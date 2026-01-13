using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartHotel.Backend.Models
{
    public enum BookingStatus
    {
        Pending,
        Confirmed,
        CheckedIn,
        CheckedOut,
        Cancelled
    }

    public class Booking
    {
        [Key]
        public int Id { get; set; }

        public int RoomId { get; set; }
        [ForeignKey("RoomId")]
        public Room Room { get; set; } = null!;

        public string UserId { get; set; } = null!;
        [ForeignKey("UserId")]
        public User User { get; set; } = null!;

        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
