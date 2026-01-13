using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using SmartHotel.Backend.Data;
using SmartHotel.Backend.Models;
using SmartHotel.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<SmartHotel.Backend.Data.ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<SmartHotel.Backend.Models.User, SmartHotel.Backend.Models.Role>()
    .AddEntityFrameworkStores<SmartHotel.Backend.Data.ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<SmartHotel.Backend.Services.ITokenService, SmartHotel.Backend.Services.TokenService>();
builder.Services.AddScoped<SmartHotel.Backend.Services.IAuditService, SmartHotel.Backend.Services.AuditService>();
builder.Services.AddScoped<SmartHotel.Backend.Services.IBookingService, SmartHotel.Backend.Services.BookingService>();
builder.Services.AddScoped<IPricingService, PricingService>();
builder.Services.AddHttpClient<IAiServiceClient, AiServiceClient>();
builder.Services.AddScoped<IStaffService, StaffService>();

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<SmartHotel.Backend.Services.JwtSettings>();
builder.Services.AddSingleton(jwtSettings!);
builder.Services.AddSignalR();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings?.Issuer,
        ValidAudience = jwtSettings?.Audience,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSettings?.Secret!))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));
    options.AddPolicy("RequireManagerRole", policy => policy.RequireRole("HotelManager"));
    options.AddPolicy("RequireReceptionistRole", policy => policy.RequireRole("Receptionist"));
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<SmartHotel.Backend.Hubs.BookingHub>("/bookingHub");

app.Run();
