using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class Bid
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public string BidderId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public Auction? Auction { get; set; }
        public User? User { get; set; } // DODANE - dla relacji z User
    }

}
