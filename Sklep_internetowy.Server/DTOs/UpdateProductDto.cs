using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.DTOs
{
    public class UpdateProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? Description { get; set; }
        [Range(0, 100)]
        public decimal? DiscountPercentage { get; set; }

        public DateTime? DiscountStartDate { get; set; }
        public DateTime? DiscountEndDate { get; set; }
        public int ProductCategoryId { get; set; }
        public string Brand { get; set; } = null!;
    }
}
