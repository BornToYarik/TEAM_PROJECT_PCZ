using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.DTOs;

namespace Sklep_internetowy.Server.Services.Bidding
{
    public class AuctionService
    {
        private readonly StoreDbContext _context;
        private readonly ILogger<AuctionService> _logger;

        public AuctionService(StoreDbContext context, ILogger<AuctionService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<Auction> CreateAuctionAsync(int productId, decimal startingPrice)
        {
            var product = await _context.Products.FindAsync(productId);
            if (product == null)
                throw new Exception("Product not found");

            if (product.IsOnAuction)
                throw new Exception("Product is already on auction");

            product.IsOnAuction = true;

            var auction = new Auction
            {
                ProductId = productId,
                StartingPrice = startingPrice,
                CurrentPrice = startingPrice,
                EndTime = DateTime.UtcNow.AddMinutes(10)
            };

            _context.Auctions.Add(auction);
            await _context.SaveChangesAsync();

            return auction;
        }

        public async Task<Auction?> GetAuctionByIdAsync(int auctionId)
        {
            return await _context.Auctions
                .Include(a => a.Product)
                .FirstOrDefaultAsync(a => a.Id == auctionId);
        }

        public async Task<bool> PlaceBidAsync(int auctionId, decimal amount, string userId)
        {
            try
            {
                _logger.LogInformation($"PlaceBidAsync called: AuctionId={auctionId}, Amount={amount}, UserId={userId}");

                var auction = await _context.Auctions
                    .Include(a => a.Product)
                    .FirstOrDefaultAsync(a => a.Id == auctionId);

                if (auction == null)
                {
                    _logger.LogWarning($"Auction not found: {auctionId}");
                    throw new Exception("Auction not found");
                }

                if (auction.IsFinished)
                {
                    _logger.LogWarning($"Auction already finished: {auctionId}");
                    return false;
                }

                if (amount <= auction.CurrentPrice)
                {
                    _logger.LogWarning($"Bid too low: {amount} <= {auction.CurrentPrice}");
                    return false;
                }

                _logger.LogInformation($"Updating auction: OldPrice={auction.CurrentPrice}, NewPrice={amount}");

                auction.CurrentPrice = amount;
                auction.LastBidderId = userId;
                auction.EndTime = DateTime.UtcNow.AddMinutes(10);

                var bid = new Bid
                {
                    Amount = amount,
                    BidderId = userId,
                    AuctionId = auctionId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Bids.Add(bid);

                var savedChanges = await _context.SaveChangesAsync();
                _logger.LogInformation($"Bid saved successfully. Changes: {savedChanges}");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error in PlaceBidAsync: AuctionId={auctionId}, Amount={amount}, UserId={userId}");
                throw;
            }
        }

        public async Task<List<AuctionDto>> GetActiveAuctionsAsync()
        {
            return await _context.Auctions
                .Include(a => a.Product)
                .Where(a => !a.IsFinished)
                .Select(a => new AuctionDto
                {
                    Id = a.Id,
                    ProductId = a.ProductId,
                    ProductName = a.Product.Name,
                    CurrentPrice = a.CurrentPrice,
                    EndTime = a.EndTime
                })
                .ToListAsync();
        }

        public async Task FinishAuctionAsync(Auction auction)
        {
            auction.IsFinished = true;
            auction.WinnerId = auction.LastBidderId;

            var product = await _context.Products.FindAsync(auction.ProductId);
            if (product != null)
            {
                if (auction.WinnerId != null)
                {
                    product.OwnerId = auction.WinnerId;
                }
              
                product.IsOnAuction = false;
            }

            await _context.SaveChangesAsync();
        }
    }
}