namespace Sklep_internetowy.Server.DTOs
{
    public class RegisterUserRequest
    {
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public IList<string> Roles { get; set; } = new List<string>();
    }
}
