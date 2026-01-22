// ==================== Services/Bidding/AuctionBackgroundService.cs ====================
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;

namespace Sklep_internetowy.Server.Services.Bidding
{
    public class AuctionBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AuctionBackgroundService> _logger;

        public AuctionBackgroundService(
            IServiceScopeFactory scopeFactory,
            ILogger<AuctionBackgroundService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken ct)
        {
            _logger.LogInformation("AuctionBackgroundService started");

            // Poczekaj 10 sekund na start aplikacji
            await Task.Delay(TimeSpan.FromSeconds(10), ct);

            while (!ct.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
                    var service = scope.ServiceProvider.GetRequiredService<AuctionService>();

                    var expired = await context.Auctions
                        .Where(a => !a.IsFinished && DateTime.UtcNow > a.EndTime)
                        .ToListAsync(ct);

                    if (expired.Any())
                    {
                        _logger.LogInformation($"Found {expired.Count} expired auctions to process");
                    }

                    foreach (var auction in expired)
                    {
                        // POPRAWKA: Przekaż auction.Id zamiast auction
                        await service.FinishAuctionAsync(auction.Id);
                        _logger.LogInformation($"Finished auction {auction.Id}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in AuctionBackgroundService");
                }

                // Sprawdzaj co 30 sekund
                await Task.Delay(30000, ct);
            }

            _logger.LogInformation("AuctionBackgroundService stopped");
        }
    }
}