using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public decimal Price { get; set; }

        public int Quantity { get; set; }

        public string? Description { get; set; }

        public decimal? DiscountPercentage { get; set; }
        public DateTime? DiscountStartDate { get; set; }
        public DateTime? DiscountEndDate { get; set; }

        public decimal FinalPrice
        {
            get
            {
                if (HasActiveDiscount)
                {
                    return Price * (1 - (DiscountPercentage ?? 0) / 100);
                }
                return Price;
            }
        }

        public bool HasActiveDiscount
        {
            get
            {
                if (!DiscountPercentage.HasValue || DiscountPercentage <= 0)
                    return false;

                var now = DateTime.UtcNow;

                bool isStarted = !DiscountStartDate.HasValue || DiscountStartDate <= now;
                bool isNotEnded = !DiscountEndDate.HasValue || DiscountEndDate >= now;

                return isStarted && isNotEnded;
            }
        }
        public ICollection<OrderProduct> OrderProducts { get; set; } = new List<OrderProduct>();
    }
}
