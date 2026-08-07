# Migrations

To create the initial migration, run from the `apps/wms-service` directory:

```bash
dotnet ef migrations add InitialCreate --project src/WmsService.Infrastructure --startup-project src/WmsService.API --output-dir Persistence/Migrations
```

To apply migrations:

```bash
dotnet ef database update --project src/WmsService.Infrastructure --startup-project src/WmsService.API
```

Ensure the PostgreSQL container is running.
