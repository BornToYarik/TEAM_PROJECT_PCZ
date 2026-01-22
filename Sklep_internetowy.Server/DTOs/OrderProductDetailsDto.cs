namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) zawierający szczegółowe informacje o konkretnym produkcie 
    /// przypisanym do zamówienia. Przechowuje dane o wolumenie zakupu, stanach magazynowych 
    /// oraz historycznej cenie sprzedaży.
    /// </summary>
    public class OrderProductDetailsDto
    {
        /// <summary>Unikalny identyfikator techniczny produktu.</summary>
        public int ProductId { get; set; }

        /// <summary>Nazwa handlowa produktu wyświetlana w podsumowaniu zamówienia.</summary>
        public string Name { get; set; } = null!;

        /// <summary>Liczba sztuk danego produktu zakupiona w ramach tego zamówienia.</summary>
        public int QuantityInOrder { get; set; }

        /// <summary>Aktualny stan magazynowy produktu (ułatwia weryfikację dostępności przy edycji).</summary>
        public int QuantityInStock { get; set; }

        /// <summary>Cena jednostkowa produktu obowiązująca w momencie składania zamówienia.</summary>
        public decimal Price { get; set; }
    }
}
