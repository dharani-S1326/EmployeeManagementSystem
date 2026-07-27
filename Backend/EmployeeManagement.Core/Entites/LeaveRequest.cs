using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagement.Core.Entities
{
    public class LeaveRequest
    {
        [Key]
        public int LeaveId { get; set; }

        [Required]
        public int EmployeeId { get; set; }

        [ForeignKey(nameof(EmployeeId))]
        public Employee? Employee { get; set; }

        [Required]
        public string LeaveType { get; set; } = string.Empty;

        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public int NoOfDays { get; set; }

        [Required]
        public string Reason { get; set; } = string.Empty;

        public string? MedicalCertificatePath { get; set; }

        public string Status { get; set; } = "Pending";

        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;

        public DateTime? ApprovedDate { get; set; }

        public int? ApprovedBy { get; set; }

        public string? Remarks { get; set; }
    }
}