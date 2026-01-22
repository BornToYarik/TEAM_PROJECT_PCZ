namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący kategorię produktów w systemie.
    /// Służy do przesyłania podstawowych informacji o grupach towarowych, wykorzystywanych 
    /// w menu nawigacyjnym, filtrach oraz przy przypisywaniu produktów do katalogu.
    /// </summary>
    public class ProductCategoryDto
    {
        /// <summary>Unikalny identyfikator kategorii w bazie danych.</summary>
        public int Id { get; set; }

        /// <summary>Nazwa wyświetlana kategorii (np. "Elektronika", "Laptopy").</summary>
        public string Name { get; set; } = null!;

        /// <summary>Przyjazny dla wyszukiwarek tekstowy identyfikator URL (slug).</summary>
        public string Slug { get; set; } = null!;

        /// <summary>Opcjonalny opis charakterystyki lub przeznaczenia danej kategorii.</summary>
        public string? Description { get; set; }
    }
}