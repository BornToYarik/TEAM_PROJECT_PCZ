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
    [Route("api/[controller]")]
    [ApiController]
    public class ProductCategoryController : ControllerBase
    {
        private readonly StoreDbContext _dbContext;

        public ProductCategoryController(StoreDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Вспомогательная функция для установки Kind=Utc
        private DateTime? SetUtcKind(DateTime? date)
        {
            return date.HasValue ? DateTime.SpecifyKind(date.Value, DateTimeKind.Utc) : null;
        }


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

        // Метод для получения всех активных акционных товаров (Deals)
        [HttpGet("deals/products")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetActiveDeals()
        {
            try
            {
                var nowUtc = DateTime.UtcNow;

                var products = await _dbContext.Products
                    .Include(p => p.ProductCategory)
                    // Логика HasActiveDiscount
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
                        ProductCategorySlug = p.ProductCategory.Slug
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error loading active deals.", error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }

        // Метод для получения продуктов по slug категории (Accessories, Laptops, etc.)
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
                        // КРИТИЧНО: Убедитесь, что все поля скидок включены и вычисляются
                        DiscountPercentage = p.DiscountPercentage,
                        DiscountStartDate = p.DiscountStartDate,
                        DiscountEndDate = p.DiscountEndDate,
                        FinalPrice = p.FinalPrice,
                        HasActiveDiscount = p.HasActiveDiscount,
                        ProductCategoryId = p.ProductCategoryId,
                        ProductCategoryName = p.ProductCategory.Name,
                        ProductCategorySlug = p.ProductCategory.Slug
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