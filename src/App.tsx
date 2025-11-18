/**
 * 主应用组件
 * 配置路由、主题和全局设置
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp } from '@/utils/antdComponents';
import { themeConfig } from '@/utils/antdComponents';
import MainLayout from '@/components/Layout/Layout';

// 页面组件 - 使用懒加载优化
const Home = React.lazy(() => import('@/pages/Home'));
const TypstEditor = React.lazy(() => import('@/pages/TypstEditor'));
const TypstEditorTest = React.lazy(() => import('@/pages/TypstEditorTest'));
const QAChat = React.lazy(() => import('@/pages/QAChat'));
const StandardSearch = React.lazy(() => import('@/pages/StandardSearch'));
const AICalculation = React.lazy(() => import('@/pages/AICalculation'));
const DataSearch = React.lazy(() => import('@/pages/DataSearch'));
const PolicySearch = React.lazy(() => import('@/pages/PolicySearch'));
const TemplateDownload = React.lazy(() => import('@/pages/TemplateDownload'));
const DocumentManagement = React.lazy(() => import('@/pages/DocumentManagement'));
const ConversionTool = React.lazy(() => import('@/pages/ConversionTool'));
const ProjectConstruct = React.lazy(() => import('@/pages/ProjectConstruct'));
const Favorite = React.lazy(() => import('@/pages/Favorite'));
const Settings = React.lazy(() => import('@/pages/Settings'));

// 加载中组件
const LoadingFallback: React.FC = () => (
  <div className="flex-center" style={{ height: '200px' }}>
    <div>页面加载中...</div>
  </div>
);

const App: React.FC = () => {
  return (
    <ConfigProvider theme={themeConfig}>
      <AntdApp>
        <Router>
          <React.Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                {/* 首页 */}
                <Route index element={<Home />} />

                {/* 可研报告编辑器 - 主要功能 */}
                <Route path="/typst-editor" element={<TypstEditor />} />
                <Route path="/typst-test" element={<TypstEditorTest />} />

                {/* 11个功能模块 - 基于良策金宝AI */}
                <Route path="/qa" element={<QAChat />} />
                <Route path="/standard" element={<StandardSearch />} />
                <Route path="/calc" element={<AICalculation />} />
                <Route path="/data-search" element={<DataSearch />} />
                <Route path="/policy" element={<PolicySearch />} />
                <Route path="/template-download" element={<TemplateDownload />} />
                <Route path="/doc" element={<DocumentManagement />} />
                <Route path="/conversion-tool" element={<ConversionTool />} />
                <Route path="/project-construct" element={<ProjectConstruct />} />
                <Route path="/favorite" element={<Favorite />} />

                {/* 系统设置 */}
                <Route path="/settings" element={<Settings />} />

                {/* 404 重定向到首页 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </React.Suspense>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;