/**
 * 智能体对话页面
 * 基于现代AI问答系统设计模式的完整实现
 * 采用6:18专业比例布局，支持流式消息和多对话管理
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Select,
  Space,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  Collapse,
  Empty,
  Spin,
  Tag,
  Divider,
  App,
} from '@/utils/antdComponents';
import {
  SendOutlined,
  PlusOutlined,
  RobotOutlined,
  UserOutlined,
  SettingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { ragflowApi } from '@/services/ragflowApi';
import type { Agent, Chat, Message, Reference } from '@/types/ragflow';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface AgentChatParams extends Record<string, string | undefined> {
  agentId?: string;
  chatId?: string;
}

const AgentChat: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams<AgentChatParams>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { message } = App.useApp();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [inputText, setInputText] = useState('');

  // 加载数据
  useEffect(() => {
    fetchAgents();
    if (params.agentId) {
      fetchChats(params.agentId);
      if (params.chatId) {
        fetchMessages(params.chatId);
      }
    }
  }, [params.agentId, params.chatId]);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await ragflowApi.getAgents(1, 20);
      setAgents(response.data.data);

      if (params.agentId) {
        const agent = response.data.data.find(a => a.id === params.agentId);
        setCurrentAgent(agent || null);
      }
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      message.error('获取智能体列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async (agentId: string) => {
    try {
      const response = await ragflowApi.getChats(1, 50);
      const agentChats = response.data.data.filter(chat => chat.assistant_id === agentId);
      setChats(agentChats);

      if (params.chatId) {
        const chat = agentChats.find(c => c.id === params.chatId);
        setCurrentChat(chat || null);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      message.error('获取对话列表失败');
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await ragflowApi.getMessages(chatId, 1, 100);
      setMessages(response.data.data.reverse()); // 按时间正序显示
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      message.error('获取消息列表失败');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAgentChange = (agentId: string) => {
    navigate(`/agent-chat/${agentId}`);
  };

  const handleChatChange = (chatId: string) => {
    navigate(`/agent-chat/${params.agentId}/${chatId}`);
  };

  const createNewChat = async () => {
    if (!currentAgent) {
      message.warning('请先选择智能体');
      return;
    }

    try {
      const response = await ragflowApi.createChat({
        name: `新对话 ${new Date().toLocaleString()}`,
        assistant_id: currentAgent.id,
      });

      const newChat = response.data;
      setChats([newChat, ...chats]);
      navigate(`/agent-chat/${currentAgent.id}/${newChat.id}`);
      message.success('创建新对话成功');
    } catch (error) {
      console.error('Failed to create chat:', error);
      message.error('创建对话失败');
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentChat || sending) return;

    const userMessage = inputText.trim();
    setInputText('');
    setSending(true);

    // 添加用户消息到界面
    const newUserMessage: Message = {
      id: Date.now().toString(),
      conversation_id: currentChat.id,
      role: 'user',
      content: userMessage,
      created_time: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newUserMessage]);

    // 添加AI消息占位符
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      conversation_id: currentChat.id,
      role: 'assistant',
      content: '',
      created_time: new Date().toISOString(),
    };

    setMessages(prev => [...prev, aiMessage]);

    try {
      // 发送流式消息
      await ragflowApi.sendMessageStream(
        {
          conversation_id: currentChat.id,
          message: userMessage,
          stream: true,
        },
        (chunk: string) => {
          // 实时更新AI消息内容
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        },
        (finalMessage: string) => {
          // 消息完成
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: finalMessage }
              : msg
          ));
          setSending(false);
        },
        (error) => {
          console.error('Stream error:', error);
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId
              ? { ...msg, content: '抱歉，发生了错误，请重试。' }
              : msg
          ));
          setSending(false);
          message.error('发送消息失败');
        }
      );
    } catch (error) {
      setSending(false);
      message.error('发送消息失败');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (msg: Message) => {
    const isUser = msg.role === 'user';

    return (
      <div key={msg.id} className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-assistant'}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          {!isUser && (
            <Avatar
              size={32}
              icon={<RobotOutlined />}
              style={{
                backgroundColor: '#52c41a',
                flexShrink: 0,
              }}
            />
          )}

          <div style={{ flex: 1, maxWidth: isUser ? '80%' : '100%' }}>
            <div className="chat-message-content" style={{
              padding: '12px 16px',
              borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              backgroundColor: isUser ? '#1677ff' : '#f5f5f5',
              color: isUser ? 'white' : 'var(--color-text)',
              wordWrap: 'break-word',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}>
              <Paragraph
                style={{
                  margin: 0,
                  color: isUser ? 'white' : 'var(--color-text)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {msg.content || (sending && !isUser ? '正在思考...' : '')}
              </Paragraph>

              {/* 引用来源 */}
              {msg.reference && msg.reference.length > 0 && (
                <Collapse size="small" style={{ marginTop: '8px' }}>
                  <Panel header={`引用来源 (${msg.reference.length})`} key="reference">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {msg.reference.map((ref: Reference) => (
                        <Card key={ref.id} size="small" style={{ fontSize: '12px' }}>
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text strong>{ref.document_name}</Text>
                              <Tag color="blue">相似度: {(ref.similarity * 100).toFixed(1)}%</Tag>
                            </div>
                            <Text type="secondary">
                              {ref.content.length > 100 ? `${ref.content.substring(0, 100)}...` : ref.content}
                            </Text>
                          </Space>
                        </Card>
                      ))}
                    </Space>
                  </Panel>
                </Collapse>
              )}
            </div>

            <div style={{
              marginTop: '4px',
              textAlign: isUser ? 'right' : 'left',
            }}>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                {new Date(msg.created_time).toLocaleTimeString()}
              </Text>
            </div>
          </div>

          {isUser && (
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{
                backgroundColor: '#1677ff',
                flexShrink: 0,
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ height: 'calc(100vh - 112px)', display: 'flex' }}>
      <Row style={{ width: '100%', height: '100%' }} gutter={24}>
        {/* 左侧配置面板 (6栏) */}
        <Col xs={24} lg={6} style={{ height: '100%' }}>
          <Space direction="vertical" style={{ width: '100%', height: '100%' }} size="large">
            {/* 对话配置 */}
            <Card title="对话配置" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>选择智能体</Text>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="请选择智能体"
                    value={currentAgent?.id}
                    onChange={handleAgentChange}
                    loading={loading}
                  >
                    {agents.map(agent => (
                      <Option key={agent.id} value={agent.id}>
                        <Space>
                          <Avatar size="small" icon={<RobotOutlined />} />
                          {agent.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>对话列表</Text>
                    <Tooltip title="新建对话">
                      <Button
                        type="text"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={createNewChat}
                        disabled={!currentAgent}
                      />
                    </Tooltip>
                  </div>
                  <Select
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="选择或创建对话"
                    value={currentChat?.id}
                    onChange={handleChatChange}
                  >
                    {chats.map(chat => (
                      <Option key={chat.id} value={chat.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Text ellipsis style={{ maxWidth: '150px' }}>
                            {chat.name}
                          </Text>
                          <Badge count={chat.message_count} size="small" />
                        </div>
                      </Option>
                    ))}
                  </Select>
                </div>
              </Space>
            </Card>

            {/* 智能体信息 */}
            {currentAgent && (
              <Card title="智能体信息" size="small">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Avatar
                      size={48}
                      src={currentAgent.avatar}
                      icon={<RobotOutlined />}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                    <div style={{ marginTop: '8px' }}>
                      <Text strong>{currentAgent.name}</Text>
                    </div>
                  </div>

                  <Divider style={{ margin: '8px 0' }} />

                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      描述
                    </Text>
                    <Paragraph
                      style={{ marginTop: '4px', fontSize: '13px' }}
                      ellipsis={{ rows: 3, expandable: true }}
                    >
                      {currentAgent.description || '暂无描述'}
                    </Paragraph>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      创建时间
                    </Text>
                    <div style={{ marginTop: '4px' }}>
                      <Text style={{ fontSize: '13px' }}>
                        {new Date(currentAgent.created_time).toLocaleString()}
                      </Text>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      关联知识库
                    </Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color="blue">{currentAgent.dataset_ids?.length || 0} 个知识库</Tag>
                    </div>
                  </div>
                </Space>
              </Card>
            )}
          </Space>
        </Col>

        {/* 右侧对话主区 (18栏) */}
        <Col xs={24} lg={18} style={{ height: '100%' }}>
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg-container)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {/* 对话标题栏 */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--color-border-secondary)',
              backgroundColor: 'var(--color-bg-elevated)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {currentChat?.name || '选择或创建对话'}
                  </Title>
                  {currentAgent && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      与 {currentAgent.name} 的对话
                    </Text>
                  )}
                </div>

                <Space>
                  <Tooltip title="清空对话">
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      disabled={!currentChat}
                    />
                  </Tooltip>
                  <Tooltip title="对话设置">
                    <Button
                      type="text"
                      icon={<SettingOutlined />}
                      disabled={!currentChat}
                    />
                  </Tooltip>
                </Space>
              </div>
            </div>

            {/* 消息列表区域 */}
            <div
              className="message-list-scroll"
              style={{
                flex: 1,
                padding: '24px',
                overflowY: 'auto',
                backgroundColor: '#fafafa',
              }}
            >
              {!currentChat ? (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="请选择智能体和对话开始聊天"
                  />
                </div>
              ) : messages.length === 0 ? (
                <div style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无消息，开始你们的对话吧"
                  />
                </div>
              ) : (
                <>
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* 消息输入区域 */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--color-border-secondary)',
              backgroundColor: 'var(--color-bg-elevated)',
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入消息... (Enter发送，Shift+Enter换行)"
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  disabled={!currentChat || sending}
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={sending ? <Spin size="small" /> : <SendOutlined />}
                  onClick={sendMessage}
                  disabled={!currentChat || !inputText.trim() || sending}
                  size="large"
                >
                  {sending ? '发送中' : '发送'}
                </Button>
              </div>

              {inputText.length > 0 && (
                <div style={{ marginTop: '8px', textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {inputText.length} 字符
                  </Text>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default AgentChat;