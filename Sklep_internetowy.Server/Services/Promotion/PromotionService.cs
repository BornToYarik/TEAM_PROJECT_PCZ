using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace Sklep_internetowy.Server.Services.Promotion
{
    public class PromotionService
    {
        private readonly StoreDbContext _context;

        private const int MIN_STOCK_LEVEL = 10;
        private const int DAYS_SINCE_LAST_SALE = 60;
        private const decimal PROMOTION_PERCENTAGE = 15;
        private const int PROMOTION_DURATION_DAYS = 14;

        public PromotionService(StoreDbContext context)
        {
            _context = context;
        }

        public async Task<int> ApplyStockClearanceDiscountsAsync()
        {
            var todayUtc = DateTime.UtcNow.Date;
            var cutOffDateUtc = todayUtc.AddDays(-DAYS_SINCE_LAST_SALE);

            
            var potentialProducts = await _context.Products
                .Where(p => p.Quantity >= MIN_STOCK_LEVEL &&
                            (!p.DiscountPercentage.HasValue || p.DiscountPercentage.Value < PROMOTION_PERCENTAGE))
                .ToListAsync();

            var productsToUpdate = new List<Product>();

            foreach (var product in potentialProducts)
            {
                
                var lastSaleDate = await _context.OrderProducts
                    .Where(op => op.ProductId == product.Id)
                    .OrderByDescending(op => op.Order.OrderDate)
                    .Select(op => (DateTime?)op.Order.OrderDate)
                    .FirstOrDefaultAsync();

                
                bool needsDiscount = !lastSaleDate.HasValue || lastSaleDate.Value.Date <= cutOffDateUtc;

                if (needsDiscount)
                {
                    product.DiscountPercentage = PROMOTION_PERCENTAGE;
                    product.DiscountStartDate = todayUtc;
                    product.DiscountEndDate = todayUtc.AddDays(PROMOTION_DURATION_DAYS);

                    productsToUpdate.Add(product);
                }
            }

            if (productsToUpdate.Count > 0)
            {
                _context.Products.UpdateRange(productsToUpdate);
                await _context.SaveChangesAsync();
            }

            return productsToUpdate.Count;
        }

        
        public async Task<int> RemoveExpiredDiscountsAsync()
        {
            var nowUtc = DateTime.UtcNow;

            var productsToRemoveDiscount = await _context.Products
                .Where(p => p.DiscountPercentage.HasValue && p.DiscountPercentage > 0 &&
                            p.DiscountEndDate.HasValue && 
                            p.DiscountEndDate.Value < nowUtc) 
                .ToListAsync();

            foreach (var product in productsToRemoveDiscount)
            {
                
                product.DiscountPercentage = null;
                product.DiscountStartDate = null;
                product.DiscountEndDate = null;
            }

            if (productsToRemoveDiscount.Count > 0)
            {
                _context.Products.UpdateRange(productsToRemoveDiscount);
                await _context.SaveChangesAsync();
            }

            return productsToRemoveDiscount.Count;
        }
    }
}