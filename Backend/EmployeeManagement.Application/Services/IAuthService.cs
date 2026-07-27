using EmployeeManagement.Application.DTOs;

namespace EmployeeManagement.Application.Services
{
    public interface IAuthService
    {
        Task<string> RegisterAsync(RegisterDto dto);

        Task<LoginResponseDto?> LoginAsync(LoginDto dto);

        Task<string> ChangePasswordAsync(int employeeId,ChangePasswordDto dto);

        Task<string> ForgotPasswordAsync(ForgotPasswordDto dto);

        Task<string> ResetPasswordAsync(ResetPasswordDto dto);

    }
}