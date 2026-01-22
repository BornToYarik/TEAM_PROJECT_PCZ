using System;
using System.Collections.Generic;

namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący szczegółowe informacje o profilu użytkownika.
    /// Klasa agreguje dane identyfikacyjne, personalne oraz przypisane role systemowe, 
    /// służąc do bezpiecznego przesyłania informacji o koncie z warstwy serwerowej do interfejsu klienta.
    /// </summary>
    public class UserDto
    {
        /// <summary>Unikalny identyfikator użytkownika (GUID) w bazie danych systemu.</summary>
        public string Id { get; set; }

        /// <summary>Adres e-mail przypisany do konta, wykorzystywany do autoryzacji i komunikacji.</summary>
        public string? Email { get; set; }

        /// <summary>Imię użytkownika zapisane w profilu personalnym.</summary>
        public string? FirstName { get; set; }

        /// <summary>Nazwisko użytkownika zapisane w profilu personalnym.</summary>
        public string? LastName { get; set; }

        /// <summary>Kolekcja ról systemowych przypisanych do konta (np. "Admin", "User"), definiująca zakres uprawnień.</summary>
        public IList<string> Roles { get; set; } = new List<string>();

        /// <summary>Data i godzina zarejestrowania konta w systemie (zapisana w formacie UTC).</summary>
        public DateTime CreatedAt { get; set; }
    }
}