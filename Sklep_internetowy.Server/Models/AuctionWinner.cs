namespace Sklep_internetowy.Server.Models
{
    public class AuctionWinner
    {
        public int Id { get; set; }
        public int AuctionId { get; set; }
        public string UserId { get; set; }
        public decimal WinningAmount { get; set; }
        public DateTime WonAt { get; set; }
        public bool IsPaid { get; set; }
        public int? OrderId { get; set; }
        public DateTime? PaidAt { get; set; }

        public Auction Auction { get; set; } = null!;
        public User User { get; set; } = null!;
        public Order? Order { get; set; }
        
    }
}
