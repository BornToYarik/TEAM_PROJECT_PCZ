using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Models;
using System.Collections.Generic;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Sklep_internetowy.Server.Data
{
    /// <summary>
    /// Glowny kontekst bazy danych aplikacji TechStore.
    /// Klasa dziedziczy po IdentityDbContext, co integruje system ASP.NET Core Identity 
    /// z modelem danych aplikacji, umozliwiajac zarzadzanie uzytkownikami i rolami.
    /// </summary>
    public class StoreDbContext : IdentityDbContext<User>
    {
        /// <summary>
        /// Inicjalizuje nowa instancje klasy StoreDbContext.
        /// </summary>
        /// <param name="options">Opcje konfiguracji kontekstu przekazywane przez system Dependency Injection.</param>
        public StoreDbContext(DbContextOptions<StoreDbContext> options) : base(options)
        {
        }

        /// <summary>Zestaw danych reprezentujacy aukcje (licytacje) w systemie.</summary>
        public DbSet<Auction> Auctions => Set<Auction>();

        /// <summary>Zestaw danych reprezentujacy poszczegolne oferty zlozone w aukcjach.</summary>
        public DbSet<Bid> Bids => Set<Bid>();

        /// <summary>Zestaw danych reprezentujacy produkty dostepne w katalogu sklepu.</summary>
        public DbSet<Product> Products => Set<Product>();

        /// <summary>Rejestr zamowien zlozonych przez klientow.</summary>
        public DbSet<Order> Orders => Set<Order>();

        /// <summary>Tabela laczaca produkty z zamowieniami (relacja wiele-do-wielu).</summary>
        public DbSet<OrderProduct> OrderProducts => Set<OrderProduct>();

        /// <summary>Wiadomosci kontaktowe przeslane przez uzytkownikow systemu.</summary>
        public DbSet<UserMessage> Messages { get; set; }

        /// <summary>Kategorie, do ktorych przypisane sa produkty.</summary>
        public DbSet<ProductCategory> ProductCategories { get; set; }

        /// <summary>Zdjecia i grafiki przypisane do konkretnych produktow.</summary>
        public DbSet<ProductImage> ProductImages { get; set; }

        /// <summary>
        /// Konfiguruje model encji i relacje miedzy nimi podczas inicjalizacji bazy danych.
        /// Definiuje klucze zlozone, zachowania usuwania kaskadowego oraz dane startowe (Seed Data).
        /// </summary>
        /// <param name="modelBuilder">Obiekt sluzacy do budowania modelu bazy danych.</param>
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Konfiguracja klucza zlozonego dla tabeli posredniczacej zamowien
            modelBuilder.Entity<OrderProduct>()
                .HasKey(op => new { op.OrderId, op.ProductId });

            // Definicja relacji zamowienie - produkty
            modelBuilder.Entity<OrderProduct>()
                .HasOne(op => op.Order)
                .WithMany(o => o.OrderProducts)
                .HasForeignKey(op => op.OrderId);

            modelBuilder.Entity<OrderProduct>()
                .HasOne(op => op.Product)
                .WithMany(p => p.OrderProducts)
                .HasForeignKey(op => op.ProductId);

            // Konfiguracja relacji produkt - kategoria z blokada usuwania kaskadowego
            modelBuilder.Entity<Product>()
                .HasOne(p => p.ProductCategory)
                .WithMany(pc => pc.Products)
                .HasForeignKey(p => p.ProductCategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            /**
             * @section SeedData
             * Inicjalizacja bazy danych wstepnymi danymi testowymi.
             */
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 50, Name = "Laptop A", Description = "High performance laptop", Price = 1500.00m, ProductCategoryId = 1, Brand = "HP" },
                new Product { Id = 33, Name = "Laptop B", Description = "High performance laptop", Price = 1500.00m, ProductCategoryId = 1, Brand = "Apple" }
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