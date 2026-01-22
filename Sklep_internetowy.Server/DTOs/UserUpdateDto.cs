namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) wykorzystywany przez administratora do aktualizacji 
    /// kluczowych parametrów konta użytkownika. Klasa umożliwia synchronizację zmian 
    /// w adresie e-mail oraz modyfikację zestawu ról przypisanych do tożsamości użytkownika.
    /// </summary>
    public class UserUpdateDto
    {
        /// <summary>Zaktualizowany adres e-mail użytkownika, służący do autoryzacji i komunikacji systemowej.</summary>
        public string Email { get; set; } = null!;

        /// <summary>Kolekcja ról systemowych (np. "Admin", "User"), które mają zostać nadane użytkownikowi w celu definicji poziomu dostępu.</summary>
        public IList<string> Roles { get; set; } = new List<string>();
    }
}
