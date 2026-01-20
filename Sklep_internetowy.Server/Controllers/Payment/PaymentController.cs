using Microsoft.AspNetCore.Mvc;
using Stripe;

namespace Sklep_internetowy.Server.Controllers.Payment
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : Controller
    {
       
        private readonly IConfiguration _configuration;
        public PaymentController(IConfiguration configuration)
        {
            _configuration = configuration;
            StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"];
        }
        [HttpPost("create-payment-intent")]
        public ActionResult CreatePaymentIntent([FromBody] PaymentRequest request)
        {
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

    public class PaymentRequest
    {
        public long Amount { get; set; } 
    }
}

