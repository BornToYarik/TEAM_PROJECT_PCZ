namespace Sklep_internetowy.Server.Models
{
    /// <summary>
    /// Klasa konfiguracyjna przechowująca parametry serwera poczty elektronicznej (SMTP).
    /// Wykorzystywana przez serwis e-mail do autoryzacji i wysyłania powiadomień systemowych.
    /// </summary>
    public class MailSettings
    {
        /// <summary>Adres serwera SMTP (np. smtp.gmail.com).</summary>
        public string Host { get; set; } = string.Empty;

        /// <summary>Numer portu wykorzystywanego do połączenia z serwerem poczty (np. 587 dla TLS).</summary>
        public int Port { get; set; }

        /// <summary>Nazwa użytkownika (login) do autoryzacji na serwerze pocztowym.</summary>
        public string Username { get; set; } = string.Empty;

        /// <summary>Hasło lub token aplikacji używany do uwierzytelnienia nadawcy.</summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>Adres e-mail, który będzie wyświetlany jako nadawca wiadomości.</summary>
        public string FromEmail { get; set; } = string.Empty;

        /// <summary>Nazwa wyświetlana nadawcy (np. "TechStore - Powiadomienia").</summary>
        public string FromName { get; set; } = string.Empty;
    }
}