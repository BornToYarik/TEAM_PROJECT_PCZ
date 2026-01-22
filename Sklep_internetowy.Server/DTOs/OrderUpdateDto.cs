using System.Collections.Generic;

namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący pojedynczą pozycję towarową w żądaniu aktualizacji zamówienia.
    /// Przechowuje informacje niezbędne do skorygowania ilości konkretnego produktu w ramach istniejącej transakcji.
    /// </summary>
    public class OrderUpdateItemDto
    {
        /// <summary>Unikalny identyfikator techniczny produktu (ID).</summary>
        public int ProductId { get; set; }

        /// <summary>Docelowa liczba sztuk produktu, która ma zostać przypisana do zamówienia po aktualizacji.</summary>
        public int Quantity { get; set; }
    }

    /// <summary>
    /// Obiekt transferu danych (DTO) wykorzystywany do kompleksowej modyfikacji istniejącego zamówienia.
    /// Klasa umożliwia jednoczesną zmianę statusu logistycznego zamówienia oraz aktualizację 
    /// zestawienia produktów wchodzących w jego skład.
    /// </summary>
    public class OrderUpdateDto
    {
        /// <summary>Nowy status realizacji zamówienia (np. "Processing", "Shipped", "Cancelled").</summary>
        public string Status { get; set; } = null!;

        /// <summary>Kolekcja pozycji (produktów i ich ilości), które mają zostać zaktualizowane w bazie danych.</summary>
        public List<OrderUpdateItemDto> Products { get; set; } = new List<OrderUpdateItemDto>();
    }
}