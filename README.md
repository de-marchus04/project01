# YogaPlatform

Современная онлайн-платформа для школы йоги. Включает каталоги курсов, консультаций и туров, блог (статьи, видео, подкасты, рецепты), систему отзывов, вишлист, промокоды, поиск, профиль пользователя, чат поддержки и административную панель.

---

## Технологический стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 16 (App Router), React 19, TypeScript |
| Архитектура | Feature-Sliced Design (FSD) |
| Стилизация | Bootstrap 5.3.8 + Bootstrap Icons + custom CSS |
| База данных | PostgreSQL (Neon) через Prisma ORM v5.22 |
| Аутентификация | NextAuth v5 (beta) — Google OAuth, GitHub OAuth, Credentials |
| Email | Resend |
| Загрузка изображений | Cloudinary |
| Деплой | Vercel (Frankfurt) |
| Тестирование | Jest |
| Валидация | Zod |
| i18n | 3 языка: RU / UA / EN (кастомный контекст) |

---

## Структура проекта

```
YogaPlatform/
├── prisma/
│   ├── schema.prisma         # Схема базы данных
│   └── seed.ts               # Начальные данные
├── src/
│   ├── app/                  # Роутинг Next.js App Router
│   │   ├── api/              # Route Handlers (auth, admin, seed)
│   │   ├── admin/            # Административная панель
│   │   ├── blog/             # Блог (статьи, видео, подкасты, рецепты)
│   │   ├── courses/          # Каталог курсов
│   │   ├── consultations/    # Каталог консультаций
│   │   ├── tours/            # Каталог туров
│   │   ├── profile/          # Личный кабинет
│   │   ├── wishlist/         # Вишлист
│   │   ├── search/           # Глобальный поиск
│   │   └── ...               # Прочие страницы (about, faq, contact, terms, privacy)
│   ├── widgets/              # Самостоятельные UI-блоки
│   │   ├── header/           # Навигация сайта
│   │   ├── footer/           # Подвал сайта
│   │   ├── home/             # Секции главной страницы
│   │   ├── support/          # Виджет чата поддержки
│   │   └── lockout/          # Таймер блокировки входа
│   ├── entities/             # Бизнес-сущности (типы и карточки)
│   │   ├── blog/             # ArticleCard, VideoCard, PodcastCard, RecipeCard
│   │   ├── course/           # CourseCard
│   │   ├── consultation/     # Типы консультаций
│   │   └── tour/             # Типы туров
│   ├── shared/               # Переиспользуемый код
│   │   ├── api/              # Server Actions и API-функции
│   │   ├── i18n/             # Языковой контекст и словари (ru/uk/en)
│   │   ├── ui/               # Общие UI-компоненты (Modal, Pagination, BuyButton, ...)
│   │   ├── lib/              # Утилиты (prisma-клиент, formatPrice, rateLimit, env)
│   │   ├── hooks/            # Кастомные хуки
│   │   └── config/           # Конфигурация навигации
│   └── __tests__/            # Jest-тесты
├── auth.ts                   # Конфигурация NextAuth
├── middleware.ts             # Edge-middleware (защита роутов)
├── next.config.ts
├── jest.config.ts
└── package.json
```

---

## Быстрый старт

### Требования

- Node.js 20+
- PostgreSQL 15+ (либо аккаунт на [Neon](https://neon.tech))
- Аккаунты для внешних сервисов: Google OAuth, GitHub OAuth, Cloudinary, Resend

### 1. Установка зависимостей

```bash
npm install
```

### 2. Переменные окружения

Скопируйте пример и заполните значения:

```bash
cp .env.example .env
```

Обязательные переменные описаны в разделе [Переменные окружения](#переменные-окружения).

### 3. Миграция базы данных

```bash
npx prisma migrate dev
```

### 4. Заполнение начальными данными (seed)

```bash
npm run seed
```

### 5. Запуск сервера разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

---

## Переменные окружения

Все переменные перечислены в `.env.example`. Ниже описание каждой:

```env
# База данных (PostgreSQL / Neon)
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# NextAuth
AUTH_SECRET=""          # Генерация: openssl rand -base64 32
AUTH_URL=""             # Публичный URL приложения (например, https://yourdomain.com)
AUTH_TRUST_HOST=true

# OAuth — Google (console.cloud.google.com)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# OAuth — GitHub (github.com/settings/developers)
GITHUB_ID=
GITHUB_SECRET=

# Cloudinary (загрузка изображений)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Resend — resend.com)
RESEND_API_KEY=
EMAIL_FROM="YOGA.LIFE <noreply@yourdomain.com>"

# Пароль администратора для seed
ADMIN_DEFAULT_PASSWORD=

# Rate Limiting (опционально — Upstash Redis)
# Без этих переменных используется in-memory хранилище,
# которое сбрасывается при холодном старте Vercel.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## Деплой на Vercel

Проект настроен для деплоя на Vercel (Frankfurt, `fra1`).

1. Подключите репозиторий в [Vercel Dashboard](https://vercel.com/dashboard).
2. Добавьте все переменные окружения из `.env.example` в настройках проекта.
3. Vercel автоматически выполнит `npm run build` (включает `prisma generate && next build`).

Конфигурация деплоя находится в `vercel.json`.

---

## Тестирование

```bash
npm test
```

Тесты написаны на Jest и находятся в `src/__tests__/`.

---

## CI/CD

GitHub Actions запускаются при пуше в `main` и при открытии Pull Request:

- `lint` — проверка кода (`npm run lint`)
- `test` — запуск тестов (`npm test`)
- `build` — сборка проекта с PostgreSQL-сервисом (`npm run build`)

Конфигурация: `.github/workflows/ci.yml`

---

## Лицензия

Проприетарный продукт. Исходный код, дизайн-система и брендовые материалы не предназначены для свободного переиспользования. Любое распространение или лицензирование требует отдельного письменного соглашения.
