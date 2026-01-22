using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.Services.Promotion;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Sklep_internetowy.Server.Controllers.Admin
{
    /// <summary>
    /// Kontroler administracyjny odpowiedzialny za zarzadzanie kampaniami promocyjnymi.
    /// Umozliwia identyfikacje produktow kwalifikujacych sie do obnizek oraz masowe nakladanie rabatow.
    /// </summary>
    [Route("api/panel/[controller]")]
    [ApiController]
    public class PromotionController : ControllerBase
    {
        private readonly PromotionService _promotionService;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy PromotionController.
        /// </summary>
        /// <param name="promotionService">Serwis obslugujacy logike biznesowa promocji.</param>
        public PromotionController(PromotionService promotionService)
        {
            _promotionService = promotionService;
        }

        /// <summary>
        /// Pobiera liste produktow spelniajacych kryteria do objecia nowa promocja.
        /// </summary>
        /// <param name="categoryId">Opcjonalny identyfikator kategorii do filtrowania.</param>
        /// <param name="minStock">Minimalny stan magazynowy wymagany do wyswietlenia produktu (domyslnie 10).</param>
        /// <param name="daysInactive">Liczba dni bez aktywnosci sprzedazowej (domyslnie 60).</param>
        /// <returns>Kolekcja obiektow DTO reprezentujacych kandydatow do promocji.</returns>
        /// <response code="200">Zwraca liste kandydatow.</response>
        /// <response code="500">W przypadku bledu serwera podczas pobierania danych.</response>
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

        /// <summary>
        /// Naklada rabat procentowy na wybrana grupe produktow na okreslony czas.
        /// </summary>
        /// <param name="request">Obiekt zawierajacy liste ID produktow, procent rabatu oraz czas trwania promocji w dniach.</param>
        /// <returns>Informacja o liczbie pomyslnie zaktualizowanych produktow.</returns>
        /// <response code="200">Promocja zostala pomyslnie nalozona.</response>
        /// <response code="400">Gdy nie wybrano zadnych produktow w zadaniu.</response>
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

        /// <summary>
        /// Usuwa dane o znizkach dla wszystkich produktow, ktorych czas trwania promocji juz uplynal.
        /// </summary>
        /// <returns>Komunikat o liczbie produktow, z ktorych usunieto wygasle rabaty.</returns>
        /// <response code="200">Wygasle promocje zostaly pomyslnie usuniete z bazy danych.</response>
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

    /// <summary>
    /// Klasa pomocnicza (DTO) reprezentujaca zadanie masowego nalozenia rabatow.
    /// </summary>
    public class ApplyBulkDiscountRequest
    {
        /// <summary>Lista identyfikatorow produktow objetych akcja promocyjna.</summary>
        public List<int> ProductIds { get; set; }
        /// <summary>Wartosc procentowa znizki (np. 20 dla 20% rabatu).</summary>
        public int Percentage { get; set; }
        /// <summary>Liczba dni, przez ktore promocja bedzie aktywna od momentu nalozenia.</summary>
        public int DurationDays { get; set; }
    }
}