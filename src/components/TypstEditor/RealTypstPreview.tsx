/**
 * 真实Typst实时预览组件
 * 基于Tinymist服务，提供真正的Typst编译和SVG渲染
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  Slider,
  Tooltip,
  Spin,
  Alert,
  Divider,
  Switch,
  Badge
} from '@/utils/antdComponents';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
  DownloadOutlined,
  ReloadOutlined,
  LeftOutlined,
  RightOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  WifiOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import tinymistService, { CompileResult } from '@/services/tinymistService';

const { Text } = Typography;

interface RealTypstPreviewProps {
  content: string;
  filename?: string;
  autoCompile?: boolean;
}

const RealTypstPreview: React.FC<RealTypstPreviewProps> = ({
  content,
  filename = 'document.typ',
  autoCompile = true
}) => {
  const [scale, setScale] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(1); // SVG通常是单页
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledPDF, setCompiledPDF] = useState<string>('');
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [autoCompileEnabled, setAutoCompileEnabled] = useState(autoCompile);
  const [lastCompileTime, setLastCompileTime] = useState<Date | null>(null);

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const compileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化Tinymist连接
  useEffect(() => {
    const initTinymist = async () => {
      try {
        // 连接WebSocket
        await tinymistService.connect();
        setIsConnected(true);

        // 监听编译结果
        tinymistService.on('compiled', handleCompileResult);
        tinymistService.on('error', handleCompileError);
        tinymistService.on('disconnected', () => setIsConnected(false));

        // 首次编译
        if (content.trim()) {
          await compileDocument();
        }
      } catch (error) {
        console.error('Tinymist初始化失败:', error);
        setPreviewError('无法连接到Tinymist服务，请确保服务器已启动');
      }
    };

    initTinymist();

    return () => {
      tinymistService.off('compiled', handleCompileResult);
      tinymistService.off('error', handleCompileError);
      if (compileTimeoutRef.current) {
        clearTimeout(compileTimeoutRef.current);
      }
    };
  }, []);

  // 监听内容变化，自动编译
  useEffect(() => {
    console.log('RealTypstPreview 内容变化:');
    console.log('内容长度:', content.length);
    console.log('内容预览:', content.substring(0, 300));
    console.log('自动编译启用:', autoCompileEnabled);
    console.log('WebSocket连接状态:', isConnected);

    if (autoCompileEnabled && content.trim()) {
      // 防抖编译
      if (compileTimeoutRef.current) {
        clearTimeout(compileTimeoutRef.current);
      }

      compileTimeoutRef.current = setTimeout(() => {
        compileDocument();
      }, 1000); // 1秒防抖
    }

    return () => {
      if (compileTimeoutRef.current) {
        clearTimeout(compileTimeoutRef.current);
      }
    };
  }, [content, autoCompileEnabled]);

  const handleCompileResult = (result: CompileResult) => {
    setCompiledPDF(result.pdf);
    setIsCompiling(false);
    setPreviewError(null);
    setLastCompileTime(new Date());

    if (result.stderr) {
      console.warn('编译警告:', result.stderr);
    }
  };

  const handleCompileError = (error: any) => {
    setIsCompiling(false);
    setPreviewError(error.message || '编译失败');
    console.error('编译错误:', error);
  };

  const compileDocument = async () => {
    if (!content.trim()) {
      setPreviewError('没有内容需要编译');
      return;
    }

    console.log('==== 开始编译文档 ====');
    console.log('文件名:', filename);
    console.log('内容长度:', content.length);
    console.log('内容开头:', content.substring(0, 200));

    setIsCompiling(true);
    setPreviewError(null);

    try {
      const result = await tinymistService.compileDocument(content, filename);
      console.log('==== 编译成功 ====');
      console.log('PDF长度:', result.pdf.length);
      console.log('PDF路径:', result.pdfPath);
      console.log('错误输出:', result.stderr);
      console.log('标准输出:', result.stdout);
      handleCompileResult(result);
    } catch (error) {
      console.error('编译失败:', error);
      handleCompileError({ message: (error as Error).message });
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 25, 300));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 25, 25));
  };

  const handleScaleChange = (value: number) => {
    setScale(value);
  };

  // 重置缩放
  const handleResetZoom = () => {
    setScale(100);
  };

  // 下载PDF
  const handleDownload = () => {
    if (compiledPDF) {
      try {
        // 将base64解码为二进制数据
        const byteCharacters = atob(compiledPDF);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);

        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        // 使用封面页标题作为文件名
        link.download = `广州博创设计院有限公司屋顶分布式光伏项目报告.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        setPreviewError('下载失败：' + (error as Error).message);
      }
    }
  };

  // 全屏预览
  const handleFullscreen = () => {
    if (compiledPDF && svgContainerRef.current) {
      const element = svgContainerRef.current;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    }
  };

  // 手动刷新
  const handleRefresh = () => {
    compileDocument();
  };

  // 渲染PDF内容
  const renderPDFContent = () => {
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
            正在编译Typst文档为PDF...
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
              <Space>
                <Button size="small" onClick={handleRefresh}>
                  重试编译
                </Button>
                <Button size="small" onClick={() => setPreviewError(null)}>
                  忽略错误
                </Button>
              </Space>
            }
          />
        </div>
      );
    }

    if (!compiledPDF) {
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
            请编写Typst内容并编译
          </Text>
          <Button
            type="primary"
            style={{ marginTop: 16 }}
            onClick={compileDocument}
            disabled={!content.trim() || !isConnected}
          >
            立即编译
          </Button>
        </div>
      );
    }

    return (
      <div
        ref={svgContainerRef}
        style={{
          background: '#fff',
          minHeight: 600,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: 20,
          transform: `scale(${scale / 100})`,
          transformOrigin: 'top center',
          overflow: 'auto'
        }}
      >
        <iframe
          src={`data:application/pdf;base64,${compiledPDF}`}
          style={{
            width: '100%',
            height: '800px',
            border: 'none',
            borderRadius: '4px'
          }}
          title="PDF预览"
        />
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
        {/* 连接状态和控制 */}
        <Space size="small">
          <Badge
            status={isConnected ? 'success' : 'error'}
            text={isConnected ? '已连接' : '未连接'}
          />
          <Divider type="vertical" />
          <Tooltip title="自动编译">
            <Switch
              size="small"
              checked={autoCompileEnabled}
              onChange={setAutoCompileEnabled}
              checkedChildren={<PlayCircleOutlined />}
              unCheckedChildren={<PauseCircleOutlined />}
            />
          </Tooltip>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={isCompiling}
            disabled={!isConnected}
          >
            编译
          </Button>
        </Space>

        {/* 缩放控制 */}
        <Space size="small">
          <Button
            size="small"
            icon={<ZoomOutOutlined />}
            onClick={handleZoomOut}
            disabled={scale <= 25}
          />
          <Slider
            min={25}
            max={300}
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
            disabled={scale >= 300}
          />
          <Text style={{ fontSize: 12, minWidth: 40, textAlign: 'center' }}>
            {scale}%
          </Text>
          <Button
            size="small"
            onClick={handleResetZoom}
          >
            重置
          </Button>
        </Space>

        {/* 操作按钮 */}
        <Space size="small">
          <Tooltip title="全屏预览">
            <Button
              size="small"
              icon={<FullscreenOutlined />}
              onClick={handleFullscreen}
              disabled={!compiledPDF}
            />
          </Tooltip>

          <Tooltip title="下载PDF">
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!compiledPDF}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 预览内容区域 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        background: '#f0f0f0'
      }}>
        {renderPDFContent()}
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
          <Space size={8}>
            {isConnected ? <WifiOutlined /> : <DisconnectOutlined />}
            <span>
              {isCompiling ? '编译中...' : compiledPDF ? 'PDF预览就绪' : '等待编译'}
            </span>
            {autoCompileEnabled && <Badge status="processing" text="自动" />}
          </Space>
        </div>
        <div>
          {lastCompileTime && `最后编译: ${lastCompileTime.toLocaleTimeString()}`}
        </div>
      </div>
    </div>
  );
};

export default RealTypstPreview;
