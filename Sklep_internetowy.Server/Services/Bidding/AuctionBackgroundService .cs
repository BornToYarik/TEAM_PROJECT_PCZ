using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
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

            while (!ct.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
                    var service = scope.ServiceProvider.GetRequiredService<AuctionService>();
                    var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<AuctionHub>>();

                    var expired = await context.Auctions
                        .Where(a => !a.IsFinished && DateTime.UtcNow > a.EndTime)
                        .ToListAsync(ct);

                    foreach (var auction in expired)
                    {
                        _logger.LogInformation($"Finishing auction {auction.Id}");
                        await service.FinishAuctionAsync(auction);

                        // Отправляем уведомление через SignalR
                        await hubContext.Clients.Group($"auction-{auction.Id}")
                            .SendAsync("AuctionFinished", ct);
                    }

                    if (expired.Any())
                    {
                        _logger.LogInformation($"Finished {expired.Count} auctions");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in AuctionBackgroundService");
                }

                await Task.Delay(30000, ct); // Проверка каждые 30 секунд
            }
        }
    }
}