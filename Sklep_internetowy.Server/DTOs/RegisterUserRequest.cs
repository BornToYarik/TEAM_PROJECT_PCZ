using System.Collections.Generic;

namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący żądanie rejestracji nowego użytkownika w systemie TechStore.
    /// Klasa służy do przesyłania kompletu informacji niezbędnych do zainicjowania procesu tworzenia 
    /// konta użytkownika, obejmując dane identyfikacyjne, uwierzytelniające oraz definicję ról dostępu.
    /// </summary>
    public class RegisterUserRequest
    {
        /// <summary>Unikalna nazwa użytkownika (login) wybrana podczas rejestracji.</summary>
        public string UserName { get; set; } = null!;

        /// <summary>Adres e-mail użytkownika służący do komunikacji systemowej, powiadomień oraz odzyskiwania hasła.</summary>
        public string Email { get; set; } = null!;

        /// <summary>Hasło w formie jawnej, przesyłane do warstwy serwerowej w celu bezpiecznego zahaszowania przed zapisem w bazie danych.</summary>
        public string Password { get; set; } = null!;

        /// <summary>
        /// Kolekcja nazw ról systemowych (np. "Admin", "User"), które mają zostać przypisane do nowego konta 
        /// w celu zdefiniowania zakresu uprawnień w systemie.
        /// </summary>
        public IList<string> Roles { get; set; } = new List<string>();
    }
}