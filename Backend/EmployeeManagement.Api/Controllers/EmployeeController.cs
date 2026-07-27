using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagement.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(
            IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAll()
        {
            var employees =
                await _employeeService.GetAllAsync();

            return Ok(employees);
        }
        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged(
    [FromQuery] int pageNumber = 1,
    [FromQuery] int pageSize = 10,
    [FromQuery] string? search = null,
    [FromQuery] string? department = null,
    [FromQuery] string? role = null)
        {
            if (pageNumber < 1)
                pageNumber = 1;

            if (pageSize < 1)
                pageSize = 10;

            var result = await _employeeService.GetPagedAsync(
                pageNumber,
                pageSize,
                search,
                department,
                role
            );

            return Ok(result);
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var employee =
                await _employeeService.GetByIdAsync(id);

            if (employee == null)
                return NotFound();

            return Ok(employee);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("add")]
        public async Task<IActionResult> Add(
            [FromBody] CreateEmployeeDto dto)
        {
            try
            {
                var employee =
                    await _employeeService.AddAsync(dto);

                return Ok(new
                {
                    message = "Employee added successfully",
                    data = employee
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] EmployeeDto dto)
        {
            try
            {
                var employee =
                    await _employeeService.UpdateAsync(id, dto);

                if (employee == null)
                    return NotFound();

                return Ok(employee);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result =
                await _employeeService.DeleteAsync(id);

            if (!result)
                return NotFound();

            return Ok(new
            {
                message = "Employee Deleted Successfully"
            });
        }
    }
}