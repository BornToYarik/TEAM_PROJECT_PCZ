using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class UserMessage
    {
        public int Id { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required, MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? Phone { get; set; }

        [Required, MaxLength(1000)]
        public string Content { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
