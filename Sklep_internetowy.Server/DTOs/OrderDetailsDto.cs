namespace Sklep_internetowy.Server.DTOs
{
    public class OrderDetailsDto
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public string UserEmail { get; set; } = null!; 
        public string Status { get; set; } = null!;
        public List<OrderProductDetailsDto> Products { get; set; } = new List<OrderProductDetailsDto>();
    }
}
