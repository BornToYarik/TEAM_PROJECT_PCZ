using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class Auction
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public decimal StartingPrice { get; set; }
        public decimal CurrentPrice { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public bool IsFinished { get; set; }
        public string? LastBidderId { get; set; }
        public string? WinnerId { get; set; }

        // Navigation properties
        public Product? Product { get; set; }
        public ICollection<Bid> Bids { get; set; } = new List<Bid>();
    }
}
