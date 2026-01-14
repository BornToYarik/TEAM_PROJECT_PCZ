using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class Auction
    {

        public int Id { get; set; }

   
        public int ProductId { get; set; }
        public Product Product { get; set; } = null!;

        public decimal StartingPrice { get; set; }
        public decimal CurrentPrice { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime EndTime { get; set; }


        public string? LastBidderId { get; set; }
        public User? LastBidder { get; set; }

        public bool IsFinished { get; set; }
        public string? WinnerId { get; set; }

        public List<Bid> Bids { get; set; } = new();
    }
}
