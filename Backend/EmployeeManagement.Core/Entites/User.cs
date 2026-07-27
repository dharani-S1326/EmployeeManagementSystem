public class User
{
    public int Id { get; set; }      // Primary Key

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Role { get; set; } = "User";

    public string? ResetToken { get; set; }

    public DateTime? ResetTokenExpiry { get; set; }
}