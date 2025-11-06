namespace Sklep_internetowy.Server.DTOs
{
    public class UserDto
    {
        public string Id { get; set; } = null!;
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
    }
}
