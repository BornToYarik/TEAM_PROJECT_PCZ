using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace Sklep_internetowy.Server.Controllers.Payment
{
    /// <summary>
    /// Kontroler API odpowiedzialny za integracje z systemem platnosci Stripe.
    /// Umozliwia generowanie zamiarow platnosci (PaymentIntents) dla transakcji elektronicznych.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : Controller
    {
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy PaymentController.
        /// Konfiguruje globalny klucz API Stripe na podstawie pliku konfiguracyjnego aplikacji.
        /// </summary>
        /// <param name="configuration">Interfejs dostepu do konfiguracji systemowej (sekcja Stripe:SecretKey).</param>
        public PaymentController(IConfiguration configuration)
        {
            _configuration = configuration;
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
        }

        /// <summary>
        /// Tworzy nowy obiekt PaymentIntent w systemie Stripe.
        /// Zamiar ten jest wykorzystywany przez frontend do bezpiecznego sfinalizowania transakcji.
        /// </summary>
        /// <param name="request">Obiekt zawierajacy calkowita kwote do zaplaty (w jednostkach glownych, np. zlotych).</param>
        /// <returns>Obiekt JSON zawierajacy clientSecret podrzednego obiektu PaymentIntent.</returns>
        /// <response code="200">Zwraca klucz sesji platnosci (clientSecret).</response>
        [HttpPost("create-payment-intent")]
        public ActionResult CreatePaymentIntent([FromBody] PaymentRequest request)
        {
            // Kwota w Stripe musi byc podana w najmniejszej jednostce waluty (np. grosze)
            var options = new PaymentIntentCreateOptions
            {
                Amount = request.Amount * 100,
                Currency = "pln",
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true,
                },
            };

            var service = new PaymentIntentService();
            var intent = service.Create(options);

            return Ok(new { clientSecret = intent.ClientSecret });
        }
    }

    /// <summary>
    /// Klasa pomocnicza (DTO) reprezentujaca zadanie utworzenia platnosci.
    /// </summary>
    public class PaymentRequest
    {
        /// <summary>Calkowita kwota zamowienia do zaplaty.</summary>
        public long Amount { get; set; }
    }
}