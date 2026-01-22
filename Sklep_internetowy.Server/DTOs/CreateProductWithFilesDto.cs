using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) wykorzystywany podczas procesu dodawania nowego produktu wraz z załącznikami multimedialnymi.
    /// Klasa obsługuje dane przesyłane w formacie multipart/form-data, umożliwiając jednoczesną definicję 
    /// parametrów handlowych oraz przesyłanie plików graficznych do serwera.
    /// </summary>
    public class CreateProductWithFilesDto
    {
        /// <summary>Nazwa handlowa produktu.</summary>
        public string Name { get; set; } = null!;

        /// <summary>Podstawowa cena jednostkowa towaru brutto.</summary>
        public decimal Price { get; set; }

        /// <summary>Początkowa liczba sztuk wprowadzana na stan magazynowy.</summary>
        public int Quantity { get; set; }

        /// <summary>Szczegółowy opis charakterystyki, specyfikacji lub przeznaczenia produktu.</summary>
        public string? Description { get; set; }

        /// <summary>Identyfikator kategorii nadrzędnej, do której zostanie przypisany produkt w katalogu.</summary>
        public int ProductCategoryId { get; set; }

        /// <summary>Wartość procentowa rabatu (np. 10.50 dla 10.5% zniżki).</summary>
        public decimal? DiscountPercentage { get; set; }

        /// <summary>Data i godzina rozpoczęcia okresu obowiązywania ceny promocyjnej (UTC).</summary>
        public DateTime? DiscountStartDate { get; set; }

        /// <summary>Data i godzina zakończenia okresu obowiązywania ceny promocyjnej (UTC).</summary>
        public DateTime? DiscountEndDate { get; set; }

        /// <summary>Marka, producent lub linia produktowa, do której należy towar.</summary>
        public string Brand { get; set; } = null!;

        /// <summary>
        /// Kolekcja plików graficznych (zdjęć) przesyłanych w ramach żądania HTTP.
        /// Mapowana z formularza binarnego typu IFormFile.
        /// </summary>
        public List<IFormFile>? Images { get; set; }
    }
}