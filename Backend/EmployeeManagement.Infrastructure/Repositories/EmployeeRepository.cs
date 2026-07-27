using EmployeeManagement.Core.Interfaces;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Infrastructure.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly ApplicationDbContext _context;

        public EmployeeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            return await _context.Employees
                .AsNoTracking()
                .ToListAsync();
        }
        public async Task<IEnumerable<Employee>> GetPagedAsync(
    int pageNumber,
    int pageSize,
    string? search,
    string? department,
    string? role)
        {
            var query = _context.Employees
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(x =>
                    x.Name.Contains(search) ||
                    x.Email.Contains(search) ||
                    x.Phone.Contains(search) ||
                    x.Designation.Contains(search)
                );
            }

            if (!string.IsNullOrWhiteSpace(department))
            {
                query = query.Where(x =>
                    x.Department == department);
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(x =>
                    x.Role == role);
            }

            return await query
                .OrderBy(x => x.Id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetTotalCountAsync(
     string? search,
     string? department,
     string? role)
        {
            var query = _context.Employees
                .AsNoTracking()
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.Trim();

                query = query.Where(x =>
                    x.Name.Contains(search) ||
                    x.Email.Contains(search) ||
                    x.Phone.Contains(search) ||
                    x.Designation.Contains(search)
                );
            }

            if (!string.IsNullOrWhiteSpace(department))
            {
                query = query.Where(x =>
                    x.Department == department);
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(x =>
                    x.Role == role);
            }

            return await query.CountAsync();
        }

        public async Task<Employee?> GetByIdAsync(int id)
        {
            return await _context.Employees
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Employee?> GetByEmailAsync(string email)
        {
            return await _context.Employees
                .FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task AddAsync(Employee employee)
        {
            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Employee employee)
        {
            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
        }
    }
}