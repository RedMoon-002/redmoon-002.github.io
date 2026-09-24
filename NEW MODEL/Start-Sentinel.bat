@echo off
setlocal
title Sentinel Motion Monitor

where py >nul 2>&1
if errorlevel 1 (
  echo Python is required to start Sentinel.
  echo Install Python from https://www.python.org/downloads/ and run this file again.
  pause
  exit /b 1
)

start "" http://localhost:8080
echo Sentinel is running at http://localhost:8080
echo Keep this window open while using the motion monitor.
echo Press Ctrl+C to stop the server.
py -m http.server 8080

