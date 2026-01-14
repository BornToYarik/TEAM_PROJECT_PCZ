using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.Services.Bidding;
using System.Security.Claims;

namespace Sklep_internetowy.Server.Controllers
{
    [Route("api/bid")]
    [ApiController]
    public class BidController : ControllerBase
    {
        private readonly AuctionService _auctionService;

        public BidController(AuctionService auctionService)
        {
            _auctionService = auctionService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuction(int id)
        {
            var auction = await _auctionService.GetAuctionByIdAsync(id);
            if (auction == null)
                return NotFound();
            return Ok(auction);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveAuctions()
        {
            var auctions = await _auctionService.GetActiveAuctionsAsync();
            return Ok(auctions);
        }

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


        [HttpPost("create")]
        public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionDto dto)
        {
            var auction = await _auctionService.CreateAuctionAsync(dto.ProductId, dto.StartingPrice);
            return Ok(auction);
        }

    }
}

