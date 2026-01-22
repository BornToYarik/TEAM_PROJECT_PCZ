namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Klasa reprezentująca zdjęcie przypisane do konkretnego produktu w systemie TechStore.
    /// Przechowuje informacje o lokalizacji pliku graficznego oraz relację z produktem,
    /// co umożliwia renderowanie galerii zdjęć w części frontendowej sklepu.
    /// </summary>
    public class ProductImage
    {
        /// <summary>Unikalny identyfikator rekordu zdjęcia w bazie danych.</summary>
        public int Id { get; set; }

        /// <summary>Adres URL lub ścieżka do pliku graficznego (np. /uploads/image.jpg).</summary>
        public string ImageUrl { get; set; } = null!;

        /// <summary>Identyfikator produktu, do którego przypisane jest to zdjęcie.</summary>
        public int ProductId { get; set; }

        /// <summary>Obiekt nawigacyjny powiązanego produktu, umożliwiający dostęp do jego szczegółów.</summary>
        public Product Product { get; set; } = null!;
    }
}