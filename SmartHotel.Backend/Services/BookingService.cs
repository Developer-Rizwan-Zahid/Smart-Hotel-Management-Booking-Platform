using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SmartHotel.Backend.Data;
using SmartHotel.Backend.DTOs;
using SmartHotel.Backend.Hubs;
using SmartHotel.Backend.Models;
using System.Data;

namespace SmartHotel.Backend.Services
{
    public interface IBookingService
    {
        Task<Booking> CreateBookingAsync(string userId, CreateBookingDto dto);
        Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId);
        Task<bool> CancelBookingAsync(int bookingId, string userId);
        Task<bool> CheckInAsync(int bookingId);
        Task<bool> CheckOutAsync(int bookingId);
        Task<bool> MoveBookingAsync(int bookingId, MoveBookingDto dto);
    }

    public class BookingService : IBookingService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;
        private readonly IPricingService _pricingService;
        private readonly IStaffService _staffService;

        public BookingService(ApplicationDbContext context, IHubContext<BookingHub> hubContext, IPricingService pricingService, IStaffService staffService)
        {
            _context = context;
            _hubContext = hubContext;
            _pricingService = pricingService;
            _staffService = staffService;
        }

        public async Task<Booking> CreateBookingAsync(string userId, CreateBookingDto dto)
        {
            // Force UTC kind for Npgsql compatibility
            dto.CheckInDate = DateTime.SpecifyKind(dto.CheckInDate.Date, DateTimeKind.Utc);
            dto.CheckOutDate = DateTime.SpecifyKind(dto.CheckOutDate.Date, DateTimeKind.Utc);

            // Use a Serializable transaction to ensure no other transaction can read/write overlapping data concurrently
            using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            try
            {
                // 1. Check for availability
                var overlappingBookingExists = await _context.Bookings.AnyAsync(b =>
                    b.RoomId == dto.RoomId &&
                    b.Status != BookingStatus.Cancelled &&
                    ((dto.CheckInDate < b.CheckOutDate) && (dto.CheckOutDate > b.CheckInDate))
                );

                if (overlappingBookingExists)
                {
                    throw new InvalidOperationException("Room is already booked for the selected dates.");
                }

                // 2. Calculate price (mock logic)
                var room = await _context.Rooms.FindAsync(dto.RoomId);
                if (room == null || !room.IsActive)
                    throw new KeyNotFoundException("Room not found or inactive.");

                var nights = (dto.CheckOutDate - dto.CheckInDate).Days;
                if (nights < 1) nights = 1;
                var totalPrice = await _pricingService.CalculateTotalBookingPriceAsync(dto.RoomId, dto.CheckInDate, dto.CheckOutDate);

                // 3. Create Booking
                var booking = new Booking
                {
                    RoomId = dto.RoomId,
                    UserId = userId,
                    CheckInDate = dto.CheckInDate.ToUniversalTime(),
                    CheckOutDate = dto.CheckOutDate.ToUniversalTime(),
                    Status = BookingStatus.Confirmed, // Auto-confirm for now
                    TotalPrice = totalPrice,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                // 4. Commit transaction
                await transaction.CommitAsync();

                // 5. Broadcast update
                await _hubContext.Clients.All.SendAsync("RoomUpdated", new { RoomId = booking.RoomId, IsAvailable = false });
                await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", $"Room {room.RoomNumber} booked from {booking.CheckInDate.ToShortDateString()} to {booking.CheckOutDate.ToShortDateString()}");

                return booking;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<Booking>> GetUserBookingsAsync(string userId)
        {
            return await _context.Bookings
                .Include(b => b.Room)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> CancelBookingAsync(int bookingId, string userId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Room)
                .FirstOrDefaultAsync(b => b.Id == bookingId && b.UserId == userId);

            if (booking == null) return false;

            if (booking.Status == BookingStatus.Cancelled) return true;

            booking.Status = BookingStatus.Cancelled;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", $"Booking {booking.Id} for Room {booking.Room.RoomNumber} was cancelled.");

            await _hubContext.Clients.All.SendAsync("RoomUpdated", new { RoomId = booking.RoomId, IsAvailable = true });
            await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", $"Booking {booking.Id} for Room {booking.Room.RoomNumber} was cancelled.");

            return true;
        }

        public async Task<bool> CheckInAsync(int bookingId)
        {
             var booking = await _context.Bookings.Include(b => b.Room).FirstOrDefaultAsync(b => b.Id == bookingId);
             if (booking == null || booking.Status != BookingStatus.Confirmed) return false;

             booking.Status = BookingStatus.CheckedIn;
             await _context.SaveChangesAsync();

             await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", $"Guest checked in to Room {booking.Room.RoomNumber}.");
             return true;
        }

        public async Task<bool> CheckOutAsync(int bookingId)
        {
             var booking = await _context.Bookings.Include(b => b.Room).FirstOrDefaultAsync(b => b.Id == bookingId);
             if (booking == null || booking.Status != BookingStatus.CheckedIn) return false;

             booking.Status = BookingStatus.CheckedOut;
             await _context.SaveChangesAsync();

             // Auto-create cleaning task
             await _staffService.CreateTaskAsync(booking.RoomId, StaffTaskType.Cleaning, "Automatic task generated upon guest checkout.");

             await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", $"Guest checked out from Room {booking.Room.RoomNumber}. Cleaning task dispatched.");
             return true;
        }

        public async Task<bool> MoveBookingAsync(int bookingId, MoveBookingDto dto)
        {
            dto.CheckInDate = DateTime.SpecifyKind(dto.CheckInDate.Date, DateTimeKind.Utc);
            dto.CheckOutDate = DateTime.SpecifyKind(dto.CheckOutDate.Date, DateTimeKind.Utc);

            using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
            try
            {
                var booking = await _context.Bookings.FindAsync(bookingId);
                if (booking == null) return false;

                // Check for overlap in new slot (excluding current booking)
                var overlap = await _context.Bookings.AnyAsync(b =>
                    b.Id != bookingId &&
                    b.RoomId == dto.RoomId &&
                    b.Status != BookingStatus.Cancelled &&
                    ((dto.CheckInDate < b.CheckOutDate) && (dto.CheckOutDate > b.CheckInDate))
                );

                if (overlap) throw new InvalidOperationException("Overlap detected in new slot.");

                var oldRoomId = booking.RoomId;
                booking.RoomId = dto.RoomId;
                booking.CheckInDate = dto.CheckInDate.ToUniversalTime();
                booking.CheckOutDate = dto.CheckOutDate.ToUniversalTime();

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // SignalR Broadcast
                await _hubContext.Clients.All.SendAsync("RoomUpdated", new { RoomId = oldRoomId, IsAvailable = true });
                await _hubContext.Clients.All.SendAsync("RoomUpdated", new { RoomId = dto.RoomId, IsAvailable = false });
                await _hubContext.Clients.All.SendAsync("ReceiveBookingUpdate", $"Booking {bookingId} moved successfully.");

                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
