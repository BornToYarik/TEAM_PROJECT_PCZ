using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Sklep_internetowy.Server.Services.Promotion
{
    public class PromotionService
    {
        private readonly StoreDbContext _context;

        public PromotionService(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProductDto>> GetPromotionCandidatesAsync(int? categoryId, int minStock, int daysSinceLastSale)
        {
            var now = DateTime.UtcNow;

            var query = _context.Products
                .Include(p => p.ProductCategory)
                .Where(p => p.Quantity >= minStock);

            query = query.Where(p =>
                !p.DiscountPercentage.HasValue
                || p.DiscountPercentage <= 0
                || (p.DiscountStartDate.HasValue && p.DiscountStartDate > now)
                || (p.DiscountEndDate.HasValue && p.DiscountEndDate < now)
            );

            if (categoryId.HasValue && categoryId > 0)
            {
                query = query.Where(p => p.ProductCategoryId == categoryId);
            }

            var products = await query.ToListAsync();

            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Quantity = p.Quantity,
                ProductCategoryName = p.ProductCategory.Name,
                HasActiveDiscount = p.HasActiveDiscount
            }).ToList();
        }

        public async Task<int> ApplyBulkDiscountsAsync(List<int> productIds, int percentage, int durationDays)
        {
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToListAsync();

            var startDate = DateTime.UtcNow;
            var endDate = startDate.AddDays(durationDays);

            foreach (var product in products)
            {
                product.DiscountPercentage = percentage;
                product.DiscountStartDate = startDate;
                product.DiscountEndDate = endDate;
            }

            return await _context.SaveChangesAsync();
        }

        public async Task<int> RemoveExpiredDiscountsAsync()
        {
            var now = DateTime.UtcNow;
            var expiredProducts = await _context.Products
                .Where(p => p.DiscountEndDate.HasValue && p.DiscountEndDate.Value < now)
                .ToListAsync();

            foreach (var p in expiredProducts)
            {
                p.DiscountPercentage = null;
                p.DiscountStartDate = null;
                p.DiscountEndDate = null;
            }

            return await _context.SaveChangesAsync();
        }
    }
}