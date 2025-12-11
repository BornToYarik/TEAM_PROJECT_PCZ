using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class Bid
    {
        public int Id { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public string Bidder { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int AuctionId { get; set; }

        [ForeignKey("AuctionId")]
        public Auction Auction { get; set; } = null!;
    }
}
