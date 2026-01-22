using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Rozszerzona klasa użytkownika systemu, dziedzicząca po IdentityUser.
    /// Przechowuje dodatkowe dane profilowe, takie jak imię i nazwisko, 
    /// oraz zarządza relacją z historią zamówień klienta.
    /// </summary>
    public class User : IdentityUser
    {
        /// <summary>Imię użytkownika.</summary>
        public string? FirstName { get; set; }

        /// <summary>Nazwisko użytkownika.</summary>
        public string? LastName { get; set; }

        /// <summary>Data i godzina rejestracji konta w systemie (domyślnie czas UTC).</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Kolekcja wszystkich zamówień złożonych przez danego użytkownika (relacja jeden-do-wielu).</summary>
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}