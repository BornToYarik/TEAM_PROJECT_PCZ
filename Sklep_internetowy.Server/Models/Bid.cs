using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class Bid
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }

        public string BidderId { get; set; } = null!;
        public User Bidder { get; set; } = null!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int AuctionId { get; set; }
        public Auction Auction { get; set; } = null!;
    }

}
