using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHotel.Backend.DTOs;
using SmartHotel.Backend.Services;
using System.Security.Claims;

namespace SmartHotel.Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            try
            {
                var booking = await _bookingService.CreateBookingAsync(userId, dto);
                return CreatedAtAction(nameof(GetUserBookings), new { id = booking.Id }, booking);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An internal error occurred." });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetUserBookings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var bookings = await _bookingService.GetUserBookingsAsync(userId);
            return Ok(bookings);
        }

        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var result = await _bookingService.CancelBookingAsync(id, userId);
            if (!result) return NotFound(new { message = "Booking not found or access denied." });

            return Ok(new { message = "Booking cancelled successfully." });
        }

        [HttpPut("{id}/checkin")]
        [Authorize(Policy = "RequireReceptionistRole")] 
        public async Task<IActionResult> CheckIn(int id)
        {
            var result = await _bookingService.CheckInAsync(id);
            if (!result) return BadRequest(new { message = "Unable to check in. Verify booking status." });
            return Ok(new { message = "Checked in successfully." });
        }

        [HttpPut("{id}/checkout")]
        [Authorize(Policy = "RequireReceptionistRole")]
        public async Task<IActionResult> CheckOut(int id)
        {
            var result = await _bookingService.CheckOutAsync(id);
            if (!result) return BadRequest(new { message = "Unable to check out. Verify booking status." });
            return Ok(new { message = "Checked out successfully." });
        }

        [HttpGet("{id}/invoice")]
        public async Task<IActionResult> GetInvoice(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var booking = await _bookingService.GetUserBookingsAsync(userId);
            var item = booking.FirstOrDefault(b => b.Id == id);
            
            if (item == null) return NotFound();

            // Simple receipt data for frontend to render/print
            return Ok(new
            {
                InvoiceId = $"INV-{item.Id}-{item.CreatedAt:yyyyMMdd}",
                GuestName = User.Identity?.Name ?? "Guest",
                RoomNumber = item.Room?.RoomNumber,
                RoomType = item.Room?.Type,
                CheckIn = item.CheckInDate,
                CheckOut = item.CheckOutDate,
                TotalPrice = item.TotalPrice,
                Status = item.Status.ToString(),
                IssuedAt = DateTime.UtcNow
            });
        }

        [HttpPut("{id}/modify")]
        public async Task<IActionResult> UpdateBooking(int id, [FromBody] MoveBookingDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            // 24 Hour Rule Check
            var bookings = await _bookingService.GetUserBookingsAsync(userId);
            var booking = bookings.FirstOrDefault(b => b.Id == id);
            
            if (booking == null) return NotFound();
            
            if ((booking.CheckInDate - DateTime.UtcNow).TotalHours < 24)
            {
                return BadRequest(new { message = "Modifications are locked within 24 hours of check-in." });
            }

            try
            {
                var result = await _bookingService.MoveBookingAsync(id, dto);
                if (!result) return NotFound();
                return Ok(new { message = "Booking modified successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/move")]
        [Authorize(Policy = "RequireAdminRole")] // Keep move for admin (override rule)
        public async Task<IActionResult> MoveBooking(int id, [FromBody] MoveBookingDto dto)
        {
            try
            {
                var result = await _bookingService.MoveBookingAsync(id, dto);
                if (!result) return NotFound();
                return Ok(new { message = "Booking moved by administrator" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
