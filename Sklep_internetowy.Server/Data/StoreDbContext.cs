using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Models;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Sklep_internetowy.Server.Data
{
    public class StoreDbContext:IdentityDbContext<User>
    {
        public StoreDbContext(DbContextOptions<StoreDbContext> options) : base(options)
        {
        }
        public DbSet<Auction> Auctions { get; set; } = null!;
        public DbSet<Bid> Bids { get; set; } = null!;
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderProduct> OrderProducts => Set<OrderProduct>();
        public DbSet<UserMessage> Messages { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder) 
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<OrderProduct>()
                .HasKey(op => new { op.OrderId, op.ProductId });

            modelBuilder.Entity<OrderProduct>()
                .HasOne(op => op.Order)
                .WithMany(o => o.OrderProducts)
                .HasForeignKey(op => op.OrderId);

            modelBuilder.Entity<OrderProduct>()
                .HasOne(op => op.Product)
                .WithMany(p => p.OrderProducts)
                .HasForeignKey(op => op.ProductId);

            modelBuilder.Entity<Product>()
                .HasOne(p => p.ProductCategory)
                .WithMany(pc => pc.Products)
                .HasForeignKey(p => p.ProductCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 50, Name = "Laptop A", Description = "High performance laptop", Price = 1500.00m, ProductCategoryId = 1 },
                new Product { Id = 33, Name = "Laptop B", Description = "High performance laptop", Price = 1500.00m, ProductCategoryId = 1 }
            );

            modelBuilder.Entity<ProductCategory>().HasData(
                new ProductCategory { Id = 1, Name = "Laptops", Slug = "laptops", Description = "Portable computers" },
                new ProductCategory { Id = 2, Name = "Computers", Slug = "computers", Description = "Desktop computers" },
                new ProductCategory { Id = 3, Name = "Smartphones", Slug = "smartphones", Description = "Mobile phones" },
                new ProductCategory { Id = 4, Name = "Gaming", Slug = "gaming", Description = "Gaming devices and accessories" },
                new ProductCategory { Id = 5, Name = "Accessories", Slug = "accessories", Description = "Computer accessories" },
                new ProductCategory { Id = 6, Name = "Deals", Slug = "deals", Description = "Special offers" }
            );  
        }
    }
}
