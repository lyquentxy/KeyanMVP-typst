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
  MoreOutlined,
} from '@ant-design/icons';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      // 模拟AI回复 - 实际项目中这里应该调用RAGFlow API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const aiResponse = `根据您的问题"${userMessage.content}"，我为您提供以下专业建议：

这是一个关于工程建设领域的专业问题。基于相关规范和最佳实践，建议您考虑以下几个方面：

1. **技术规范遵循**：确保符合国家相关标准和行业规范
2. **安全性评估**：进行全面的安全风险评估
3. **成本效益分析**：综合考虑投入产出比
4. **可持续发展**：关注环境影响和长期效益

如需更详细的分析，建议您上传相关文档或提供更多具体信息。`;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: aiResponse, loading: false, references: ['工程建设规范 GB50157-2013', '建筑法规汇编 2023版'] }
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to get AI response:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, content: '抱歉，AI助手暂时无法回应，请稍后重试。', loading: false }
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
    "如何进行工程项目的风险评估？",
    "建筑施工安全规范有哪些要点？",
    "工程造价控制的最佳实践是什么？",
    "绿色建筑认证流程怎么做？",
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
                博创电力 AI 助手
                <Tag color="green">在线</Tag>
              </Space>
            }
            extra={
              <Space>
                <Button icon={<ReloadOutlined />} size="small">
                  刷新
                </Button>
                <Button icon={<ClearOutlined />} size="small" onClick={handleClear}>
                  清空
                </Button>
                <Button icon={<MoreOutlined />} size="small" type="text">
                  更多
                </Button>
              </Space>
            }
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            bodyStyle={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
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
                        <Text type="secondary">欢迎使用博创电力AI助手</Text>
                        <br />
                        <Text type="secondary">专注于工程建设行业的智能问答</Text>
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
                  placeholder="输入您的问题，支持工程建设、规范标准、项目管理等专业咨询..."
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
            {/* 智能提示 */}
            <Card title="智能建议" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                  message="专业领域"
                  description="我擅长工程建设、规范标准、项目管理、安全评估等专业咨询"
                  type="info"
                  showIcon
                  style={{ fontSize: '12px' }}
                />
                <Button type="dashed" block size="small" onClick={() => handleQuickInput("请介绍一下最新的建筑安全规范")}>
                  建筑安全规范
                </Button>
                <Button type="dashed" block size="small" onClick={() => handleQuickInput("工程项目成本控制方法有哪些？")}>
                  成本控制方法
                </Button>
                <Button type="dashed" block size="small" onClick={() => handleQuickInput("如何进行施工质量管理？")}>
                  质量管理
                </Button>
              </Space>
            </Card>

            {/* 会话统计 */}
            <Card title="会话统计" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">消息数量</Text>
                  <Text strong>{messages.length}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">会话时长</Text>
                  <Text strong>
                    {messages.length > 0 ? '5分钟' : '0分钟'}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text type="secondary">AI响应</Text>
                  <Text strong style={{ color: '#52c41a' }}>正常</Text>
                </div>
              </Space>
            </Card>

            {/* 相关功能 */}
            <Card title="相关功能" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block size="small" icon={<FileTextOutlined />}>
                  标准规范搜索
                </Button>
                <Button block size="small" icon={<FileTextOutlined />}>
                  模板下载
                </Button>
                <Button block size="small" icon={<FileTextOutlined />}>
                  项目推荐书
                </Button>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default QAChat;