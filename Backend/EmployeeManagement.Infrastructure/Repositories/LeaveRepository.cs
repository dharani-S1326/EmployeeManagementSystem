using EmployeeManagement.Core.Entities;
using EmployeeManagement.Core.Interfaces;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EmployeeManagement.Infrastructure.Repositories
{
    public class LeaveRepository : ILeaveRepository
    {
        private readonly ApplicationDbContext _context;

        public LeaveRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<LeaveRequest>> GetAllAsync()
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .OrderByDescending(x => x.AppliedDate)
                .ToListAsync();
        }

        public async Task<LeaveRequest?> GetByIdAsync(int id)
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .FirstOrDefaultAsync(x => x.LeaveId == id);
        }

        public async Task<IEnumerable<LeaveRequest>>
            GetMyLeavesAsync(int employeeId)
        {
            return await _context.LeaveRequests
                .Include(x => x.Employee)
                .Where(x => x.EmployeeId == employeeId)
                .OrderByDescending(x => x.AppliedDate)
                .ToListAsync();
        }

        public async Task AddAsync(LeaveRequest leave)
        {
            await _context.LeaveRequests.AddAsync(leave);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(LeaveRequest leave)
        {
            _context.LeaveRequests.Update(leave);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(LeaveRequest leave)
        {
            _context.LeaveRequests.Remove(leave);
            await _context.SaveChangesAsync();
        }
    }
}