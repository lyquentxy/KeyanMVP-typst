# 可研报告编辑器 - Tinymist集成

基于Tinymist的真实Typst实时预览功能已经集成到可研报告编辑器中！

## 🚀 新功能

### ✅ **真实Typst编译**
- 不再是模拟延迟，而是真正的Typst编译器
- 支持完整的Typst语法和功能
- 实时错误检查和语法高亮

### ✅ **SVG实时预览**
- 基于SVG的高质量渲染，比PDF预览更快
- WebSocket实时同步，文件变化立即反映
- 增量渲染技术，只更新变化部分

### ✅ **自动编译**
- 支持自动编译模式，1秒防抖
- 手动编译控制
- 编译状态实时显示

### ✅ **高级预览控制**
- 25%-300%缩放范围
- 全屏预览支持
- SVG文件下载
- 连接状态监控

## 🛠 安装和使用

### 方法1：自动启动（推荐）

**Windows:**
```bash
# 双击运行
start-with-tinymist.bat
```

**Linux/Mac:**
```bash
# 运行启动脚本
./start-with-tinymist.sh
```

### 方法2：手动启动

**1. 启动后端服务器:**
```bash
cd server
npm install
npm start
```

**2. 启动前端开发服务器:**
```bash
npm run dev
```

**3. 访问应用:**
- 打开浏览器访问: http://localhost:5174/typst-editor

## 📋 前置要求

### 必需:
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0

### 可选（推荐）:
- **Typst CLI** - 用于真实编译
  ```bash
  # 安装Typst
  curl -fsSL https://typst.app/install.sh | sh
  # 或者从 GitHub releases 下载二进制文件
  ```

- **Tinymist** - 高级语言服务器功能
  ```bash
  # 安装Tinymist
  cargo install tinymist
  # 或者从 GitHub releases 下载
  ```

## 🔧 配置

### 后端配置
服务器默认配置：
- **HTTP API**: http://localhost:3000
- **WebSocket**: ws://localhost:3001
- **临时文件**: `server/temp/`

### 前端配置
在 `src/services/tinymistService.ts` 中可以修改：
```typescript
private serverUrl = 'http://localhost:3000';
private wsUrl = 'ws://localhost:3001';
```

## 🎯 使用指南

### 1. **基本编辑**
- 在左侧选择文档结构
- 在中间编辑器中编写Typst代码
- 右侧实时预览自动更新

### 2. **自动编译**
- 默认开启自动编译模式
- 1秒防抖，避免频繁编译
- 可通过工具栏切换开关

### 3. **手动编译**
- 点击"编译"按钮强制重新编译
- 适用于解决编译缓存问题

### 4. **预览控制**
- 使用缩放滑块调整预览大小
- 全屏按钮进入全屏预览模式
- 下载按钮保存SVG文件

### 5. **错误处理**
- 编译错误会在预览区域显示
- WebSocket连接状态实时监控
- 自动重连机制

## 🔍 故障排除

### 连接问题
```
❌ WebSocket连接失败
✅ 确保后端服务器已启动 (npm start)
✅ 检查端口3001是否被占用
✅ 防火墙是否阻止连接
```

### 编译问题
```
❌ 编译失败
✅ 检查Typst语法是否正确
✅ 确保Typst CLI已安装
✅ 查看错误信息详情
```

### 性能问题
```
❌ 预览更新慢
✅ 启用自动编译模式
✅ 减少文档复杂度
✅ 检查网络连接
```

## 📚 技术架构

```
┌─────────────────┐    WebSocket    ┌──────────────────┐
│   React前端      │ ←──────────────→ │  Node.js后端     │
│   (端口5174)     │                 │  (端口3000/3001) │
└─────────────────┘                 └──────────────────┘
         ↑                                     ↓
         │                           ┌──────────────────┐
         └───────── SVG渲染 ←─────────│  Typst编译器     │
                                     └──────────────────┘
```

### 关键组件:
- **tinymistService.ts**: WebSocket客户端服务
- **RealTypstPreview.tsx**: 真实预览组件
- **tinymist-server.js**: 后端服务器

## 🎨 自定义

### 添加新功能
1. 编辑 `server/tinymist-server.js` 添加后端API
2. 修改 `src/services/tinymistService.ts` 更新客户端
3. 在 `RealTypstPreview.tsx` 中添加UI组件

### 修改编译选项
在服务器的 `compileTypst` 方法中修改Typst编译参数。

## 📝 开发说明

这个集成提供了从"界面原型"到"真正可用编辑器"的完整升级：

- ✅ **真实编译**: 不再是假的模拟延迟
- ✅ **实时预览**: WebSocket驱动的即时更新
- ✅ **SVG渲染**: 高质量矢量图形预览
- ✅ **自动化**: 防抖编译和错误处理

现在这是一个真正的**专业级Typst编辑器**！🎉