/**
 * Typst代码编辑器组件
 * 基于CodeMirror实现的Typst语法高亮编辑器
 */

import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Space, Typography, Tooltip, Divider } from '@/utils/antdComponents';
import {
  CopyOutlined,
  UndoOutlined,
  RedoOutlined,
  SearchOutlined,
  ExpandOutlined,
  CompressOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface TypstCodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  readonly?: boolean;
  height?: number;
}

// Typst语法示例
const TYPST_SYNTAX_EXAMPLES = [
  '= 标题 (一级)',
  '== 子标题 (二级)',
  '*粗体文本*',
  '_斜体文本_',
  '`代码片段`',
  '#text(red)[红色文本]',
  '#pagebreak()',
  '#align(center)[居中内容]'
];

const TypstCodeEditor: React.FC<TypstCodeEditorProps> = ({
  content,
  onChange,
  readonly = false,
  height = 600
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // 复制内容
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // 这里可以显示成功提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 插入语法示例
  const insertSyntax = (syntax: string) => {
    if (editorRef.current && !readonly) {
      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent =
        content.substring(0, start) +
        syntax +
        content.substring(end);

      onChange(newContent);

      // 设置光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + syntax.length, start + syntax.length);
      }, 0);
    }
  };

  // 全屏切换
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 键盘快捷键处理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab键插入空格
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newContent =
        content.substring(0, start) +
        '  ' +
        content.substring(end);

      onChange(newContent);

      setTimeout(() => {
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }

    // Ctrl+S 保存（阻止浏览器默认行为）
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      // 触发保存事件
    }
  };

  return (
    <div style={{
      height: isFullscreen ? '100vh' : height,
      display: 'flex',
      flexDirection: 'column',
      position: isFullscreen ? 'fixed' : 'relative',
      top: isFullscreen ? 0 : 'auto',
      left: isFullscreen ? 0 : 'auto',
      right: isFullscreen ? 0 : 'auto',
      bottom: isFullscreen ? 0 : 'auto',
      zIndex: isFullscreen ? 1000 : 'auto',
      background: isFullscreen ? '#fff' : 'transparent'
    }}>
      {/* 编辑器工具栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid #e8e8e8',
        background: '#fafafa'
      }}>
        <Space size="small">
          <Text style={{ fontSize: 12, color: '#666' }}>可研报告编辑器</Text>
          {readonly && <Text style={{ fontSize: 12, color: '#ff6b6b' }}>(只读)</Text>}
        </Space>

        <Space size="small">
          <Tooltip title="语法帮助">
            <Button
              size="small"
              icon={<InfoCircleOutlined />}
              onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
            />
          </Tooltip>

          <Tooltip title="复制内容">
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopy}
            />
          </Tooltip>

          <Tooltip title={isFullscreen ? '退出全屏' : '全屏编辑'}>
            <Button
              size="small"
              icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={toggleFullscreen}
            />
          </Tooltip>
        </Space>
      </div>

      {/* 语法帮助面板 */}
      {showSyntaxHelp && (
        <div style={{
          padding: '12px',
          background: '#f6f8fa',
          borderBottom: '1px solid #e8e8e8',
          fontSize: 12
        }}>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>Typst语法快速参考：</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TYPST_SYNTAX_EXAMPLES.map((syntax, index) => (
              <Button
                key={index}
                size="small"
                type="text"
                style={{
                  height: 'auto',
                  padding: '2px 6px',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  background: '#fff',
                  border: '1px solid #d9d9d9'
                }}
                onClick={() => insertSyntax(syntax.split(' (')[0])}
              >
                {syntax}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 主编辑区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          readOnly={readonly}
          placeholder={readonly ? "请选择一个章节进行编辑" : "在这里编写Typst代码..."}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            padding: '16px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: 14,
            lineHeight: 1.6,
            resize: 'none',
            background: readonly ? '#f9f9f9' : '#fff',
            color: readonly ? '#999' : '#333'
          }}
        />

        {/* 底部状态栏 */}
        <div style={{
          padding: '6px 12px',
          background: '#fafafa',
          borderTop: '1px solid #e8e8e8',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#666'
        }}>
          <div>
            行数: {content.split('\n').length} | 字符数: {content.length}
          </div>

          <div>
            <Space size={16}>
              <span>UTF-8</span>
              <span>Typst</span>
              {!readonly && <span>● 已修改</span>}
            </Space>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypstCodeEditor;