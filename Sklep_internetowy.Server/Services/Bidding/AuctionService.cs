using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.DTOs;

namespace Sklep_internetowy.Server.Services.Bidding
{
    /**
     * @class AuctionService
     * @brief Serwis odpowiedzialny za pełną obsługę logiki aukcji.
     * @details Umożliwia tworzenie aukcji, składanie ofert, pobieranie aktywnych aukcji
     * oraz finalizowanie zakończonych licytacji zintegrowane z komunikacją SignalR.
     */
    public class AuctionService
    {
        private readonly StoreDbContext _context;
        private readonly IHubContext<AuctionHub> _hubContext;
        private readonly ILogger<AuctionService> _logger;

        /**
         * @brief Konstruktor serwisu AuctionService.
         * @param context Kontekst bazy danych.
         * @param hubContext Kontekst huba SignalR do powiadomień w czasie rzeczywistym.
         * @param logger Logger do zapisywania informacji diagnostycznych.
         */
        public AuctionService(
            StoreDbContext context,
            IHubContext<AuctionHub> hubContext,
            ILogger<AuctionService> logger)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
        }

        /**
         * @brief Tworzy nową aukcję dla wybranego produktu.
         * @details Sprawdza dostępność produktu, ustawia czas trwania i inicjalizuje stan aukcji.
         * @param productId Identyfikator produktu.
         * @param startingPrice Cena początkowa aukcji.
         * @param durationMinutes Czas trwania aukcji w minutach (domyślnie 10).
         * @return Utworzony obiekt aukcji.
         */
        public async Task<Auction> CreateAuctionAsync(int productId, decimal startingPrice, int durationMinutes = 10)
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .Include(p => p.ProductCategory)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                throw new Exception("Product not found");

            if (product.Quantity < 1)
                throw new Exception("Product is out of stock");

            var auction = new Auction
            {
                ProductId = productId,
                StartingPrice = startingPrice,
                CurrentPrice = startingPrice,
                StartTime = DateTime.UtcNow,
                EndTime = DateTime.UtcNow.AddMinutes(durationMinutes),
                IsFinished = false
            };

            _context.Auctions.Add(auction);
            await _context.SaveChangesAsync();

            // Przypisanie produktu do obiektu aukcji przed zwróceniem
            auction.Product = product;

            _logger.LogInformation($"Created auction {auction.Id} for product {productId}, duration: {durationMinutes} minutes");

            return auction;
        }

        /**
         * @brief Pobiera aukcję na podstawie jej identyfikatora wraz z powiązanymi danymi.
         * @param id Identyfikator aukcji.
         * @return Obiekt aukcji z produktem, zdjęciami i ofertami lub null.
         */
        public async Task<Auction?> GetAuctionByIdAsync(int id)
        {
            return await _context.Auctions
                .Include(a => a.Product)
                    .ThenInclude(p => p.Images)
                .Include(a => a.Product)
                    .ThenInclude(p => p.ProductCategory)
                .Include(a => a.Bids)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        /**
         * @brief Pobiera listę wszystkich aktywnych (niezakończonych) aukcji.
         * @return Lista obiektów Auction.
         */
        public async Task<List<Auction>> GetActiveAuctionsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Auctions
                .Include(a => a.Product)
                    .ThenInclude(p => p.Images)
                .Include(a => a.Bids)
                .Where(a => a.EndTime > now && !a.IsFinished)
                .ToListAsync();
        }

        /**
         * @brief Składa ofertę w aukcji i powiadamia uczestników przez SignalR.
         * @details Weryfikuje cenę, aktualizuje czas zakończenia (jeśli zostało < 5 min) 
         * oraz rozsyła informację o nowej ofercie do grupy subskrybentów aukcji.
         * @param auctionId Identyfikator aukcji.
         * @param amount Kwota oferty.
         * @param userId Identyfikator użytkownika składającego ofertę.
         * @return True jeśli oferta została przyjęta, w przeciwnym wypadku false.
         */
        public async Task<bool> PlaceBidAsync(int auctionId, decimal amount, string userId)
        {
            var auction = await _context.Auctions
                .Include(a => a.Bids)
                .Include(a => a.Product)
                .FirstOrDefaultAsync(a => a.Id == auctionId);

            if (auction == null || auction.IsFinished || auction.EndTime <= DateTime.UtcNow)
            {
                _logger.LogWarning($"Cannot place bid on auction {auctionId}: auction not found or expired");
                return false;
            }

            if (amount <= auction.CurrentPrice)
            {
                _logger.LogWarning($"Bid amount {amount} is not higher than