param(
  [int]$Port = 5173
)

$ErrorActionPreference = "Stop"
$projectDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$previewDirectory = Join-Path $projectDirectory ".local-preview"
$standardOutputLog = Join-Path $previewDirectory "site-output.log"
$standardErrorLog = Join-Path $previewDirectory "site-error.log"
$pidFile = Join-Path $previewDirectory "site.pid"
$vitePath = Join-Path $projectDirectory "node_modules\vite\bin\vite.js"

function Test-LocalSite {
  param([int]$SitePort)

  try {
    $response = Invoke-WebRequest `
      -Uri "http://127.0.0.1:$SitePort/" `
      -UseBasicParsing `
      -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (Test-LocalSite -SitePort $Port) {
  Write-Output "BTC Beef is already available at http://127.0.0.1:$Port/"
  exit 0
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) {
  $nodeCommand.Source
} else {
  "C:\Users\Austin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
}

if (-not (Test-Path -LiteralPath $nodePath)) {
  throw "Node.js could not be found. Open the BTC Beef task in Codex and ask it to start the local site."
}

if (-not (Test-Path -LiteralPath $vitePath)) {
  throw "The BTC Beef site dependencies are missing."
}

New-Item -ItemType Directory -Path $previewDirectory -Force | Out-Null

$process = Start-Process `
  -FilePath $nodePath `
  -ArgumentList @(
    $vitePath,
    "--host",
    "127.0.0.1",
    "--port",
    $Port,
    "--strictPort"
  ) `
  -WorkingDirectory $projectDirectory `
  -WindowStyle Hidden `
  -RedirectStandardOutput $standardOutputLog `
  -RedirectStandardError $standardErrorLog `
  -PassThru

Set-Content -LiteralPath $pidFile -Value $process.Id

for ($attempt = 0; $attempt -lt 12; $attempt += 1) {
  Start-Sleep -Milliseconds 250
  if (Test-LocalSite -SitePort $Port) {
    Write-Output "BTC Beef is running at http://127.0.0.1:$Port/ (process $($process.Id))."
    exit 0
  }
}

$errorDetails = if (Test-Path -LiteralPath $standardErrorLog) {
  Get-Content -Raw -LiteralPath $standardErrorLog
} else {
  "No error log was created."
}

throw "The local site did not start. $errorDetails"
