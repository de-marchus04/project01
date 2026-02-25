using System;

namespace Yoga.Core.Entities
{
    public class Article
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty; // HTML or Markdown content
        public string ImageUrl { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // "Health", "Meditation", etc.
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Author { get; set; } = string.Empty;
    }
}
