# Cleanup old conflicting files and folders
$src = "C:\Users\User\Desktop\cashOS-main\apps\wms-service\src\WmsService.Application"

# Delete old Stock folder (will be replaced with Stocks)
if (Test-Path "$src\Features\Stock") {
    Remove-Item "$src\Features\Stock" -Recurse -Force
    Write-Host "Deleted old Features/Stock/"
}

# Delete old Handlers
if (Test-Path "$src\Handlers") {
    Remove-Item "$src\Handlers" -Recurse -Force
    Write-Host "Deleted Handlers/"
}

# Delete old IWmsDbContext
if (Test-Path "$src\Common\Interfaces\IWmsDbContext.cs") {
    Remove-Item "$src\Common\Interfaces\IWmsDbContext.cs" -Force
    Write-Host "Deleted IWmsDbContext.cs"
}

# Delete old LoggingBehavior (will be replaced)
if (Test-Path "$src\Common\Behaviors\LoggingBehavior.cs") {
    Remove-Item "$src\Common\Behaviors\LoggingBehavior.cs" -Force
    Write-Host "Deleted old LoggingBehavior.cs"
}

Write-Host "`nDone. Now run: dotnet build"
