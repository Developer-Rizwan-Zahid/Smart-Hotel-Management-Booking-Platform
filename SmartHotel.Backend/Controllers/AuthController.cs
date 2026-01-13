using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SmartHotel.Backend.DTOs;
using SmartHotel.Backend.Models;
using SmartHotel.Backend.Services;

namespace SmartHotel.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    private readonly ITokenService _tokenService;
    private readonly IAuditService _auditService;
    private readonly SmartHotel.Backend.Data.ApplicationDbContext _context;

    public AuthController(UserManager<User> userManager, RoleManager<Role> roleManager, ITokenService tokenService, SmartHotel.Backend.Data.ApplicationDbContext context, IAuditService auditService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _tokenService = tokenService;
        _context = context;
        _auditService = auditService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userExists = await _userManager.FindByEmailAsync(dto.Email);
        if (userExists != null)
            return BadRequest("User already exists");

        var user = new User
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            SecurityStamp = Guid.NewGuid().ToString()
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(result.Errors);

        if (!await _roleManager.RoleExistsAsync(dto.Role))
        {
            await _roleManager.CreateAsync(new Role { Name = dto.Role, Description = $"Role for {dto.Role}" });
        }

        await _userManager.AddToRoleAsync(user, dto.Role);

        await _auditService.LogAsync(user.Id, "Register", "User", user.Id, $"Registered as {dto.Role}");

        return Ok(new { Message = "User created successfully" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return Unauthorized("Invalid credentials");

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.GenerateAccessToken(user, roles);
        var refreshToken = _tokenService.GenerateRefreshToken();

        var userSession = new UserSession
        {
            UserId = user.Id,
            RefreshToken = refreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7) // Should match JwtSettings
        };

        _context.UserSessions.Add(userSession);
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(user.Id, "Login", "UserSession", userSession.Id.ToString(), "User Logged In");
        
        return Ok(new TokenDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        });
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] TokenDto dto)
    {
        var principal = _tokenService.GetPrincipalFromExpiredToken(dto.AccessToken);
        if (principal == null)
            return BadRequest("Invalid access token or refresh token");

        var userId = principal.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) 
            return BadRequest("Invalid token");

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return BadRequest("User not found");

        var session = _context.UserSessions.FirstOrDefault(s => s.RefreshToken == dto.RefreshToken && s.UserId == userId);
        if (session == null || session.IsRevoked || session.ExpiresAt < DateTime.UtcNow)
        {
            await _auditService.LogAsync(userId, "RefreshTokenFailed", "UserSession", "N/A", "Invalid or Expired Refresh Token Used");
            return BadRequest("Invalid refresh token");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var newAccessToken = _tokenService.GenerateAccessToken(user, roles);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        session.IsRevoked = true; // Rotated
        _context.UserSessions.Add(new UserSession
        {
            UserId = user.Id,
            RefreshToken = newRefreshToken,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
        
        await _context.SaveChangesAsync();

        return Ok(new TokenDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        });
    }

    [HttpPost("logout")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();
        
        await _auditService.LogAsync(userId, "Logout", "User", userId, "User Logged Out");

        return Ok(new { Message = "Logged out successfully" });
    }

    [HttpGet("sessions")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public IActionResult GetSessions()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var sessions = _context.UserSessions.Where(s => s.UserId == userId && !s.IsRevoked && s.ExpiresAt > DateTime.UtcNow)
                                            .OrderByDescending(s => s.CreatedAt)
                                            .ToList();
        return Ok(sessions);
    }

    [HttpPost("revoke-session/{id}")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public async Task<IActionResult> RevokeSession(int id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var session = await _context.UserSessions.FindAsync(id);
        if (session == null || session.UserId != userId)
            return NotFound("Session not found or not owned by user");

        session.IsRevoked = true;
        await _context.SaveChangesAsync();

        await _auditService.LogAsync(userId, "RevokeSession", "UserSession", id.ToString(), "User Revoked Session");

        return Ok(new { Message = "Session revoked" });
    }
}
