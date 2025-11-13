using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs;

namespace Sklep_internetowy.Server.Controllers.Admin
{
    [Route("api/panel/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public ProductController(StoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            try
            {
                var products = await _context.Products
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
                return StatusCode(500, new { message = "Error loading products", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult> CreateProduct(CreateProductDto createProductDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var product = new Models.Product
                {
                    Name = createProductDto.Name,
                    Price = createProductDto.Price,
                    Quantity = createProductDto.Quantity,
                    Description = createProductDto.Description,
                    DiscountPercentage = createProductDto.DiscountPercentage,
                    DiscountStartDate = createProductDto.DiscountStartDate,
                    DiscountEndDate = createProductDto.DiscountEndDate,
                    ProductCategoryId = createProductDto.ProductCategoryId
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

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

                return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, productDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating product", error = ex.Message });
            }
        }


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
                product.DiscountPercentage = updateProductDto.DiscountPercentage;
                product.DiscountStartDate = updateProductDto.DiscountStartDate;
                product.DiscountEndDate = updateProductDto.DiscountEndDate;
                product.ProductCategoryId = updateProductDto.ProductCategoryId;

                _context.Products.Update(product);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating product", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProductById(int id)
        {
            var product = await _context.Products
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
    }
} 


