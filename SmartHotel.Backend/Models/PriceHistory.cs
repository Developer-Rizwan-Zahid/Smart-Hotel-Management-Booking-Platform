using System.ComponentModel.DataAnnotations;

namespace SmartHotel.Backend.Models
{
    public class PriceHistory
    {
        [Key]
        public int Id { get; set; }

        public int RoomId { get; set; }
        public virtual Room Room { get; set; } = null!;

        public decimal BasePrice { get; set; }
        public decimal CalculatedPrice { get; set; }

        public string AppliedRules { get; set; } = string.Empty; // JSON or comma-separated names

        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;

        public DateTime ForDate { get; set; }
    }
}
