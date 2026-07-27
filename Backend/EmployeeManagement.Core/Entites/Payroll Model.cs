using System.ComponentModel.DataAnnotations;

namespace EmployeeManagement.Core.Entities
{
    public class Payroll
    {
        [Key]
        public int PayrollId { get; set; }

        public int EmployeeId { get; set; }

        public string EmployeeName { get; set; } = "";

        public string Department { get; set; } = "";

        public string Designation { get; set; } = "";

        public decimal BasicSalary { get; set; }

        public decimal Allowance { get; set; }

        public decimal Bonus { get; set; }

        public decimal Deduction { get; set; }

        public decimal Tax { get; set; }

        public decimal NetSalary { get; set; }

        public string PaymentStatus { get; set; } = "Pending";

        public DateTime PaymentDate { get; set; }

        public string Month { get; set; } = "";
    }
}