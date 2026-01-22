namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) wykorzystywany do zainicjowania nowej aukcji w systemie.
    /// Zawiera niezbędne informacje o produkcie przeznaczonym do sprzedaży licytacyjnej 
    /// oraz ustalonej dla niego cenie wywoławczej.
    /// </summary>
    public class CreateAuctionDto
    {
        /// <summary>Unikalny identyfikator produktu, który ma zostać wystawiony na aukcję.</summary>
        public int ProductId { get; set; }

        /// <summary>Cena początkowa (wywoławcza), od której rozpocznie się proces licytacji produktu.</summary>
        public decimal StartingPrice { get; set; }
        public int DurationMinutes { get; set; } 
    }
}
