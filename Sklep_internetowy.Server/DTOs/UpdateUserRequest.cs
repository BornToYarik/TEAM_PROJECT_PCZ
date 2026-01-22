namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) służący do aktualizacji podstawowych informacji o koncie użytkownika.
    /// Klasa ta jest wykorzystywana w procesie modyfikacji danych profilowych, umożliwiając 
    /// synchronizację zmian nazwy użytkownika oraz adresu e-mail pomiędzy warstwą prezentacji a bazą danych.
    /// </summary>
    public class UpdateUserRequest
    {
        /// <summary>Zaktualizowana nazwa użytkownika (login) służąca do identyfikacji konta w systemie.</summary>
        public string UserName { get; set; }

        /// <summary>Nowy adres e-mail użytkownika, wykorzystywany do komunikacji systemowej i powiadomień.</summary>
        public string Email { get; set; }
    }
}