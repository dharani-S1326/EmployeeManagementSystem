import { Routes } from '@angular/router';
import { ChangePassword } from './pages/change-password/change-password';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { EmployeeListComponent } from './pages/employee/employee-list/employee-list';
import { AddEmployeeComponent } from './pages/employee/add-employee/add-employee';
import { EditEmployeeComponent } from './pages/employee/edit-employee/edit-employee';
import { EmployeeDetailsComponent } from './pages/employee/employee-details/employee-details';
import { RegisterComponent } from './pages/register/register';
import { LoginComponent } from './pages/login/login';
import { ApplyLeaveComponent } from './pages/leave-apply/leave-apply';
import { authGuard } from './auth.guard';
import { EmployeeDashboardComponent } from './pages/employee-dashboard/employee-dashboard';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [authGuard],
  },
  {
    path: 'employee-dashboard',
    component: EmployeeDashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'my-payroll',
    loadComponent: () => import('./pages/my-payroll/my-payroll').then((m) => m.MyPayrollComponent),
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'employees',
    component: EmployeeListComponent,
    canActivate: [authGuard],
  },

  {
    path: 'employees/add',
    component: AddEmployeeComponent,
    canActivate: [authGuard],
  },

  {
    path: 'employees/edit/:id',
    component: EditEmployeeComponent,
    canActivate: [authGuard],
  },

  {
    path: 'employees/details/:id',
    component: EmployeeDetailsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'payroll',
    loadComponent: () =>
      import('./pages/payroll-list/payroll-list').then((m) => m.PayrollComponent),
    canActivate: [authGuard],
  },
  {
    path: 'generate-payroll',
    loadComponent: () =>
      import('./pages/generate-payroll/generate-payroll').then((m) => m.GeneratePayrollComponent),
    canActivate: [authGuard],
  },

  {
    path: 'apply-leave',
    loadComponent: () =>
      import('./pages/leave-apply/leave-apply').then((m) => m.ApplyLeaveComponent),
    canActivate: [authGuard],
  },

  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },

  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
  },

  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
  },
  {
    path: 'leave',
    loadComponent: () =>
      import('./pages/leave-management/leave-management').then((m) => m.LeaveManagementComponent),
    canActivate: [authGuard],
  },
  {
    path: 'my-leaves',
    loadComponent: () => import('./pages/my-leaves/my-leaves').then((m) => m.MyLeavesComponent),
    canActivate: [authGuard],
  },
  {
    path: 'leave-requests',
    loadComponent: () =>
      import('./pages/leave-requests/leave-requests').then((m) => m.LeaveRequestsComponent),
    canActivate: [authGuard],
  },
];
