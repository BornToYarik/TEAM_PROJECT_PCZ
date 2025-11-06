namespace Sklep_internetowy.Server.DTOs
{
    public class OrderUpdateItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class OrderUpdateDto
    {
        public string Status { get; set; } = null!;
        public List<OrderUpdateItemDto> Products { get; set; } = new List<OrderUpdateItemDto>();
    }
}
