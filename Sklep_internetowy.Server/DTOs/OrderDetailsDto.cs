using System;
using System.Collections.Generic;

namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący szczegółowe informacje o zamówieniu klienta.
    /// Klasa agreguje dane identyfikacyjne użytkownika, aktualny status realizacji zamówienia 
    /// oraz pełną listę produktów wraz z datą operacji, służąc do prezentacji danych w interfejsie użytkownika.
    /// </summary>
    public class OrderDetailsDto
    {
        /// <summary>Unikalny identyfikator zamówienia w bazie danych.</summary>
        public int Id { get; set; }

        /// <summary>Identyfikator użytkownika (GUID), który złożył zamówienie.</summary>
        public string UserId { get; set; } = null!;

        /// <summary>Adres e-mail użytkownika przypisany do zamówienia, wykorzystywany do powiadomień.</summary>
        public string UserEmail { get; set; } = null!;

        /// <summary>Aktualny status realizacji zamówienia (np. "Pending", "Shipped", "Completed").</summary>
        public string Status { get; set; } = null!;

        /// <summary>Kolekcja szczegółowych informacji o produktach wchodzących w skład tego zamówienia.</summary>
        public List<OrderProductDetailsDto> Products { get; set; } = new List<OrderProductDetailsDto>();

        /// <summary>Data i godzina zarejestrowania zamówienia w systemie.</summary>
        public DateTime OrderDate { get; internal set; }
    }
}