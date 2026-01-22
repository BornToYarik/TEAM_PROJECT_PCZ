namespace Sklep_internetowy.Server.DTOs
{
    /// <summary>
    /// Obiekt transferu danych (DTO) wykorzystywany podczas procesu uwierzytelniania użytkownika.
    /// Przechowuje poświadczenia (login i hasło) niezbędne do weryfikacji tożsamości 
    /// i wygenerowania tokenu autoryzacyjnego w systemie TechStore.
    /// </summary>
    public class LoginRequest
    {
        /// <summary>Nazwa użytkownika (login) przypisana do konta w bazie danych.</summary>
        public string UserName { get; set; } = null!;

        /// <summary>Hasło użytkownika przesyłane w celu sprawdzenia poprawności autoryzacji.</summary>
        public string Password { get; set; } = null!;
    }
}