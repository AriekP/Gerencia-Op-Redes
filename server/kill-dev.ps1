# server/kill-dev.ps1
# Detiene procesos node relacionados con el backend server dentro de la carpeta `server`
$cwd = (Get-Location).Path
Get-CimInstance Win32_Process -Filter "Name='node.exe'" | ForEach-Object {
    if ($_.CommandLine -and ($_.CommandLine -like "*$cwd*" -or $_.CommandLine -like "*server*" -or $_.CommandLine -like "*node index.js*" -or $_.CommandLine -like "*npm*run dev*")) {
        Write-Host "Stopping PID:" $_.ProcessId
        try { Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop } catch { Write-Host "Failed to stop PID: $_.ProcessId" }
    }
}
Write-Host "Done."