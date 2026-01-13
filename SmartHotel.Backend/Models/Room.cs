using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartHotel.Backend.Models
{
    public enum RoomStatus
    {
        Available,
        Occupied,
        Cleaning,
        Maintenance
    }

    public class Room
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string RoomNumber { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = "Single"; // Single, Double, Suite

        [Column(TypeName = "decimal(18,2)")]
        public decimal PricePerNight { get; set; }

        public RoomStatus Status { get; set; } = RoomStatus.Available;

        public bool IsActive { get; set; } = true;
    }
}
