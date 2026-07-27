using System.ComponentModel.DataAnnotations;

public class EmployeeDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^\d{10}$",
        ErrorMessage = "Phone number must contain exactly 10 digits.")]
    public string Phone { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    public decimal Salary { get; set; }
    public string Role { get; set; } = string.Empty;

    public bool IsActive { get; set; }
}