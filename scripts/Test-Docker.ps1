[CmdletBinding()]
param(
    [string]$FrontendUrl = 'http://localhost:3000',
    [string]$BackendUrl = 'http://localhost:8080'
)

$ErrorActionPreference = 'Stop'
$FrontendUrl = $FrontendUrl.TrimEnd('/')
$BackendUrl = $BackendUrl.TrimEnd('/')

$web = Invoke-WebRequest -Uri "$FrontendUrl/" -UseBasicParsing -TimeoutSec 30
if ($web.StatusCode -ne 200) { throw 'Frontend did not return HTTP 200.' }

foreach ($url in @(
    "$BackendUrl/categories",
    "$FrontendUrl/api/categories",
    "$FrontendUrl/api/api/categories",
    "$FrontendUrl/api/items"
)) {
    $response = Invoke-RestMethod -Uri $url -TimeoutSec 30
    if ($response.success -ne $true) { throw "API check failed: $url" }
    Write-Host "OK: $url"
}
Write-Host 'Frontend, direct API and same-origin API proxy checks passed.'
Write-Host 'This read-only check does not test login, upload persistence or email delivery.'
