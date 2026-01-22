using Microsoft.Extensions.Options;
using Sklep_internetowy.Server.Models;
using System.Net;
using System.Net.Mail;

namespace Sklep_internetowy.Server.Services
{
    /**
     * @class EmailService
     * @brief Serwis odpowiedzialny za wysyłanie wiadomości e-mail.
     * @details Wykorzystywany głównie do wysyłania potwierdzeń zamówień oraz
     * komunikacji systemowej z użytkownikiem.
     */
    public class EmailService
    {
        private readonly MailSettings _mailSettings;

        /**
         * @brief Konstruktor serwisu EmailService.
         * @param mailSettings Ustawienia serwera pocztowego wczytane z konfiguracji aplikacji.
         */
        public EmailService(IOptions<MailSettings> mailSettings)
        {
            _mailSettings = mailSettings.Value;
        }

        /**
         * @brief Wysyła e-mail z potwierdzeniem złożenia zamówienia.
         * @details Generuje wiadomość HTML zawierającą szczegóły zamówienia i wysyła ją do klienta.
         * @param toEmail Adres e-mail odbiorcy.
         * @param orderId Identyfikator zamówienia.
         * @param totalAmount Łączna kwota do zapłaty.
         * @param orderDate Data złożenia zamówienia.
         */
        public async Task SendOrderConfirmationAsync(string toEmail, int orderId, decimal totalAmount, string orderDate)
        {
            try
            {
                // Utworzenie klienta SMTP na podstawie konfiguracji
                using var smtpClient = new SmtpClient(_mailSettings.Host)
                {
                    Port = _mailSettings.Port,
                    EnableSsl = true, // Gmail wymaga SSL
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false, // Musi być false przed ustawieniem Credentials
                    Credentials = new NetworkCredential(_mailSettings.Username, _mailSettings.Password)
                };

                // Zbudowanie wiadomości e-mail
                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_mailSettings.FromEmail, _mailSettings.FromName),
                    Subject = $"Potwierdzenie zamówienia nr #{orderId}",
                    Body = $@"
                        <div style='font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; max-width: 600px;'>
                            <h1 style='color: #28a745;'>Dziękujemy za zakupy w TechStore!</h1>
                            <p>Twoje zamówienie <strong>#{orderId}</strong> zostało przyjęte do realizacji.</p>
                            <p><strong>Data zamówienia:</strong> {orderDate}</p>
                            <hr />
                            <h3>Do zapłaty: <span style='color: #007bff;'>{totalAmount:C}</span></h3>
                            <p>Status: <strong>Oczekujące na płatność</strong></p>
                            <br />
                            <p style='font-size: 12px; color: #888;'>Wiadomość wygenerowana automatycznie.</p>
                            <p>Pozdrawiamy,<br/>Zespół TechStore</p>
                        </div>",
                    IsBodyHtml = true,
                };

                mailMessage.To.Add(toEmail);

                // Wysłanie wiadomości e-mail
                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine($"E-mail wysłany pomyślnie do: {toEmail}");
            }
            catch (Exception ex)
            {
                // Logowanie błędu po stronie serwera
                Console.WriteLine($"BŁĄD WYSYŁANIA MAILA: {ex.Message}");

                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Szczegóły: {ex.InnerException.Message}");
                }

                // Przekazanie wyjątku wyżej, aby kontroler mógł go obsłużyć
                throw;
            }
        }
    }
}