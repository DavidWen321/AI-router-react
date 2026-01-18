@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo =========================================
echo   AIClaude Frontend 打包工具 (Windows)
echo =========================================
echo.

REM 获取时间戳
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set TIMESTAMP=%datetime:~0,8%_%datetime:~8,6%

REM 设置变量
set PACK_DIR=aiclaude-frontend-deploy
set PACK_FILE=aiclaude-frontend-%TIMESTAMP%.zip

echo 正在准备打包...

REM 清理旧目录
if exist "%PACK_DIR%" rmdir /s /q "%PACK_DIR%"
mkdir "%PACK_DIR%"

REM 复制源代码目录
echo 复制源代码...
xcopy /E /I /Q app "%PACK_DIR%\app"
xcopy /E /I /Q components "%PACK_DIR%\components"
xcopy /E /I /Q hooks "%PACK_DIR%\hooks"
xcopy /E /I /Q lib "%PACK_DIR%\lib"
xcopy /E /I /Q public "%PACK_DIR%\public"

REM 复制配置文件
echo 复制配置文件...
copy /Y package.json "%PACK_DIR%\"
copy /Y package-lock.json "%PACK_DIR%\"
copy /Y next.config.mjs "%PACK_DIR%\"
copy /Y tsconfig.json "%PACK_DIR%\"
copy /Y tailwind.config.ts "%PACK_DIR%\"
copy /Y postcss.config.mjs "%PACK_DIR%\"
copy /Y components.json "%PACK_DIR%\"

REM 复制部署文件
echo 复制部署配置...
copy /Y Dockerfile "%PACK_DIR%\"
copy /Y docker-compose.yml "%PACK_DIR%\"
copy /Y nginx.conf "%PACK_DIR%\"
copy /Y deploy.sh "%PACK_DIR%\"
copy /Y setup-ssl.sh "%PACK_DIR%\"
copy /Y .dockerignore "%PACK_DIR%\"
copy /Y .env.example "%PACK_DIR%\"

REM 转换 Shell 脚本的换行符 (CRLF -> LF)
echo 转换 Linux 换行符...
powershell -Command "(Get-Content '%PACK_DIR%\deploy.sh') -join \"`n\" | Set-Content -NoNewline '%PACK_DIR%\deploy.sh'"
powershell -Command "(Get-Content '%PACK_DIR%\setup-ssl.sh') -join \"`n\" | Set-Content -NoNewline '%PACK_DIR%\setup-ssl.sh'"

REM 复制文档
echo 复制文档...
copy /Y README_DEPLOY.md "%PACK_DIR%\"
copy /Y DEPLOYMENT.md "%PACK_DIR%\"
copy /Y QUICK_START.txt "%PACK_DIR%\"

REM 打包（使用 PowerShell 压缩）
echo 正在压缩打包...
powershell -command "Compress-Archive -Path '%PACK_DIR%' -DestinationPath '%PACK_FILE%' -Force"

REM 清理临时目录
rmdir /s /q "%PACK_DIR%"

echo.
echo =========================================
echo   打包完成！
echo =========================================
echo.
echo 压缩包: %PACK_FILE%
for %%A in ("%PACK_FILE%") do echo 大小: %%~zA bytes
echo.
echo 上传步骤：
echo 1. 使用 MobaXterm/FileZilla 上传 %PACK_FILE% 到服务器
echo 2. 在服务器上解压: unzip %PACK_FILE%
echo 3. 进入目录: cd aiclaude-frontend-deploy
echo 4. 执行部署: chmod +x deploy.sh setup-ssl.sh ^&^& ./deploy.sh
echo.
pause
