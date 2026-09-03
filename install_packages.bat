@echo off
title Naomika Design Studio - Package Setup
color 0B
echo ===================================================
echo   Naomika Design Studio - One-Click Package Setup
echo ===================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed on this laptop!
    echo Opening https://nodejs.org in your browser...
    start "" "https://nodejs.org"
    echo Please install Node.js and run this file again.
    echo.
    pause
    exit /b 1
)

echo [1/2] Installing required project packages (xlsx, express, cors)...
call npm install

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [2/2] Generating initial catalog bundle...
    node sync_store.js
    echo.
    echo ===================================================
    echo  SUCCESS: All packages installed and store ready!
    echo  You can now run 'run_localhost.bat' to start!
    echo ===================================================
) else (
    echo [ERROR] Package installation failed. Please check your internet connection.
)

echo.
pause
