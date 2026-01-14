using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;

namespace Sklep_internetowy.Server.Services.Bidding
{
    public class AuctionBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public AuctionBackgroundService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken ct)
        {
            while (!ct.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<StoreDbContext>();
                var service = scope.ServiceProvider.GetRequiredService<AuctionService>();

                var expired = await context.Auctions
                    .Where(a => !a.IsFinished && DateTime.UtcNow > a.EndTime)
                    .ToListAsync();

                foreach (var auction in expired)
                    await service.FinishAuctionAsync(auction);

                await Task.Delay(30000, ct);
            }
        }
    }
}
