using System.ComponentModel.DataAnnotations;

namespace SmartHotel.Backend.Models
{
    public class AiRecommendation
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Type { get; set; } = string.Empty; // Pricing, Discount, Alert

        [Required]
        public string Message { get; set; } = string.Empty;

        public string Impact { get; set; } = "Medium"; // Low, Medium, High, Critical

        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

        public bool IsApplied { get; set; } = false;

        public string? Metadata { get; set; } // JSON blob for flexible data
    }
}
