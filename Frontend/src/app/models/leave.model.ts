export interface Leave {
  leaveId: number;
  employeeId: number;
  employeeName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  noOfDays: number;
  reason: string;
  medicalCertificatePath?: string | null;
  status: string;
  appliedDate: string;
  approvedDate?: string | null;
  approvedBy?: number | null;
  remarks?: string | null;
}

export interface ApplyLeave {
  employeeId: number;
  leaveType: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface LeaveApproval {
  status: string;
  approvedBy: number | null;
  remarks: string;
}
