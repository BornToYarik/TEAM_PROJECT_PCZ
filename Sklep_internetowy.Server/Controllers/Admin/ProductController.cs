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
    [Route("api/panel/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly StoreDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProductController(StoreDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        private DateTime? SetUtcKind(DateTime? date)
        {
            return date.HasValue ? DateTime.SpecifyKind(date.Value, DateTimeKind.Utc) : null;
        }

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
                var categoryExists = await _context.ProductCategories
                    .AnyAsync(c => c.Id == updateProductDto.ProductCategoryId);

                if (!categoryExists)
                {
                    return BadRequest(new { message = $"Category with ID {updateProductDto.ProductCategoryId} does not exist." });
                }

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
    }
}