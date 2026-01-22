using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Klasa reprezentująca produkt w systemie sklepu internetowego.
    /// Zawiera szczegółowe informacje o towarze, stanach magazynowych oraz logikę
    /// zarządzania cenami promocyjnymi i powiązaniami z kategoriami.
    /// </summary>
    public class Product
    {
        /// <summary>Unikalny identyfikator produktu w bazie danych.</summary>
        public int Id { get; set; }

        /// <summary>Nazwa handlowa produktu.</summary>
        public string Name { get; set; } = null!;

        /// <summary>Podstawowa cena jednostkowa przed naliczeniem rabatów.</summary>
        public decimal Price { get; set; }

        /// <summary>Liczba dostępnych sztuk produktu w magazynie.</summary>
        public int Quantity { get; set; }

        /// <summary>Opcjonalny opis techniczny lub marketingowy produktu.</summary>
        public string? Description { get; set; }

        /// <summary>Flaga określająca, czy produkt jest aktualnie wystawiony w module aukcyjnym.</summary>
        public bool IsOnAuction { get; set; }

        /// <summary>Identyfikator właściciela lub sprzedawcy produktu (jeśli dotyczy).</summary>
        public string? OwnerId { get; set; }

        /// <summary>Obiekt nawigacyjny do danych właściciela produktu.</summary>
        public User? Owner { get; set; }

        /// <summary>Marka lub producent danego towaru.</summary>
        public string Brand { get; set; } = null!;

        /// <summary>Wartość procentowa rabatu (np. 20.00 dla 20% zniżki).</summary>
        public decimal? DiscountPercentage { get; set; }

        /// <summary>Data i godzina rozpoczęcia okresu obowiązywania promocji.</summary>
        public DateTime? DiscountStartDate { get; set; }

        /// <summary>Data i godzina zakończenia okresu obowiązywania promocji.</summary>
        public DateTime? DiscountEndDate { get; set; }

        /// <summary>Kolekcja zdjęć przypisanych do tego produktu.</summary>
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();

        /// <summary>
        /// Wylicza cenę końcową produktu. 
        /// Jeśli promocja jest aktywna, zwraca cenę pomniejszoną o rabat, w przeciwnym razie cenę bazową.
        /// </summary>
        public decimal FinalPrice
        {
            get
            {
                if (HasActiveDiscount)
                {
                    return Price * (1 - (DiscountPercentage ?? 0) / 100);
                }
                return Price;
            }
        }

        /// <summary>
        /// Weryfikuje, czy produkt posiada w tej chwili aktywną i ważną zniżkę.
        /// Sprawdza zarówno wartość procentową, jak i ramy czasowe (UTC).
        /// </summary>
        public bool HasActiveDiscount
        {
            get
            {
                if (!DiscountPercentage.HasValue || DiscountPercentage <= 0)
                    return false;

                var now = DateTime.UtcNow;

                bool isStarted = !DiscountStartDate.HasValue || DiscountStartDate <= now;
                bool isNotEnded = !DiscountEndDate.HasValue || DiscountEndDate >= now;

                return isStarted && isNotEnded;
            }
        }

        /// <summary>Identyfikator kategorii nadrzędnej, do której należy produkt.</summary>
        public int ProductCategoryId { get; set; }

        /// <summary>Obiekt kategorii umożliwiający dostęp do jej nazwy i parametrów.</summary>
        public ProductCategory ProductCategory { get; set; } = null!;

        /// <summary>Kolekcja pozycji zamówień zawierających ten produkt (relacja wiele-do-wielu).</summary>
        public ICollection<OrderProduct> OrderProducts { get; set; } = new List<OrderProduct>();
    }
}