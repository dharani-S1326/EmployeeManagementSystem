using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Helpers;
using EmployeeManagement.Core.Entities;
using EmployeeManagement.Core.Interfaces;

namespace EmployeeManagement.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly JwtService _jwtService;
        private readonly IEmailService _emailService;

        public AuthService(
            IEmployeeRepository employeeRepository,
            JwtService jwtService,
            IEmailService emailService)
        {
            _employeeRepository = employeeRepository;
            _jwtService = jwtService;
            _emailService = emailService;
        }

        // Admin only access will be handled in AuthController
        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            if (dto.Password != dto.ConfirmPassword)
                return "Passwords do not match";

            var existingEmployee =
                await _employeeRepository.GetByEmailAsync(dto.Email);

            if (existingEmployee != null)
                return "Email already exists";

            var allowedRoles = new[]
            {
                "Admin",
                "HR",
                "Employee"
            };

            if (string.IsNullOrWhiteSpace(dto.Role) ||
                !allowedRoles.Contains(
                    dto.Role,
                    StringComparer.OrdinalIgnoreCase))
            {
                return "Invalid role. Allowed roles are Admin, HR and Employee";
            }

            var role = allowedRoles.First(
                x => x.Equals(
                    dto.Role,
                    StringComparison.OrdinalIgnoreCase));

            var employee = new Employee
            {
                Name = dto.Name.Trim(),
                Email = dto.Email.Trim().ToLower(),
                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(dto.Password),

                Role = role,

                Phone = string.Empty,
                Department = string.Empty,
                Designation = string.Empty,

                Salary = 0,
                IsActive = true
            };

            await _employeeRepository.AddAsync(employee);

            return "Registration Successful";
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
        {
            var employee =
                await _employeeRepository.GetByEmailAsync(
                    dto.Email.Trim().ToLower());

            if (employee == null)
                return null;

            if (!employee.IsActive)
                return null;

            if (string.IsNullOrWhiteSpace(employee.PasswordHash))
                return null;

            var isPasswordValid =
                BCrypt.Net.BCrypt.Verify(
                    dto.Password,
                    employee.PasswordHash);

            if (!isPasswordValid)
                return null;

            return new LoginResponseDto
{
    Token = _jwtService.GenerateToken(employee),
    EmployeeId = employee.Id,
    Name = employee.Name,
    Email = employee.Email,
    Role = employee.Role
};
        }

        public async Task<string> ChangePasswordAsync(
            int employeeId,
            ChangePasswordDto dto)
        {
            var employee =
                await _employeeRepository.GetByIdAsync(employeeId);

            if (employee == null)
                return "Employee not found";

            if (string.IsNullOrWhiteSpace(employee.PasswordHash))
                return "Password is not configured";

            if (!BCrypt.Net.BCrypt.Verify(
                    dto.CurrentPassword,
                    employee.PasswordHash))
            {
                return "Current Password is incorrect";
            }

            if (dto.NewPassword != dto.ConfirmPassword)
                return "Passwords do not match";

            if (BCrypt.Net.BCrypt.Verify(
                    dto.NewPassword,
                    employee.PasswordHash))
            {
                return "New password cannot be the same as current password";
            }

            employee.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _employeeRepository.UpdateAsync(employee);

            return "Password changed successfully";
        }
        public async Task<string> ForgotPasswordAsync(
            ForgotPasswordDto dto)
        {
            var employee =
                await _employeeRepository.GetByEmailAsync(
                    dto.Email.Trim().ToLower());

            if (employee == null)
                return "Email not found";

            var resetToken = Guid.NewGuid().ToString();

            employee.ResetToken = resetToken;

            employee.ResetTokenExpiry =
                DateTime.UtcNow.AddMinutes(15);

            await _employeeRepository.UpdateAsync(employee);

            var resetLink =
                $"http://localhost:4200/reset-password" +
                $"?email={Uri.EscapeDataString(employee.Email)}" +
                $"&token={Uri.EscapeDataString(resetToken)}";

            var subject = "Reset Your Password";

            var body = $@"
                <h2>Employee Management System</h2>

                <p>Hello <b>{employee.Name}</b>,</p>

                <p>
                    Click the button below to reset your password.
                </p>

                <br/>

                <a href='{resetLink}'
                   style='background:#0d6efd;
                          color:white;
                          padding:12px 20px;
                          text-decoration:none;
                          border-radius:6px;'>
                    Reset Password
                </a>

                <br/><br/>

                <p>This link will expire in 15 minutes.</p>

                <p>
                    If you didn't request a password reset,
                    please ignore this email.
                </p>
            ";

            await _emailService.SendEmailAsync(
                employee.Email,
                subject,
                body);

            return "Reset password link sent successfully";
        }

        public async Task<string> ResetPasswordAsync(
            ResetPasswordDto dto)
        {
            var employee =
                await _employeeRepository.GetByEmailAsync(
                    dto.Email.Trim().ToLower());

            if (employee == null)
                return "Email not found";

            if (employee.ResetToken != dto.Token)
                return "Invalid reset token";

            if (employee.ResetTokenExpiry == null ||
                employee.ResetTokenExpiry < DateTime.UtcNow)
            {
                return "Reset token has expired";
            }

            if (dto.NewPassword != dto.ConfirmPassword)
                return "Passwords do not match";

            employee.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            employee.ResetToken = null;
            employee.ResetTokenExpiry = null;

            await _employeeRepository.UpdateAsync(employee);

            return "Password reset successfully";
        }
    }
}