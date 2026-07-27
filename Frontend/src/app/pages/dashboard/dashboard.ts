import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Chart, registerables, ChartConfiguration, ChartData, Plugin } from 'chart.js';

import { BaseChartDirective } from 'ng2-charts';

import ChartDataLabels from 'chartjs-plugin-datalabels';

import { EmployeeService } from '../../services/employee.service';

import { Header } from '../../layout/header/header';

import { Sidebar } from '../../layout/sidebar/sidebar';

import { Footer } from '../../layout/footer/footer';

Chart.register(...registerables, ChartDataLabels);

@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [CommonModule, Header, Sidebar, Footer, BaseChartDirective],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  user: any = {};

  employees: any[] = [];

  totalEmployees = 0;

  totalDepartments = 0;

  chartPlugins: Plugin[] = [ChartDataLabels];

  departmentColors: string[] = [
    '#6D5BD0',

    '#F5A623',

    '#2196F3',

    '#4CAF50',

    '#E53935',

    '#9C27B0',

    '#00ACC1',

    '#FF7043',

    '#795548',

    '#607D8B',
  ];

  departmentChartData: ChartData<'bar'> = {
    labels: [],

    datasets: [
      {
        label: 'Number of Employees',

        data: [],

        backgroundColor: [],

        borderColor: [],

        borderWidth: 1,

        borderRadius: 6,
      },
    ],
  };

  departmentChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      // Hide chart legend

      legend: {
        display: false,
      },

      datalabels: {
        display: true,

        anchor: 'center',

        align: 'center',

        color: '#FFFFFF',

        font: {
          size: 16,

          weight: 'bold',
        },

        formatter: (value: number) => {
          return value;
        },
      },
    },

    scales: {
      // X AXIS

      x: {
        grid: {
          display: false,
        },
      },

      // Y AXIS

      y: {
        beginAtZero: true,

        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  distributionChartData: ChartData<'doughnut'> = {
    labels: [],

    datasets: [
      {
        data: [],

        backgroundColor: [],

        borderColor: '#FFFFFF',

        borderWidth: 2,
      },
    ],
  };

  distributionChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      // Department names

      legend: {
        position: 'bottom',
      },

      datalabels: {
        display: true,

        color: '#FFFFFF',

        font: {
          size: 16,

          weight: 'bold',
        },

        formatter: (value: number) => {
          return value;
        },
      },
    },
  };

  constructor(
    private employeeService: EmployeeService,

    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Get logged-in user

    this.user = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Load employee API data

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.employeeService

      .getEmployees()

      .subscribe({
        next: (data: any[]) => {
          // Store employees from API

          this.employees = data || [];

          this.totalEmployees = this.employees.length;

          const departments = this.employees

            .map((employee) => employee.department?.trim())

            .filter((department) => department);

          this.totalDepartments = new Set(departments).size;

          this.createCharts();

          // Update UI

          this.cdr.detectChanges();
        },

        error: (err: any) => {
          console.error(
            'Dashboard API Error:',

            err,
          );

          this.employees = [];

          this.totalEmployees = 0;

          this.totalDepartments = 0;

          this.createCharts();
        },
      });
  }

  createCharts(): void {
    // Department name -> Employee count

    const departmentCounts: Record<string, number> = {};

    this.employees.forEach((employee) => {
      // Get department from API

      // Empty department = Not Assigned

      const department = employee.department?.trim() || 'Not Assigned';

      // Increase department count

      departmentCounts[department] = (departmentCounts[department] || 0) + 1;
    });

    const departmentNames = Object.keys(departmentCounts);

    const employeeCounts = Object.values(departmentCounts);

    const chartColors = departmentNames.map(
      (department, index) => this.departmentColors[index % this.departmentColors.length],
    );

    this.departmentChartData = {
      labels: departmentNames,

      datasets: [
        {
          label: 'Number of Employees',

          // Dynamic API count

          data: employeeCounts,

          // Different color per department

          backgroundColor: chartColors,

          borderColor: chartColors,

          borderWidth: 1,

          borderRadius: 6,
        },
      ],
    };

    this.distributionChartData = {
      labels: departmentNames,

      datasets: [
        {
          // Dynamic API count

          data: employeeCounts,

          // Same department colors
          // as bar chart

          backgroundColor: chartColors,

          borderColor: '#FFFFFF',

          borderWidth: 2,
        },
      ],
    };
  }
}
