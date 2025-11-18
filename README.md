# DOCX处理器前端

> 基于 React + TypeScript + Ant Design 5.x 的企业级DOCX文档智能处理系统

## 🚀 项目特色

- 🎨 **现代化设计**: 基于 Ant Design 5.x 设计系统，遵循最新设计规范
- 🏗️ **架构完整**: 单例API客户端、模块化组件、响应式布局
- ⚡ **性能优化**: Tree-shaking、懒加载、Vite构建优化
- 🔧 **开发友好**: TypeScript完整类型支持、ESLint代码规范
- 📱 **响应式**: 完整移动端适配，断点式响应布局

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.1.1 | 前端框架 |
| TypeScript | ~5.8.3 | 类型系统 |
| Ant Design | 5.27.4 | UI组件库 |
| Vite | 7.1.7 | 构建工具 |
| React Router | 7.9.2 | 路由管理 |
| Axios | 1.12.2 | HTTP客户端 |

## 📁 项目结构

```
docx-processor-frontend/
├── src/
│   ├── components/           # 公共组件
│   │   └── Layout/          # 主布局组件
│   ├── pages/               # 页面组件
│   │   ├── Home.tsx         # 首页系统概览
│   │   ├── TypstEditor.tsx  # Typst可研编辑器
│   │   ├── QAChat.tsx       # MiniMax问答助手
│   │   └── Settings.tsx     # 系统设置
│   ├── services/            # AI模块封装
│   │   └── photovoltaicAiService.ts # MiniMax调用+数据验证
│   ├── types/               # TypeScript类型定义
│   │   └── aiModule.ts      # Typst AI模块类型
│   ├── utils/               # 工具函数
│   │   └── antdComponents.ts # Ant Design组件统一导入
│   ├── styles/              # 样式文件
│   │   └── global.css       # 全局样式和Design Token
│   ├── App.tsx              # 主应用组件
│   └── main.tsx             # 应用入口
├── public/                  # 静态资源
├── package.json             # 项目配置
├── vite.config.ts           # Vite配置
└── tsconfig.json            # TypeScript配置
```

## 🎯 核心功能模块

### 1. 首页概览 (Home)
- ✅ MiniMax 模块连接状态检测
- ✅ 光伏章节与规范指标展示
- ✅ 快速功能入口
- ✅ 进度引导和快速开始指南

### 2. 主布局系统 (Layout)
- ✅ 固定Header + 侧边导航 + 内容区布局
- ✅ 响应式菜单收缩 (250px ⟷ 80px)
- ✅ 统一的导航状态管理
- ✅ 用户信息和操作菜单

### 3. 章节管理 (ChapterManager)
- 🔄 多栏布局设计 (16:8黄金比例)
- 🔄 DOCX文档上传和解析
- 🔄 章节结构可视化展示 (Tree组件)
- 🔄 章节处理状态管理

### 4. 智能体管理 (AgentList)
- 🔄 响应式网格布局 (xs:1, sm:2, lg:3, xxl:4)
- 🔄 智能体卡片展示
- 🔄 快速对话入口
- 🔄 管理操作 (编辑/删除)

### 5. 智能体对话 (AgentChat)
- 🔄 多栏布局 (6:18专业比例)
- 🔄 流式消息处理 (Server-Sent Events)
- 🔄 多对话管理
- 🔄 消息历史滚动

### 6. 系统设置 (Settings)
- ✅ 多栏表单布局 (14:10信息密度优化)
- ✅ MiniMax API配置管理
- ✅ 模块状态检测
- ✅ 配置数据持久化

> 🔄 = 待完善实现，✅ = 已完成

## 🎨 设计系统

### Design Token 系统

```css
/* 品牌色系 */
--color-primary: #1677ff        /* 主色调 */
--color-primary-bg: #e6f7ff     /* 主色背景 */
--color-success: #52c41a        /* 成功色 */
--color-warning: #faad14        /* 警告色 */
--color-error: #ff4d4f          /* 错误色 */

/* 间距系统 */
--padding-xs: 8px              /* 小间距 */
--padding-sm: 12px             /* 中间距 */
--padding: 16px                /* 标准间距 */
--padding-lg: 24px             /* 大间距 */
--padding-xl: 32px             /* 超大间距 */

/* 布局标准 */
--page-width-max: 1440px       /* 页面最大宽度 */
--content-width-max: 1208px    /* 内容区最大宽度 */
--sidebar-width: 250px         /* 侧边栏宽度 */
--header-height: 64px          /* 顶部导航高度 */
```

### 响应式断点

```css
/* 大屏幕 ≥1440px: 内容区居中，固定最大宽度 */
/* 中屏幕 1024-1440px: 动态宽度，保持边距 */
/* 小屏幕 <1024px: 去除边距，紧凑布局 */
/* 移动端 <768px: 垂直堆叠，优化间距 */
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.0.0
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
cd docx-processor-frontend
npm install
```

### 开发运行

```bash
npm run dev
```

访问: http://localhost:5174

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
npm run lint:fix
```

## 🔌 API集成

### MiniMax API配置

1. **进入系统设置页面** (`/settings`)
2. **配置API信息**:
   - API密钥: 从 MiniMax 控制台获取
   - Base URL: 默认 `https://api.minimaxi.com/anthropic`
   - 模型: `MiniMax-M2` 或 `MiniMax-M2-Stable`
   - Temperature/MaxTokens 等参数按需调整
3. **测试连接**: 使用“测试连接”按钮校验配置
4. **保存配置**: 设置会自动保存到 localStorage

### API客户端特性

- ✅ 单例模式设计，全局统一实例
- ✅ 自动请求/响应拦截器
- ✅ 完整错误处理和重试机制
- ✅ 流式消息支持 (Server-Sent Events)
- ✅ TypeScript完整类型定义
- ✅ 自动配置持久化

## 📊 性能数据

### Bundle优化效果

| 资源类型 | 原始大小 | Gzip压缩 | 压缩率 |
|---------|----------|----------|--------|
| CSS | 12.15KB | 3.34KB | 72.5% |
| JavaScript | 1.27MB | 407KB | 68.0% |

### 加载性能

- ⚡ Vite HMR: 毫秒级热更新
- 📦 Tree-shaking: 按需加载组件
- 🎯 路由懒加载: 代码分割优化
- 💾 localStorage缓存: 配置持久化

## 🔮 架构扩展点

### 1. Typst集成准备
- 基于 MiniMax AI 模块的数据验证 + Typst 模板流程
- 替换DOCX处理为Typst处理
- 增加Typst模板系统
- 支持实时预览和编译

### 2. 功能扩展
- 批量文档处理
- 文档版本管理
- 协作编辑功能
- 高级搜索和过滤

### 3. 性能优化
- 虚拟滚动 (大列表场景)
- Service Worker缓存
- 离线模式支持

## 🏷️ 待优化事项

- [ ] 引入状态管理 (Redux Toolkit/Zustand)
- [ ] 增加单元测试和集成测试
- [ ] 支持国际化多语言
- [ ] 支持暗色主题切换
- [ ] 增加React Error Boundary
- [ ] 集成错误监控和性能监控

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

**总结**: 这是一个结构清晰、遵循Ant Design设计规范、具备良好扩展性的现代化React应用。采用多栏布局设计，充分利用屏幕空间，提供优秀的用户体验。代码架构支持未来向Typst的平滑迁移。
