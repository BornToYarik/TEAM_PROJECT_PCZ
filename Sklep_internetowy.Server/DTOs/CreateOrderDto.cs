namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący pojedynczą pozycję w żądaniu utworzenia zamówienia.
    /// Zawiera informacje niezbędne do zidentyfikowania produktu oraz określenia zamawianej ilości sztuk.
    /// </summary>
    public class CreateOrderItemDto
    {
        /// <summary>Unikalny identyfikator techniczny produktu (ID).</summary>
        public int ProductId { get; set; }

        /// <summary>Liczba sztuk danego produktu, którą użytkownik zamierza nabyć.</summary>
        public int Quantity { get; set; }
    }

    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący kompletne żądanie utworzenia nowego zamówienia.
    /// Przesyłany z warstwy frontendu podczas finalizacji koszyka zakupowego w celu 
    /// zainicjowania transakcji po stronie serwerowej.
    /// </summary>
    public class CreateOrderRequestDto
    {
        /// <summary>Unikalny identyfikator użytkownika (GUID) składającego zamówienie.</summary>
        public string UserId { get; set; } = null!;

        /// <summary>Lista pozycji wchodzących w skład zamówienia (kolekcja produktów wraz z ilościami).</summary>
        public List<CreateOrderItemDto> Products { get; set; } = new List<CreateOrderItemDto>();
    }
}