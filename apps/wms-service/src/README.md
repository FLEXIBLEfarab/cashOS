# Четка WMS Service — Stage 5-9 Complete

## Архитектура
- Clean Architecture (Domain → Application → Infrastructure → API)
- CQRS (MediatR) + FluentValidation
- Repository Pattern + UnitOfWork
- Hangfire (фоновые задачи)
- SignalR (real-time уведомления)
- RabbitMQ (event publishing)
- Serilog (логирование)
- Swagger (документация)

## Установка

### 1. .NET CLI
```bash
cd WmsService.API
dotnet restore
dotnet ef migrations add InitialCreate --project ../WmsService.Infrastructure
dotnet ef database update --project ../WmsService.Infrastructure
dotnet run
```

### 2. Docker
```bash
docker-compose up --build
```

## Endpoints

| Endpoint | Method | Описание |
|----------|--------|----------|
| `/api/docs` | GET | Swagger UI |
| `/api/v1/stock` | GET | Остатки |
| `/api/v1/stock/receive` | POST | Приёмка |
| `/api/v1/stock/writeoff` | POST | Списание |
| `/api/v1/stock/move` | POST | Перемещение |
| `/api/v1/expirationchecks/logs` | GET | Логи сроков |
| `/api/v1/expirationchecks/run-check` | POST | Ручной запуск проверки |
| `/api/v1/analytics/dashboard` | GET | Дашборд |
| `/api/v1/analytics/sales` | GET | Продажи |
| `/api/v1/analytics/network` | GET | Сеть складов |
| `/api/v1/analytics/sales/export` | GET | Excel/PDF экспорт |
| `/hubs/wms` | WS | SignalR Hub |
| `/hangfire` | GET | Hangfire Dashboard |
| `/health` | GET | Health Checks |
