# Run once after copying this package's backend folder into the project root.
# Adds Flyway without overwriting dependencies or configuration from other branches.
$ErrorActionPreference = 'Stop'
$backendRoot = Split-Path -Parent $PSScriptRoot
$pomPath = Join-Path $backendRoot 'pom.xml'
$configPath = Join-Path $backendRoot 'src/main/resources/application.yaml'
$utf8 = New-Object System.Text.UTF8Encoding($false)

if (!(Test-Path -LiteralPath $pomPath) -or !(Test-Path -LiteralPath $configPath)) {
    throw 'Run this script from backend/scripts in the existing project. Do not delete the original backend.'
}

# Refuse stale schema definitions before modifying pom/config.
$snapshotPath = Join-Path $backendRoot 'docs/db-entity-snapshot.json'
if (!(Test-Path -LiteralPath $snapshotPath)) { throw 'Entity snapshot file is missing from this package.' }
$snapshot = Get-Content -LiteralPath $snapshotPath -Raw | ConvertFrom-Json
$javaRoot = Join-Path $backendRoot 'src/main/java'
$mappedFiles = @(Get-ChildItem -LiteralPath $javaRoot -Recurse -Filter '*.java' | Where-Object {
    $source = [System.IO.File]::ReadAllText($_.FullName)
    [regex]::IsMatch($source, '(?m)^\s*@(Entity|MappedSuperclass)(?:\s|$|\()')
})
if ($mappedFiles.Count -ne @($snapshot).Count) {
    throw 'Entity set differs from the supplied backend. Send the latest backend.zip before applying migration.'
}
$sha = [System.Security.Cryptography.SHA256]::Create()
try {
    foreach ($entry in $snapshot) {
        $entityPath = Join-Path $backendRoot $entry.path
        if (!(Test-Path -LiteralPath $entityPath)) { throw ('Missing mapped class: ' + $entry.path) }
        $source = [System.IO.File]::ReadAllText($entityPath).Replace("`r`n", "`n").Trim()
        $hash = ([System.BitConverter]::ToString($sha.ComputeHash($utf8.GetBytes($source)))).Replace('-', '').ToLowerInvariant()
        if ($hash -ne $entry.sha256) {
            throw ('Mapped class changed: ' + $entry.path + '. Send the latest backend.zip for schema review.')
        }
    }
} finally {
    $sha.Dispose()
}

$pom = New-Object System.Xml.XmlDocument
$pom.PreserveWhitespace = $true
$pom.Load($pomPath)
$ns = New-Object System.Xml.XmlNamespaceManager($pom.NameTable)
$ns.AddNamespace('m', 'http://maven.apache.org/POM/4.0.0')
$deps = $pom.SelectSingleNode('/m:project/m:dependencies', $ns)
if ($null -eq $deps) { throw 'Cannot find the Maven dependencies element.' }

function Add-Dependency([string]$group, [string]$artifact, [string]$scope) {
    $existing = $deps.SelectSingleNode("m:dependency[m:groupId='$group' and m:artifactId='$artifact']", $ns)
    if ($null -ne $existing) { return }
    $dependency = $pom.CreateElement('dependency', $deps.NamespaceURI)
    foreach ($pair in @(@('groupId', $group), @('artifactId', $artifact))) {
        $element = $pom.CreateElement($pair[0], $deps.NamespaceURI)
        $element.InnerText = $pair[1]
        [void]$dependency.AppendChild($element)
    }
    if ($scope) {
        $element = $pom.CreateElement('scope', $deps.NamespaceURI)
        $element.InnerText = $scope
        [void]$dependency.AppendChild($element)
    }
    [void]$deps.AppendChild($pom.CreateWhitespace("`n        "))
    [void]$deps.AppendChild($dependency)
    [void]$deps.AppendChild($pom.CreateWhitespace("`n    "))
}

Add-Dependency 'org.springframework.boot' 'spring-boot-starter-flyway' ''
Add-Dependency 'org.flywaydb' 'flyway-mysql' 'runtime'

$config = [System.IO.File]::ReadAllText($configPath)
$existingFlyway = [regex]::IsMatch($config, '(?m)^  flyway:\s*(?:#.*)?$')
if ($existingFlyway -and !$config.Contains('# UniLend Flyway V1')) {
    throw 'A Flyway block already exists. Stop and review it before applying this package.'
}
if (!$existingFlyway) {
    if (![regex]::IsMatch($config, '(?m)^  jpa:\s*$')) {
        throw 'Expected spring.jpa block was not found. Send application.yaml for review.'
    }
    $flywayBlock = @'
  # UniLend Flyway V1
  flyway:
    enabled: true
    locations: "classpath:db/migration/{vendor}"
    baseline-on-migrate: false
    baseline-version: "1"
    clean-disabled: true
    validate-on-migrate: true
    validate-migration-naming: true
    fail-on-missing-locations: true
  sql:
    init:
      mode: never

'@
    if ([regex]::IsMatch($config, '(?m)^  sql:\s*')) {
        throw 'A spring.sql block already exists. Review initialization settings before applying.'
    }
    $config = [regex]::Replace($config, '(?m)^  jpa:\s*$', $flywayBlock + "`n  jpa:")
}
if (![regex]::IsMatch($config, '(?m)^\s+ddl-auto:\s*(update|validate)\s*$')) {
    throw 'Expected ddl-auto update/validate was not found. Review config before applying.'
}
$config = [regex]::Replace($config, '(?m)^(\s+ddl-auto:)\s*(update|validate)\s*$', '$1 validate')

# Prepare all edits before writing. Preserve test logic; let Flyway own its test schema.
$authTestPath = Join-Path $backendRoot 'src/test/java/com/unilend/backend/controller/AuthAndLoanIntegrationTest.java'
$authTest = $null
if (Test-Path -LiteralPath $authTestPath) {
    $authTest = [System.IO.File]::ReadAllText($authTestPath).Replace(
        'spring.jpa.hibernate.ddl-auto=create-drop', 'spring.jpa.hibernate.ddl-auto=validate')
}

$pom.Save($pomPath)
[System.IO.File]::WriteAllText($configPath, $config, $utf8)
if ($null -ne $authTest) { [System.IO.File]::WriteAllText($authTestPath, $authTest, $utf8) }
Write-Host 'Flyway dependencies added; Hibernate now validates the schema.'
Write-Host 'Do not start against an existing database until backup/schema review/baseline steps are complete.'
Write-Host 'First run the two new migration tests on H2. See backend/docs/DB_MIGRATION.md.'
