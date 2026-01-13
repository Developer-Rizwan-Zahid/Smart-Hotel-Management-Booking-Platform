namespace SmartHotel.Backend.Models;

public class UserSession
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
}
