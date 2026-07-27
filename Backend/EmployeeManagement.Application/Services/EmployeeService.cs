using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Core.Entities;
using EmployeeManagement.Core.Interfaces;

namespace EmployeeManagement.Application.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;

        public EmployeeService(
            IEmployeeRepository employeeRepository)
        {
            _employeeRepository = employeeRepository;
        }

        public async Task<IEnumerable<EmployeeDto>> GetAllAsync()
        {
            var employees =
                await _employeeRepository.GetAllAsync();

            return employees.Select(MapToDto);
        }

        public async Task<EmployeeDto?> GetByIdAsync(int id)
        {
            var employee =
                await _employeeRepository.GetByIdAsync(id);

            if (employee == null)
                return null;

            return MapToDto(employee);
        }

        public async Task<object> GetPagedAsync(
            int pageNumber,
            int pageSize,
            string? search,
            string? department,
            string? role)
        {
            var employees =
                await _employeeRepository.GetPagedAsync(
                    pageNumber,
                    pageSize,
                    search,
                    department,
                    role
                );

            var totalCount =
                await _employeeRepository.GetTotalCountAsync(
                    search,
                    department,
                    role
                );

            return new
            {
                data = employees.Select(MapToDto),

                totalCount,

                pageNumber,

                pageSize,

                totalPages = (int)Math.Ceiling(
                    totalCount / (double)pageSize
                ),

                hasMore =
                    pageNumber * pageSize < totalCount
            };
        }

        public async Task<EmployeeDto> AddAsync(
            CreateEmployeeDto dto)
        {
            if (dto.Password != dto.ConfirmPassword)
            {
                throw new ArgumentException(
                    "Passwords do not match");
            }

            var normalizedEmail =
                dto.Email.Trim().ToLower();

            var existing =
                await _employeeRepository
                    .GetByEmailAsync(normalizedEmail);

            if (existing != null)
            {
                throw new ArgumentException(
                    "Email already exists");
            }

            var allowedRoles = new[]
            {
                "Admin",
                "HR",
                "Employee"
            };

            var role = allowedRoles.FirstOrDefault(
                r => r.Equals(
                    dto.Role,
                    StringComparison.OrdinalIgnoreCase
                )
            );

            if (role == null)
            {
                throw new ArgumentException(
                    "Invalid role. Allowed roles are Admin, HR and Employee");
            }

            var employee = new Employee
            {
                Name = dto.Name.Trim(),

                Email = normalizedEmail,

                Phone = dto.Phone,

                Department = dto.Department,

                Designation = dto.Designation,

                Salary = dto.Salary,

                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        dto.Password),

                Role = role,

                IsActive = true
            };

            await _employeeRepository.AddAsync(employee);

            return MapToDto(employee);
        }

        public async Task<EmployeeDto?> UpdateAsync(
            int id,
            EmployeeDto dto)
        {
            var employee =
                await _employeeRepository.GetByIdAsync(id);

            if (employee == null)
                return null;

            employee.Name =
                dto.Name.Trim();

            employee.Email =
                dto.Email.Trim().ToLower();

            employee.Phone =
                dto.Phone;

            employee.Department =
                dto.Department;

            employee.Designation =
                dto.Designation;

            employee.Salary =
                dto.Salary;

            await _employeeRepository.UpdateAsync(employee);

            return MapToDto(employee);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var employee =
                await _employeeRepository.GetByIdAsync(id);

            if (employee == null)
                return false;

            await _employeeRepository.DeleteAsync(employee);

            return true;
        }

        private static EmployeeDto MapToDto(
            Employee employee)
        {
            return new EmployeeDto
            {
                Id = employee.Id,

                Name = employee.Name,

                Email = employee.Email,

                Phone = employee.Phone,

                Department = employee.Department,

                Designation = employee.Designation,

                Salary = employee.Salary,

                Role = employee.Role,

                IsActive = employee.IsActive
            };
        }
    }
}