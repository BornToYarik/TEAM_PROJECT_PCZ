using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Klasa reprezentująca aukcję (licytację) konkretnego produktu w systemie.
    /// Przechowuje informacje o cenach, czasie trwania oraz uczestnikach biorących udział w licytacji.
    /// </summary>
    public class Auction
    {
        /// <summary>Unikalny identyfikator aukcji.</summary>
        public int Id { get; set; }

        /// <summary>Identyfikator powiązanego produktu, który jest przedmiotem licytacji.</summary>
        public int ProductId { get; set; }

        /// <summary>Obiekt nawigacyjny do szczegółowych danych produktu wystawionego na aukcję.</summary>
        public Product Product { get; set; } = null!;

        /// <summary>Cena początkowa (wywoławcza), od której zaczyna się licytacja.</summary>
        public decimal StartingPrice { get; set; }

        /// <summary>Aktualna najwyższa cena zaoferowana przez licytujących.</summary>
        public decimal CurrentPrice { get; set; }

        /// <summary>Data i godzina utworzenia aukcji (domyślnie czas UTC).</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Data i godzina planowanego zakończenia aukcji.</summary>
        public DateTime EndTime { get; set; }

        /// <summary>Identyfikator użytkownika (GUID), który złożył ostatnią (najwyższą) ofertę.</summary>
        public string? LastBidderId { get; set; }

        /// <summary>Obiekt użytkownika będącego aktualnym liderem licytacji.</summary>
        public User? LastBidder { get; set; }

        /// <summary>Flaga określająca, czy aukcja została już sfinalizowana.</summary>
        public bool IsFinished { get; set; }

        /// <summary>Identyfikator użytkownika, który wygrał aukcję (został zwycięzcą).</summary>
        public string? WinnerId { get; set; }

        /// <summary>Kolekcja wszystkich ofert (postąpień) złożonych w ramach danej aukcji.</summary>
        public List<Bid> Bids { get; set; } = new();
    }
}