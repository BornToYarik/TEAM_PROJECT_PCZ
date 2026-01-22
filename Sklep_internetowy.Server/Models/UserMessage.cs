using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Klasa reprezentująca wiadomość przesłaną przez użytkownika poprzez formularz kontaktowy.
    /// Przechowuje dane teleadresowe nadawcy oraz treść zapytania, umożliwiając obsługę zgłoszeń klientów.
    /// </summary>
    public class UserMessage
    {
        /// <summary>Unikalny identyfikator wiadomości w bazie danych.</summary>
        public int Id { get; set; }

        /// <summary>Adres e-mail nadawcy wiadomości (wymagany, walidacja formatu e-mail).</summary>
        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        /// <summary>Imię i nazwisko lub nazwa wyświetlana nadawcy (maksymalnie 100 znaków).</summary>
        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        /// <summary>Opcjonalny numer telefonu kontaktowego nadawcy.</summary>
        [MaxLength(20)]
        public string? Phone { get; set; }

        /// <summary>Treść wiadomości lub zapytania przesłanego przez użytkownika (maksymalnie 1000 znaków).</summary>
        [Required, MaxLength(1000)]
        public string Content { get; set; } = string.Empty;

        /// <summary>Data i godzina zarejestrowania wiadomości w systemie (domyślnie czas UTC).</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}