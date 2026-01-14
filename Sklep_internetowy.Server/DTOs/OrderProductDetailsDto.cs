namespace Sklep_internetowy.Server.DTOs
{
    public class OrderProductDetailsDto
    {
        public int ProductId { get; set; }
        public string Name { get; set; } = null!;
        public int QuantityInOrder { get; set; } 
        public int QuantityInStock { get; set; } 
        public decimal Price { get; set; }
    }
}
