using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.Services.Bidding;

namespace Sklep_internetowy.Server.Controllers.Bidding
{
    [ApiController]
    [Route("api/[controller]")]
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
            if (auction == null || auction.StartingPrice <= 0 || auction.EndTime <= DateTime.UtcNow)
                return BadRequest("Invalid auction data.");

            var created = await _auctionService.CreateAuctionAsync(auction);
            return Ok(created);
        }

        [HttpPost("{id}/bid")]
        public async Task<IActionResult> PlaceBid(int id, [FromBody] BidRequest bid)
        {
            if (bid == null || bid.Amount <= 0 || string.IsNullOrEmpty(bid.Bidder))
                return BadRequest("Invalid bid.");

            try
            {
                var success = await _auctionService.PlaceBidAsync(id, bid.Amount, bid.Bidder);
                if (!success)
                    return BadRequest("Bid must be higher than current price.");

                return Ok("Bid accepted.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveAuctions()
        {
            var auctions = await _auctionService.GetActiveAuctionsAsync();
            return Ok(auctions);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuction(int id)
        {
            var auction = await _auctionService.GetAuctionByIdAsync(id);
            if (auction == null) return NotFound();

            return Ok(auction);
        }
    }
}
