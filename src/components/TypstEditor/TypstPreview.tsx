/**
 * Typst实时预览组件
 * 显示编译后的PDF预览，支持缩放、页面导航等功能
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Slider,
  Tooltip,
  Spin,
  Alert,
  Divider
} from '@/utils/antdComponents';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  FileTextOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface TypstPreviewProps {
  compiledContent: string;
  isCompiling: boolean;
}

const TypstPreview: React.FC<TypstPreviewProps> = ({
  compiledContent,
  isCompiling
}) => {
  const [scale, setScale] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1); // 暂时固定为1页
  const [previewError, setPreviewError] = useState<string | null>(null);

  // 缩放控制
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 25, 50));
  };

  const handleScaleChange = (value: number) => {
    setScale(value);
  };

  // 页面导航
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // 下载PDF
  const handleDownload = () => {
    if (compiledContent) {
      try {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = compiledContent;
        link.download = 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        setPreviewError('下载失败：' + (error as Error).message);
      }
    }
  };

  // 全屏预览
  const handleFullscreen = () => {
    if (compiledContent) {
      window.open(compiledContent, '_blank');
    }
  };

  // 刷新预览
  const handleRefresh = () => {
    setPreviewError(null);
    // 触发重新编译
    window.location.reload();
  };

  // 渲染预览内容
  const renderPreviewContent = () => {
    if (isCompiling) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 400,
          background: '#f9f9f9'
        }}>
          <Spin size="large" />
          <Text style={{ marginTop: 16, color: '#666' }}>
            正在编译中，请稍候...
          </Text>
        </div>
      );
    }

    if (previewError) {
      return (
        <div style={{ padding: 16 }}>
          <Alert
            message="预览错误"
            description={previewError}
            type="error"
            showIcon
            action={
              <Button size="small" onClick={handleRefresh}>
                重试
              </Button>
            }
          />
        </div>
      );
    }

    if (!compiledContent) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: 400,
          background: '#f9f9f9'
        }}>
          <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <Text style={{ color: '#666' }}>
            暂无预览内容
          </Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
            请编辑内容后进行编译
          </Text>
        </div>
      );
    }

    // 这里应该渲染实际的PDF内容
    // 由于这是模拟环境，我们显示一个占位预览
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e8e8e8',
        minHeight: 600,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: `scale(${scale / 100})`,
        transformOrigin: 'top center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: 595, // A4宽度
          height: 842, // A4高度
          background: '#fff',
          padding: 40,
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: 'Times New Roman, serif'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 24, marginBottom: 20 }}>文档预览</h1>
            <p style={{ color: '#666' }}>这里显示编译后的Typst文档内容</p>
          </div>

          <div style={{ marginBottom: 30 }}>
            <h2 style={{ fontSize: 18, marginBottom: 15 }}>第一章 示例内容</h2>
            <p>这是一段示例文本，展示Typst编译后的效果。</p>
            <p>支持<strong>粗体</strong>、<em>斜体</em>等格式。</p>
          </div>

          <div style={{ marginBottom: 30 }}>
            <h3 style={{ fontSize: 16, marginBottom: 10 }}>1.1 子章节</h3>
            <p>子章节内容示例...</p>
          </div>

          <div style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            fontSize: 12,
            color: '#999'
          }}>
            第 {currentPage} 页，共 {totalPages} 页
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* 预览工具栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid #e8e8e8',
        background: '#fafafa'
      }}>
        {/* 页面导航 */}
        <Space size="small">
          <Button
            size="small"
            icon={<LeftOutlined />}
            disabled={currentPage <= 1}
            onClick={handlePrevPage}
          />
          <Text style={{ fontSize: 12, minWidth: 80, textAlign: 'center' }}>
            {currentPage} / {totalPages}
          </Text>
          <Button
            size="small"
            icon={<RightOutlined />}
            disabled={currentPage >= totalPages}
            onClick={handleNextPage}
          />
        </Space>

        {/* 缩放控制 */}
        <Space size="small">
          <Button
            size="small"
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            disabled={scale <= 50}
          />
          <Slider
            min={50}
            max={200}
            step={25}
            value={scale}
            onChange={handleScaleChange}
            style={{ width: 100 }}
            tooltip={{ formatter: (value) => `${value}%` }}
          />
          <Button
            size="small"
            icon={<ZoomInOutlined />}
            onClick={handleZoomIn}
            disabled={scale >= 200}
          />
          <Text style={{ fontSize: 12, minWidth: 35 }}>{scale}%</Text>
        </Space>

        {/* 操作按钮 */}
        <Space size="small">
          <Tooltip title="刷新预览">
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            />
          </Tooltip>

          <Tooltip title="全屏预览">
            <Button
              size="small"
              icon={<FullscreenOutlined />}
              onClick={handleFullscreen}
              disabled={!compiledContent}
            />
          </Tooltip>

          <Tooltip title="下载PDF">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!compiledContent}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 预览内容区域 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        background: '#f0f0f0',
        padding: 16
      }}>
        {renderPreviewContent()}
      </div>

      {/* 底部状态栏 */}
      <div style={{
        padding: '6px 12px',
        background: '#fafafa',
        borderTop: '1px solid #e8e8e8',
        fontSize: 11,
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          {isCompiling ? '编译中...' : compiledContent ? '预览就绪' : '等待编译'}
        </div>
        <div>
          最后更新: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default TypstPreview;