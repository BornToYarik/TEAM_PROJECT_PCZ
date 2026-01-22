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
         * @brief Konstruktor huba AuctionHub.
         * @param auctionService Serwis odpowiedzialny za obsługę aukcji.
         */
        public AuctionHub(AuctionService auctionService)
        {
            _auctionService = auctionService;
        }

        /**
         * @brief Metoda wywoływana po połączeniu klienta z hubem.
         * @details Służy do logowania informacji o nowym połączeniu użytkownika.
         * @return Zadanie asynchroniczne.
         */
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"User connected: {userId ?? "Anonymous"}");
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
            Console.WriteLine($"User joined auction {auctionId}");
        }

        /**
         * @brief Składa ofertę w wybranej aukcji.
         * @details Metoda weryfikuje użytkownika, a następnie próbuje zapisać ofertę w systemie.
         * W przypadku sukcesu informuje wszystkich uczestników aukcji o nowej cenie.
         * @param auctionId Identyfikator aukcji.
         * @param amount Kwota oferty.
         * @return Zadanie asynchroniczne.
         */
        public async Task PlaceBid(int auctionId, decimal amount)
        {
            // Pobranie identyfikatora użytkownika z tokena JWT
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

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
                }
            }
            else
            {
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
        }

        /**
         * @brief Generuje nazwę grupy SignalR dla danej aukcji.
         * @param auctionId Identyfikator aukcji.
         * @return Nazwa grupy SignalR.
         */
        private string GetGroupName(int auctionId) => $"auction-{auctionId}";
    }
}
