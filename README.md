# 🧘‍♀️ YogaPlatform - Enterprise Edition

Современная платформа для онлайн-школы йоги, бронирования туров и покупки курсов. Проект спроектирован с использованием **Clean Architecture** на бэкенде и **Feature-Sliced Design (FSD)** на фронтенде, готов к высоким нагрузкам и масштабированию.

---

## 🚀 Технологический стек

### Backend (.NET 8)
- **Архитектура:** Clean Architecture, CQRS (MediatR), Domain-Driven Design (DDD).
- **База данных:** PostgreSQL (Entity Framework Core).
- **Кэширование:** Redis (StackExchange.Redis).
- **Валидация:** FluentValidation.
- **Безопасность:** JWT Authentication, Rate Limiting.
- **Observability:** Serilog (структурированное логирование), OpenTelemetry (метрики и трейсы).
- **Обработка ошибок:** Global Exception Handler (RFC 7807 Problem Details).
- **Тестирование:** xUnit, FluentAssertions, Testcontainers (интеграционные тесты с реальной БД), NetArchTest (архитектурные тесты).

### Frontend (Next.js 16)
- **Фреймворк:** Next.js (App Router), React 19.
- **Язык:** TypeScript (строгая типизация).
- **Архитектура:** Feature-Sliced Design (FSD).
- **Стилизация:** Tailwind CSS v4.
- **UI Библиотека:** shadcn/ui (Radix UI).
- **State Management:** Zustand (с поддержкой persist).
- **Работа с API:** Автогенерация клиента через `openapi-typescript-codegen`.
- **Формы:** React Hook Form + Zod (валидация).

### DevOps & Инфраструктура
- **Контейнеризация:** Docker, Docker Compose.
- **API Gateway:** Traefik (Reverse Proxy, Load Balancing, SSL).
- **CI/CD:** GitHub Actions (автоматическая сборка, линтинг, тесты).
- **DX (Developer Experience):** Husky (pre-commit hooks), lint-staged, EditorConfig.

---

## 🛠 Быстрый старт (Локальная разработка)

### Требования
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) или Docker Engine + Docker Compose.
- [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0).
- [Node.js 20+](https://nodejs.org/) и npm.

### 1. Запуск инфраструктуры (База данных, Redis, Traefik)
Перейдите в папку `Infra` и запустите контейнеры в фоновом режиме:
```bash
cd Infra
docker-compose up -d
```
*Traefik Dashboard будет доступен по адресу: http://localhost:8080*

### 2. Запуск Backend (API)
Перейдите в папку `Backend` и запустите проект:
```bash
cd Backend/Yoga.Api
dotnet run
```
*Swagger UI будет доступен по адресу: http://localhost:5253/swagger*

### 3. Запуск Frontend (Next.js)
Перейдите в папку `Frontend`, установите зависимости и запустите сервер разработки:
```bash
cd Frontend
npm install
npm run dev
```
*Приложение будет доступно по адресу: http://localhost:3000*

---

## 🧪 Тестирование

### Backend
В проекте настроены интеграционные тесты с использованием **Testcontainers** (автоматически поднимает изолированную БД в Docker) и архитектурные тесты.
```bash
cd Backend
dotnet test Yoga.sln
```

### Frontend
Настроены E2E тесты с использованием Playwright.
```bash
cd Frontend
npm run test
```

---

## 🏗 Структура проекта

```text
YogaPlatform/
├── Backend/                  # .NET 8 Clean Architecture
│   ├── Yoga.Domain/          # Сущности, интерфейсы репозиториев, исключения
│   ├── Yoga.Application/     # Use Cases (CQRS), DTOs, валидация
│   ├── Yoga.Infrastructure/  # EF Core, JWT, интеграции
│   ├── Yoga.Api/             # Controllers, Middleware, DI
│   └── tests/                # Unit, Integration (Testcontainers) и Architecture тесты
├── Frontend/                 # Next.js (FSD)
│   ├── src/
│   │   ├── app/              # Роутинг (App Router), глобальные стили
│   │   ├── widgets/          # Самостоятельные блоки (например, CartWidget)
│   │   ├── features/         # Пользовательские сценарии (например, AddToCartButton, LoginForm)
│   │   ├── entities/         # Бизнес-сущности (например, модель корзины Zustand)
│   │   └── shared/           # UI-кит (shadcn), сгенерированный API-клиент, утилиты
│   └── package.json
└── Infra/                    # Docker Compose, Traefik, Prometheus, Grafana
```

---

## 🔄 Обновление API Клиента на Frontend

Если вы изменили контроллеры или DTO на бэкенде, вам нужно обновить TypeScript-клиент на фронтенде.
Убедитесь, что Backend запущен, затем выполните:
```bash
cd Frontend
npm run generate-api
```
Это автоматически скачает актуальный `swagger.json` и перегенерирует сервисы и модели в папке `src/shared/api`.

---

## 🛡 Качество кода (CI/CD)

Проект защищен автоматическими проверками:
1. **Husky & lint-staged:** При каждом коммите (`git commit`) автоматически запускается ESLint для измененных файлов на фронтенде.
2. **GitHub Actions:** При пуше в ветку `main` или создании Pull Request запускается пайплайн (`.github/workflows/ci.yml`), который:
   - Собирает Backend и прогоняет все тесты (включая архитектурные).
   - Собирает Frontend и проверяет типизацию.

---

## 📝 Лицензия
MIT
