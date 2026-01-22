namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący żądanie złożenia nowej oferty licytacyjnej.
    /// Przechowuje informacje o deklarowanej kwocie oraz tożsamości licytanta niezbędne 
    /// do przetworzenia postąpienia przez silnik aukcyjny.
    /// </summary>
    public class BidRequest
    {
        /// <summary>Kwota zaoferowana przez użytkownika w ramach licytacji.</summary>
        public decimal Amount { get; set; }

        /// <summary>Nazwa wyświetlana lub unikalny identyfikator użytkownika składającego ofertę.</summary>
        public string Bidder { get; set; } = string.Empty;
    }
}
