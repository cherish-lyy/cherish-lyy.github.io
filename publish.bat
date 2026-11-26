@echo off
chcp 65001 >nul
cd /d D:\blog
git add .
git commit -m "update notes"
git push
echo.
echo  ============================================
echo   Pushed. Wait 1-2 minutes, then refresh:
echo   https://cherish-lyy.github.io
echo  ============================================
echo.
pause
