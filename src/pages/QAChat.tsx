/**
 * QA对话页面组件
 * 基于博创电力AI的对话系统设计，提供专业的AI问答功能
 * 支持实时对话、多轮问答、文档上下文理解
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Avatar,
  List,
  Spin,
  Empty,
  Divider,
  Tag,
  Alert,
  Row,
  Col,
} from '@/utils/antdComponents';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  ClearOutlined,
  ReloadOutlined,
  FileTextOutlined,
  StarOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { photovoltaicAIService } from '@/services/photovoltaicAiService';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  references?: string[];
  loading?: boolean;
}

const QAChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectContext, setProjectContext] = useState(photovoltaicAIService.getCachedInput());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const configReady = Boolean(photovoltaicAIService.getConfig().apiKey);
  const normativeReferences = ['GB50009-2012', 'GB50797-2012', 'GB50017-2017'];

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const refreshProjectContext = () => {
    setProjectContext(photovoltaicAIService.getCachedInput());
  };

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      loading: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const config = photovoltaicAIService.getConfig();
      if (!config.apiKey) {
        throw new Error('MiniMax API 尚未配置，请前往系统设置填写密钥');
      }

      const aiResponse = await photovoltaicAIService.askExpert(userMessage.content);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? {
                ...msg,
                content: aiResponse.content,
                loading: false,
                references: normativeReferences
              }
            : msg
        )
      );
      refreshProjectContext();
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: (error as Error).message || '抱歉，AI助手暂时无法回应，请稍后重试。', loading: false }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  // 清空对话
  const handleClear = () => {
    setMessages([]);
  };

  // 处理快捷输入
  const handleQuickInput = (text: string) => {
    setInputValue(text);
  };

  // 快捷问题建议
  const quickQuestions = [
    '冬季施工需要重点控制哪些焊接与混凝土措施？',
    '如何按照GB50797-2012完善结构设计描述？',
    '请给出项目投资回收期和收益率估算思路。',
    '光伏组件选型时需要关注哪些荷载及安全等级参数？'
  ];

  return (
    <div className="chat-page-container qa-chat-container">
      <Row gutter={24} style={{ height: '100%' }}>
        {/* 左侧：对话区域 */}
        <Col span={18} style={{ height: '100%' }}>
          <Card
            title={
              <Space>
                <RobotOutlined style={{ color: '#1677ff' }} />
                MiniMax 光伏可研助手
                <Tag color={configReady ? 'green' : 'orange'}>
                  {configReady ? '已连接' : '待配置'}
                </Tag>
              </Space>
            }
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} size="small" onClick={refreshProjectContext}>
                  同步项目
                </Button>
                <Button icon={<ClearOutlined />} size="small" onClick={handleClear}>
                  清空
                </Button>
              </Space>
            }
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{
              body: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden',
              }
            }}
          >
            {/* 对话消息区域 */}
            <div
              className="message-list-scroll"
              style={{
                flex: 1,
                padding: '16px',
                overflow: 'auto',
              }}
            >
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <Empty
                    image={<RobotOutlined style={{ fontSize: '48px', color: '#1677ff' }} />}
                    description={
                      <div>
                        <Text type="secondary">欢迎使用光伏项目可研助手</Text>
                        <br />
                        <Text type="secondary">聚焦《光伏项目可行性研究报告》撰写</Text>
                      </div>
                    }
                  />
                  <Divider>快速开始</Divider>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {quickQuestions.map((question, index) => (
                      <Button
                        key={index}
                        type="dashed"
                        block
                        onClick={() => handleQuickInput(question)}
                        style={{ textAlign: 'left' }}
                      >
                        {question}
                      </Button>
                    ))}
                  </Space>
                </div>
              ) : (
                <List
                  dataSource={messages}
                  renderItem={(message) => (
                    <List.Item style={{ border: 'none', padding: '12px 0' }}>
                      <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}>
                          {/* 头像 */}
                          <Avatar
                            size={40}
                            icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                            style={{
                              backgroundColor: message.type === 'user' ? '#1677ff' : '#52c41a',
                              flexShrink: 0
                            }}
                          />

                          {/* 消息内容 */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                background: message.type === 'user'
                                  ? 'linear-gradient(135deg, #1677ff, #69c0ff)'
                                  : '#f5f5f5',
                                color: message.type === 'user' ? 'white' : '#333',
                                padding: '12px 16px',
                                borderRadius: '18px',
                                borderTopRightRadius: message.type === 'user' ? '4px' : '18px',
                                borderTopLeftRadius: message.type === 'user' ? '18px' : '4px',
                                wordWrap: 'break-word',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                              }}
                            >
                              {message.loading ? (
                                <Space>
                                  <Spin size="small" />
                                  <Text>AI助手正在思考...</Text>
                                </Space>
                              ) : (
                                <Paragraph
                                  style={{
                                    margin: 0,
                                    color: message.type === 'user' ? 'white' : '#333',
                                    whiteSpace: 'pre-wrap'
                                  }}
                                >
                                  {message.content}
                                </Paragraph>
                              )}
                            </div>

                            {/* 参考资料 */}
                            {message.references && message.references.length > 0 && (
                              <div style={{ marginTop: '8px' }}>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                  参考资料：
                                </Text>
                                <Space wrap style={{ marginTop: '4px' }}>
                                  {message.references.map((ref, index) => (
                                    <Tag key={index} icon={<FileTextOutlined />} color="blue">
                                      {ref}
                                    </Tag>
                                  ))}
                                </Space>
                              </div>
                            )}

                            {/* 操作按钮 */}
                            {message.type === 'assistant' && !message.loading && (
                              <div style={{ marginTop: '8px', opacity: 0.7 }}>
                                <Space size="small">
                                  <Button size="small" type="text" icon={<StarOutlined />}>
                                    收藏
                                  </Button>
                                  <Button size="small" type="text" icon={<ShareAltOutlined />}>
                                    分享
                                  </Button>
                                </Space>
                              </div>
                            )}

                            {/* 时间戳 */}
                            <div style={{
                              marginTop: '4px',
                              textAlign: message.type === 'user' ? 'right' : 'left'
                            }}>
                              <Text type="secondary" style={{ fontSize: '11px' }}>
                                {message.timestamp.toLocaleTimeString()}
                              </Text>
                            </div>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div style={{
              padding: '16px',
              borderTop: '1px solid #f0f0f0',
              background: '#fafafa'
            }}>
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="输入您的问题，支持光伏技术方案、施工措施、投资分析等专业咨询..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  style={{
                    resize: 'none',
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0,
                  }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  loading={loading}
                  disabled={!inputValue.trim()}
                  style={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    height: 'auto',
                  }}
                >
                  发送
                </Button>
              </Space.Compact>
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  按 Enter 发送消息，Shift + Enter 换行
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* 右侧：功能面板 */}
        <Col span={6} style={{ height: '100%' }}>
          <Space direction="vertical" style={{ width: '100%', height: '100%' }}>
            <Card title="项目上下文" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">项目</Text>
                  <Text strong style={{ textAlign: 'right' }}>{projectContext.basic.projectName}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">地点/规模</Text>
                  <Text strong>{projectContext.basic.location} / {projectContext.basic.capacityKw}kW</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">施工季节</Text>
                  <Text strong>{projectContext.construction.season}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">钢材/防腐</Text>
                  <Text strong>{projectContext.construction.steelType} / {projectContext.construction.antiCorrosion}</Text>
                </div>
              </Space>
            </Card>

            <Card title="行业规范" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  type="info"
                  showIcon
                  description="回答内容默认引用以下强制性标准"
                />
                <Space wrap>
                  {normativeReferences.map(ref => (
                    <Tag key={ref} icon={<FileTextOutlined />} color="blue">
                      {ref}
                    </Tag>
                  ))}
                </Space>
              </Space>
            </Card>

            <Card title="高频咨询" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                {quickQuestions.map((question, index) => (
                  <Button key={index} type="dashed" block size="small" onClick={() => handleQuickInput(question)}>
                    {question}
                  </Button>
                ))}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default QAChat;
