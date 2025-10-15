namespace Sklep_internetowy.Server.DTOs
{
    public class OrderDto
    {
       
            public Guid Id { get; set; }
            public DateTime OrderDate { get; set; }
            public string Status { get; set; } = null!;
            public decimal TotalAmount { get; set; }
            public string PaymentMethod { get; set; } = null!;
            public string TransactionId { get; set; } = null!;
            public List<OrderItemDto>? Items { get; set; }
        

      
    }
}
