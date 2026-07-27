using EmployeeManagement.Application.DTOs;
using EmployeeManagement.Application.Services;
using EmployeeManagement.Core.Entities;
using EmployeeManagement.Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace EmployeeManagement.Api.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveController : ControllerBase
    {
        private readonly ILeaveRepository _leaveRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IEmailService _emailService;

        public LeaveController(
            ILeaveRepository leaveRepository,
            IEmployeeRepository employeeRepository,
            IEmailService emailService)
        {
            _leaveRepository = leaveRepository;
            _employeeRepository = employeeRepository;
            _emailService = emailService;
        }


        // ============================================
        // GET CURRENT LOGGED-IN EMPLOYEE ID
        // ============================================

        private int? GetCurrentEmployeeId()
        {
            var idValue =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

            if (
                !int.TryParse(
                    idValue,
                    out var employeeId
                )
            )
            {
                return null;
            }

            return employeeId;
        }


        // ============================================
        // GET ALL LEAVES
        // ADMIN / HR ONLY
        // ============================================

        [Authorize(Roles = "Admin,HR")]
        [HttpGet]
        public async Task<IActionResult> GetAllLeaves()
        {
            var leaves =
                await _leaveRepository
                    .GetAllAsync();

            var result =
                leaves.Select(
                    x => MapToResponseDto(x)
                );

            return Ok(result);
        }


        // ============================================
        // GET LEAVE BY ID
        // ADMIN / HR ONLY
        // ============================================

        [Authorize(Roles = "Admin,HR")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLeaveById(
            int id
        )
        {
            var leave =
                await _leaveRepository
                    .GetByIdAsync(id);

            if (leave == null)
            {
                return NotFound(new
                {
                    success = false,

                    message =
                        "Leave request not found"
                });
            }

            return Ok(
                MapToResponseDto(leave)
            );
        }


        // ============================================
        // GET LOGGED-IN EMPLOYEE LEAVES
        // ============================================

        [HttpGet("my-leaves")]
        public async Task<IActionResult> GetMyLeaves()
        {
            var employeeId =
                GetCurrentEmployeeId();

            if (employeeId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid employee token"
                });
            }

            var leaves =
                await _leaveRepository
                    .GetMyLeavesAsync(
                        employeeId.Value
                    );

            var result =
                leaves.Select(
                    x => MapToResponseDto(x)
                );

            return Ok(result);
        }


        // ============================================
        // APPLY LEAVE
        // ============================================

        [HttpPost]
        public async Task<IActionResult> ApplyLeave(
            [FromForm] ApplyLeaveDto dto,
            IFormFile? medicalCertificate)
        {
            // Validate request model

            if (!ModelState.IsValid)
            {
                return BadRequest(
                    ModelState
                );
            }


            // Get logged-in employee ID

            var employeeId =
                GetCurrentEmployeeId();


            if (employeeId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid employee token"
                });
            }


            // Get employee details from database

            var employee =
                await _employeeRepository
                    .GetByIdAsync(
                        employeeId.Value
                    );


            if (employee == null)
            {
                return NotFound(new
                {
                    message =
                        "Employee not found"
                });
            }


            // Check employee account

            if (!employee.IsActive)
            {
                return BadRequest(new
                {
                    message =
                        "Employee account is inactive"
                });
            }


            // Validate dates

            if (
                dto.ToDate.Date <
                dto.FromDate.Date
            )
            {
                return BadRequest(new
                {
                    message =
                        "To Date cannot be before From Date"
                });
            }


            // Calculate number of leave days

            var noOfDays =

                (
                    dto.ToDate.Date -
                    dto.FromDate.Date
                ).Days + 1;


            // ========================================
            // MEDICAL CERTIFICATE UPLOAD
            // ========================================

            string? medicalCertificatePath = null;


            // Medical certificate required
            // only for Sick Leave

            if (
                dto.LeaveType.Equals(
                    "Sick Leave",
                    StringComparison.OrdinalIgnoreCase
                )
            )
            {
                // Check file selected

                if (
                    medicalCertificate == null ||
                    medicalCertificate.Length == 0
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Medical certificate is required for Sick Leave"
                    });
                }


                // Maximum file size = 5 MB

                const long maxFileSize =
                    5 * 1024 * 1024;


                if (
                    medicalCertificate.Length >
                    maxFileSize
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Medical certificate size cannot exceed 5 MB"
                    });
                }


                // Allowed file extensions

                var allowedExtensions =
                    new[]
                    {
                        ".pdf",
                        ".jpg",
                        ".jpeg",
                        ".png"
                    };


                var extension =
                    Path.GetExtension(
                        medicalCertificate.FileName
                    ).ToLowerInvariant();


                if (
                    !allowedExtensions.Contains(
                        extension
                    )
                )
                {
                    return BadRequest(new
                    {
                        message =
                            "Only PDF, JPG, JPEG and PNG files are allowed"
                    });
                }


                // Create upload folder

                var uploadFolder =
                    Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot",
                        "uploads",
                        "medical-certificates"
                    );


                if (
                    !Directory.Exists(
                        uploadFolder
                    )
                )
                {
                    Directory.CreateDirectory(
                        uploadFolder
                    );
                }


                // Generate unique file name

                var fileName =
                    $"{Guid.NewGuid()}{extension}";


                // Create full physical file path

                var filePath =
                    Path.Combine(
                        uploadFolder,
                        fileName
                    );


                // Save file into folder

                await using (
                    var stream =
                        new FileStream(
                            filePath,
                            FileMode.Create
                        )
                )
                {
                    await medicalCertificate
                        .CopyToAsync(stream);
                }


                // Save relative file path
                // into database

                medicalCertificatePath =
                    $"/uploads/medical-certificates/{fileName}";
            }


            // ========================================
            // CREATE LEAVE REQUEST
            // ========================================

            var leave =
                new LeaveRequest
                {
                    EmployeeId =
                        employeeId.Value,

                    LeaveType =
                        dto.LeaveType.Trim(),

                    FromDate =
                        dto.FromDate.Date,

                    ToDate =
                        dto.ToDate.Date,

                    NoOfDays =
                        noOfDays,

                    Reason =
                        dto.Reason.Trim(),

                    MedicalCertificatePath =
                        medicalCertificatePath,

                    Status =
                        "Pending",

                    AppliedDate =
                        DateTime.UtcNow
                };


            // ========================================
            // SAVE LEAVE INTO DATABASE
            // ========================================

            await _leaveRepository
                .AddAsync(leave);


            // ========================================
            // SEND CONFIRMATION EMAIL
            // ========================================

            try
            {
                var subject =
                    "Leave Request Submitted Successfully";


                var emailBody = $@"

                    <div style='
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: auto;
                        padding: 20px;
                        border: 1px solid #dddddd;
                        border-radius: 8px;
                    '>

                        <h2 style='color:#4739B5;'>
                            Leave Request Submitted
                        </h2>


                        <p>
                            Hi <strong>
                            {employee.Name}
                            </strong>,
                        </p>


                        <p>
                            Your leave request has been
                            submitted successfully.
                        </p>


                        <table style='
                            width:100%;
                            border-collapse:collapse;
                            margin-top:20px;
                        '>

                            <tr>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    <strong>
                                        Leave Type
                                    </strong>
                                </td>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    {leave.LeaveType}
                                </td>

                            </tr>


                            <tr>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    <strong>
                                        From Date
                                    </strong>
                                </td>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    {leave.FromDate:dd-MM-yyyy}
                                </td>

                            </tr>


                            <tr>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    <strong>
                                        To Date
                                    </strong>
                                </td>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    {leave.ToDate:dd-MM-yyyy}
                                </td>

                            </tr>


                            <tr>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    <strong>
                                        Number of Days
                                    </strong>
                                </td>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    {leave.NoOfDays}
                                </td>

                            </tr>


                            <tr>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    <strong>
                                        Reason
                                    </strong>
                                </td>

                                <td style='
                                    padding:10px;
                                    border-bottom:1px solid #dddddd;
                                '>
                                    {leave.Reason}
                                </td>

                            </tr>


                            <tr>

                                <td style='padding:10px;'>
                                    <strong>
                                        Status
                                    </strong>
                                </td>

                                <td style='
                                    padding:10px;
                                    color:#F5A623;
                                    font-weight:bold;
                                '>
                                    Pending
                                </td>

                            </tr>

                        </table>


                        <p style='margin-top:25px;'>

                            You will be notified once your
                            leave request is approved or rejected.

                        </p>


                        <p>
                            Regards,<br>

                            <strong>
                                Employee Management System
                            </strong>
                        </p>

                    </div>
                ";


                await _emailService
                    .SendEmailAsync(
                        employee.Email,
                        subject,
                        emailBody
                    );
            }
            catch (Exception ex)
            {
                // Leave is already saved.
                // Email failure should not cancel
                // the leave application.

                Console.WriteLine(
                    $"Leave email error: {ex.Message}"
                );
            }


            // ========================================
            // SUCCESS RESPONSE
            // ========================================

            return Ok(new
            {
                success = true,

                message =
                    "Leave applied successfully"
            });
        }


        // ============================================
        // APPROVE LEAVE
        // ============================================

        [Authorize(Roles = "Admin,HR")]
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveLeave(
            int id,
            [FromBody] ApproveLeaveDto dto
        )
        {
            var approverId =
                GetCurrentEmployeeId();


            if (approverId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid employee token"
                });
            }


            var leave =
                await _leaveRepository
                    .GetByIdAsync(id);


            if (leave == null)
            {
                return NotFound(new
                {
                    success = false,

                    message =
                        "Leave request not found"
                });
            }


            if (leave.Status != "Pending")
            {
                return BadRequest(new
                {
                    success = false,

                    message =
                        $"Leave request is already {leave.Status}"
                });
            }


            leave.Status =
                "Approved";


            leave.ApprovedBy =
                approverId.Value;


            leave.ApprovedDate =
                DateTime.UtcNow;


            leave.Remarks =
                dto.Remarks?.Trim();


            await _leaveRepository
                .UpdateAsync(leave);


            return Ok(new
            {
                success = true,

                message =
                    "Leave approved successfully"
            });
        }


        // ============================================
        // REJECT LEAVE
        // ============================================

        [Authorize(Roles = "Admin,HR")]
        [HttpPut("reject/{id}")]
        public async Task<IActionResult> RejectLeave(
            int id,
            [FromBody] ApproveLeaveDto dto
        )
        {
            var approverId =
                GetCurrentEmployeeId();


            if (approverId == null)
            {
                return Unauthorized(new
                {
                    message =
                        "Invalid employee token"
                });
            }


            var leave =
                await _leaveRepository
                    .GetByIdAsync(id);


            if (leave == null)
            {
                return NotFound(new
                {
                    success = false,

                    message =
                        "Leave request not found"
                });
            }


            if (leave.Status != "Pending")
            {
                return BadRequest(new
                {
                    success = false,

                    message =
                        $"Leave request is already {leave.Status}"
                });
            }


            leave.Status =
                "Rejected";


            leave.ApprovedBy =
                approverId.Value;


            leave.ApprovedDate =
                DateTime.UtcNow;


            leave.Remarks =
                dto.Remarks?.Trim();


            await _leaveRepository
                .UpdateAsync(leave);


            return Ok(new
            {
                success = true,

                message =
                    "Leave rejected successfully"
            });
        }


        // ============================================
        // MAP ENTITY TO RESPONSE DTO
        // ============================================

        private static LeaveResponseDto
            MapToResponseDto(
                LeaveRequest leave
            )
        {
            return new LeaveResponseDto
            {
                LeaveId =
                    leave.LeaveId,

                EmployeeId =
                    leave.EmployeeId,

                EmployeeName =
                    leave.Employee?.Name ??
                    string.Empty,

                LeaveType =
                    leave.LeaveType,

                FromDate =
                    leave.FromDate,

                ToDate =
                    leave.ToDate,

                NoOfDays =
                    leave.NoOfDays,

                Reason =
                    leave.Reason,
                MedicalCertificatePath =
                    leave.MedicalCertificatePath,

                Status =
                    leave.Status,

                AppliedDate =
                    leave.AppliedDate,

                ApprovedDate =
                    leave.ApprovedDate,

                ApprovedBy =
                    leave.ApprovedBy,

                Remarks =
                    leave.Remarks
            };
        }
    }
}