export interface Payroll {
  payrollId?: number;

  employeeId?: number;

  employeeName: string;

  department: string;

  designation: string;

  basicSalary: number;

  allowance: number;

  bonus: number;

  deduction: number;

  tax: number;

  netSalary: number;

  paymentStatus: string;

  paymentDate: string;

  month?: string;
}
