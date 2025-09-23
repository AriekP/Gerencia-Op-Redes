# kill-dev.ps1
# Busca y detiene procesos node/vite/npm que ejecutan el proyecto en esta carpeta
$cwd = (Get-Location).Path
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ForEach-Object {
    if ($_.CommandLine -and ($_.CommandLine -like "*$cwd*" -or $_.CommandLine -like "*vite*" -or $_.CommandLine -like "*npm*run dev*")) {
        Write-Host "Stopping PID:" $_.ProcessId
        try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch { Write-Host "Failed to stop PID: $_.ProcessId" }
    }
}
Write-Host "Done."