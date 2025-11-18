@echo off
echo 启动可研报告编辑器 - 集成Tinymist实时预览
echo =============================================

echo 1. 启动后端Tinymist服务器...
start "Tinymist Server" cmd /k "cd server && npm start"

echo 2. 等待服务器启动...
timeout /t 3 /nobreak >nul

echo 3. 启动前端开发服务器...
start "Frontend Dev Server" cmd /k "npm run dev"

echo 4. 等待前端启动...
timeout /t 5 /nobreak >nul

echo 5. 打开浏览器...
start http://localhost:5175/typst-editor

echo =============================================
echo 所有服务已启动！
echo 前端: http://localhost:5175/typst-editor
echo 后端: http://localhost:3000
echo WebSocket: ws://localhost:3001
echo =============================================
echo 按任意键关闭此窗口...
pause >nul