namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący szczegółowe informacje o produkcie.
    /// Zawiera kompletny zestaw danych o towarze, w tym parametry cenowe, logikę promocyjną,
    /// przynależność do kategorii oraz powiązane zasoby multimedialne.
    /// </summary>
    public class ProductDto
    {
        /// <summary>Unikalny identyfikator produktu w systemie.</summary>
        public int Id { get; set; }

        /// <summary>Nazwa handlowa produktu.</summary>
        public string Name { get; set; } = null!;

        /// <summary>Podstawowa cena jednostkowa brutto przed naliczeniem rabatów.</summary>
        public decimal Price { get; set; }

        /// <summary>Aktualna liczba sztuk produktu dostępna w magazynie.</summary>
        public int Quantity { get; set; }

        /// <summary>Szczegółowy opis techniczny lub marketingowy produktu.</summary>
        public string? Description { get; set; }

        /// <summary>Wartość procentowa rabatu przypisana do produktu (jeśli dotyczy).</summary>
        public decimal? DiscountPercentage { get; set; }

        /// <summary>Data i godzina rozpoczęcia okresu obowiązywania ceny promocyjnej.</summary>
        public DateTime? DiscountStartDate { get; set; }

        /// <summary>Data i godzina zakończenia okresu obowiązywania ceny promocyjnej.</summary>
        public DateTime? DiscountEndDate { get; set; }

        /// <summary>Obliczona cena końcowa po uwzględnieniu aktywnych rabatów.</summary>
        public decimal FinalPrice { get; set; }

        /// <summary>Flaga logiczna określająca, czy produkt jest obecnie objęty aktywną promocją.</summary>
        public bool HasActiveDiscount { get; set; }

        /// <summary>Identyfikator techniczny kategorii, do której przypisano produkt.</summary>
        public int ProductCategoryId { get; set; }

        /// <summary>Nazwa kategorii nadrzędnej dla celów prezentacyjnych.</summary>
        public string ProductCategoryName { get; set; } = null!;

        /// <summary>Tekstowy identyfikator URL kategorii nadrzędnej (slug).</summary>
        public string ProductCategorySlug { get; set; } = null!;

        /// <summary>Marka lub producent danego towaru.</summary>
        public string Brand { get; set; } = null!;

        /// <summary>Kolekcja adresów URL prowadzących do zdjęć produktu.</summary>
        public List<string> ImageUrls { get; set; } = new List<string>();
    }
}
