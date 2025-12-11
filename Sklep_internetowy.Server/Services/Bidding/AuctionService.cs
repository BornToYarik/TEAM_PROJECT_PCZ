using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Sklep_internetowy.Server.Services.Bidding
{
    public class AuctionService
    {
        private readonly StoreDbContext _context;

        public AuctionService(StoreDbContext context)
        {
            _context = context;
        }

        
        public async Task<Auction> CreateAuctionAsync(Auction auction)
        {
            auction.CurrentPrice = auction.StartingPrice;
            _context.Auctions.Add(auction);
            await _context.SaveChangesAsync();
            return auction;
        }

     
        public async Task<bool> PlaceBidAsync(int auctionId, decimal bidAmount, string bidder)
        {
            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null)
                throw new Exception("Auction not found");

            if (DateTime.UtcNow > auction.EndTime)
                throw new Exception("Auction has ended");

            if (bidAmount <= auction.CurrentPrice)
                return false;

           
            auction.CurrentPrice = bidAmount;
            auction.LastBidder = bidder;
            auction.LastBidTime = DateTime.UtcNow;

            
            var bid = new Bid
            {
                Amount = bidAmount,
                Bidder = bidder,
                AuctionId = auction.Id
            };
            _context.Bids.Add(bid);

            await _context.SaveChangesAsync();
            return true;
        }

       
        public async Task<List<Auction>> GetActiveAuctionsAsync()
        {
            return await _context.Auctions
                .Where(a => a.EndTime > DateTime.UtcNow)
                .Include(a => a.Bids)
                .ToListAsync();
        }

       
        public async Task<Auction?> GetAuctionByIdAsync(int id)
        {
            return await _context.Auctions
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == id);
        }
    }
}
