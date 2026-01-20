// ==================== Controllers/BidController.cs ====================
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.Services.Bidding;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;

namespace Sklep_internetowy.Server.Controllers
{
    [Route("api/bid")]
    [ApiController]
    public class BidController : ControllerBase
    {
        private readonly AuctionService _auctionService;
        private readonly ILogger<BidController> _logger;
        private readonly StoreDbContext _context;

        public BidController(AuctionService auctionService, ILogger<BidController> logger, StoreDbContext context)
        {
            _auctionService = auctionService;
            _logger = logger;
            _context = context;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAuction(int id)
        {
            var auction = await _context.Auctions
                .Include(a => a.Product)
                    .ThenInclude(p => p.Images)
                .Include(a => a.Product)
                    .ThenInclude(p => p.ProductCategory)
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (auction == null) return NotFound();

            // Znajdź aktualnego zwycięzcę
            var highestBid = auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();
            string? currentWinnerName = null;

            if (highestBid != null)
            {
                var user = await _context.Users.FindAsync(highestBid.BidderId);
                currentWinnerName = user?.UserName ?? user?.Email ?? "Użytkownik";
            }

            var dto = new AuctionDto
            {
                Id = auction.Id,
                ProductId = auction.ProductId,
                CurrentPrice = auction.CurrentPrice,
                EndTime = auction.EndTime,
                CurrentWinnerName = currentWinnerName,
                Product = new ProductDto
                {
                    Id = auction.Product.Id,
                    Name = auction.Product.Name,
                    Price = auction.Product.Price,
                    Quantity = auction.Product.Quantity,
                    Description = auction.Product.Description,
                    DiscountPercentage = auction.Product.DiscountPercentage,
                    DiscountStartDate = auction.Product.DiscountStartDate,
                    DiscountEndDate = auction.Product.DiscountEndDate,
                    FinalPrice = auction.Product.FinalPrice,
                    HasActiveDiscount = auction.Product.HasActiveDiscount,
                    ProductCategoryId = auction.Product.ProductCategoryId,
                    ProductCategoryName = auction.Product.ProductCategory.Name,
                    ProductCategorySlug = auction.Product.ProductCategory.Slug,
                    ImageUrls = auction.Product.Images.Select(i => i.ImageUrl).ToList()
                }
            };

            return Ok(dto);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveAuctions()
        {
            var now = DateTime.UtcNow;
            var auctions = await _context.Auctions
                .Include(a => a.Product)
                    .ThenInclude(p => p.Images)
                .Include(a => a.Bids)
                .Where(a => a.EndTime > now && !a.IsFinished)
                .ToListAsync();

            var auctionDtos = new List<AuctionDto>();

            foreach (var auction in auctions)
            {
                var highestBid = auction.Bids.OrderByDescending(b => b.Amount).FirstOrDefault();
                string? currentWinnerName = null;

                if (highestBid != null)
                {
                    var user = await _context.Users.FindAsync(highestBid.BidderId);
                    currentWinnerName = user?.UserName ?? user?.Email ?? "Użytkownik";
                }

                auctionDtos.Add(new AuctionDto
                {
                    Id = auction.Id,
                    ProductId = auction.ProductId,
                    CurrentPrice = auction.CurrentPrice,
                    EndTime = auction.EndTime,
                    CurrentWinnerName = currentWinnerName,
                    Product = new ProductDto
                    {
                        Id = auction.Product.Id,
                        Name = auction.Product.Name,
                        ImageUrls = auction.Product.Images.Select(i => i.ImageUrl).ToList()
                    }
                });
            }
            _logger.LogInformation($"Now: {DateTime.UtcNow}, Auctions count: {auctions.Count}");
            foreach (var a in auctions)
            {
                _logger.LogInformation($"AuctionId: {a.Id}, EndTime: {a.EndTime}, IsFinished: {a.IsFinished}");
            }

            return Ok(auctionDtos);
        }

        [HttpPost("{id}/bid")]
        [Authorize]
        public async Task<IActionResult> PlaceBid(int id, [FromBody] PlaceBidDto dto)
        {
            try
            {
                _logger.LogInformation("=== PlaceBid START ===");
                _logger.LogInformation($"AuctionId: {id}");
                _logger.LogInformation($"DTO received: {dto != null}");

                if (dto == null)
                {
                    _logger.LogError("DTO is null!");
                    return BadRequest(new { error = "Invalid request data" });
                }

                _logger.LogInformation($"Amount: {dto.Amount}");

                // Pobierz UserId z tokena
                var userId = User.FindFirst("sub")?.Value
                    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

                _logger.LogInformation($"UserId from token: {userId}");

                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogError("UserId is null or empty");

                    // Debug: wyświetl wszystkie claims
                    _logger.LogInformation("Available claims:");
                    foreach (var claim in User.Claims)
                    {
                        _logger.LogInformation($"  {claim.Type} = {claim.Value}");
                    }

                    return Unauthorized(new { error = "User not authenticated" });
                }

                _logger.LogInformation($"Calling PlaceBidAsync...");
                var success = await _auctionService.PlaceBidAsync(id, dto.Amount, userId);

                if (!success)
                {
                    _logger.LogWarning("PlaceBidAsync returned false");
                    return BadRequest(new { error = "Bid too low or auction finished" });
                }

                _logger.LogInformation("=== PlaceBid SUCCESS ===");
                return Ok(new { success = true, message = "Bid placed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception in PlaceBid");
                _logger.LogError($"Message: {ex.Message}");
                _logger.LogError($"StackTrace: {ex.StackTrace}");

                if (ex.InnerException != null)
                {
                    _logger.LogError($"InnerException: {ex.InnerException.Message}");
                }

                return StatusCode(500, new { error = ex.Message, details = ex.InnerException?.Message });
            }
        }

        [HttpPost("create")]
     
        public async Task<IActionResult> CreateAuction([FromBody] CreateAuctionDto dto)
        {
            try
            {
                var auction = await _auctionService.CreateAuctionAsync(
                    dto.ProductId,
                    dto.StartingPrice,
                    dto.DurationMinutes
                );
                return Ok(auction);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating auction");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}