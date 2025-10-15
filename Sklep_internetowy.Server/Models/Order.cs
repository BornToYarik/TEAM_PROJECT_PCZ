namespace Sklep_internetowy.Server.Models
{
    public class Order
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public User User { get; set; } = null!;
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Pending";
        public decimal TotalAmount { get; set; }
        public string PaymentMethod { get; set; } = "PayPal";
        public string TransactionId { get; set; } = null!; 
        public ICollection<OrderItem>? Items { get; set; }
    }
}
