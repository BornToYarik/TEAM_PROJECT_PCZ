using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class Auction
    {
        
        public int Id { get; set; }

        [Required]
        public string ItemName { get; set; } = string.Empty;

        [Required]
        public decimal StartingPrice { get; set; }

        public decimal CurrentPrice { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime EndTime { get; set; }

        public string? LastBidder { get; set; }
        public DateTime? LastBidTime { get; set; }

       
        public List<Bid> Bids { get; set; } = new();
    }
}
