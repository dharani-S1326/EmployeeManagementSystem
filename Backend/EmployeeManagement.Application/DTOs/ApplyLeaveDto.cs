using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Application.DTOs
{
    public class ApplyLeaveDto
    {
        [Required]
        public string LeaveType { get; set; } = string.Empty;

        [Required]
        public DateTime FromDate { get; set; }

        [Required]
        public DateTime ToDate { get; set; }

        [Required]
        [MinLength(10)]
        public string Reason { get; set; } = string.Empty;
    }
}