using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.Services.Bidding;
using System.Security.Claims;

namespace Sklep_internetowy.Server.Controllers
{
    /// <summary>
    /// Kontroler API odpowiedzialny za obsluge systemu aukcyjnego oraz licytacji.
    /// Umozliwia przegladanie aktywnych aukcji, skladanie ofert oraz wystawianie nowych przedmiotow na licytacje.
    /// </summary>
    [Route("api/bid")]
    [ApiController]
    public class BidController : ControllerBase
    {
        private readonly AuctionService _auctionService;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy BidController.
        /// </summary>
        /// <param name="auctionService">Serwis obslugujacy logike biznesowa aukcji i licytacji.</param>
        public BidController(AuctionService auctionService)
        {
            _auctionService = auctionService;
        }

        /// <summary>
        /// Pobiera szczegolowe informacje o konkretnej aukcji na podstawie jej identyfikatora.
        /// </summary>
        /// <param name="id">Unikalny identyfikator aukcji.</param>
        /// <returns>Obiekt aukcji lub blad 404 w przypadku braku znalezienia.</returns>
        /// <response code="200">Zwraca dane wybranej aukcji.</response>
        /// <response code="404">Gdy aukcja o podanym ID nie istnieje.</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuction(int id)
        {
            var auction = await _auctionService.GetAuctionByIdAsync(id);
            if (auction == null)
                return NotFound();
            return Ok(auction);
        }

        /// <summary>
        /// Pobiera liste wszystkich obecnie trwajacych (aktywnych) aukcji.
        /// </summary>
        /// <returns>Kolekcja aktywnych aukcji.</returns>
        /// <response code="200">Zwraca liste aktywnych licytacji.</response>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveAuctions()
        {
            var auctions = await _auctionService.GetActiveAuctionsAsync();
            return Ok(auctions);
        }

        /// <summary>
        /// Pozwala zalogowanemu uzytkownikowi na zlozenie oferty (podbicie ceny) w wybranej aukcji.
        /// </summary>
        /// <param name="id">ID aukcji, w ktorej skladana jest oferta.</param>
        /// <param name="dto">Obiekt DTO zawierajacy deklarowana kwote licytacji.</param>
        /// <returns>Informacja o powodzeniu operacji lub blad walidacji licytacji.</returns>
        /// <response code="200">Oferta zostala pomyslnie przyjeta.</response>
        /// <response code="400">Gdy oferta jest zbyt niska, aukcja sie zakonczyla lub wystapil blad autoryzacji.</response>
        [HttpPost("{id}/bid")]
        public async Task<IActionResult> PlaceBid(int id, [FromBody] PlaceBidDto dto)
        {
            var userId = User.FindFirst("sub")?.Value
                         ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var success = await _auctionService.PlaceBidAsync(id, dto.Amount, userId);
            if (!success)
                return BadRequest("Bid too low or auction finished");

            return Ok(new { success = true });
        }

        /// <summary>
        /// Tworzy nowa aukcje dla wskazanego produktu z okreslona cena wywolawcza.
        /// </summary>
        /// <param name="dto">Dane niezbedne do utworzenia aukcji (ID produktu, cena startowa).</param>
        /// <returns>Dane nowo utworzonej aukcji.</returns>
        /// <response code="200">Aukcja zostala pomyslnie utworzona.</response>
        [HttpPost("create")]
        public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionDto dto)
        {
            var auction = await _auctionService.CreateAuctionAsync(dto.ProductId, dto.StartingPrice);
            return Ok(auction);
        }
    }
}