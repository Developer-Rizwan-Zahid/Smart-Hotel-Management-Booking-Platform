using System.ComponentModel.DataAnnotations;

namespace SmartHotel.Backend.DTOs
{
    public class CreateBookingDto
    {
        [Required]
        public int RoomId { get; set; }

        [Required]
        public DateTime CheckInDate { get; set; }

        [Required]
        public DateTime CheckOutDate { get; set; }
    }
}
