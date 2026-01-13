using Microsoft.AspNetCore.Identity;

namespace SmartHotel.Backend.Models;

public class Role : IdentityRole
{
    public string Description { get; set; } = string.Empty;
}
