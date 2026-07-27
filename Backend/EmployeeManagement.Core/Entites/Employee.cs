public class Employee
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    public decimal Salary { get; set; }

    public string? ProfileImagePath { get; set; }

    public string Role { get; set; } = "Employee";

    public bool IsActive { get; set; } = true;

    // Forgot password
    public string? ResetToken { get; set; }

    public DateTime? ResetTokenExpiry { get; set; }
}