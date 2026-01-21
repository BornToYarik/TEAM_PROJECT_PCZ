// ==================== Services/AuctionFinisherService.cs ====================
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Services.Bidding;

namespace Sklep_internetowy.Server.Services
{
    public class AuctionFinisherService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AuctionFinisherService> _logger;

        public AuctionFinisherService(IServiceProvider serviceProvider, ILogger<AuctionFinisherService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AuctionFinisherService started");

            // Poczekaj 10 sekund na start aplikacji
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
                    var auctionService = scope.ServiceProvider.GetRequiredService<AuctionService>();

                    var now = DateTime.UtcNow;
                    var finishedAuctions = await context.Auctions
                        .Where(a => !a.IsFinished && a.EndTime <= now)
                        .ToListAsync(stoppingToken);

                    if (finishedAuctions.Any())
                    {
                        _logger.LogInformation($"Found {finishedAuctions.Count} finished auctions to process");

                        foreach (var auction in finishedAuctions)
                        {
                            await auctionService.FinishAuctionAsync(auction.Id);
                            _logger.LogInformation($"Finished auction {auction.Id}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in AuctionFinisherService");
                }

                // Sprawdzaj co minutę
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }

            _logger.LogInformation("AuctionFinisherService stopped");
        }
    }
}