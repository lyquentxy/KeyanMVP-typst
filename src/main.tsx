/**
 * 应用入口文件
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

// 获取根容器
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

// 创建React根实例并渲染应用
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);