namespace Sklep_internetowy.Server.DTOs
{
    public class AuctionDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public decimal CurrentPrice { get; set; }
        public DateTime EndTime { get; set; }
    }
}
