namespace Sklep_internetowy.Server.DTOs
{
    public class UserUpdateDto
    {
        public string Email { get; set; } = null!;
        public IList<string> Roles { get; set; } = new List<string>();
    }
}
