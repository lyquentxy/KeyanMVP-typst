#!/bin/bash

echo "启动可研报告编辑器 - 集成Tinymist实时预览"
echo "============================================="

# 检查依赖
echo "检查依赖..."
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    exit 1
fi

if ! command -v typst &> /dev/null; then
    echo "警告: Typst 未安装，将使用模拟模式"
fi

# 安装依赖
echo "1. 安装服务器依赖..."
cd server && npm install --silent
cd ..

echo "2. 启动后端Tinymist服务器..."
cd server && npm start &
SERVER_PID=$!
cd ..

echo "3. 等待服务器启动..."
sleep 3

echo "4. 启动前端开发服务器..."
npm run dev &
FRONTEND_PID=$!

echo "5. 等待前端启动..."
sleep 5

echo "6. 打开浏览器..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:5174/typst-editor
elif command -v open &> /dev/null; then
    open http://localhost:5174/typst-editor
fi

echo "============================================="
echo "所有服务已启动！"
echo "前端: http://localhost:5174/typst-editor"
echo "后端: http://localhost:3000"
echo "WebSocket: ws://localhost:3001"
echo "============================================="
echo "按 Ctrl+C 停止所有服务"

# 捕获Ctrl+C信号，清理进程
trap 'echo "正在停止服务..."; kill $SERVER_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# 等待进程结束
wait