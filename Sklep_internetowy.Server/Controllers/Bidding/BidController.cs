using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.Services.Bidding;

namespace Sklep_internetowy.Server.Controllers.Bidding
{
    public class BidController : ControllerBase
    {
        private readonly AuctionService _auctionService;

        public BidController(AuctionService auctionService)
        {
            _auctionService = auctionService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateAuction([FromBody] Auction auction)
        {
            if (auction == null)
                return BadRequest("Invalid data");

            var created = await _auctionService.CreateAuctionAsync(auction);

            return Ok(created);
        }
        [HttpPost("{id}/bid")]
        public async Task<IActionResult> PlaceBid(int id, [FromBody] BidRequest bid)
        {
            var success = await _auctionService.PlaceBidAsync(id, bid.Amount);

            if (!success)
                return BadRequest("Bid must be higher than current price.");

            return Ok("Bid accepted.");
        }

    }
}
