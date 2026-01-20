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

    
        [HttpPost("{auctionId}/pay")]
        public async Task<IActionResult> PayForAuction(int auctionId)
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var auctionWinner = await _context.AuctionWinners
                .Include(aw => aw.Order)
                    .ThenInclude(o => o.OrderProducts)
                    .ThenInclude(op => op.Product)
                .Include(aw => aw.Auction)
                    .ThenInclude(a => a.Product)
                .FirstOrDefaultAsync(aw => aw.AuctionId == auctionId && aw.UserId == userId);

            if (auctionWinner == null) return NotFound(new { message = "You are not the winner" });
            if (auctionWinner.IsPaid) return BadRequest(new { message = "Already paid" });

            auctionWinner.Order.Status = "Paid";
            auctionWinner.IsPaid = true;
            await _context.SaveChangesAsync();

            
            var products = auctionWinner.Order.OrderProducts.Select(op => new
            {
                name = op.Product.Name,
                quantity = op.Quantity > 0 ? op.Quantity : 1,
                price = op.Price 
            }).ToList();

            decimal subtotal = products.Sum(p => p.price * p.quantity);
            decimal tax = subtotal * 0.23m; 
            decimal total = subtotal + tax;

            var orderDto = new
            {
                id = auctionWinner.Order.Id,
                orderDate = auctionWinner.Order.OrderDate,
                status = auctionWinner.Order.Status,
                subtotal,
                tax,
                total,
                products
            };

            return Ok(orderDto);
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