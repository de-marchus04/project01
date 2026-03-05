using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Yoga.Infrastructure.Data;
using Yoga.Core.Entities;

namespace Yoga.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly YogaDbContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(YogaDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/users/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var username = request.Username?.Trim() ?? string.Empty;
            var password = request.Password ?? string.Empty;

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                return BadRequest(new { error = "Username and password are required." });

            if (username.Length < 3 || username.Length > 50)
                return BadRequest(new { error = "Username must be between 3 and 50 characters." });

            if (password.Length < 6)
                return BadRequest(new { error = "Password must be at least 6 characters." });

            if (await _context.Users.AnyAsync(u => u.Username == username))
                return BadRequest(new { error = "User already exists." });

            var role = IsAdminUsername(username) ? "ADMIN" : "USER";
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 10);

            var user = new User
            {
                Username = username,
                PasswordHash = passwordHash,
                FullName = request.FullName ?? string.Empty,
                Email = request.Email ?? string.Empty
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                message = "User created successfully",
                user = new { username = user.Username, role }
            });
        }

        // POST: api/users/create-admin
        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest request)
        {
            var adminCreationKey = _configuration["Security:AdminCreationKey"];
            if (string.IsNullOrWhiteSpace(adminCreationKey))
            {
                return StatusCode(500, "Admin creation key is not configured.");
            }

            if (!string.Equals(request.AdminCreationKey, adminCreationKey, StringComparison.Ordinal))
                return Unauthorized("Invalid admin creation key");

            var username = request.Username?.Trim() ?? string.Empty;
            var password = request.Password ?? string.Empty;
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                return BadRequest("Username and Password are required");

            if (!IsAdminUsername(username))
                return BadRequest("Username is not listed in Security:AdminUsernames");

            if (await _context.Users.AnyAsync(u => u.Username == username))
                return BadRequest("User already exists");

            var admin = new User
            {
                Username = username,
                PasswordHash = HashPassword(password),
                FullName = request.FullName,
                Email = request.Email
            };

            _context.Users.Add(admin);
            await _context.SaveChangesAsync();
            return Ok(new { user = MapUserResponse(admin) });
        }

        // POST: api/users/purge-admins
        [HttpPost("purge-admins")]
        public async Task<IActionResult> PurgeAdmins([FromBody] PurgeAdminsRequest request)
        {
            var adminCreationKey = _configuration["Security:AdminCreationKey"];
            if (string.IsNullOrWhiteSpace(adminCreationKey))
                return StatusCode(500, "Admin creation key is not configured.");

            if (!string.Equals(request.AdminCreationKey, adminCreationKey, StringComparison.Ordinal))
                return Unauthorized("Invalid admin creation key");

            var adminUsernames = _configuration
                .GetSection("Security:AdminUsernames")
                .Get<string[]>() ?? Array.Empty<string>();

            var adminsToDelete = await _context.Users
                .Where(u => adminUsernames.Contains(u.Username))
                .ToListAsync();

            if (adminsToDelete.Count == 0)
                return Ok(new { DeletedAdmins = 0, DeletedBookings = 0 });

            var usernames = adminsToDelete.Select(a => a.Username).ToList();
            var relatedOrders = await _context.Orders
                .Where(o => usernames.Contains(o.UserName))
                .ToListAsync();

            _context.Orders.RemoveRange(relatedOrders);
            _context.Users.RemoveRange(adminsToDelete);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                DeletedAdmins = adminsToDelete.Count,
                DeletedBookings = relatedOrders.Count,
                DeletedUsernames = usernames
            });
        }

        // POST: api/users/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var username = request.Username?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(request.Password))
                return Unauthorized("Invalid credentials");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null) return Unauthorized("Invalid credentials");

            if (!VerifyPassword(request.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            if (!IsPasswordHashed(user.PasswordHash))
            {
                user.PasswordHash = HashPassword(request.Password);
                await _context.SaveChangesAsync();
            }

            var userView = MapUserResponse(user);
            var token = GenerateJwtToken(userView);

            return Ok(new
            {
                token,
                expiresAt = DateTime.UtcNow.AddHours(12),
                user = userView
            });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (string.IsNullOrWhiteSpace(username)) return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null) return NotFound();

            return Ok(MapUserResponse(user));
        }

        private UserResponseDto MapUserResponse(User user)
        {
            var role = IsAdminUsername(user.Username)
                ? "Admin"
                : "User";

            return new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                FullName = user.FullName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                DateOfBirth = user.DateOfBirth,
                Role = role
            };
        }

        private string GenerateJwtToken(UserResponseDto user)
        {
            var jwtKey = _configuration["Security:JwtKey"];
            if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
                throw new InvalidOperationException("Security:JwtKey must be configured and at least 32 chars.");

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("uid", user.Id.ToString())
            };

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
            var expires = DateTime.UtcNow.AddHours(12);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: expires,
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static bool IsPasswordHashed(string value)
        {
            return value.StartsWith("pbkdf2$", StringComparison.OrdinalIgnoreCase);
        }

        private static string HashPassword(string password)
        {
            var salt = RandomNumberGenerator.GetBytes(16);
            const int iterations = 100_000;
            var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, 32);

            return $"pbkdf2${iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
        }

        private static bool VerifyPassword(string inputPassword, string storedPasswordHash)
        {
            if (string.IsNullOrWhiteSpace(storedPasswordHash)) return false;

            // BCrypt hashes start with $2a$, $2b$, or $2y$
            if (storedPasswordHash.StartsWith("$2"))
                return BCrypt.Net.BCrypt.Verify(inputPassword, storedPasswordHash);

            if (!IsPasswordHashed(storedPasswordHash))
                return string.Equals(inputPassword, storedPasswordHash, StringComparison.Ordinal);

            // PBKDF2 legacy format
            var parts = storedPasswordHash.Split('$');
            if (parts.Length != 4) return false;

            if (!int.TryParse(parts[1], out var iterations)) return false;

            byte[] salt;
            byte[] storedHash;
            try
            {
                salt = Convert.FromBase64String(parts[2]);
                storedHash = Convert.FromBase64String(parts[3]);
            }
            catch
            {
                return false;
            }

            var inputHash = Rfc2898DeriveBytes.Pbkdf2(inputPassword, salt, iterations, HashAlgorithmName.SHA256, storedHash.Length);
            return CryptographicOperations.FixedTimeEquals(inputHash, storedHash);
        }

        private bool IsAdminUsername(string username)
        {
            if (string.IsNullOrWhiteSpace(username)) return false;

            var configuredAdmins = _configuration
                .GetSection("Security:AdminUsernames")
                .Get<string[]>() ?? Array.Empty<string>();

            return configuredAdmins.Contains(username, StringComparer.OrdinalIgnoreCase);
        }
    }

    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Email { get; set; }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class CreateAdminRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string AdminCreationKey { get; set; } = string.Empty;
    }

    public class PurgeAdminsRequest
    {
        public string AdminCreationKey { get; set; } = string.Empty;
    }

    public class UserResponseDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public DateTime? DateOfBirth { get; set; }
        public string Role { get; set; } = "User";
    }
}