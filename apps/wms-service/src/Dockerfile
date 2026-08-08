FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["WmsService.API/WmsService.API.csproj", "WmsService.API/"]
COPY ["WmsService.Application/WmsService.Application.csproj", "WmsService.Application/"]
COPY ["WmsService.Infrastructure/WmsService.Infrastructure.csproj", "WmsService.Infrastructure/"]
COPY ["WmsService.Domain/WmsService.Domain.csproj", "WmsService.Domain/"]
RUN dotnet restore "WmsService.API/WmsService.API.csproj"
COPY . .
WORKDIR "/src/WmsService.API"
RUN dotnet build "WmsService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "WmsService.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WmsService.API.dll"]
