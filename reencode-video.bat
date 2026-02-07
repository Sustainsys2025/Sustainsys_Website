@echo off
REM Video Re-encoding Script for Mobile Compatibility (Windows)
REM Place this script in the same folder as your video file

echo ============================================
echo Mobile Video Re-encoder for iOS/Android
echo ============================================
echo.

set INPUT=grok-video-890d4307-1e67-405d-838d-44860a4e0c56.mp4
set OUTPUT=grok-video-890d4307-1e67-405d-838d-44860a4e0c56-mobile.mp4

REM Check if input file exists
if not exist "%INPUT%" (
    echo ERROR: %INPUT% not found!
    echo Please place this script in the same folder as your video file.
    pause
    exit /b 1
)

REM Check if ffmpeg is installed
where ffmpeg >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ffmpeg is not installed!
    echo.
    echo Please install ffmpeg first:
    echo Download from: https://www.gyan.dev/ffmpeg/builds/
    echo.
    echo After downloading:
    echo 1. Extract the zip file
    echo 2. Add the bin folder to your PATH
    echo 3. Restart Command Prompt
    pause
    exit /b 1
)

echo Found input file: %INPUT%
echo FFmpeg is installed
echo.
echo Starting re-encoding for mobile compatibility...
echo This may take a minute...
echo.

REM Re-encode video
ffmpeg -i "%INPUT%" ^
  -c:v libx264 ^
  -profile:v baseline ^
  -level 3.0 ^
  -pix_fmt yuv420p ^
  -c:a aac ^
  -b:a 128k ^
  -movflags +faststart ^
  -y ^
  "%OUTPUT%"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo SUCCESS!
    echo ============================================
    echo.
    echo Mobile-optimized video created: %OUTPUT%
    echo.
    echo Next steps:
    echo 1. Upload %OUTPUT% to your server
    echo 2. Rename it to %INPUT% (replace the old file^)
    echo    OR update your HTML to use the new filename
    echo 3. Test on your iPhone Safari
    echo.
) else (
    echo.
    echo ERROR: Re-encoding failed!
    echo Please check the error messages above.
)

pause
