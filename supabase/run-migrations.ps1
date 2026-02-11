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
$sailingsSeedFile = Join-Path $root "..\cruise-cards-site\src\supporting-materials\sailings-seed.sql"

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

if (Test-Path $sailingsSeedFile) {
  Write-Host "Seeding ship and sail dates from $(Split-Path -Leaf $sailingsSeedFile)"
  & $psql.Source $DbUrl -v ON_ERROR_STOP=1 -f $sailingsSeedFile
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host "Skipping ship/sailings seed: file not found at $sailingsSeedFile"
}

Write-Host "Verifying ships and sailings counts"
& $psql.Source $DbUrl -v ON_ERROR_STOP=1 -c "select count(*) as total_ships from public.ships;"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $psql.Source $DbUrl -v ON_ERROR_STOP=1 -c "select count(*) as total_sailings from public.sailings;"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $psql.Source $DbUrl -v ON_ERROR_STOP=1 -c "select count(*) as future_galveston_sailings from public.sailings where departure_port = 'Galveston' and depart_date >= current_date;"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Done."
