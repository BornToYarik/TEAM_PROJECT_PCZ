
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;


namespace Sklep_internetowy.Server.Services.Bidding
{
    public class AuctionService
    {
        private readonly StoreDbContext _context;
        private readonly IHubContext<AuctionHub> _hubContext;
        private readonly ILogger<AuctionService> _logger;

        public AuctionService(
            StoreDbContext context,
            IHubContext<AuctionHub> hubContext,
            ILogger<AuctionService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task<Auction> CreateAuctionAsync(int productId, decimal startingPrice, int durationMinutes = 10)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.ProductCategory)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                throw new Exception("Product not found");

            if (product.Quantity < 1)
                throw new Exception("Product is out of stock");

            var auction = new Auction
            {
                ProductId = productId,
                StartingPrice = startingPrice,
                CurrentPrice = startingPrice,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddMinutes(durationMinutes),
                IsFinished = false
            };

            _context.Auctions.Add(auction);
            await _context.SaveChangesAsync();

            // Załaduj produkt ponownie z pełnymi danymi
            auction.Product = product;

            _logger.LogInformation($"Created auction {auction.Id} for product {productId}, duration: {durationMinutes} minutes");

            return auction;
        }

        public async Task<Auction?> GetAuctionByIdAsync(int id)
        {
            return await _context.Auctions
                .Include(a => a.Product)
                    .ThenInclude(p => p.Images)
                .Include(a => a.Product)
                    .ThenInclude(p => p.ProductCategory)
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Auction>> GetActiveAuctionsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Auctions
                .Include(a => a.Product)
                    .ThenInclude(p => p.Images)
                .Include(a => a.Bids)
                .Where(a => a.EndTime > now && !a.IsFinished)
                .ToListAsync();
        }

        public async Task<bool> PlaceBidAsync(int auctionId, decimal amount, string userId)
        {
            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .Include(a => a.Product)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null || auction.IsFinished || auction.EndTime <= DateTime.UtcNow)
            {
                _logger.LogWarning($"Cannot place bid on auction {auctionId}: auction not found, finished, or expired");
                return false;
            }

            if (amount <= auction.CurrentPrice)
            {
                _logger.LogWarning($"Bid amount {amount} is not higher than current price {auction.CurrentPrice}");
                return false;
            }

            var bid = new Bid
            {
                AuctionId = auctionId,
                BidderId = userId,
                Amount = amount,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bids.Add(bid);
            auction.CurrentPrice = amount;
            auction.LastBidderId = userId;


            var timeLeft = auction.EndTime - DateTime.UtcNow;
            if (timeLeft.TotalMinutes < 5)
            {
                auction.EndTime = auction.EndTime.AddMinutes(2);
                _logger.LogInformation($"Extended auction {auctionId} by 2 minutes");
            }

            await _context.SaveChangesAsync();


            var user = await _context.Users.FindAsync(userId);
            var winnerName = user?.UserName ?? user?.Email ?? "Użytkownik";


            await _hubContext.Clients.Group($"auction_{auctionId}")
                .SendAsync("BidPlaced", amount, auction.EndTime, winnerName);

            _logger.LogInformation($"Bid placed on auction {auctionId} by user {userId}, amount: {amount}");

            return true;
        }

        public async Task FinishAuctionAsync(int auctionId)
        {
            using var tx = await _context.Database.BeginTransactionAsync();

            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null || auction.IsFinished)
                return;

            
            auction.IsFinished = true;

            var winningBid = auction.Bids
                .OrderByDescending(b => b.Amount)
                .FirstOrDefault();

            if (winningBid == null)
            {
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                return;
            }

            var winnerExists = await _context.AuctionWinners
                .AnyAsync(w => w.AuctionId == auctionId);

            if (winnerExists)
            {
                await tx.RollbackAsync();
                return;
            }

            _context.AuctionWinners.Add(new AuctionWinner
            {
                AuctionId = auctionId,
                UserId = winningBid.BidderId,
                WinningAmount = winningBid.Amount, 
                WonAt = DateTime.UtcNow,
                IsPaid = false
            });

            await _context.SaveChangesAsync();
            await tx.CommitAsync();

            await _hubContext.Clients
                .Group($"auction_{auctionId}")
                .SendAsync("AuctionFinished", auctionId);
        }



    }

}
