# start-postgres.ps1 - Start the portable PostgreSQL instance
$toolsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$extractDir = Join-Path $toolsDir "pgsql"
$dataDir = Join-Path $toolsDir "data"
$logFile = Join-Path $toolsDir "postgres.log"
$pgCtl = Join-Path $extractDir "pgsql\bin\pg_ctl.exe"

if (-not (Test-Path $dataDir)) {
    Write-Host "Data directory not found. Please run setup-postgres.ps1 first."
    exit 1
}

Write-Host "Starting PostgreSQL..."
& $pgCtl -D $dataDir -l $logFile -o "-p 5432" start
Write-Host "PostgreSQL started."
