using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs;

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
                return NotFound();
            }

            return Ok(category);
        }

        [HttpGet("{slug}/products")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByCategory(string slug)
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
                    ProductCategoryId = p.ProductCategoryId,
                    ProductCategoryName = p.ProductCategory.Name,
                    ProductCategorySlug = p.ProductCategory.Slug
                })
                .ToListAsync();

            return Ok(products);
        }
    }
}

