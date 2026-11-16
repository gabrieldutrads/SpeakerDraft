# Plikai for VS Code - installer
# usage: irm https://plikai.com/install.ps1 | iex
$ErrorActionPreference = 'Stop'

$version = '1.0.25'
$url     = 'https://plikai.com/vsix/plikai-1.0.25.vsix'
$sha256  = '285ecbdb10b2ae2c71f82dbbd99aa73afcbb33333208929b8b751e95a480b62a'
$id      = 'plikai.plikai'

function Find-Editor {
  # 1) editor set explicitly - command name or full path
  if ($env:PLIKAI_EDITOR) {
    $c = Get-Command $env:PLIKAI_EDITOR -ErrorAction SilentlyContinue
    if ($c) { return $c.Source }
    if (Test-Path -LiteralPath $env:PLIKAI_EDITOR) { return (Resolve-Path -LiteralPath $env:PLIKAI_EDITOR).Path }
    return $env:PLIKAI_EDITOR
  }

  # 2) current session PATH is often stale right after the editor was installed
  #    (an already-open PowerShell won't see the new PATH) - we refresh it from the registry.
  try {
    $paths = @(
      [Environment]::GetEnvironmentVariable('Path','Machine'),
      [Environment]::GetEnvironmentVariable('Path','User'),
      $env:Path
    ) | Where-Object { $_ }
    $env:Path = ($paths -join ';')
  } catch {}

  foreach ($n in @('code','cursor','windsurf','code-insiders','codium','trae')) {
    if (Get-Command $n -ErrorAction SilentlyContinue) { return $n }
  }

  # 3) PATH still didn't help - look for the CLI in standard install locations.
  #    Forward slashes are safe for both Test-Path and inside this JS template.
  $la = $env:LOCALAPPDATA
  $pf = $env:ProgramFiles
  $px = [Environment]::GetEnvironmentVariable('ProgramFiles(x86)')
  $candidates = @(
    "$la/Programs/Microsoft VS Code/bin/code.cmd",
    "$pf/Microsoft VS Code/bin/code.cmd",
    "$px/Microsoft VS Code/bin/code.cmd",
    "$la/Programs/Microsoft VS Code Insiders/bin/code-insiders.cmd",
    "$pf/Microsoft VS Code Insiders/bin/code-insiders.cmd",
    "$la/Programs/cursor/resources/app/bin/cursor.cmd",
    "$la/Programs/Windsurf/bin/windsurf.cmd",
    "$pf/Windsurf/bin/windsurf.cmd",
    "$la/Programs/VSCodium/bin/codium.cmd",
    "$pf/VSCodium/bin/codium.cmd",
    "$la/Programs/Trae/bin/trae.cmd"
  )
  foreach ($p in $candidates) {
    if ($p -and (Test-Path -LiteralPath $p)) { return (Resolve-Path -LiteralPath $p).Path }
  }
  return $null
}

$cli = Find-Editor
if (-not $cli) {
  Write-Error @"
plikai: no editor command line tool found (looked for code, cursor, windsurf, code-insiders, codium, trae).
If the editor is already installed, close this window, open a NEW PowerShell and run the command again - a fresh install adds 'code' to PATH only for terminals started afterwards.
If it is not installed yet, install VS Code and keep the "Add to PATH" option enabled (it is on by default), then re-run.
To point at a specific editor, set PLIKAI_EDITOR to its command or full path, for example:
  setx PLIKAI_EDITOR "C:/Users/You/AppData/Local/Programs/Microsoft VS Code/bin/code.cmd"
then open a new PowerShell and re-run.
"@
  exit 1
}

Write-Host "plikai: editor  $cli"
Write-Host "plikai: version $version"

$tmp  = Join-Path $env:TEMP ("plikai-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
$vsix = Join-Path $tmp "plikai-$version.vsix"

try {
  Invoke-WebRequest -Uri $url -OutFile $vsix -UseBasicParsing
  $sum = (Get-FileHash -Path $vsix -Algorithm SHA256).Hash.ToLower()
  if ($sum -ne $sha256) { throw "checksum mismatch, download is corrupted" }
  Write-Host "plikai: checksum ok"

  & $cli --install-extension $vsix --force | Out-Null
  Write-Host ""
  Write-Host "plikai: installed - $id $version"
  Write-Host "       open the editor, click Plikai in the activity bar, sign in and pick a model."
}
finally {
  Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
}
