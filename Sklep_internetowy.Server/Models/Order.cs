using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Klasa reprezentująca zamówienie klienta w systemie TechStore.
    /// Przechowuje informacje o dacie zakupu, statusie oraz powiązaniach z użytkownikiem i produktami.
    /// </summary>
    public class Order
    {
        /// <summary>Unikalny identyfikator zamówienia w bazie danych.</summary>
        public int Id { get; set; }

        /// <summary>Identyfikator użytkownika (GUID), który dokonał zakupu.</summary>
        public string UserId { get; set; } = null!;

        /// <summary>Obiekt nawigacyjny do szczegółowych danych użytkownika składającego zamówienie.</summary>
        public User User { get; set; } = null!;

        /// <summary>Data i godzina zarejestrowania zamówienia (domyślnie czas UTC).</summary>
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        /// <summary>Aktualny etap realizacji zamówienia (domyślnie "pending").</summary>
        public string Status { get; set; } = "pending";

        /// <summary>Kolekcja pozycji wchodzących w skład zamówienia (tabela łącząca z produktami).</summary>
        public ICollection<OrderProduct> OrderProducts { get; set; } = new List<OrderProduct>();
    }
}