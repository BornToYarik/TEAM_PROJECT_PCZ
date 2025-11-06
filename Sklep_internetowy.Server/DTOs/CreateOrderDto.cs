namespace Sklep_internetowy.Server.DTOs
{
    public class CreateOrderItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class CreateOrderRequestDto
    {
        public string UserId { get; set; } = null!; 
        public List<CreateOrderItemDto> Products { get; set; } = new List<CreateOrderItemDto>();
    }
}
