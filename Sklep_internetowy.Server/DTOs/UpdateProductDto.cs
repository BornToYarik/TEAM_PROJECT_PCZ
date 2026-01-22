using System;
using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) służący do aktualizacji parametrów istniejącego produktu.
    /// Klasa zawiera kompletny zestaw właściwości niezbędnych do modyfikacji danych technicznych,
    /// logiki cenowej oraz przypisań kategoryzacyjnych towaru w systemie TechStore.
    /// </summary>
    public class UpdateProductDto
    {
        /// <summary>Unikalny identyfikator produktu (ID) podlegającego aktualizacji.</summary>
        public int Id { get; set; }

        /// <summary>Zaktualizowana nazwa handlowa produktu.</summary>
        public string Name { get; set; } = null!;

        /// <summary>Nowa podstawowa cena jednostkowa towaru.</summary>
        public decimal Price { get; set; }

        /// <summary>Zaktualizowana liczba sztuk produktu dostępna na stanie magazynowym.</summary>
        public int Quantity { get; set; }

        /// <summary>Nowy opis charakterystyki lub specyfikacji technicznej produktu.</summary>
        public string? Description { get; set; }

        /// <summary>Wartość procentowa rabatu w przedziale od 0 do 100.</summary>
        [Range(0, 100)]
        public decimal? DiscountPercentage { get; set; }

        /// <summary>Data i godzina rozpoczęcia nowego okresu promocyjnego.</summary>
        public DateTime? DiscountStartDate { get; set; }

        /// <summary>Data i godzina zakończenia nowego okresu promocyjnego.</summary>
        public DateTime? DiscountEndDate { get; set; }

        /// <summary>Identyfikator nowej kategorii nadrzędnej, do której ma zostać przypisany produkt.</summary>
        public int ProductCategoryId { get; set; }

        /// <summary>Nazwa marki lub producenta produktu.</summary>
        public string Brand { get; set; } = null!;
    }
}