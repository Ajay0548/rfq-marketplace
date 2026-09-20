# stop-postgres.ps1 - Stop the portable PostgreSQL instance
$toolsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$extractDir = Join-Path $toolsDir "pgsql"
$dataDir = Join-Path $toolsDir "data"
$pgCtl = Join-Path $extractDir "pgsql\bin\pg_ctl.exe"

if (Test-Path $dataDir) {
    & $pgCtl -D $dataDir stop -m fast
}
