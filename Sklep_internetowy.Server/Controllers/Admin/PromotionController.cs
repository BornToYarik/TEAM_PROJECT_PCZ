using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.Services.Promotion;
using System;
using System.Threading.Tasks;

namespace Sklep_internetowy.Server.Controllers.Admin
{
    [Route("api/panel/[controller]")]
    [ApiController]
    public class PromotionController : ControllerBase
    {
        
        private readonly PromotionService _promotionService;

        public PromotionController(PromotionService promotionService)
        {
            _promotionService = promotionService;
        }

        [HttpPost("apply-discounts")]
        public async Task<ActionResult> ApplyDiscounts()
        {
            try
            {
                var count = await _promotionService.ApplyStockClearanceDiscountsAsync();
                return Ok(new { message = $"Successfully applied promotion to {count} products." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error applying discounts.", error = ex.Message });
            }
        }
        [HttpPost("remove-expired")]
        public async Task<ActionResult> RemoveExpiredDiscounts()
        {
            try
            {
                var count = await _promotionService.RemoveExpiredDiscountsAsync();
                return Ok(new { message = $"Successfully removed expired discounts from {count} products." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error removing expired discounts.", error = ex.Message });
            }
        }
    }
}