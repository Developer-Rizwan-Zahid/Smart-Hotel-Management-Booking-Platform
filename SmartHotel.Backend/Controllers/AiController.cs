using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartHotel.Backend.Services;
using System.Security.Claims;

namespace SmartHotel.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IAiServiceClient _aiService;

        public AiController(IAiServiceClient aiService)
        {
            _aiService = aiService;
        }

        [HttpGet("recommendations")]
        public async Task<IActionResult> GetRecommendations()
        {
            var results = await _aiService.GetLastRecommendationsAsync();
            return Ok(results);
        }

        [HttpGet("guest-insights")]
        public async Task<IActionResult> GetGuestRecommendations()
        {
            var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();
            
            var results = await _aiService.GetGuestInsightsAsync(userId);
            return Ok(results);
        }

        [HttpPost("run-analysis")]
        [Authorize(Policy = "RequireAdminRole")]
        public async Task<IActionResult> RunAnalysis()
        {
            await _aiService.RunAnalysisAsync();
            return Ok(new { message = "AI Analysis triggered successfully" });
        }
    }
}
