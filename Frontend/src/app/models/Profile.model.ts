export interface Profile {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  designation: string;
  role: string;
  salary: number;
  joiningDate: string;
  isActive: boolean;
  profileImageUrl?: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  email: string;
  phoneNumber: string;
}
