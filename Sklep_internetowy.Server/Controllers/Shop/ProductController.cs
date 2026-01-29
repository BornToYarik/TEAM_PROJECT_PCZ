using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Models;

namespace Sklep_internetowy.Server.Controllers.Shop
{
    [Route("api/home/[controller]")]
    [ApiController]
    public class ProductController : Controller
    {
        private readonly StoreDbContext _context;

        public ProductController(StoreDbContext context)
        {
            _context = context;
        }

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
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q)) return Ok(new List<ProductDto>());

            try
            {
                var query = q.ToLower().Trim();

                var products = await _context.Products
                    .Include(p => p.ProductCategory)
                    .Include(p => p.Images)
                    .Where(p => p.Name.ToLower().Contains(query) ||
                                p.Brand.ToLower().Contains(query) ||
                                (p.Description != null && p.Description.ToLower().Contains(query)) ||
                                (p.ProductCategory != null && p.ProductCategory.Name.ToLower().Contains(query)) ||
                                (p.ProductCategory != null && p.ProductCategory.Slug.ToLower().Contains(query)))
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
                        ProductCategoryName = p.ProductCategory != null ? p.ProductCategory.Name : "Uncategorized",
                        ProductCategorySlug = p.ProductCategory != null ? p.ProductCategory.Slug : "none",
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
    }
}
