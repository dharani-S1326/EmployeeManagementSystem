namespace EmployeeManagement.Core.Interfaces
{
    public interface IEmployeeRepository
    {
        Task<IEnumerable<Employee>> GetAllAsync();

        Task<Employee?> GetByIdAsync(int id);

        Task<Employee?> GetByEmailAsync(string email);

        Task AddAsync(Employee employee);

        Task UpdateAsync(Employee employee);

        Task DeleteAsync(Employee employee);
        Task<IEnumerable<Employee>> GetPagedAsync(
      int pageNumber,
      int pageSize,
      string? search,
      string? department,
      string? role);

        Task<int> GetTotalCountAsync(
            string? search,
            string? department,
            string? role);
    }
}