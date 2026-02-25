using System;

namespace Yoga.Core.Entities
{
    public class Lesson
    {
        public int Id { get; set; }
        public int CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string VideoUrl { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty; // Text materials
        public int OrderIndex { get; set; } // Order of the lesson in the course
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}