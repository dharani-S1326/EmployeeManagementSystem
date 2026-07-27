using EmployeeManagement.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using EmployeeManagement.Infrastructure.Data;

[Route("api/[controller]")]
[ApiController]
public class PayrollController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PayrollController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET
    [HttpGet]
    public async Task<IActionResult> GetPayroll()
    {
        return Ok(await _context.Payrolls.ToListAsync());
    }

    // GET BY EMPLOYEE

    [HttpGet("{employeeId}")]
    public async Task<IActionResult> GetPayrollByEmployee(int employeeId)
    {
        var payroll = await _context.Payrolls
            .Where(x => x.EmployeeId == employeeId)
            .ToListAsync();

        return Ok(payroll);
    }

    // POST

    [HttpPost]

    public async Task<IActionResult> GeneratePayroll(Payroll payroll)
    {
        payroll.NetSalary =
            payroll.BasicSalary +
            payroll.Allowance +
            payroll.Bonus -
            payroll.Deduction -
            payroll.Tax;

        _context.Payrolls.Add(payroll);

        await _context.SaveChangesAsync();

        return Ok(payroll);
    }
    // PUT
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePayroll(int id, Payroll payroll)
    {
        var data = await _context.Payrolls.FindAsync(id);

        if (data == null)
            return NotFound();

        data.BasicSalary = payroll.BasicSalary;
        data.Allowance = payroll.Allowance;
        data.Bonus = payroll.Bonus;
        data.Deduction = payroll.Deduction;
        data.Tax = payroll.Tax;

        data.NetSalary =
            payroll.BasicSalary +
            payroll.Allowance +
            payroll.Bonus -
            payroll.Deduction -
            payroll.Tax;

        data.PaymentStatus = payroll.PaymentStatus;
        data.PaymentDate = payroll.PaymentDate;

        await _context.SaveChangesAsync();

        return Ok(data);
    }

    // DELETE
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePayroll(int id)
    {
        var payroll = await _context.Payrolls.FindAsync(id);

        if (payroll == null)
            return NotFound();

        _context.Payrolls.Remove(payroll);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Payroll deleted successfully"
        });
    }

}