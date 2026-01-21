using Microsoft.Extensions.Options;
using Sklep_internetowy.Server.Models;
using System.Net;
using System.Net.Mail;

namespace Sklep_internetowy.Server.Services
{
    public class EmailService
    {
        private readonly MailSettings _mailSettings;

        public EmailService(IOptions<MailSettings> mailSettings)
        {
            _mailSettings = mailSettings.Value;
        }

        public async Task SendOrderConfirmationAsync(string toEmail, int orderId, decimal totalAmount, string orderDate)
        {
            try
            {
                // Tworzenie klienta SMTP
                using var smtpClient = new SmtpClient(_mailSettings.Host)
                {
                    Port = _mailSettings.Port,
                    EnableSsl = true, // Gmail WYMAGA SSL
                    DeliveryMethod = SmtpDeliveryMethod.Network,
                    UseDefaultCredentials = false, // WAŻNE: Musi być false przed ustawieniem Credentials
                    Credentials = new NetworkCredential(_mailSettings.Username, _mailSettings.Password)
                };

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

                // Wysyłanie
                await smtpClient.SendMailAsync(mailMessage);
                Console.WriteLine($"E-mail wysłany pomyślnie do: {toEmail}");
            }
            catch (Exception ex)
            {
               
                Console.WriteLine($"BŁĄD WYSYŁANIA MAILA: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Szczegóły: {ex.InnerException.Message}");
                }
                
                throw;
            }
        }
    }
}