using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) wykorzystywany podczas procesu dodawania nowego produktu do katalogu sklepu.
    /// Zawiera kompletny zestaw informacji o towarze, jego parametrach cenowych oraz logice promocyjnej.
    /// </summary>
    public class CreateProductDto
    {
        /// <summary>Nazwa handlowa produktu (pole wymagane).</summary>
        [Required(ErrorMessage = "Product name is required.")]
        public string Name { get; set; } = null!;

        /// <summary>Podstawowa cena jednostkowa towaru.</summary>
        [Required]
        public decimal Price { get; set; }

        /// <summary>Początkowa liczba sztuk wprowadzana na stan magazynowy.</summary>
        [Required]
        public int Quantity { get; set; }

        /// <summary>Szczegółowy opis techniczny lub marketingowy produktu.</summary>
        public string? Description { get; set; }

        /// <summary>Wartość procentowa rabatu w przedziale od 0 do 100.</summary>
        [Range(0, 100)]
        public decimal? DiscountPercentage { get; set; }

        /// <summary>Data i godzina rozpoczęcia okresu obowiązywania promocji.</summary>
        public DateTime? DiscountStartDate { get; set; }

        /// <summary>Data i godzina zakończenia okresu obowiązywania promocji.</summary>
        public DateTime? DiscountEndDate { get; set; }

        /// <summary>Identyfikator kategorii nadrzędnej, do której zostanie przypisany produkt.</summary>
        [Required(ErrorMessage = "Category is required.")]
        public int ProductCategoryId { get; set; }
    }
}
