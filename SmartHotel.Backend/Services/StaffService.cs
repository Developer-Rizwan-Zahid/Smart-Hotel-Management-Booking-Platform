using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SmartHotel.Backend.Data;
using SmartHotel.Backend.Hubs;
using SmartHotel.Backend.Models;

namespace SmartHotel.Backend.Services
{
    public interface IStaffService
    {
        Task<StaffTask> CreateTaskAsync(int roomId, StaffTaskType type, string? notes = null);
        Task<List<StaffTask>> GetAllTasksAsync();
        Task<StaffTask> UpdateTaskStatusAsync(int taskId, StaffTaskStatus status, string? assignedTo = null);
        Task<StaffStatsDto> GetStaffStatsAsync();
    }

    public class StaffStatsDto
    {
        public int CriticalTasks { get; set; }
        public int ActiveStaff { get; set; }
        public string TaskEfficiency { get; set; } = "0%";
        public int TotalTasksHandled { get; set; }
    }

    public class StaffService : IStaffService
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;

        public StaffService(ApplicationDbContext context, IHubContext<BookingHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<StaffTask> CreateTaskAsync(int roomId, StaffTaskType type, string? notes = null)
        {
            var task = new StaffTask
            {
                RoomId = roomId,
                Type = type,
                Notes = notes,
                CreatedAt = DateTime.UtcNow,
                Status = StaffTaskStatus.Pending
            };

            _context.StaffTasks.Add(task);

            // Update room status based on task type
            var room = await _context.Rooms.FindAsync(roomId);
            if (room != null)
            {
                room.Status = type == StaffTaskType.Maintenance ? RoomStatus.Maintenance : RoomStatus.Cleaning;
            }

            await _context.SaveChangesAsync();

            // Broadcast real-time updates
            await _hubContext.Clients.All.SendAsync("TaskCreated", task);
            if (room != null)
            {
                await _hubContext.Clients.All.SendAsync("RoomUpdated", new { 
                    roomId = room.Id, 
                    isAvailable = false, 
                    status = room.Status 
                });
            }

            return task;
        }

        public async Task<List<StaffTask>> GetAllTasksAsync()
        {
            return await _context.StaffTasks
                .Include(t => t.Room)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<StaffTask> UpdateTaskStatusAsync(int taskId, StaffTaskStatus status, string? assignedTo = null)
        {
            var task = await _context.StaffTasks.Include(t => t.Room).FirstOrDefaultAsync(t => t.Id == taskId);
            if (task == null) throw new Exception("Task not found");

            task.Status = status;
            if (assignedTo != null) task.AssignedTo = assignedTo;
            
            if (status == StaffTaskStatus.Completed)
            {
                task.CompletedAt = DateTime.UtcNow;

                // If cleaning/maintenance is done, set room to available
                if (task.Room != null)
                {
                    task.Room.Status = RoomStatus.Available;
                    await _hubContext.Clients.All.SendAsync("RoomUpdated", new { 
                        roomId = task.Room.Id, 
                        isAvailable = true, 
                        status = RoomStatus.Available 
                    });
                }
            }

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("TaskUpdated", task);

            return task;
        }
        public async Task<StaffStatsDto> GetStaffStatsAsync()
        {
            var tasks = await _context.StaffTasks.ToListAsync();
            var totalTasks = tasks.Count;
            var completedTasks = tasks.Count(t => t.Status == StaffTaskStatus.Completed);
            
            var efficiency = totalTasks == 0 ? "100%" : $"{(int)((double)completedTasks / totalTasks * 100)}%";

            return new StaffStatsDto
            {
                CriticalTasks = tasks.Count(t => t.Status == StaffTaskStatus.Pending && t.Type == StaffTaskType.Maintenance),
                ActiveStaff = await _context.Users.CountAsync(), // For now, count all users as potential staff
                TaskEfficiency = efficiency,
                TotalTasksHandled = completedTasks
            };
        }
    }
}
