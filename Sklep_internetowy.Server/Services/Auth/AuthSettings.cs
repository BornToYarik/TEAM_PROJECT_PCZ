namespace Sklep_internetowy.Server.Services.Auth
{
    /**
     * @class AuthSettings
     * @brief Klasa przechowująca ustawienia uwierzytelniania JWT.
     * @details Obiekt tej klasy jest mapowany z konfiguracji aplikacji (np. appsettings.json)
     * i zawiera parametry potrzebne do generowania oraz weryfikacji tokenów JWT.
     */
    public class AuthSettings
    {
        /**
         * @brief Czas ważności tokena JWT.
         * @details Określa jak długo token pozostaje aktywny od momentu jego wygenerowania.
         */
        public TimeSpan Expires { get; set; }

        /**
         * @brief Tajny klucz używany do podpisywania tokenów JWT.
         * @details Klucz ten musi być odpowiednio długi i przechowywany w bezpiecznym miejscu.
         */
        public string SecretKey { get; set; }
    }
}
