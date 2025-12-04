using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using System;

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
            _context.Auctions.Add(auction);
            await _context.SaveChangesAsync();
            return auction;
        }

        public async Task<bool> PlaceBidAsync(int auctionId, decimal bidAmount)
        {
            var auction = await _context.Auctions.FindAsync(auctionId);

            if (auction == null)
                throw new Exception("Auction not found");

            if (bidAmount <= auction.CurrentPrice)
                return false; 

            auction.CurrentPrice = bidAmount;
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
