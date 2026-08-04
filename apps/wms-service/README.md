# WMS Service — Четка SaaS

WMS (Warehouse Management System) микросервис для SaaS-системы «Четка».

## 🏗️ Архитектура: Clean Architecture + CQRS

```
apps/wms-service/src/
├── WmsService.API/              → Presentation Layer (Controllers, Swagger, Middleware)
│   ├── Controllers/
│   │   └── HealthController.cs
│   ├── Program.cs
│   ├── appsettings.json
│   └── WmsService.API.csproj
│
├── WmsService.Application/      → Application Layer (CQRS: Commands, Queries, Handlers)
│   └── WmsService.Application.csproj
│
├── WmsService.Domain/           → Domain Layer (Entities, Value Objects, Domain Events)
│   └── WmsService.Domain.csproj
│
└── WmsService.Infrastructure/   → Infrastructure Layer (EF Core, RabbitMQ, Redis)
    └── WmsService.Infrastructure.csproj
```

## 🚀 Запуск (локально)

### Требования
- .NET SDK 8.0+
- PostgreSQL 16 (или через docker-compose)

### Шаги

```bash
# 1. Создать Solution файл
dotnet new sln -n WmsService -o .

# 2. Добавить проекты в solution
dotnet sln add src/WmsService.API/WmsService.API.csproj
dotnet sln add src/WmsService.Application/WmsService.Application.csproj
dotnet sln add src/WmsService.Domain/WmsService.Domain.csproj
dotnet sln add src/WmsService.Infrastructure/WmsService.Infrastructure.csproj

# 3. Восстановить зависимости
dotnet restore

# 4. Запустить в режиме разработки
dotnet run --project src/WmsService.API

# API: http://localhost:5000
# Swagger: http://localhost:5000/api/docs
# Health: http://localhost:5000/health
```

## 📋 Планируемые модули (Шаги 4+)

| Модуль | Описание |
|--------|----------|
| `Warehouses` | CRUD складов и зон |
| `StockItems` | Учёт товарных остатков |
| `StockMovements` | Приход / расход / перемещение |
| `Receiving` | Приёмка товара от поставщика |
| `Picking` | Сборка заказов |
| `Inventory` | Инвентаризация |

## 🔌 Зависимости (NuGet)

| Пакет | Версия | Назначение |
|-------|--------|------------|
| MediatR | 12.2.0 | CQRS |
| FluentValidation | 11.9.0 | Валидация команд |
| AutoMapper | 13.0.1 | DTO маппинг |
| EF Core + Npgsql | 8.0.x | ORM + PostgreSQL |
| RabbitMQ.Client | 6.8.1 | Message Bus |
| StackExchange.Redis | 2.7.27 | Кэширование |
| Serilog.AspNetCore | 8.0.0 | Структурированные логи |
