namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Klasa pośrednicząca (tabela łącząca) reprezentująca relację wiele-do-wielu 
    /// pomiędzy zamówieniami a produktami.
    /// Przechowuje informacje o tym, jakie produkty i w jakiej ilości wchodzą w skład danego zamówienia.
    /// </summary>
    public class OrderProduct
    {
        /// <summary>Identyfikator powiązanego zamówienia.</summary>
        public int OrderId { get; set; }

        /// <summary>Obiekt nawigacyjny do szczegółowych danych zamówienia.</summary>
        public Order Order { get; set; } = null!;

        /// <summary>Identyfikator powiązanego produktu.</summary>
        public int ProductId { get; set; }

        /// <summary>Obiekt nawigacyjny do szczegółowych danych produktu.</summary>
        public Product Product { get; set; } = null!;

        /// <summary>Liczba sztuk danego produktu zakupiona w ramach tego zamówienia.</summary>
        public int Quantity { get; set; }
    }
}