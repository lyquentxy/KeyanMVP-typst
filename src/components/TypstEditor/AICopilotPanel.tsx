import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  useMessage
} from '@/utils/antdComponents';
import {
  CopyOutlined,
  RobotOutlined,
  SendOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  CommentOutlined
} from '@ant-design/icons';
import { CHAPTER_KEYWORDS, CHAPTER_LABELS } from '@/constants/chapterKeywords';
import { photovoltaicAIService } from '@/services/photovoltaicAiService';
import type { ChapterType, PhotovoltaicReportInput } from '@/types/aiModule';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

interface DocumentSection {
  id: string;
  title: string;
  content: string;
  type: string;
}

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: 'thinking' | 'done' | 'error';
  reasoning?: string;
  actionLabel?: string;
  applied?: boolean;
}

interface QuickAction {
  key: 'draft' | 'polish' | 'qa';
  label: string;
  description: string;
}

interface AICopilotPanelProps {
  documentTitle: string;
  currentSection?: DocumentSection;
  isCompiling: boolean;
  onApplyContent: (content: string) => void;
}

const quickActions: QuickAction[] = [
  {
    key: 'draft',
    label: '生成章节草稿',
    description: '调用MiniMax生成符合规范的Typst段落'
  },
  {
    key: 'polish',
    label: '润色当前章节',
    description: 'AI会分析并优化当前章节'
  },
  {
    key: 'qa',
    label: '快速问答',
    description: '就规范或设计向专家提问'
  }
];

const formatTime = (iso: string) => new Date(iso).toLocaleTimeString();

const inferChapterType = (section?: DocumentSection): ChapterType | null => {
  if (!section) {
    return null;
  }
  const match = Object.entries(CHAPTER_KEYWORDS).find(([, keyword]) => section.title.includes(keyword));
  return match ? (match[0] as ChapterType) : null;
};

const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  documentTitle,
  currentSection,
  isCompiling,
  onApplyContent
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: `你好，我是你的Typst AI助手。选中左侧章节后可以让我生成或润色内容，也可以直接聊天提问。`,
    timestamp: new Date().toISOString(),
    status: 'done'
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messageApi, contextHolder] = useMessage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentChapter = useMemo(() => inferChapterType(currentSection), [currentSection]);

  const cachedInput: PhotovoltaicReportInput = useMemo(
    () => photovoltaicAIService.getCachedInput(),
    []
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const appendMessages = useCallback((items: CopilotMessage[]) => {
    setMessages(prev => [...prev, ...items]);
  }, []);

  const updateMessage = useCallback((id: string, payload: Partial<CopilotMessage>) => {
    setMessages(prev => prev.map(msg => (msg.id === id ? { ...msg, ...payload } : msg)));
  }, []);

  const runAskExpert = useCallback(async (question: string, actionLabel?: string) => {
    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString()
    };
    const assistantId = `assistant-${Date.now()}`;
    const assistantPlaceholder: CopilotMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'thinking',
      actionLabel
    };

    appendMessages([userMessage, assistantPlaceholder]);
    setIsProcessing(true);
    try {
      const result = await photovoltaicAIService.askExpert(question);
      updateMessage(assistantId, {
        status: 'done',
        content: result.content,
        reasoning: result.reasoning
      });
    } catch (error) {
      updateMessage(assistantId, {
        status: 'error',
        content: (error as Error).message || '调用AI失败'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [appendMessages, updateMessage]);

  const runChapterGeneration = useCallback(async (mode: 'draft' | 'polish') => {
    if (!currentSection || currentSection.type !== 'chapter') {
      messageApi.warning('请先在左侧选择一个章节');
      return;
    }

    const chapterType = currentChapter ?? 'technical_solution';
    const actionLabel = mode === 'draft' ? 'MiniMax · 章节生成' : 'MiniMax · 章节润色';
    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: mode === 'draft' ? `生成 ${currentSection.title} 的全新章节内容` : `润色 ${currentSection.title}`,
      timestamp: new Date().toISOString()
    };
    const assistantId = `assistant-${Date.now()}`;
    const assistantPlaceholder: CopilotMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'thinking',
      actionLabel
    };

    appendMessages([userMessage, assistantPlaceholder]);
    setIsProcessing(true);
    try {
      if (mode === 'draft') {
        const generation = await photovoltaicAIService.generateChapter({
          chapter: chapterType,
          input: cachedInput,
          customContext: currentSection.content
        });
        updateMessage(assistantId, {
          status: 'done',
          content: generation.content,
          reasoning: generation.reasoning
        });
      } else {
        const polishPrompt = `请以Typst格式润色以下章节，使其结构清晰并突出关键指标：\n${currentSection.content}`;
        const result = await photovoltaicAIService.askExpert(polishPrompt);
        updateMessage(assistantId, {
          status: 'done',
          content: result.content,
          reasoning: result.reasoning
        });
      }
    } catch (error) {
      updateMessage(assistantId, {
        status: 'error',
        content: (error as Error).message || 'AI调用失败'
      });
    } finally {
      setIsProcessing(false);
    }
  }, [appendMessages, cachedInput, currentChapter, currentSection, messageApi, updateMessage]);

  const handleSend = async () => {
    if (!inputValue.trim()) {
      return;
    }
    await runAskExpert(inputValue.trim());
    setInputValue('');
  };

  const handleQuickAction = async (action: QuickAction) => {
    if (action.key === 'draft') {
      await runChapterGeneration('draft');
    } else if (action.key === 'polish') {
      await runChapterGeneration('polish');
    } else {
      const question = currentSection
        ? `【${currentSection.title}】${action.description}`
        : action.description;
      await runAskExpert(`请针对光伏可研报告回答：${question}`, `MiniMax · ${action.label}`);
    }
  };

  const handleApply = (id: string, content: string) => {
    onApplyContent(content);
    updateMessage(id, { applied: true });
    messageApi.success('已将AI内容写入当前章节');
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      messageApi.success('内容已复制到剪贴板');
    } catch {
      messageApi.error('复制失败，请手动选择文本');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {contextHolder}
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space direction="vertical" size={6}>
          <Space align="center">
            <RobotOutlined style={{ color: '#1677ff' }} />
            <Text strong>MiniMax Copilot</Text>
            <Tag color={isCompiling ? 'processing' : 'blue'}>
              {isCompiling ? '预览编译中' : '预览就绪'}
            </Tag>
          </Space>
          <Text type="secondary" style={{ display: 'block' }}>
            当前文档：{documentTitle}
          </Text>
          <Space size={8} wrap>
            <Tag bordered={false} color="default">
              {currentSection ? currentSection.title : '未选择章节'}
            </Tag>
            {currentChapter && (
              <Tag bordered={false} color="success">
                {CHAPTER_LABELS[currentChapter]}
              </Tag>
            )}
          </Space>
        </Space>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          <Text type="secondary">预览参数</Text>
          <Card
            size="small"
            bodyStyle={{ padding: 12 }}
            style={{ borderRadius: 10, background: '#f9fbff' }}
          >
            <Space direction="vertical" size={4}>
              <Text type="secondary">实时编译</Text>
              <Text strong>{isCompiling ? '运行中' : '自动刷新'}</Text>
              <Text type="secondary">章节同步</Text>
              <Text strong>{currentSection ? '已绑定当前章节' : '等待选择章节'}</Text>
            </Space>
          </Card>
        </Space>
      </div>

      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5' }}>
        <Space size={[8, 8]} wrap>
          {quickActions.map(action => (
            <Tooltip title={action.description} key={action.key}>
              <Button
                size="small"
                icon={action.key === 'qa' ? <CommentOutlined /> : action.key === 'draft' ? <ThunderboltOutlined /> : <BulbOutlined />}
                onClick={() => handleQuickAction(action)}
              >
                {action.label}
              </Button>
            </Tooltip>
          ))}
        </Space>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '16px',
          background: '#f9f9fb'
        }}
      >
        {messages.length === 0 ? (
          <Empty description="暂无对话，试着向AI提问吧" />
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              style={{
                marginBottom: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }}
            >
              <Text type="secondary" style={{ fontSize: 12, marginBottom: 4 }}>
                {message.role === 'assistant' ? 'AI助手' : '我'} · {formatTime(message.timestamp)}
              </Text>
              <div
                style={{
                  maxWidth: '90%',
                  borderRadius: message.role === 'assistant'
                    ? '16px 16px 16px 4px'
                    : '16px 16px 4px 16px',
                  background: message.role === 'assistant' ? '#fff' : '#1677ff',
                  color: message.role === 'assistant' ? '#111' : '#fff',
                  padding: 14,
                  boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                  width: 'fit-content'
                }}
              >
                {message.actionLabel && (
                  <Tag
                    color={message.role === 'assistant' ? 'blue' : 'gold'}
                    style={{ marginBottom: 8 }}
                  >
                    {message.actionLabel}
                  </Tag>
                )}
                {message.status === 'thinking' ? (
                  <Space>
                    <Spin size="small" />
                    <Text style={{ color: message.role === 'assistant' ? '#555' : '#fff' }}>
                      AI 正在思考...
                    </Text>
                  </Space>
                ) : (
                  <Paragraph
                    style={{
                      margin: 0,
                      color: message.role === 'assistant' ? '#111' : '#fff',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {message.content}
                  </Paragraph>
                )}
                {message.reasoning && (
                  <Alert
                    style={{ marginTop: 12 }}
                    type="info"
                    message="AI思考"
                    description={
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                        {message.reasoning}
                      </pre>
                    }
                    showIcon
                  />
                )}
                {message.status === 'error' && (
                  <Alert
                    style={{ marginTop: 12 }}
                    type="error"
                    message="调用失败"
                    description={message.content}
                    showIcon
                  />
                )}
                {message.role === 'assistant' && message.status === 'done' && (
                  <Space size="small" style={{ marginTop: 12, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      onClick={() => handleApply(message.id, message.content)}
                      disabled={!currentSection}
                    >
                      写入章节
                    </Button>
                    <Button
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={() => handleCopy(message.content)}
                    >
                      复制
                    </Button>
                    {message.applied && <Tag color="success">已写入</Tag>}
                  </Space>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
        <Space.Compact style={{ width: '100%' }}>
          <TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            placeholder="向MiniMax提问或让TA生成Typst内容..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={isProcessing}
            onClick={() => void handleSend()}
          >
            发送
          </Button>
        </Space.Compact>
      </div>
    </div>
  );
};

export default AICopilotPanel;
