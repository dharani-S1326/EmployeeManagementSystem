namespace EmployeeManagement.Application.DTOs
{
    public class LeaveResponseDto
    {
        public int LeaveId { get; set; }

        public int EmployeeId { get; set; }

        public string EmployeeName { get; set; } = string.Empty;

        public string LeaveType { get; set; } = string.Empty;

        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public int NoOfDays { get; set; }

        public string Reason { get; set; } = string.Empty;

        public string? MedicalCertificatePath { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime AppliedDate { get; set; }

        public DateTime? ApprovedDate { get; set; }

        public int? ApprovedBy { get; set; }

        public string? Remarks { get; set; }
    }
}