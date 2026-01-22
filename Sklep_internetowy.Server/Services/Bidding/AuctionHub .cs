using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Sklep_internetowy.Server.Services.Bidding
{
    /**
     * @class AuctionHub
     * @brief Hub SignalR odpowiedzialny za komunikację w czasie rzeczywistym dla aukcji.
     * @details Umożliwia dołączanie użytkowników do aukcji, składanie ofert oraz
     * przesyłanie aktualizacji ceny i czasu zakończenia aukcji do wszystkich uczestników.
     */
    [Authorize]
    public class AuctionHub : Hub
    {
        /**
         * @brief Serwis obsługujący logikę aukcji.
         */
        private readonly AuctionService _auctionService;

        /**
         * @brief Serwis logowania do rejestrowania zdarzeń połączeń i ofert.
         */
        private readonly ILogger<AuctionHub> _logger;

        /**
         * @brief Konstruktor huba AuctionHub.
         * @param auctionService Serwis odpowiedzialny za obsługę aukcji.
         * @param logger Serwis do logowania zdarzeń wewnątrz huba.
         */
        public AuctionHub(AuctionService auctionService, ILogger<AuctionHub> logger)
        {
            _auctionService = auctionService;
            _logger = logger;
        }

        /**
         * @brief Metoda wywoływana po połączeniu klienta z hubem.
         * @details Służy do logowania informacji o nowym połączeniu użytkownika.
         * @return Zadanie asynchroniczne.
         */
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation($"User connected: {userId ?? "Anonymous"}");
            await base.OnConnectedAsync();
        }

        /**
         * @brief Dodaje użytkownika do grupy SignalR powiązanej z daną aukcją.
         * @param auctionId Identyfikator aukcji.
         * @return Zadanie asynchroniczne.
         */
        public async Task JoinAuction(int auctionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(auctionId));
            _logger.LogInformation($"User joined auction {auctionId}");
        }

        /**
         * @brief Składa ofertę w wybranej aukcji.
         * @details Metoda weryfikuje użytkownika (sprawdzając ClaimTypes.NameIdentifier lub "sub"), 
         * a następnie próbuje zapisać ofertę w systemie. W przypadku sukcesu informuje 
         * wszystkich uczestników aukcji o nowej cenie i czasie zakończenia.
         * @param auctionId Identyfikator aukcji.
         * @param amount Kwota oferty.
         * @return Zadanie asynchroniczne.
         * @exception HubException Rzucany, gdy użytkownik nie jest uwierzytelniony lub oferta jest zbyt niska.
         */
        public async Task PlaceBid(int auctionId, decimal amount)
        {
            // Pobranie identyfikatora użytkownika z tokena JWT (obsługa standardowego Claimu oraz 'sub')
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? Context.User?.FindFirst("sub")?.Value;

            if (userId == null)
            {
                throw new HubException("User not authenticated");
            }

            // Próba złożenia oferty w serwisie aukcji
            var success = await _auctionService.PlaceBidAsync(auctionId, amount, userId);

            if (success)
            {
                // Pobranie aktualnych danych aukcji
                var auction = await _auctionService.GetAuctionByIdAsync(auctionId);
                if (auction != null)
                {
                    // Powiadomienie wszystkich uczestników aukcji o nowej ofercie
                    await Clients.Group(GetGroupName(auctionId)).SendAsync(
                        "BidPlaced",
                        auction.CurrentPrice,
                        auction.EndTime
                    );
                    _logger.LogInformation($"Bid placed successfully on auction {auctionId} by user {userId}");
                }
            }
            else
            {
                _logger.LogWarning($"Bid attempt failed for auction {auctionId} (amount too low or finished)");
                throw new HubException("Bid too low or auction finished");
            }
        }

        /**
         * @brief Wysyła do klientów informację o zakończeniu aukcji.
         * @param auctionId Identyfikator aukcji.
         * @return Zadanie asynchroniczne.
         */
        public async Task FinishAuction(int auctionId)
        {
            await Clients.Group(GetGroupName(auctionId)).SendAsync("AuctionFinished");
            _logger.LogInformation($"Broadcasted finish for auction {auctionId}");
        }

        /**
         * @brief Generuje nazwę grupy SignalR dla danej aukcji.
         * @param auctionId Identyfikator aukcji.
         * @return Nazwa grupy SignalR (np. "auction-123").
         */
        private string GetGroupName(int auctionId) => $"auction-{auctionId}";
    }
}