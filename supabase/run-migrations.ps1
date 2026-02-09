Param(
  [string]$DbUrl = $env:SUPABASE_DB_URL
)

if (-not $DbUrl) {
  $DbUrl = $env:DATABASE_URL
}

if (-not $DbUrl) {
  Write-Error "Missing SUPABASE_DB_URL (or DATABASE_URL)."
  Write-Error "Example: `$env:SUPABASE_DB_URL='postgresql://USER:PASSWORD@HOST:5432/postgres'"
  exit 1
}

$psql = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psql) {
  Write-Error "psql is required to run migrations."
  Write-Error "Install PostgreSQL client tools, then retry."
  exit 1
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$migrationsDir = Join-Path $root "migrations"
$seedDir = Join-Path $root "seed"

Write-Host "Running migrations from $migrationsDir"
Get-ChildItem -Path $migrationsDir -Filter "*.sql" | Sort-Object Name | ForEach-Object {
  Write-Host "Applying $($_.Name)"
  & $psql.Source $DbUrl -v ON_ERROR_STOP=1 -f $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Running seed files from $seedDir"
Get-ChildItem -Path $seedDir -Filter "*.sql" | Sort-Object Name | ForEach-Object {
  Write-Host "Seeding $($_.Name)"
  & $psql.Source $DbUrl -v ON_ERROR_STOP=1 -f $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host "Done."
