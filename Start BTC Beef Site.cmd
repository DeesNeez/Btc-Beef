@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-local-site.ps1"
if errorlevel 1 pause
