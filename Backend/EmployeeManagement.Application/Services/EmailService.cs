using EmployeeManagement.Application.Helper;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Mail;

namespace EmployeeManagement.Application.Services
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;

        public EmailService(
            IOptions<EmailSettings> settings)
        {
            _settings = settings.Value;
        }

        public async Task SendEmailAsync(
     string toEmail,
     string subject,
     string body)
        {
            using var smtp = new SmtpClient(_settings.SmtpServer)
            {
                Port = _settings.Port,
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(
                    _settings.Username,
                    _settings.Password)
            };

            using var mail = new MailMessage
            {
                From = new MailAddress(_settings.From),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            mail.To.Add(toEmail);

            await smtp.SendMailAsync(mail);
        }
    }
}