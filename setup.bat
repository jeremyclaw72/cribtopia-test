@echo off
REM Cribtopia Test Environment Setup Script
REM Run this script in PowerShell as Administrator

echo ========================================
echo Cribtopia Docker Setup
echo ========================================
echo.

cd /d C:\Users\jerem\cribtopia-test

echo Step 1: Pulling Node.js image...
docker pull node:20-alpine
if %errorlevel% neq 0 (
    echo ERROR: Failed to pull node:20-alpine
    echo.
    echo Try this manually in PowerShell:
    echo   docker pull node:20-alpine
    echo.
    pause
    exit /b 1
)

echo.
echo Step 2: Building Docker image...
docker compose build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build
    pause
    exit /b 1
)

echo.
echo Step 3: Starting container...
docker compose up -d
if %errorlevel% neq 0 (
    echo ERROR: Failed to start
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Cribtopia is running!
echo ========================================
echo.
echo Open your browser: http://localhost:5173
echo.
echo To stop: docker compose down
echo.
pause