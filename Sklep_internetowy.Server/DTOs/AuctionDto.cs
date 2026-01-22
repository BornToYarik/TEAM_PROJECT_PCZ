namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący podstawowe informacje o aukcji.
    /// Klasa służy do przesyłania kluczowych parametrów licytacji pomiędzy warstwą serwerową 
    /// a interfejsem użytkownika, minimalizując narzut sieciowy poprzez ograniczenie przesyłanych danych.
    /// </summary>
    public class AuctionDto
    {
        /// <summary>Unikalny identyfikator aukcji w systemie.</summary>
        public int Id { get; set; }

        /// <summary>Identyfikator techniczny produktu przypisanego do danej aukcji.</summary>
        public int ProductId { get; set; }

        /// <summary>Nazwa handlowa produktu wystawionego na licytację.</summary>
        public string ProductName { get; set; } = string.Empty;

        /// <summary>Aktualna najwyższa cena zaoferowana w ramach aukcji (bieżące przebicie).</summary>
        public decimal CurrentPrice { get; set; }

        /// <summary>Data i godzina planowanego zakończenia licytacji w formacie UTC.</summary>
        public string ProductName { get; set; } = null!;
        public ProductDto Product { get; set; } = null!;
        public decimal CurrentPrice { get; set; }
        public string? CurrentWinnerName { get; set; }
        public DateTime EndTime { get; set; }
    }
}