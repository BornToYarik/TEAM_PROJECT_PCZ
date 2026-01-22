namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Klasa reprezentująca kategorię produktów w systemie TechStore.
    /// Służy do logicznego grupowania towarów, co ułatwia zarządzanie asortymentem 
    /// oraz nawigację użytkownika w części frontendowej sklepu.
    /// </summary>
    public class ProductCategory
    {
        /// <summary>Unikalny identyfikator kategorii w bazie danych.</summary>
        public int Id { get; set; }

        /// <summary>Nazwa wyświetlana kategorii (np. "Laptopy", "Akcesoria").</summary>
        public string Name { get; set; } = null!;

        /// <summary>Przyjazny dla wyszukiwarek tekstowy identyfikator URL (tzw. slug).</summary>
        public string Slug { get; set; } = null!;

        /// <summary>Opcjonalny opis charakterystyki lub przeznaczenia danej kategorii.</summary>
        public string? Description { get; set; }

        /// <summary>Lista produktów przypisanych do tej kategorii (relacja jeden-do-wielu).</summary>
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}