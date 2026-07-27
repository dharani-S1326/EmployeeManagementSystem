using EmployeeManagement.Core.Entities;

namespace EmployeeManagement.Core.Interfaces
{
    public interface ILeaveRepository
    {
        Task<IEnumerable<LeaveRequest>> GetAllAsync();

        Task<LeaveRequest?> GetByIdAsync(int id);

        Task<IEnumerable<LeaveRequest>> GetMyLeavesAsync(int employeeId);

        Task AddAsync(LeaveRequest leave);

        Task UpdateAsync(LeaveRequest leave);

        Task DeleteAsync(LeaveRequest leave);
    }
}