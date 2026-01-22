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
    /// <summary>
    /// Serwis biznesowy odpowiedzialny za zaawansowane zarządzanie akcjami promocyjnymi w systemie TechStore.
    /// Klasa dostarcza metody do identyfikacji produktów o niskiej rotacji, masowego nakładania rabatów
    /// oraz automatycznego czyszczenia bazy danych z wygasłych ofert cenowych.
    /// </summary>
    public class PromotionService
    {
        private readonly StoreDbContext _context;

        /// <summary>
        /// Inicjalizuje nową instancję klasy <see cref="PromotionService"/>.
        /// </summary>
        /// <param name="context">Kontekst bazy danych umożliwiający dostęp do repozytorium produktów i kategorii.</param>
        public PromotionService(StoreDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Analizuje stan magazynowy i wyszukuje produkty kwalifikujące się do objęcia nową akcją promocyjną.
        /// </summary>
        /// <remarks>
        /// Metoda filtruje produkty, które posiadają stan magazynowy powyżej określonego progu i nie są obecnie 
        /// objęte żadną aktywną zniżką (sprawdzane są ramy czasowe oraz status pola DiscountPercentage).
        /// </remarks>
        /// <param name="categoryId">Opcjonalny identyfikator kategorii, do której ma zostać ograniczone wyszukiwanie.</param>
        /// <param name="minStock">Minimalna liczba sztuk produktu wymagana, aby system uznał go za kandydata do promocji.</param>
        /// <param name="daysSinceLastSale">Parametr określający czas braku aktywności sprzedażowej (liczba dni).</param>
        /// <returns>Kolekcja obiektów <see cref="ProductDto"/> reprezentujących wyselekcjonowane produkty.</returns>
        public async Task<IEnumerable<ProductDto>> GetPromotionCandidatesAsync(int? categoryId, int minStock, int daysSinceLastSale)
        {
            var now = DateTime.UtcNow;

            var query = _context.Products
                .Include(p => p.ProductCategory)
                .Where(p => p.Quantity >= minStock);

            // Filtrowanie produktów bez aktywnej zniżki
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

        /// <summary>
        /// Wykonuje operację masowej aktualizacji cen (Bulk Update) dla wybranych produktów.
        /// </summary>
        /// <remarks>
        /// Metoda automatycznie wyznacza datę rozpoczęcia (bieżący czas UTC) oraz datę zakończenia
        /// na podstawie przekazanego parametru czasu trwania. Wszystkie zmiany są zatwierdzane w ramach jednej transakcji.
        /// </remarks>
        /// <param name="productIds">Lista unikalnych identyfikatorów produktów objętych przeceną.</param>
        /// <param name="percentage">Wartość procentowa rabatu (np. 15 dla 15% zniżki).</param>
        /// <param name="durationDays">Liczba dni, przez które promocja ma pozostać aktywna.</param>
        /// <returns>Liczba rekordów pomyślnie zaktualizowanych w bazie danych.</returns>
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

        /// <summary>
        /// Przeprowadza procedurę czyszczenia rekordów promocyjnych, których termin ważności upłynął.
        /// </summary>
        /// <remarks>
        /// Metoda wyszukuje produkty z datą końcową mniejszą niż aktualny czas systemowy i resetuje 
        /// wszystkie pola związane z rabatem do wartości domyślnych (null).
        /// </remarks>
        /// <returns>Liczba produktów, z których pomyślnie usunięto wygasłe promocje.</returns>
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