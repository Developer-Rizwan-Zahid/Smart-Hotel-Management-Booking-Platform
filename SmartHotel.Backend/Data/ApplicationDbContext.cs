using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SmartHotel.Backend.Models;

namespace SmartHotel.Backend.Data;

public class ApplicationDbContext : IdentityDbContext<User, Role, string>
{
    public DbSet<AuditLog> AuditLogs { get; set; }
    public DbSet<UserSession> UserSessions { get; set; }
    public DbSet<Room> Rooms { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<PricingRule> PricingRules { get; set; }
    public DbSet<PriceHistory> PriceHistories { get; set; }
    public DbSet<AiRecommendation> AiRecommendations { get; set; }
    public DbSet<StaffTask> StaffTasks { get; set; }

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Seed Rooms
        builder.Entity<Room>().HasData(
            new Room { Id = 1, RoomNumber = "101", Type = "Single", PricePerNight = 100, IsActive = true, Status = RoomStatus.Available },
            new Room { Id = 2, RoomNumber = "102", Type = "Single", PricePerNight = 100, IsActive = true, Status = RoomStatus.Cleaning },
            new Room { Id = 3, RoomNumber = "201", Type = "Double", PricePerNight = 180, IsActive = true, Status = RoomStatus.Available },
            new Room { Id = 4, RoomNumber = "202", Type = "Double", PricePerNight = 180, IsActive = true, Status = RoomStatus.Maintenance },
            new Room { Id = 5, RoomNumber = "301", Type = "Suite", PricePerNight = 350, IsActive = true, Status = RoomStatus.Available }
        );

        builder.Entity<PricingRule>().HasData(
            new PricingRule { Id = 1, Name = "Weekend Surcharge", RuleType = PricingRuleType.DayOfWeek, AdjustmentType = AdjustmentType.Percentage, AdjustmentValue = 0.15m, ApplyToDays = "Saturday,Sunday", IsActive = true },
            new PricingRule { Id = 2, Name = "Summer Peak", RuleType = PricingRuleType.Seasonal, AdjustmentType = AdjustmentType.Percentage, AdjustmentValue = 0.25m, StartDate = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc), EndDate = new DateTime(2026, 8, 31, 23, 59, 59, DateTimeKind.Utc), IsActive = true },
            new PricingRule { Id = 3, Name = "High Demand Surcharge", RuleType = PricingRuleType.OccupancyBased, AdjustmentType = AdjustmentType.Percentage, AdjustmentValue = 0.10m, OccupancyThreshold = 0.80, IsActive = true }
        );

        builder.Entity<User>().ToTable("Users");
        builder.Entity<Role>().ToTable("Roles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<string>>().ToTable("UserRoles");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>().ToTable("UserClaims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>().ToTable("UserLogins");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>>().ToTable("RoleClaims");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>().ToTable("UserTokens");

        builder.Entity<AuditLog>().ToTable("AuditLogs");
        builder.Entity<UserSession>().ToTable("UserSessions");
        builder.Entity<Room>().ToTable("Rooms");
        builder.Entity<Booking>().ToTable("Bookings");
        builder.Entity<PricingRule>().ToTable("PricingRules");
        builder.Entity<PriceHistory>().ToTable("PriceHistories");
        builder.Entity<AiRecommendation>().ToTable("AiRecommendations");
        builder.Entity<StaffTask>().ToTable("StaffTasks");
    }
}
