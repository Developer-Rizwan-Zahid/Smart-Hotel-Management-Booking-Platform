using Microsoft.EntityFrameworkCore;
using SmartHotel.Backend.Data;
using SmartHotel.Backend.Models;

namespace SmartHotel.Backend.Services
{
    public interface IPricingService
    {
        Task<decimal> CalculateRoomPriceAsync(int roomId, DateTime date);
        Task<decimal> CalculateTotalBookingPriceAsync(int roomId, DateTime checkIn, DateTime checkOut);
        Task<List<PricingRule>> GetActiveRulesForDateAsync(DateTime date, int? roomId = null);
    }

    public class PricingService : IPricingService
    {
        private readonly ApplicationDbContext _context;

        public PricingService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<decimal> CalculateRoomPriceAsync(int roomId, DateTime date)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null) return 0;

            var basePrice = room.PricePerNight;
            var activeRules = await GetActiveRulesForDateAsync(date, roomId);

            decimal finalPrice = basePrice;
            foreach (var rule in activeRules)
            {
                if (rule.AdjustmentType == AdjustmentType.Percentage)
                    finalPrice += basePrice * rule.AdjustmentValue;
                else
                    finalPrice += rule.AdjustmentValue;
            }

            return Math.Round(finalPrice, 2);
        }

        public async Task<decimal> CalculateTotalBookingPriceAsync(int roomId, DateTime checkIn, DateTime checkOut)
        {
            decimal total = 0;
            for (var date = checkIn.Date; date < checkOut.Date; date = date.AddDays(1))
            {
                total += await CalculateRoomPriceAsync(roomId, date);
            }
            return total;
        }

        public async Task<List<PricingRule>> GetActiveRulesForDateAsync(DateTime date, int? roomId = null)
        {
            date = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
            var rules = await _context.PricingRules
                .Where(r => r.IsActive)
                .ToListAsync();

            var filteredRules = new List<PricingRule>();

            foreach (var rule in rules)
            {
                bool matches = false;
                var ruleStart = rule.StartDate.HasValue ? DateTime.SpecifyKind(rule.StartDate.Value.Date, DateTimeKind.Utc) : (DateTime?)null;
                var ruleEnd = rule.EndDate.HasValue ? DateTime.SpecifyKind(rule.EndDate.Value.Date, DateTimeKind.Utc) : (DateTime?)null;

                switch (rule.RuleType)
                {
                    case PricingRuleType.Seasonal:
                        if (ruleStart <= date && ruleEnd >= date) matches = true;
                        break;

                    case PricingRuleType.DayOfWeek:
                        if (rule.ApplyToDays?.Contains(date.DayOfWeek.ToString()) == true) matches = true;
                        break;

                    case PricingRuleType.OccupancyBased:
                        var occupancy = await GetOccupancyForDateAsync(date);
                        if (occupancy >= (rule.OccupancyThreshold ?? 100)) matches = true;
                        break;

                    case PricingRuleType.SpecialEvent:
                        if (ruleStart?.Date == date.Date) matches = true;
                        break;
                }

                if (matches) filteredRules.Add(rule);
            }

            return filteredRules;
        }

        private async Task<double> GetOccupancyForDateAsync(DateTime date)
        {
            date = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
            var totalRooms = await _context.Rooms.CountAsync(r => r.IsActive);
            if (totalRooms == 0) return 0;

            var occupiedCount = await _context.Bookings
                .CountAsync(b => b.Status != BookingStatus.Cancelled && 
                            b.CheckInDate.Date <= date && 
                            b.CheckOutDate.Date > date);

            return (double)occupiedCount / totalRooms;
        }
    }
}
