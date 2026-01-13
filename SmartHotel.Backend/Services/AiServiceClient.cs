using Microsoft.EntityFrameworkCore;
using SmartHotel.Backend.Data;
using SmartHotel.Backend.Models;
using System.Text.Json;
using System.Text;

namespace SmartHotel.Backend.Services
{
    public interface IAiServiceClient
    {
        Task RunAnalysisAsync();
        Task<List<AiRecommendation>> GetLastRecommendationsAsync();
        Task<List<AiRecommendation>> GetGuestInsightsAsync(string userId);
    }

    public class AiServiceClient : IAiServiceClient
    {
        private readonly HttpClient _httpClient;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AiServiceClient> _logger;

        public AiServiceClient(HttpClient httpClient, ApplicationDbContext context, ILogger<AiServiceClient> logger)
        {
            _httpClient = httpClient;
            _context = context;
            _logger = logger;
            var baseUrl = Environment.GetEnvironmentVariable("AI_SERVICE_URL") ?? "http://localhost:8000";
            _httpClient.BaseAddress = new Uri(baseUrl);
        }

        public async Task RunAnalysisAsync()
        {
            try
            {
                // 1. Prepare data (History + Occupancy)
                var history = await _context.Bookings
                    .Select(b => new { 
                        roomId = b.RoomId, 
                        checkInDate = b.CheckInDate.ToString("yyyy-MM-dd"), 
                        checkOutDate = b.CheckOutDate.ToString("yyyy-MM-dd"), 
                        totalPrice = (double)b.TotalPrice 
                    })
                    .Take(100) // Last 100 for simulation
                    .ToListAsync();

                var totalRooms = await _context.Rooms.CountAsync(r => r.IsActive);
                var occupied = await _context.Rooms.CountAsync(r => r.IsActive && r.Status == RoomStatus.Occupied);
                var occupancy = totalRooms > 0 ? (double)occupied / totalRooms : 0;

                var requestData = new
                {
                    history = history,
                    currentOccupancy = occupancy
                };

                // 2. Call Python Service
                var json = JsonSerializer.Serialize(requestData);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _httpClient.PostAsync("/analyze", content);
                if (response.IsSuccessStatusCode)
                {
                    var resultJson = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(resultJson);
                    var recommendationsArray = doc.RootElement.GetProperty("recommendations");

                    // 3. Save new recommendations
                    foreach (var rec in recommendationsArray.EnumerateArray())
                    {
                        _context.AiRecommendations.Add(new AiRecommendation
                        {
                            Type = rec.GetProperty("type").GetString() ?? "General",
                            Message = rec.GetProperty("message").GetString() ?? "",
                            Impact = rec.GetProperty("impact").GetString() ?? "Medium",
                            GeneratedAt = DateTime.UtcNow
                        });
                    }

                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI analysis request failed");
            }
        }

        public async Task<List<AiRecommendation>> GetLastRecommendationsAsync()
        {
            return await _context.AiRecommendations
                .OrderByDescending(r => r.GeneratedAt)
                .Take(5)
                .ToListAsync();
        }

        public async Task<List<AiRecommendation>> GetGuestInsightsAsync(string userId)
        {
            // For now, generate dynamic contextual insights based on guest's active bookings
            var activeBookings = await _context.Bookings
                .Include(b => b.Room)
                .Where(b => b.UserId == userId && b.Status == BookingStatus.Confirmed)
                .ToListAsync();

            var insights = new List<AiRecommendation>();

            if (!activeBookings.Any())
            {
                insights.Add(new AiRecommendation 
                { 
                    Type = "Optimization", 
                    Message = "Best time to book for next weekend! Prices are projected to drop by 15% in the next 48 hours.",
                    Impact = "High"
                });
            }
            else
            {
                foreach (var booking in activeBookings)
                {
                    if (booking.Room.Type == "Single" || booking.Room.Type == "Double")
                    {
                        insights.Add(new AiRecommendation
                        {
                            Type = "Upgrade",
                            Message = $"Room {booking.Room.RoomNumber} is eligible for a Deluxe Suite upgrade. Experience ultimate luxury for just $45 more.",
                            Impact = "Medium"
                        });
                    }
                }
            }

            return insights;
        }
    }
}
