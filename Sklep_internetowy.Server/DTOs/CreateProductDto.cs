using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.DTOs
{
    public class CreateProductDto
    {
        [Required(ErrorMessage = "Product name is required.")]
        public string Name { get; set; } = null!;
        [Required]
        public decimal Price { get; set; }
        [Required]
        public int Quantity { get; set; }
        public string? Description { get; set; }

        [Range(0, 100)]
        public decimal? DiscountPercentage { get; set; }

        public DateTime? DiscountStartDate { get; set; }
        public DateTime? DiscountEndDate { get; set; }

        [Required(ErrorMessage = "Category is required.")]
        public int ProductCategoryId { get; set; }
    }
}
