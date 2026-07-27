using EmployeeManagement.Application.DTOs;

namespace EmployeeManagement.Application.Services
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeDto>> GetAllAsync();

        Task<EmployeeDto?> GetByIdAsync(int id);

        Task<EmployeeDto> AddAsync(
            CreateEmployeeDto dto);

        Task<EmployeeDto?> UpdateAsync(
            int id,
            EmployeeDto dto);

        Task<bool> DeleteAsync(int id);

        Task<object> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? search,
            string? department,
            string? role);
    }
}