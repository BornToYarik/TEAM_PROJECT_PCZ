namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) reprezentujący ofertę złożoną przez użytkownika w ramach aukcji.
    /// Przechowuje informację o kwocie postąpienia, która jest przesyłana do serwera w celu 
    /// walidacji i aktualizacji bieżącej ceny licytowanego przedmiotu.
    /// </summary>
    public class PlaceBidDto
    {
        /// <summary>Wartość pieniężna zadeklarowana przez licytanta jako nowa oferta cenowa.</summary>
        public decimal Amount { get; set; }
    }
}
