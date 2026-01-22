using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Models;

namespace Sklep_internetowy.Server.Controllers.Shop
{
    /// <summary>
    /// Kontroler API odpowiedzialny za dostarczanie danych o produktach dla czesci sklepowej (ogolnodostepnej).
    /// Obsluguje operacje przegladania katalogu produktow oraz wyswietlania szczegolowych informacji o konkretnym towarze.
    /// </summary>
    [Route("api/home/[controller]")]
    [ApiController]
    public class ProductController : Controller
    {
        private readonly StoreDbContext _context;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy ProductController.
        /// </summary>
        /// <param name="context">Kontekst bazy danych StoreDbContext do obslugi zapytan.</param>
        public ProductController(StoreDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Pobiera liste wszystkich produktow zarejestrowanych w systemie wraz z ich kategoriami i powiazanymi zdjeciami.
        /// </summary>
        /// <returns>Kolekcja obiektow ProductDto zawierajaca kompletne dane o cenach, znizkach i mediach.</returns>
        /// <response code="200">Zwraca liste produktow dostepnych w sklepie.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.ProductCategory)
                .Include(p => p.Images)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Quantity = p.Quantity,
                    Description = p.Description,
                    DiscountPercentage = p.DiscountPercentage,
                    DiscountStartDate = p.DiscountStartDate,
                    DiscountEndDate = p.DiscountEndDate,
                    FinalPrice = p.FinalPrice,
                    HasActiveDiscount = p.HasActiveDiscount,
                    ProductCategoryId = p.ProductCategoryId,
                    ProductCategoryName = p.ProductCategory.Name,
                    ProductCategorySlug = p.ProductCategory.Slug,
                    ImageUrls = p.Images.Select(img => img.ImageUrl).ToList()
                })
                .ToListAsync();

            return Ok(products);
        }

        /// <summary>
        /// Pobiera szczegolowe dane o pojedynczym produkcie na podstawie jego unikalnego identyfikatora ID.
        /// </summary>
        /// <param name="id">Identyfikator techniczny produktu.</param>
        /// <returns>Obiekt ProductDto reprezentujacy szczegoly towaru lub NotFound w przypadku braku rekordu.</returns>
        /// <response code="200">Zwraca dane wybranego produktu.</response>
        /// <response code="404">Gdy produkt o podanym ID nie istnieje w bazie danych.</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductCategory)
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
                return NotFound();

            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Quantity = product.Quantity,
                Description = product.Description,
                DiscountPercentage = product.DiscountPercentage,
                DiscountStartDate = product.DiscountStartDate,
                DiscountEndDate = product.DiscountEndDate,
                FinalPrice = product.FinalPrice,
                HasActiveDiscount = product.HasActiveDiscount,
                ProductCategoryId = product.ProductCategoryId,
                ProductCategoryName = product.ProductCategory?.Name,
                ProductCategorySlug = product.ProductCategory?.Slug,

                ImageUrls = product.Images.Select(img => img.ImageUrl).ToList()
            };

            return Ok(productDto);
        }
    }
}