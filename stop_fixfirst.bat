@echo off
chcp 65001 >nul 2>&1
title FixFirst AI - Stopping...
color 0C

echo.
echo  ╔══════════════════════════════════════════════════╗
echo  ║     Stopping FixFirst AI Servers                 ║
echo  ╚══════════════════════════════════════════════════╝
echo.

:: Only kill FixFirst AI processes (by window title)
echo [STOP] Closing FixFirst AI - Backend window...
taskkill /FI "WINDOWTITLE eq FixFirst AI - Backend*" /F >nul 2>&1

echo [STOP] Closing FixFirst AI - Frontend window...
taskkill /FI "WINDOWTITLE eq FixFirst AI - Frontend*" /F >nul 2>&1

:: Note: We do NOT kill generic python/node processes
:: because those might belong to other projects

echo.
echo [DONE] FixFirst AI servers stopped.
echo.
echo NOTE: If any server is still running, close its
echo       command prompt window manually.
echo.
echo Your other projects were NOT affected.
echo.
pause
