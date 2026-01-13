using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHotel.Backend.Models;
using SmartHotel.Backend.Services;

namespace SmartHotel.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StaffController : ControllerBase
    {
        private readonly IStaffService _staffService;

        public StaffController(IStaffService staffService)
        {
            _staffService = staffService;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _staffService.GetStaffStatsAsync();
            return Ok(stats);
        }

        [HttpGet("tasks")]
        public async Task<IActionResult> GetTasks()
        {
            var tasks = await _staffService.GetAllTasksAsync();
            return Ok(tasks);
        }

        [HttpPost("tasks")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto dto)
        {
            var task = await _staffService.CreateTaskAsync(dto.RoomId, dto.Type, dto.Notes);
            return Ok(task);
        }

        [HttpPut("tasks/{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTaskStatusDto dto)
        {
            var task = await _staffService.UpdateTaskStatusAsync(id, dto.Status, dto.AssignedTo);
            return Ok(task);
        }
    }

    public class CreateTaskDto
    {
        public int RoomId { get; set; }
        public StaffTaskType Type { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateTaskStatusDto
    {
        public StaffTaskStatus Status { get; set; }
        public string? AssignedTo { get; set; }
    }
}
