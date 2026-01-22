using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Klasa reprezentująca pojedynczą ofertę licytacji (postąpienie) złożoną przez użytkownika.
    /// Przechowuje informacje o kwocie, czasie złożenia oraz powiązaniach z konkretną aukcją i licytantem.
    /// </summary>
    public class Bid
    {
        /// <summary>Unikalny identyfikator rekordu oferty.</summary>
        public int Id { get; set; }

        /// <summary>Kwota zaoferowana przez licytanta w ramach tego postąpienia.</summary>
        public decimal Amount { get; set; }

        /// <summary>Identyfikator użytkownika (GUID), który jest autorem oferty.</summary>
        public string BidderId { get; set; } = null!;

        /// <summary>Obiekt użytkownika składającego ofertę, umożliwiający dostęp do jego danych profilowych.</summary>
        public User Bidder { get; set; } = null!;

        /// <summary>Data i godzina zarejestrowania oferty w systemie (domyślnie czas UTC).</summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        /// <summary>Identyfikator aukcji, której dotyczy dana oferta cenowa.</summary>
        public int AuctionId { get; set; }

        /// <summary>Obiekt aukcji powiązanej z tą ofertą, umożliwiający nawigację do szczegółów licytacji.</summary>
        public Auction Auction { get; set; } = null!;
        public User? User { get; set; }
    }
}