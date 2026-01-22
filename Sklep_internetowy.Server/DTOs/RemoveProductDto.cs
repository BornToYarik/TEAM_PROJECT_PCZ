namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) wykorzystywany w procesie usuwania produktu z systemu.
    /// Zawiera minimalny zestaw danych niezbędny do jednoznacznej identyfikacji zasobu
    /// przeznaczonego do usunięcia z bazy danych.
    /// </summary>
    public class RemoveProductDto
    {
        /// <summary>Unikalny identyfikator techniczny produktu (ID), który ma zostać usunięty.</summary>
        public int Id { get; set; }
    }
}
