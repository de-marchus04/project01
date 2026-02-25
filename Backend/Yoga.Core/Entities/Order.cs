using System;

namespace Yoga.Core.Entities
{
    public class Order
    {
        public int Id { get; set; }

        public string UserName { get; set; } = string.Empty; 
        public string ProductTitle { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Completed";

        // Поля совместимости (важны для миграций)
        public int? TourId { get; set; }
        public int? CourseId { get; set; }
        public int? ConsultationId { get; set; }
        public string ProductType { get; set; } = "General"; 
        
        // Для EntityFramework
        public string CustomerName { get; set; } = "";
        public string CustomerEmail { get; set; } = "";
        public string CustomerPhone { get; set; } = "";
        
        // New features
        public bool IsGift { get; set; } = false;
        public string GiftMessage { get; set; } = "";
    }
}