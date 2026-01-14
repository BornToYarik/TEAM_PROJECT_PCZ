using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.Services.Promotion;
using System;
using System.Collections.Generic;
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

        // Запрос кандидатов для предпросмотра
        [HttpGet("candidates")]
        public async Task<ActionResult> GetCandidates(
            [FromQuery] int? categoryId,
            [FromQuery] int minStock = 10,
            [FromQuery] int daysInactive = 60)
        {
            try
            {
                var candidates = await _promotionService.GetPromotionCandidatesAsync(categoryId, minStock, daysInactive);
                return Ok(candidates);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching candidates.", error = ex.Message });
            }
        }

        // Применение к выбранному списку
        [HttpPost("apply-selected")]
        public async Task<ActionResult> ApplyToSelected([FromBody] ApplyBulkDiscountRequest request)
        {
            if (request.ProductIds == null || request.ProductIds.Count == 0)
                return BadRequest(new { message = "No products selected." });

            try
            {
                var count = await _promotionService.ApplyBulkDiscountsAsync(
                    request.ProductIds,
                    request.Percentage,
                    request.DurationDays);

                return Ok(new { message = $"Successfully applied discount to {count} products." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error applying bulk discounts.", error = ex.Message });
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

    public class ApplyBulkDiscountRequest
    {
        public List<int> ProductIds { get; set; }
        public int Percentage { get; set; }
        public int DurationDays { get; set; }
    }
}