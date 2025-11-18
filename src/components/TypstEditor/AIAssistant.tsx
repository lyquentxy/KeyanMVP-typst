/**
 * AI智能助手组件
 * 集成RAGFlow智能体，提供章节级别的AI辅助编辑功能
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  List,
  Tag,
  Spin,
  Alert,
  Divider,
  Select,
  Message,
  Tooltip,
  Collapse,
  useMessage
} from '@/utils/antdComponents';
import {
  RobotOutlined,
  SendOutlined,
  EditOutlined,
  BulbOutlined,
  ReloadOutlined,
  SettingOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Panel } = Collapse;

// 智能体类型定义
interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: 'writing' | 'research' | 'format' | 'translate' | 'summary';
  status: 'online' | 'offline' | 'busy';
}

// 对话消息接口
interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: number;
  agentId?: string;
}

// 文档章节接口
interface DocumentSection {
  id: string;
  type: 'cover1' | 'cover2' | 'toc' | 'chapter';
  title: string;
  content: string;
  order: number;
  aiAgent?: string;
}

interface AIAssistantProps {
  currentSection?: DocumentSection;
  onContentUpdate: (content: string) => void;
}

// 预设智能体
const DEFAULT_AGENTS: AIAgent[] = [
  {
    id: 'writer',
    name: '写作助手',
    description: '帮助改进文本表达、语法结构和逻辑组织',
    type: 'writing',
    status: 'online'
  },
  {
    id: 'researcher',
    name: '研究助手',
    description: '提供相关背景资料、数据支持和引用建议',
    type: 'research',
    status: 'online'
  },
  {
    id: 'formatter',
    name: '格式助手',
    description: '优化Typst代码格式、排版布局和样式设计',
    type: 'format',
    status: 'online'
  },
  {
    id: 'translator',
    name: '翻译助手',
    description: '多语言翻译和本地化支持',
    type: 'translate',
    status: 'offline'
  },
  {
    id: 'summarizer',
    name: '总结助手',
    description: '内容总结、提炼要点和生成摘要',
    type: 'summary',
    status: 'online'
  }
];

// AI操作类型
const AI_OPERATIONS = [
  { key: 'improve', label: '改进文本', icon: <EditOutlined /> },
  { key: 'expand', label: '扩展内容', icon: <BulbOutlined /> },
  { key: 'summarize', label: '生成摘要', icon: <MessageOutlined /> },
  { key: 'format', label: '优化格式', icon: <SettingOutlined /> },
  { key: 'translate', label: '翻译文档', icon: <ReloadOutlined /> }
];

const AIAssistant: React.FC<AIAssistantProps> = ({
  currentSection,
  onContentUpdate
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('writer');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [agents] = useState<AIAgent[]>(DEFAULT_AGENTS);
  const [messageApi, contextHolder] = useMessage();

  // 获取当前选中的智能体
  const getCurrentAgent = () => {
    return agents.find(agent => agent.id === selectedAgent);
  };

  // 发送消息给AI
  const sendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: inputMessage,
      timestamp: Date.now(),
      agentId: selectedAgent
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsProcessing(true);

    try {
      // 模拟AI响应 - 在实际应用中这里会调用RAGFlow API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiResponse: ChatMessage = {
        id: `ai_${Date.now()}`,
        type: 'assistant',
        content: generateMockResponse(inputMessage, selectedAgent),
        timestamp: Date.now(),
        agentId: selectedAgent
      };

      setChatMessages(prev => [...prev, aiResponse]);
      messageApi.success('AI助手已回复');
    } catch (error) {
      messageApi.error('AI助手响应失败：' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 生成模拟响应
  const generateMockResponse = (userInput: string, agentId: string): string => {
    const agent = agents.find(a => a.id === agentId);

    switch (agentId) {
      case 'writer':
        return `我是${agent?.name}，我建议优化您的文本表达。基于您的输入"${userInput}"，我可以帮您改进语法结构和逻辑流程。`;
      case 'researcher':
        return `作为${agent?.name}，我为您找到了相关的背景资料。针对"${userInput}"，我建议添加更多的数据支持和学术引用。`;
      case 'formatter':
        return `我是${agent?.name}，我注意到您的Typst代码可以进一步优化。让我帮您改进排版格式和样式设计。`;
      default:
        return `收到您的消息"${userInput}"，我会尽力为您提供帮助。`;
    }
  };

  // 执行快速操作
  const executeQuickOperation = async (operation: string) => {
    if (!currentSection) {
      messageApi.warning('请先选择一个章节');
      return;
    }

    setIsProcessing(true);

    try {
      // 模拟AI处理
      await new Promise(resolve => setTimeout(resolve, 1500));

      let optimizedContent = currentSection.content;

      switch (operation) {
        case 'improve':
          optimizedContent = `${currentSection.content}\n\n// AI改进建议：\n// - 增强逻辑连贯性\n// - 优化表达方式\n// - 补充必要细节`;
          break;
        case 'expand':
          optimizedContent = `${currentSection.content}\n\n// AI扩展内容\n在前述内容基础上，我们可以进一步探讨相关主题...`;
          break;
        case 'format':
          optimizedContent = currentSection.content.replace(/\n\n/g, '\n\n').replace(/^([=]+\s)/, '$1');
          break;
        default:
          break;
      }

      onContentUpdate(optimizedContent);
      messageApi.success('AI操作完成');

      // 添加操作记录到聊天
      const operationMessage: ChatMessage = {
        id: `op_${Date.now()}`,
        type: 'assistant',
        content: `已完成"${AI_OPERATIONS.find(op => op.key === operation)?.label}"操作`,
        timestamp: Date.now(),
        agentId: selectedAgent
      };

      setChatMessages(prev => [...prev, operationMessage]);
    } catch (error) {
      messageApi.error('AI操作失败：' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 清空聊天记录
  const clearChat = () => {
    setChatMessages([]);
    messageApi.info('聊天记录已清空');
  };

  return (
    <>
      {contextHolder}
      <div style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
      {/* AI助手选择 */}
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          选择AI助手：
        </Text>
        <Select
          value={selectedAgent}
          onChange={setSelectedAgent}
          style={{ width: '100%' }}
          placeholder="选择智能体"
        >
          {agents.map(agent => (
            <Select.Option key={agent.id} value={agent.id}>
              <Space>
                <RobotOutlined />
                <span>{agent.name}</span>
                <Tag color={
                  agent.status === 'online' ? 'green' :
                  agent.status === 'busy' ? 'orange' : 'red'
                }>
                  {agent.status === 'online' ? '在线' :
                   agent.status === 'busy' ? '忙碌' : '离线'}
                </Tag>
              </Space>
            </Select.Option>
          ))}
        </Select>

        {getCurrentAgent() && (
          <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
            {getCurrentAgent()?.description}
          </Text>
        )}
      </div>

      <Divider style={{ margin: '12px 0' }} />

      {/* 快速操作 */}
      <Collapse size="small" style={{ marginBottom: 16 }}>
        <Panel header="快速操作" key="1">
          <Space wrap size="small">
            {AI_OPERATIONS.map(operation => (
              <Tooltip key={operation.key} title={operation.label}>
                <Button
                  size="small"
                  icon={operation.icon}
                  onClick={() => executeQuickOperation(operation.key)}
                  loading={isProcessing}
                  disabled={!currentSection}
                >
                  {operation.label}
                </Button>
              </Tooltip>
            ))}
          </Space>

          {!currentSection && (
            <Alert
              message="请先选择一个章节以使用AI快速操作"
              type="info"
              size="small"
              style={{ marginTop: 8 }}
            />
          )}
        </Panel>
      </Collapse>

      {/* 聊天区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8
        }}>
          <Text strong>对话记录</Text>
          <Button size="small" onClick={clearChat} disabled={chatMessages.length === 0}>
            清空
          </Button>
        </div>

        {/* 消息列表 */}
        <div style={{
          flex: 1,
          border: '1px solid #e8e8e8',
          borderRadius: 6,
          padding: 8,
          overflow: 'auto',
          background: '#fafafa',
          marginBottom: 12
        }}>
          {chatMessages.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: '#999'
            }}>
              <Text type="secondary">开始与AI助手对话...</Text>
            </div>
          ) : (
            <List
              dataSource={chatMessages}
              renderItem={(message) => (
                <List.Item style={{ padding: '8px 0', border: 'none' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: messageApi.type === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        maxWidth: '80%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: messageApi.type === 'user' ? '#1677ff' : '#fff',
                        color: messageApi.type === 'user' ? '#fff' : '#333',
                        border: messageApi.type === 'assistant' ? '1px solid #e8e8e8' : 'none'
                      }}>
                        <div style={{ fontSize: 13 }}>{messageApi.content}</div>
                        <div style={{
                          fontSize: 11,
                          opacity: 0.7,
                          marginTop: 4,
                          textAlign: 'right'
                        }}>
                          {new Date(messageApi.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>

        {/* 输入区域 */}
        <div style={{ display: 'flex', gap: 8 }}>
          <TextArea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="输入消息与AI助手对话..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            onPressEnter={(e) => {
              if (e.ctrlKey) {
                sendMessage();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            loading={isProcessing}
            disabled={!inputMessage.trim()}
          >
            发送
          </Button>
        </div>

        <Text type="secondary" style={{ fontSize: 11, marginTop: 4 }}>
          按 Ctrl+Enter 快速发送
        </Text>
      </div>
    </div>
    </>
  );
};

export default AIAssistant;