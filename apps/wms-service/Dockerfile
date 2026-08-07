# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/WmsService.Domain/WmsService.Domain.csproj src/WmsService.Domain/
COPY src/WmsService.Application/WmsService.Application.csproj src/WmsService.Application/
COPY src/WmsService.Infrastructure/WmsService.Infrastructure.csproj src/WmsService.Infrastructure/
COPY src/WmsService.API/WmsService.API.csproj src/WmsService.API/

RUN dotnet restore src/WmsService.API/WmsService.API.csproj

COPY . .

RUN dotnet build src/WmsService.API/WmsService.API.csproj -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish src/WmsService.API/WmsService.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "WmsService.API.dll"]
