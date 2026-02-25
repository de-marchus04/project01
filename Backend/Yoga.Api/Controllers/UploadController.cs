using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System;
using System.IO;
using System.Threading.Tasks;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Webp;

namespace Yoga.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _environment;

        public UploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            // 1. Создаем папку uploads, если нет
            string uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 2. Генерируем уникальное имя файла (с расширением .webp)
            string uniqueFileName = Guid.NewGuid().ToString() + ".webp";
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 3. Сжимаем и сохраняем в WebP
            try
            {
                using var image = await Image.LoadAsync(file.OpenReadStream());
                
                // Изменяем размер, если картинка больше 1920px по ширине или высоте
                image.Mutate(x => x.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(1920, 1920)
                }));

                // Сохраняем с качеством 80%
                await image.SaveAsWebpAsync(filePath, new WebpEncoder { Quality = 80 });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error processing image: {ex.Message}");
            }

            // 4. Возвращаем URL
            string fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";

            return Ok(new { url = fileUrl });
        }
    }
}
