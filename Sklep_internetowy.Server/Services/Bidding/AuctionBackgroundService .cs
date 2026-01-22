using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;

namespace Sklep_internetowy.Server.Services.Bidding
{
    /**
     * @class AuctionBackgroundService
     * @brief Usługa działająca w tle odpowiedzialna za automatyczne kończenie aukcji.
     * @details Serwis cyklicznie sprawdza, czy istnieją aukcje, których czas zakończenia już minął
     * i automatycznie je finalizuje przy użyciu AuctionService.
     */
    public class AuctionBackgroundService : BackgroundService
    {
        /**
         * @brief Fabryka zakresów usług do tworzenia scope dla zależności.
         */
        private readonly IServiceScopeFactory _scopeFactory;

        /**
         * @brief Serwis logowania do rejestrowania zdarzeń i błędów.
         */
        private readonly ILogger<AuctionBackgroundService> _logger;

        /**
         * @brief Konstruktor usługi AuctionBackgroundService.
         * @param scopeFactory Fabryka zakresów serwisów do tworzenia kontekstu zależności.
         * @param logger Serwis do logowania operacji wykonywanych w tle.
         */
        public AuctionBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<AuctionBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        /**
         * @brief Główna pętla wykonywana w tle przez usługę.
         * @param ct Token anulowania umożliwiający bezpieczne zatrzymanie usługi.
         * @return Zadanie asynchroniczne.
         */
        protected override async Task ExecuteAsync(CancellationToken ct)
        {
            _logger.LogInformation("AuctionBackgroundService started");

            /**
             * @brief Początkowe opóźnienie (10 sekund) na start aplikacji.
             */
            await Task.Delay(TimeSpan.FromSeconds(10), ct);

            // Pętla wykonująca się dopóki aplikacja działa
            while (!ct.IsCancellationRequested)
            {
                try
                {
                    // Utworzenie nowego zakresu zależności (scope)
                    using var scope = _scopeFactory.CreateScope();

                    // Pobranie kontekstu bazy danych
                    var context = scope.ServiceProvider.GetRequiredService<StoreDbContext>();

                    // Pobranie serwisu obsługującego aukcje
                    var service = scope.ServiceProvider.GetRequiredService<AuctionService>();

                    /**
                     * @brief Pobranie listy aukcji, które powinny zostać zakończone.
                     * @details Wybierane są aukcje, które nie są jeszcze zakończone i których czas dobiegł końca.
                     */
                    var expired = await context.Auctions
                        .Where(a => !a.IsFinished && DateTime.UtcNow > a.EndTime)
                        .ToListAsync(ct);

                    if (expired.Any())
                    {
                        _logger.LogInformation($"Found {expired.Count} expired auctions to process");
                    }

                    /**
                     * @brief Finalizacja każdej wygasłej aukcji.
                     * @details Wywołuje asynchroniczną metodę kończenia aukcji na podstawie jej ID.
                     */
                    foreach (var auction in expired)
                    {
                        await service.FinishAuctionAsync(auction.Id);
                        _logger.LogInformation($"Finished auction {auction.Id}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in AuctionBackgroundService");
                }

                /**
                 * @brief Opóźnienie pomiędzy kolejnymi sprawdzeniami (30 sekund).
                 */
                await Task.Delay(30000, ct);
            }

            _logger.LogInformation("AuctionBackgroundService stopped");
        }
    }
}