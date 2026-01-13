using SmartHotel.Backend.Data;
using SmartHotel.Backend.Models;

namespace SmartHotel.Backend.Services;

public interface IAuditService
{
    Task LogAsync(string userId, string action, string entityName, string entityId, string details);
}

public class AuditService : IAuditService
{
    private readonly ApplicationDbContext _context;

    public AuditService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task LogAsync(string userId, string action, string entityName, string entityId, string details)
    {
        var log = new AuditLog
        {
            UserId = userId,
            Action = action,
            EntityName = entityName,
            EntityId = entityId,
            Details = details,
            Timestamp = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }
}
