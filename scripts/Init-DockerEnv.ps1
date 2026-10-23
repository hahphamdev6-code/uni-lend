[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
$templatePath = Join-Path $projectDir '.env.docker.example'
$destinationPath = Join-Path $projectDir '.env.docker'

if (Test-Path -LiteralPath $destinationPath) {
    Write-Host '.env.docker already exists; kept unchanged.'
    return
}

function New-RandomSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) }
    finally { $rng.Dispose() }
    return [Convert]::ToBase64String($bytes)
}

$template = [System.IO.File]::ReadAllText($templatePath)
$template = $template.Replace('__GENERATE_DB_PASSWORD__', (New-RandomSecret))
$template = $template.Replace('__GENERATE_ROOT_PASSWORD__', (New-RandomSecret))
$template = $template.Replace('__GENERATE_JWT_SECRET__', (New-RandomSecret))
# CreateNew prevents overwriting an environment file created by another terminal.
$stream = [System.IO.File]::Open($destinationPath, [System.IO.FileMode]::CreateNew)
try {
    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes($template)
    $stream.Write($bytes, 0, $bytes.Length)
}
finally { $stream.Dispose() }
Write-Host '.env.docker created with random database passwords and a Base64 JWT key.'
Write-Host 'No secret values were printed. Keep this file for the existing Docker volumes.'
