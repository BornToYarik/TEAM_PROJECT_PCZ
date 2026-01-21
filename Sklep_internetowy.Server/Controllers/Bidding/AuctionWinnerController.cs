// ==================== Controllers/AuctionWinnerController.cs ====================
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs;
using System.Security.Claims;

namespace Sklep_internetowy.Server.Controllers
{
    [Route("api/auction-winner")]
    [ApiController]

    public class AuctionWinnerController : ControllerBase
    {
        private readonly StoreDbContext _context;
        private readonly ILogger<AuctionWinnerController> _logger;

        public AuctionWinnerController(StoreDbContext context, ILogger<AuctionWinnerController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/auction-winner/{auctionId}
        [HttpGet("{auctionId}")]
        public async Task<IActionResult> GetAuctionWinner(int auctionId)
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var auctionWinner = await _context.AuctionWinners
                .Include(aw => aw.Auction)
                    .ThenInclude(a => a.Product)
                    .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(aw => aw.AuctionId == auctionId && aw.UserId == userId);

            if (auctionWinner == null)
                return NotFound(new { message = "You are not the winner of this auction" });

            var firstImage = auctionWinner.Auction.Product.Images.FirstOrDefault();

            var dto = new
            {
                auctionId = auctionWinner.AuctionId,
                productName = auctionWinner.Auction.Product.Name,
                productImage = firstImage != null
                    ? (firstImage.ImageUrl.StartsWith("http")
                        ? firstImage.ImageUrl
                        : $"http://localhost:8080{firstImage.ImageUrl}")
                    : null,
                winningAmount = auctionWinner.WinningAmount,
                wonAt = auctionWinner.WonAt,
                isPaid = auctionWinner.IsPaid,
                orderId = auctionWinner.OrderId
            };

            return Ok(dto);
        }
        [HttpPost("auction/{auctionId}/add-to-cart")]
        public async Task<IActionResult> AddAuctionWinToCart(int auctionId)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var winner = await _context.AuctionWinners
                .Include(aw => aw.Auction)
                    .ThenInclude(a => a.Product)
                .FirstOrDefaultAsync(aw => aw.AuctionId == auctionId && aw.UserId == userId);

            if (winner == null) return NotFound(new { message = "You are not the winner" });
            if (winner.IsPaid) return BadRequest(new { message = "Already paid" });

            var product = winner.Auction.Product;
            if (product == null) return NotFound(new { message = "Product not found" });

            return Ok(new
            {
                id = product.Id,
                name = product.Name,
                price = winner.WinningAmount,
                auctionId = auctionId,
                quantity = 1
            });
        }

        [HttpPost("mark-auction-paid")]
        [Authorize]
        public async Task<IActionResult> MarkAuctionPaid([FromBody] MarkPaidRequest request)
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var winner = await _context.AuctionWinners
                .FirstOrDefaultAsync(w => w.AuctionId == request.AuctionId && w.UserId == userId);

            if (winner == null)
                return NotFound(new { message = "Auction win not found" });

            if (winner.IsPaid)
                return BadRequest(new { message = "Already paid" });

            winner.IsPaid = true;
            winner.PaidAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Payment status updated" });
        }

        public class PaymentRequest
        {
            public long Amount { get; set; }
        }

        public class MarkPaidRequest
        {
            public int AuctionId { get; set; }
        }



        // GET: api/auction-winner/my-wins
        [HttpGet("my-wins")]
        public async Task<IActionResult> GetMyWins()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized();

            var wins = await _context.AuctionWinners
                .Include(aw => aw.Auction)
                    .ThenInclude(a => a.Product)
                    .ThenInclude(p => p.Images)
                .Where(aw => aw.UserId == userId)
                .OrderByDescending(aw => aw.WonAt)
                .Select(aw => new
                {
                    auctionId = aw.AuctionId,
                    productName = aw.Auction.Product.Name,
                    productImage = aw.Auction.Product.Images.FirstOrDefault() != null
                        ? (aw.Auction.Product.Images.FirstOrDefault().ImageUrl.StartsWith("http")
                            ? aw.Auction.Product.Images.FirstOrDefault().ImageUrl
                            : $"http://localhost:8080{aw.Auction.Product.Images.FirstOrDefault().ImageUrl}")
                        : null,
                    winningAmount = aw.WinningAmount,
                    wonAt = aw.WonAt,
                    isPaid = aw.IsPaid,
                    orderId = aw.OrderId
                })
                .ToListAsync();

            return Ok(wins);
        }

        private string? GetUserId()
        {
            return User.FindFirst("sub")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;
        }
    }
}