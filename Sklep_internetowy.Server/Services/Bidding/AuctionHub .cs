using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Sklep_internetowy.Server.Services.Bidding
{
    [Authorize]
    public class AuctionHub : Hub
    {
        private readonly AuctionService _auctionService;
        private readonly ILogger<AuctionHub> _logger;

        public AuctionHub(AuctionService auctionService, ILogger<AuctionHub> logger)
        {
            _auctionService = auctionService;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation($"User connected: {userId ?? "Anonymous"}");
            await base.OnConnectedAsync();
        }

        public async Task JoinAuction(int auctionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(auctionId));
            _logger.LogInformation($"User joined auction {auctionId}");
        }

        public async Task PlaceBid(int auctionId, decimal amount)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? Context.User?.FindFirst("sub")?.Value;

            if (userId == null)
            {
                throw new HubException("User not authenticated");
            }

            var success = await _auctionService.PlaceBidAsync(auctionId, amount, userId);

            if (success)
            {
                var auction = await _auctionService.GetAuctionByIdAsync(auctionId);
                if (auction != null)
                {
                    await Clients.Group(GetGroupName(auctionId)).SendAsync(
                        "BidPlaced",
                        auction.CurrentPrice,
                        auction.EndTime
                    );
                }
            }
            else
            {
                throw new HubException("Bid too low or auction finished");
            }
        }

        public async Task FinishAuction(int auctionId)
        {
            await Clients.Group(GetGroupName(auctionId)).SendAsync("AuctionFinished");
        }

        private string GetGroupName(int auctionId) => $"auction-{auctionId}";
    }
}