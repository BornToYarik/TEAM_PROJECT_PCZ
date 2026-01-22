using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sklep_internetowy.Server.Controllers.Admin
{
    /// <summary>
    /// Kontroler API odpowiedzialny za zarzadzanie kategoriami produktow oraz filtrowanie ofert specjalnych.
    /// Umozliwia pobieranie list kategorii, szczegolowych danych o kategorii oraz powiazanych z nimi produktow.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ProductCategoryController : ControllerBase
    {
        private readonly StoreDbContext _dbContext;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy ProductCategoryController.
        /// </summary>
        /// <param name="dbContext">Kontekst bazy danych do obslugi operacji na kategoriach i produktach.</param>
        public ProductCategoryController(StoreDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        /// <summary>
        /// Pomocnicza funkcja ustawiajaca rodzaj daty na UTC.
        /// Zapewnia kompatybilnosc z wymaganiami baz danych dotyczacymi stref czasowych.
        /// </summary>
        /// <param name="date">Data do przetworzenia.</param>
        /// <returns>Data z wymuszonym rodzajem DateTimeKind.Utc lub null.</returns>
        private DateTime? SetUtcKind(DateTime? date)
        {
            return date.HasValue ? DateTime.SpecifyKind(date.Value, DateTimeKind.Utc) : null;
        }

        /// <summary>
        /// Pobiera liste wszystkich dostepnych kategorii produktow.
        /// </summary>
        /// <returns>Kolekcja obiektow ProductCategoryDto zawierajacych nazwe, slug i opis kategorii.</returns>
        /// <response code="200">Zwraca liste kategorii.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductCategoryDto>>> GetCategories()
        {
            var categories = await _dbContext.ProductCategories
                .Select(c => new ProductCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description
                })
                .ToListAsync();

            return Ok(categories);
        }

        /// <summary>
        /// Pobiera szczegolowe dane o konkretnej kategorii na podstawie jej tekstowego identyfikatora (slug).
        /// </summary>
        /// <param name="slug">Unikalny, przyjazny adres URL kategorii.</param>
        /// <returns>Obiekt ProductCategoryDto lub blad 404, jesli kategoria nie istnieje.</returns>
        /// <response code="200">Zwraca dane wybranej kategorii.</response>
        /// <response code="404">Gdy kategoria o podanym identyfikatorze nie zostala znaleziona.</response>
        [HttpGet("{slug}")]
        public async Task<ActionResult<ProductCategoryDto>> GetCategoryBySlug(string slug)
        {
            var category = await _dbContext.ProductCategories
                .Where(c => c.Slug == slug)
                .Select(c => new ProductCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Slug = c.Slug,
                    Description = c.Description
                })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return NotFound(new { message = $"Category '{slug}' not found." });
            }

            return Ok(category);
        }

        /// <summary>
        /// Pobiera liste wszystkich produktow objetych aktywna promocja (Deals).
        /// </summary>
        /// <details>
        /// Metoda weryfikuje posiadanie znizki oraz sprawdza, czy aktualna data miesci sie 
        /// w zdefiniowanych ramach czasowych promocji.
        /// </details>
        /// <returns>Lista produktow spelniajacych kryteria promocji wraz z ich zdjeciami.</returns>
        /// <response code="200">Zwraca liste aktywnych promocji.</response>
        /// <response code="500">Gdy wystapi blad serwera podczas przetwarzania danych.</response>
        [HttpGet("deals/products")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetActiveDeals()
        {
            try
            {
                var nowUtc = DateTime.UtcNow;

                var products = await _dbContext.Products
                    .Include(p => p.ProductCategory)
                    // Logika HasActiveDiscount
                    .Where(p => p.DiscountPercentage.HasValue && p.DiscountPercentage.Value > 0 &&
                                (!p.DiscountStartDate.HasValue || p.DiscountStartDate.Value <= nowUtc) &&
                                (!p.DiscountEndDate.HasValue || p.DiscountEndDate.Value >= nowUtc))
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading active deals.", error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        /// <summary>
        /// Pobiera wszystkie produkty przypisane do kategorii o wskazanym identyfikatorze slug.
        /// </summary>
        /// <param name="slug">Tekstowy identyfikator kategorii (np. "laptops").</param>
        /// <returns>Kolekcja produktow nalezacych do danej kategorii.</returns>
        /// <response code="200">Zwraca liste produktow dla kategorii.</response>
        /// <response code="500">Gdy wystapi blad bazy danych lub przetwarzania.</response>
        [HttpGet("{slug}/products")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByCategory(string slug)
        {
            try
            {
                var products = await _dbContext.Products
                    .Include(p => p.ProductCategory)
                    .Where(p => p.ProductCategory.Slug == slug)
                    .Select(p => new ProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        Quantity = p.Quantity,
                        Description = p.Description,
                        // KRYTYCZNO: Upewnij sie, ze wszystkie pola znizek sa wlaczone i wyliczane
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading category products", error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }
    }
}