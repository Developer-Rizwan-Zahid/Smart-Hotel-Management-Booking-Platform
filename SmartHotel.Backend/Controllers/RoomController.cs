using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHotel.Backend.Data;
using SmartHotel.Backend.Models;
using Microsoft.AspNetCore.SignalR;
using SmartHotel.Backend.Hubs;

namespace SmartHotel.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;

        public RoomController(ApplicationDbContext context, IHubContext<BookingHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetRooms()
        {
            var today = DateTime.UtcNow.Date;
            var rooms = await _context.Rooms.ToListAsync();
            
            // Check current availability for each room
            var activeBookings = await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled && 
                            b.CheckInDate.Date <= today && 
                            b.CheckOutDate.Date > today)
                .Select(b => b.RoomId)
                .ToListAsync();

            var roomList = rooms.Select(r => new {
                r.Id,
                r.RoomNumber,
                r.Type,
                r.PricePerNight,
                r.IsActive,
                r.Status,
                IsAvailable = !activeBookings.Contains(r.Id)
            });

            return Ok(roomList);
        }

        [HttpPost]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<IActionResult> CreateRoom([FromBody] Room room)
        {
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            
            await _hubContext.Clients.All.SendAsync("RoomUpdated", new { 
                roomId = room.Id, 
                isAvailable = true, 
                status = room.Status 
            });

            return CreatedAtAction(nameof(GetRooms), new { id = room.Id }, room);
        }

        [HttpPut("{id}")]
        [Authorize(Policy = "RequireManagerRole")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] Room room)
        {
            if (id != room.Id) return BadRequest();

            _context.Entry(room).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                await _hubContext.Clients.All.SendAsync("RoomUpdated", new { 
                    roomId = room.Id, 
                    isAvailable = room.Status == RoomStatus.Available, 
                    status = room.Status 
                });
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Rooms.Any(e => e.Id == id)) return NotFound();
                throw;
            }

            return Ok(new { message = "Room updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            room.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("RoomUpdated", new { 
                roomId = room.Id, 
                isAvailable = false, 
                status = room.Status 
            });

            return Ok(new { message = "Room deactivated successfully" });
        }

        [HttpPut("{id}/status")]
        [Authorize(Policy = "RequireReceptionistRole")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] RoomStatus status)
        {
            var room = await _context.Rooms.FindAsync(id);
            if (room == null) return NotFound();

            room.Status = status;
            await _context.SaveChangesAsync();

            await _hubContext.Clients.All.SendAsync("RoomUpdated", new { 
                roomId = room.Id, 
                isAvailable = status == RoomStatus.Available, 
                status = status 
            });

            return Ok(new { message = "Status updated" });
        }
    }
}
