namespace Sklep_internetowy.Server.DTOs
{
    public class CreateProductWithFilesDto
    {
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? Description { get; set; }
        public int ProductCategoryId { get; set; }

        public decimal? DiscountPercentage { get; set; }
        public DateTime? DiscountStartDate { get; set; }
        public DateTime? DiscountEndDate { get; set; }

        public List<IFormFile>? Images { get; set; }
    }
}
