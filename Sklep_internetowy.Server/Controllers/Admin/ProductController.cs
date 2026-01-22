using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sklep_internetowy.Server.Controllers.Admin
{
    /// <summary>
    /// Kontroler administracyjny odpowiedzialny za pelne zarzadzanie asortymentem produktow.
    /// Obsluguje operacje CRUD, przesyłanie plikow graficznych, wyszukiwanie oraz system sugestii.
    /// </summary>
    [Route("api/panel/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly StoreDbContext _context;
        private readonly IWebHostEnvironment _environment;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy ProductController.
        /// </summary>
        /// <param name="context">Kontekst bazy danych StoreDbContext.</param>
        /// <param name="environment">Srodowisko serwerowe do obslugi systemu plikow (przesyłanie zdjec).</param>
        public ProductController(StoreDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        /// <summary>
        /// Metoda pomocnicza ustawiajaca rodzaj daty na UTC, wymagana dla kompatybilnosci z baza danych.
        /// </summary>
        /// <param name="date">Data do przetworzenia.</param>
        /// <returns>Data z rodzajem DateTimeKind.Utc lub null.</returns>
        private DateTime? SetUtcKind(DateTime? date)
        {
            return date.HasValue ? DateTime.SpecifyKind(date.Value, DateTimeKind.Utc) : null;
        }

        /// <summary>
        /// Pobiera pelna liste wszystkich produktow wraz z ich kategoriami i zdjeciami.
        /// </summary>
        /// <returns>Kolekcja obiektow ProductDto zawierajaca kompletne dane o produktach.</returns>
        /// <response code="200">Zwraca liste produktow.</response>
        /// <response code="500">Gdy wystapi blad serwera podczas pobierania danych.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            try
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
                        Brand = p.Brand,
                        ProductCategoryName = p.ProductCategory.Name,
                        ProductCategorySlug = p.ProductCategory.Slug,
                        ImageUrls = p.Images.Select(img => img.ImageUrl).ToList()
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading products", error = ex.Message });
            }
        }

        /// <summary>
        /// Pobiera liste wszystkich unikalnych marek produktow dostepnych w bazie danych.
        /// Metoda dostepna publicznie (AllowAnonymous) dla potrzeb filtrowania na froncie.
        /// </summary>
        /// <returns>Lista ciagow znakow reprezentujacych nazwy marek.</returns>
        [AllowAnonymous]
        [HttpGet("all-brands")]
        public async Task<ActionResult<IEnumerable<string>>> GetAllBrands()
        {
            try
            {
                var brands = await _context.Products
                    .Where(p => !string.IsNullOrEmpty(p.Brand))
                    .Select(p => p.Brand)
                    .Distinct()
                    .OrderBy(b => b)
                    .ToListAsync();

                return Ok(brands);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading brands", error = ex.Message });
            }
        }

        /// <summary>
        /// Wyszukuje produkty na podstawie frazy tekstowej dopasowanej do nazwy, marki lub opisu.
        /// </summary>
        /// <param name="q">Zapytanie wyszukiwania wpisane przez uzytkownika.</param>
        /// <returns>Kolekcja produktow spelniajacych kryteria wyszukiwania.</returns>
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q)) return Ok(new List<ProductDto>());

            try
            {
                var query = q.ToLower().Trim();

                var products = await _context.Products
                    .Include(p => p.ProductCategory)
                    .Where(p => p.Name.ToLower().Contains(query) ||
                                p.Brand.ToLower().Contains(query) ||
                                p.Description.ToLower().Contains(query))
                    .Select(p => new ProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        Quantity = p.Quantity,
                        Description = p.Description,
                        Brand = p.Brand,
                        DiscountPercentage = p.DiscountPercentage,
                        DiscountStartDate = p.DiscountStartDate,
                        DiscountEndDate = p.DiscountEndDate,
                        FinalPrice = p.FinalPrice,
                        HasActiveDiscount = p.HasActiveDiscount,
                        ProductCategoryId = p.ProductCategoryId,
                        ProductCategoryName = p.ProductCategory.Name,
                        ImageUrls = p.Images.Select(img => img.ImageUrl).ToList()
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error during search", error = ex.Message });
            }
        }

        /// <summary>
        /// Tworzy nowy produkt w systemie wraz z obsluga przesyłania wielu plikow graficznych.
        /// </summary>
        /// <param name="formDto">Dane produktu przekazane w formacie multipart/form-data.</param>
        /// <returns>Status 200 OK po pomyslnym utworzeniu i zapisaniu plikow.</returns>
        [HttpPost]
        public async Task<ActionResult> CreateProduct([FromForm] CreateProductWithFilesDto formDto)
        {
            var product = new Models.Product
            {
                Name = formDto.Name,
                Price = formDto.Price,
                Quantity = formDto.Quantity,
                Description = formDto.Description,
                ProductCategoryId = formDto.ProductCategoryId,
                DiscountPercentage = formDto.DiscountPercentage,
                DiscountStartDate = SetUtcKind(formDto.DiscountStartDate),
                DiscountEndDate = SetUtcKind(formDto.DiscountEndDate),
                Brand = formDto.Brand
            };

            if (formDto.Images != null && formDto.Images.Count > 0)
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                foreach (var file in formDto.Images)
                {
                    if (file.Length > 0)
                    {
                        var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                        using (var fileStream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(fileStream);
                        }

                        product.Images.Add(new ProductImage
                        {
                            ImageUrl = "/uploads/" + uniqueFileName
                        });
                    }
                }
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok();
        }

        /// <summary>
        /// Usuwa wybrany produkt z bazy danych na podstawie identyfikatora.
        /// </summary>
        /// <param name="removeProductDto">DTO zawierajace identyfikator ID produktu do usuniecia.</param>
        [HttpPost("remove")]
        public async Task<ActionResult> RemoveProduct(RemoveProductDto removeProductDto)
        {
            var product = await _context.Products.FindAsync(removeProductDto.Id);
            if (product == null)
            {
                return NotFound();
            }
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        /// <summary>
        /// Aktualizuje dane techniczne i cenowe istniejacego produktu.
        /// </summary>
        /// <param name="updateProductDto">Obiekt zawierajacy zaktualizowane pola produktu.</param>
        /// <response code="204">Gdy aktualizacja przebiegla pomyslnie.</response>
        /// <response code="404">Gdy produkt nie figuruje w bazie danych.</response>
        [HttpPut("update")]
        public async Task<ActionResult> UpdateProduct(UpdateProductDto updateProductDto)
        {
            try
            {
                var product = await _context.Products.FindAsync(updateProductDto.Id);
                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                product.Name = updateProductDto.Name;
                product.Price = updateProductDto.Price;
                product.Quantity = updateProductDto.Quantity;
                product.Description = updateProductDto.Description;
                product.ProductCategoryId = updateProductDto.ProductCategoryId;

                product.DiscountPercentage = updateProductDto.DiscountPercentage;
                product.DiscountStartDate = SetUtcKind(updateProductDto.DiscountStartDate);
                product.DiscountEndDate = SetUtcKind(updateProductDto.DiscountEndDate);
                product.Brand = updateProductDto.Brand;

                _context.Products.Update(product);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating product", error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        /// <summary>
        /// Pobiera szczegolowe dane pojedynczego produktu.
        /// </summary>
        /// <param name="id">ID produktu.</param>
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProductById(int id)
        {
            var product = await _context.Products
                .Include(p => p.ProductCategory)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound(new { message = "Product not found" });
            }

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
                ProductCategoryName = product.ProductCategory.Name,
                ProductCategorySlug = product.ProductCategory.Slug
            };

            return Ok(productDto);
        }

        /// <summary>
        /// Pobiera liste dwoch unikalnych produktow do porownania na podstawie przekazanych identyfikatorow.
        /// </summary>
        /// <param name="productIds">Lista identyfikatorow ID (maksymalnie 2 unikalne zostana przetworzone).</param>
        [AllowAnonymous]
        [HttpPost("compare-list")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsForComparison([FromBody] List<int> productIds)
        {
            if (productIds == null || !productIds.Any())
            {
                return Ok(new List<ProductDto>());
            }

            var uniqueIds = productIds.Distinct().Take(2).ToList();

            try
            {
                var products = await _context.Products
                    .Where(p => uniqueIds.Contains(p.Id))
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading products for comparison", error = ex.Message });
            }
        }

        /// <summary>
        /// Generuje dynamiczne sugestie wyszukiwania (kategorie i produkty) w czasie rzeczywistym.
        /// </summary>
        /// <param name="q">Fragment nazwy wpisany przez uzytkownika.</param>
        /// <returns>Obiekt zawierajacy liste nazw kategorii oraz liste dopasowanych obiektow ProductDto.</returns>
        [AllowAnonymous]
        [HttpGet("suggestions")]
        public async Task<ActionResult> GetSuggestions([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
            {
                return Ok(new { categories = new List<string>(), products = new List<ProductDto>() });
            }

            try
            {
                var query = q.ToLower().Trim();

                var allProducts = await _context.Products
                    .Include(p => p.ProductCategory)
                    .Include(p => p.Images)
                    .Where(p => p.Name != null && p.Name.ToLower().Contains(query))
                    .ToListAsync();

                var sortedProducts = allProducts
                    .OrderByDescending(p => p.Name.ToLower().StartsWith(query))
                    .ThenBy(p => p.Name.Length)
                    .Take(6)
                    .Select(p => new ProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        FinalPrice = p.FinalPrice,
                        HasActiveDiscount = p.HasActiveDiscount,
                        ProductCategoryName = p.ProductCategory?.Name,
                        Description = p.Description,
                        ImageUrls = p.Images.Select(img => img.ImageUrl).ToList()
                    })
                    .ToList();

                var categories = allProducts
                    .Where(p => p.ProductCategory != null)
                    .Select(p => p.ProductCategory.Name)
                    .Distinct()
                    .OrderBy(c => c)
                    .Take(5)
                    .ToList();

                return Ok(new
                {
                    categories = categories,
                    products = sortedProducts
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Error getting suggestions",
                    error = ex.Message
                });
            }
        }
    }
}