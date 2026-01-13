using System.ComponentModel.DataAnnotations;

namespace SmartHotel.Backend.Models
{
    public enum PricingRuleType
    {
        Seasonal,
        DayOfWeek,
        OccupancyBased, // Demand
        SpecialEvent
    }

    public enum AdjustmentType
    {
        Percentage,
        FlatAmount
    }

    public class PricingRule
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public PricingRuleType RuleType { get; set; }

        public AdjustmentType AdjustmentType { get; set; }

        public decimal AdjustmentValue { get; set; } // e.g. 0.20 for 20% or 50 for $50

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public string? TargetRoomType { get; set; } // Null for all

        // For DayOfWeek rules
        public string? ApplyToDays { get; set; } // "Saturday,Sunday"

        // For Occupancy rules
        public double? OccupancyThreshold { get; set; } // Apply if occupancy > 80%

        public bool IsActive { get; set; } = true;
    }
}
