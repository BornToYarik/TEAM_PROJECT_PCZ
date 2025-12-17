namespace Sklep_internetowy.Server.DTOs
{
    public class BidRequest
    {
        public decimal Amount { get; set; }
        public string Bidder { get; set; } = string.Empty;
    }
}
