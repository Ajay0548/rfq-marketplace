# setup-postgres.ps1 - Extract and initialize portable PostgreSQL 16
$toolsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$zipPath = Join-Path $toolsDir "pgsql.zip"
$extractDir = Join-Path $toolsDir "pgsql"
$dataDir = Join-Path $toolsDir "data"
$logFile = Join-Path $toolsDir "postgres.log"

Write-Host "=== Setting up Portable PostgreSQL ==="

if (-not (Test-Path $extractDir)) {
    if (-not (Test-Path $zipPath)) {
        Write-Host "Downloading PostgreSQL binaries..."
        curl.exe -L -o $zipPath "https://get.enterprisedb.com/postgresql/postgresql-16.2-1-windows-x64-binaries.zip"
    }
    Write-Host "Extracting PostgreSQL binaries (this may take a moment)..."
    Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
}

$pgBin = Join-Path $extractDir "pgsql\bin"
$initDb = Join-Path $pgBin "initdb.exe"
$pgCtl = Join-Path $pgBin "pg_ctl.exe"
$createdb = Join-Path $pgBin "createdb.exe"
$psql = Join-Path $pgBin "psql.exe"

# Initialize cluster if data dir doesn't exist
if (-not (Test-Path $dataDir)) {
    Write-Host "Initializing database cluster in $dataDir..."
    & $initDb -D $dataDir -U postgres -A trust -E UTF8
}

# Start PostgreSQL server
Write-Host "Starting PostgreSQL server on port 5432..."
& $pgCtl -D $dataDir -l $logFile -o "-p 5432" start

Start-Sleep -Seconds 3

# Create rfq_marketplace database if not exists
Write-Host "Creating database 'rfq_marketplace' if needed..."
& $createdb -U postgres -h localhost -p 5432 rfq_marketplace 2>$null

Write-Host "PostgreSQL is ready and running on localhost:5432!"
