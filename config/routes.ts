export default [
  {
    path: '/',
    name: '首页',
    component: '@/pages/Home',
  },
  {
    path: '/typst-editor',
    name: '可研报告编辑器',
    component: '@/pages/TypstEditor',
  },
  {
    path: '/qa',
    name: '新对话',
    component: '@/pages/QAChat',
  },
  {
    path: '/standard',
    name: '标准规范搜索',
    component: '@/pages/StandardSearch',
  },
  {
    path: '/calc',
    name: 'AI工程计算',
    component: '@/pages/AICalculation',
  },
  {
    path: '/data-search',
    name: '数据查询',
    component: '@/pages/DataSearch',
  },
  {
    path: '/policy',
    name: '政策及其他',
    component: '@/pages/PolicySearch',
  },
  {
    path: '/template-download',
    name: '模板下载',
    component: '@/pages/TemplateDownload',
  },
  {
    path: '/doc',
    name: '项目推荐书',
    component: '@/pages/DocumentManagement',
  },
  {
    path: '/conversion-tool',
    name: '转换工具',
    component: '@/pages/ConversionTool',
  },
  {
    path: '/project-construct',
    name: '项目建设',
    component: '@/pages/ProjectConstruct',
  },
  {
    path: '/favorite',
    name: '我的收藏',
    component: '@/pages/Favorite',
  },
  {
    path: '/settings',
    name: '系统设置',
    component: '@/pages/Settings',
  },
  {
    path: '/*',
    component: '@/pages/404',
  },
];
