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
    }
}
