using System.ComponentModel.DataAnnotations;

namespace SmartHotel.Backend.Models
{
    public enum StaffTaskType
    {
        Cleaning,
        Maintenance,
        Inspection
    }

    public enum StaffTaskStatus
    {
        Pending,
        InProgress,
        Completed
    }

    public class StaffTask
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int RoomId { get; set; }
        public Room? Room { get; set; }

        [Required]
        public StaffTaskType Type { get; set; }

        public StaffTaskStatus Status { get; set; } = StaffTaskStatus.Pending;

        public string? AssignedTo { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? CompletedAt { get; set; }

        public string? Notes { get; set; }
    }
}
