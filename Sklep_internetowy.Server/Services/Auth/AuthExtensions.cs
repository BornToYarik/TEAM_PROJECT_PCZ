using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Sklep_internetowy.Server.Services.Auth
{
    /**
     * @class AuthExtensions
     * @brief Klasa rozszerzeń konfiguracji uwierzytelniania JWT.
     * @details Zawiera metodę rozszerzającą do konfiguracji mechanizmu autoryzacji w aplikacji.
     */
    public static class AuthExtensions
    {
        /**
         * @brief Dodaje konfigurację uwierzytelniania JWT do kontenera usług.
         * @details Konfiguruje walidację tokena JWT oraz klucz szyfrujący na podstawie ustawień aplikacji.
         * @param serviceCollection Kolekcja usług aplikacji.
         * @param configuration Konfiguracja aplikacji.
         * @return Zmieniona kolekcja usług z dodaną obsługą JWT.
         */
        public static IServiceCollection AddAuth(this IServiceCollection serviceCollection, IConfiguration configuration)
        {
            // Pobranie ustawień uwierzytelniania z konfiguracji
            var authSettings = configuration.GetSection(nameof(AuthSettings)).Get<AuthSettings>();

            // Dodanie uwierzytelniania JWT do aplikacji
            serviceCollection
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(a =>
                    a.TokenValidationParameters = new TokenValidationParameters
                    {
                        // Czy walidować wystawcę tokena
                        ValidateIssuer = false,

                        // Czy walidować odbiorcę tokena
                        ValidateAudience = false,

                        // Czy walidować czas ważności tokena
                        ValidateLifetime = true,

                        // Czy walidować klucz podpisujący token
                        ValidateIssuerSigningKey = true,

                        // Klucz używany do podpisywania tokenów
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(authSettings.SecretKey)
                        )
                    }
                );

            return serviceCollection;
        }
    }
}
