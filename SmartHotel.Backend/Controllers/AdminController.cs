using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHotel.Backend.Data;
using SmartHotel.Backend.Models;
using System.Security.Claims;

namespace SmartHotel.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly ApplicationDbContext _context;

        public AdminController(
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _context = context;
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin,HotelManager,Receptionist")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            var userList = new List<object>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userList.Add(new
                {
                    user.Id,
                    user.UserName,
                    user.Email,
                    user.FullName,
                    user.IsActive,
                    Roles = roles
                });
            }

            return Ok(userList);
        }

        [HttpPost("users/{userId}/role")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<IActionResult> UpdateUserRole(string userId, [FromBody] UpdateRoleDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return NotFound("User not found");

            var currentRoles = await _userManager.GetRolesAsync(user);
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            if (!await _roleManager.RoleExistsAsync(dto.Role))
            {
                return BadRequest("Role does not exist");
            }

            var result = await _userManager.AddToRoleAsync(user, dto.Role);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { message = $"Role updated to {dto.Role}" });
        }

        [HttpGet("stats")]
        [Authorize(Policy = "RequireManagerRole")]
        public async Task<IActionResult> GetSystemStats()
        {
            var totalRevenue = await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled)
                .SumAsync(b => b.TotalPrice);

            var totalBookings = await _context.Bookings.CountAsync();
            var activeBookings = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.CheckedIn);

            var availableRooms = await _context.Rooms
                .CountAsync(r => r.IsActive && r.Status == RoomStatus.Available);

            // Simple occupancy trend (last 7 days)
            var today = DateTime.UtcNow.Date;
            var trend = new List<object>();
            for (int i = 6; i >= 0; i--)
            {
                var date = today.AddDays(-i);
                var todayDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
                var nextDate = DateTime.SpecifyKind(date.Date.AddDays(1), DateTimeKind.Utc);
                var count = await _context.Bookings.CountAsync(b => 
                    b.Status != BookingStatus.Cancelled && 
                    b.CheckInDate < nextDate && 
                    b.CheckOutDate >= todayDate);
                
                trend.Add(new { 
                    date = date.ToString("MMM dd"), 
                    occupancy = count 
                });
            }

            return Ok(new
            {
                totalRevenue,
                totalBookings,
                activeBookings,
                availableRooms,
                occupancyTrend = trend
            });
        }

        [HttpGet("leaderboards")]
        [Authorize(Policy = "RequireManagerRole")]
        public async Task<IActionResult> GetLeaderboards()
        {
            var now = DateTime.UtcNow;
            var firstDayThisMonth = new DateTime(now.Year, now.Month, 1);
            var firstDayLastMonth = firstDayThisMonth.AddMonths(-1);

            // 1. Room Type Performance
            var roomTypePerformance = await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled)
                .GroupBy(b => b.Room.Type)
                .Select(g => new
                {
                    Type = g.Key,
                    Revenue = g.Sum(b => b.TotalPrice),
                    Bookings = g.Count()
                })
                .OrderByDescending(x => x.Revenue)
                .ToListAsync();

            // 2. Staff Leaderboard (Top task completers)
            var staffLeaderboard = await _context.StaffTasks
                .Where(t => t.Status == StaffTaskStatus.Completed && t.AssignedTo != null)
                .GroupBy(t => t.AssignedTo)
                .Select(g => new
                {
                    Name = g.Key,
                    CompletedTasks = g.Count(),
                    Score = g.Count() * 10 
                })
                .OrderByDescending(x => x.CompletedTasks)
                .Take(5)
                .ToListAsync();

            // 3. Seasonal Metrics (Revenue Growth)
            var revenueThisMonth = await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled && b.CreatedAt >= firstDayThisMonth)
                .SumAsync(b => b.TotalPrice);

            var revenueLastMonth = await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled && b.CreatedAt >= firstDayLastMonth && b.CreatedAt < firstDayThisMonth)
                .SumAsync(b => b.TotalPrice);

            decimal growth = 0;
            if (revenueLastMonth > 0)
                growth = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

            // 4. Top Performing Rooms
            var topRooms = await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled)
                .GroupBy(b => b.Room.RoomNumber)
                .Select(g => new
                {
                    RoomNumber = g.Key,
                    RankFactor = g.Count() + (g.Sum(b => b.TotalPrice) / 1000) // Quality + Quantity
                })
                .OrderByDescending(x => x.RankFactor)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                roomTypePerformance,
                staffLeaderboard,
                seasonalGrowth = growth,
                topRooms
            });
        }

        [HttpPost("seed-demo")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<IActionResult> SeedDemoData()
        {
            // Only seed if empty or explicitly requested
            var rooms = await _context.Rooms.ToListAsync();
            if (!rooms.Any()) return BadRequest("No rooms available for seeding. Ensure base migration run.");

            var random = new Random();
            var names = new[] { "John Miller", "Sarah Connor", "Michael Scott", "Elena Gilbert", "Tony Stark" };
            var taskNotes = new[] { "Deep clean required", "AC filter check", "Bulb replacement", "Carpet vacuum", "Bathroom sanity check" };

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "admin-id";
            // 1. Seed Historical Bookings (Last 60 days)
            for (int i = 0; i < 40; i++)
            {
                var room = rooms[random.Next(rooms.Count)];
                var checkIn = DateTime.UtcNow.AddDays(-random.Next(2, 60));
                var checkOut = checkIn.AddDays(random.Next(1, 4));
                
                var booking = new Booking
                {
                    RoomId = room.Id,
                    UserId = currentUserId, 
                    CheckInDate = checkIn,
                    CheckOutDate = checkOut,
                    Status = random.Next(10) > 2 ? BookingStatus.Confirmed : BookingStatus.Cancelled,
                    TotalPrice = room.PricePerNight * (decimal)(checkOut - checkIn).TotalDays,
                    CreatedAt = checkIn.AddDays(-1)
                };
                _context.Bookings.Add(booking);
            }

            // 2. Seed Staff Performance (Last 30 days)
            for (int i = 0; i < 50; i++)
            {
                var room = rooms[random.Next(rooms.Count)];
                var created = DateTime.UtcNow.AddDays(-random.Next(0, 30));
                
                var task = new StaffTask
                {
                    RoomId = room.Id,
                    Type = (StaffTaskType)random.Next(3),
                    Status = StaffTaskStatus.Completed,
                    AssignedTo = names[random.Next(names.Length)],
                    CreatedAt = created,
                    CompletedAt = created.AddMinutes(random.Next(30, 120)),
                    Notes = taskNotes[random.Next(taskNotes.Length)]
                };
                _context.StaffTasks.Add(task);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Simulation data injected successfully. Analytics are now alive." });
        }
    }

    public class UpdateRoleDto
    {
        public string Role { get; set; } = string.Empty;
    }
}
