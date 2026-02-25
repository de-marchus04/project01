using System;

namespace Yoga.Core.Entities
{
    // Класс Tour - это чертеж того, как выглядит "Тур" в нашей системе.
    // Мы описываем "Чистую Суть" тура, без баз данных и HTML.
    public class Tour
    {
        // Уникальный ID (паспорт тура). База данных сама его присвоит.
        public int Id { get; set; }

        // Название (например, "Магия Бали"). 
        // string = строка текста.
        public string Title { get; set; } = string.Empty;

        // Описание программы.
        public string Description { get; set; } = string.Empty;

        // Цена. decimal - специальный тип для денег (точный, в отличие от double).
        public decimal Price { get; set; }

        // Ссылка на картинку (URL).
        public string ImageUrl { get; set; } = string.Empty;

        // Дата начала. DateTime - тип для времени.
        public DateTime StartDate { get; set; }

        // Локация (Город/Страна).
        public string Location { get; set; } = string.Empty;
        
        // Сложность тура (1 - Легко, 5 - Хардкор).
        // Это мое "домашнее задание" тебе: подумай, как мы будем это использовать?
        public int Difficulty { get; set; }

        // Признак: Хит продаж? (true/false)
        public bool IsHit { get; set; }

        // 🆕 НОВОЕ ПОЛЕ: Количество свободных мест
        public int SpotsAvailable { get; set; }
    }
}