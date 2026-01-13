using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHotel.Backend.Data;
using SmartHotel.Backend.Models;

namespace SmartHotel.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "RequireAdminRole")]
public class AuditController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public AuditController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.AuditLogs.AsQueryable();

        var totalCount = await query.CountAsync();
        var logs = await query.OrderByDescending(l => l.Timestamp)
                              .Skip((page - 1) * pageSize)
                              .Take(pageSize)
                              .ToListAsync();

        return Ok(new
        {
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            Data = logs
        });
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserAuditLogs(string userId)
    {
        var logs = await _context.AuditLogs
                                 .Where(l => l.UserId == userId)
                                 .OrderByDescending(l => l.Timestamp)
                                 .Take(50) // Limit to last 50 actions
                                 .ToListAsync();
        return Ok(logs);
    }
}
