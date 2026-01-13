using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartHotel.Backend.Data;
using SmartHotel.Backend.Models;
using SmartHotel.Backend.Services;

namespace SmartHotel.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PricingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPricingService _pricingService;

        public PricingController(ApplicationDbContext context, IPricingService pricingService)
        {
            _context = context;
            _pricingService = pricingService;
        }

        [HttpGet("rules")]
        public async Task<IActionResult> GetRules()
        {
            var rules = await _context.PricingRules.ToListAsync();
            return Ok(rules);
        }

        [HttpPost("rules")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<IActionResult> CreateRule([FromBody] PricingRule rule)
        {
            _context.PricingRules.Add(rule);
            await _context.SaveChangesAsync();
            return Ok(rule);
        }

        [HttpGet("estimate")]
        public async Task<IActionResult> GetEstimate(int roomId, DateTime checkIn, DateTime checkOut)
        {
            var total = await _pricingService.CalculateTotalBookingPriceAsync(roomId, checkIn, checkOut);
            
            // Get breakdown for UI
            var breakdown = new List<object>();
            for (var date = checkIn.Date; date < checkOut.Date; date = date.AddDays(1))
            {
                var price = await _pricingService.CalculateRoomPriceAsync(roomId, date);
                var rules = await _pricingService.GetActiveRulesForDateAsync(date, roomId);
                breakdown.Add(new { 
                    Date = date, 
                    Price = price, 
                    AppliedRules = rules.Select(r => r.Name) 
                });
            }

            return Ok(new { Total = total, Breakdown = breakdown });
        }
    }
}
