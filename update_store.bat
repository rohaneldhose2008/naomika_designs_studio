@echo off
title Naomika Design Studio - Catalog Auto-Sync & Git Deployer
color 0A
echo ===================================================
echo     Naomika Design Studio - Store Auto-Sync
echo ===================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed on this laptop.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...
if not exist node_modules\xlsx (
    echo [INFO] Installing required packages (xlsx)...
    call npm install
)

echo [2/3] Syncing products.xlsx and images...
node sync_store.js
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to sync products sheet. Please verify products.xlsx format.
    pause
    exit /b 1
)

echo [3/3] Checking Git deployment status...
where git >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    if exist .git (
        git add .
        git commit -m "Auto-sync Naomika catalog updates - %DATE% %TIME%" 2>nul
        git push origin main 2>nul
        if %ERRORLEVEL% EQU 0 (
            echo [INFO] Updates pushed to live GitHub repository!
        ) else (
            echo [INFO] Local Git committed. (Push skipped or remote branch offline).
        )
    ) else (
        echo [INFO] No Git repository initialized yet. Products synced locally!
    )
    echo.
    echo ===================================================
    echo  SUCCESS: Store catalog synced successfully!
    echo ===================================================
) else (
    echo [INFO] Products synced locally! Install Git if you want 1-click cloud sync.
)

echo.
echo Press any key to close this window...
pause >nul
