using EmployeeManagement.Api.DTOs;
using EmployeeManagement.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace EmployeeManagement.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        private static readonly string[] AllowedExtensions =
        {
            ".jpg",
            ".jpeg",
            ".png"
        };

        private const long MaxImageSizeBytes =
            2 * 1024 * 1024;

        public ProfileController(
            ApplicationDbContext context,
            IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        private int? GetCurrentEmployeeId()
        {
            var employeeIdClaim =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(employeeIdClaim))
                return null;

            if (!int.TryParse(
                    employeeIdClaim,
                    out var employeeId))
            {
                return null;
            }

            return employeeId;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var employeeId = GetCurrentEmployeeId();

            if (employeeId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid or missing employee id in token"
                });
            }

            var employee =
                await _context.Employees
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        e => e.Id == employeeId.Value);

            if (employee == null)
            {
                return NotFound(new
                {
                    message = "Employee not found"
                });
            }

            var dto = new ProfileDto
            {
                Id = employee.Id,

                FullName = employee.Name,

                Email = employee.Email,

                PhoneNumber = employee.Phone,

                Department = employee.Department,

                Designation = employee.Designation,

                Salary = employee.Salary,

                Role = employee.Role,

                IsActive = employee.IsActive,

                ProfileImageUrl =
                    BuildAbsoluteUrl(
                        employee.ProfileImagePath)
            };

            return Ok(dto);
        }

        
        [HttpPut]
        public async Task<IActionResult> UpdateProfile(
            [FromBody] UpdateProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var employeeId = GetCurrentEmployeeId();

            if (employeeId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid or missing employee id in token"
                });
            }

            var employee =
                await _context.Employees
                    .FirstOrDefaultAsync(
                        e => e.Id == employeeId.Value);

            if (employee == null)
            {
                return NotFound(new
                {
                    message = "Employee not found"
                });
            }

            var normalizedEmail =
                dto.Email.Trim().ToLower();

            var emailTaken =
                await _context.Employees.AnyAsync(
                    e =>
                        e.Id != employee.Id &&
                        e.Email.ToLower() ==
                        normalizedEmail);

            if (emailTaken)
            {
                return BadRequest(new
                {
                    message =
                        "This email is already in use"
                });
            }

            employee.Name =
                dto.FullName.Trim();

            employee.Email =
                normalizedEmail;

            employee.Phone =
                dto.PhoneNumber.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Profile updated successfully"
            });
        }

        [HttpPost("upload-image")]
        [RequestSizeLimit(
            MaxImageSizeBytes + 1024)]
        public async Task<IActionResult> UploadImage(
            IFormFile? file)
        {
            if (file == null ||
                file.Length == 0)
            {
                return BadRequest(new
                {
                    message = "No file uploaded"
                });
            }

            var extension =
                Path.GetExtension(file.FileName)
                    .ToLowerInvariant();

            if (!AllowedExtensions.Contains(extension))
            {
                return BadRequest(new
                {
                    message =
                        "Only .jpg, .jpeg and .png files are allowed"
                });
            }

            if (file.Length > MaxImageSizeBytes)
            {
                return BadRequest(new
                {
                    message =
                        "Maximum image size is 2 MB"
                });
            }

            var employeeId = GetCurrentEmployeeId();

            if (employeeId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid or missing employee id in token"
                });
            }

            var employee =
                await _context.Employees
                    .FirstOrDefaultAsync(
                        e => e.Id == employeeId.Value);

            if (employee == null)
            {
                return NotFound(new
                {
                    message = "Employee not found"
                });
            }

            var webRoot =
                _env.WebRootPath ??
                Path.Combine(
                    _env.ContentRootPath,
                    "wwwroot");

            var uploadsFolder =
                Path.Combine(
                    webRoot,
                    "uploads",
                    "profile-images");

            Directory.CreateDirectory(
                uploadsFolder);

            if (!string.IsNullOrWhiteSpace(
                    employee.ProfileImagePath))
            {
                var oldRelativePath =
                    employee.ProfileImagePath
                        .TrimStart('/', '\\')
                        .Replace(
                            '/',
                            Path.DirectorySeparatorChar);

                var oldFullPath =
                    Path.Combine(
                        webRoot,
                        oldRelativePath);

                if (System.IO.File.Exists(
                        oldFullPath))
                {
                    try
                    {
                        System.IO.File.Delete(
                            oldFullPath);
                    }
                    catch
                    {
                       
                    }
                }
            }

            var fileName =
                $"{Guid.NewGuid()}{extension}";

            var fullPath =
                Path.Combine(
                    uploadsFolder,
                    fileName);

            await using (
                var stream =
                    new FileStream(
                        fullPath,
                        FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath =
                $"/uploads/profile-images/{fileName}";

            employee.ProfileImagePath =
                relativePath;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Image uploaded successfully",

                imageUrl =
                    BuildAbsoluteUrl(relativePath)
            });
        }

        private string? BuildAbsoluteUrl(
            string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(
                    relativePath))
            {
                return null;
            }

            return
                $"{Request.Scheme}://" +
                $"{Request.Host}" +
                $"{relativePath}";
        }
    }
}