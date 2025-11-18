/**
 * 最近对话页面组件
 * 基于博创电力AI的历史对话管理功能
 * 需要登录验证，支持微信扫码和手机号登录
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Typography,
  Space,
  Avatar,
  Tag,
  Empty,
  Modal,
  Row,
  Col,
  QRCode,
  Input,
  Tabs,
  Form,
  Divider,
} from '@/utils/antdComponents';
import {
  MessageOutlined,
  DeleteOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  WechatOutlined,
  MobileOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  lastUpdateTime: string;
  category: 'qa' | 'standard' | 'calculation' | 'policy';
}

const RecentChat: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(false);

  // 模拟登录状态检查
  useEffect(() => {
    const checkLoginStatus = () => {
      // 实际项目中这里应该检查token或调用API
      const token = localStorage.getItem('user_token');
      setIsLoggedIn(!!token);

      if (!token) {
        setLoginModalVisible(true);
      } else {
        fetchChatHistory();
      }
    };

    checkLoginStatus();
  }, []);

  // 获取对话历史
  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockHistory: ChatHistory[] = [
        {
          id: '1',
          title: '建筑施工安全规范咨询',
          lastMessage: '感谢您的详细回答，对施工安全有了更深入的了解',
          messageCount: 12,
          lastUpdateTime: '2024-01-20 14:30:00',
          category: 'qa',
        },
        {
          id: '2',
          title: '工程造价计算方法',
          lastMessage: '请帮我计算一下这个项目的预算成本',
          messageCount: 8,
          lastUpdateTime: '2024-01-19 16:45:00',
          category: 'calculation',
        },
        {
          id: '3',
          title: '最新建筑行业政策查询',
          lastMessage: '关于绿色建筑认证的最新政策有什么变化？',
          messageCount: 5,
          lastUpdateTime: '2024-01-18 09:20:00',
          category: 'policy',
        },
      ];

      setChatHistory(mockHistory);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  // 微信登录
  const handleWechatLogin = () => {
    // 模拟登录成功
    setTimeout(() => {
      localStorage.setItem('user_token', 'mock_token');
      setIsLoggedIn(true);
      setLoginModalVisible(false);
      fetchChatHistory();
    }, 2000);
  };

  // 手机号登录
  const handleMobileLogin = (values: any) => {
    // 模拟登录成功
    setTimeout(() => {
      localStorage.setItem('user_token', 'mock_token');
      setIsLoggedIn(true);
      setLoginModalVisible(false);
      fetchChatHistory();
    }, 1000);
  };

  // 获取分类标签
  const getCategoryTag = (category: ChatHistory['category']) => {
    const categoryMap = {
      qa: { color: 'blue', text: 'AI问答' },
      standard: { color: 'green', text: '标准规范' },
      calculation: { color: 'orange', text: '工程计算' },
      policy: { color: 'purple', text: '政策咨询' },
    };
    return categoryMap[category];
  };

  // 登录表单
  const LoginForm = () => (
    <Modal
      title="登录以查看历史对话"
      open={loginModalVisible}
      footer={null}
      closable={false}
      width={400}
    >
      <Tabs defaultActiveKey="qrcode" centered>
        <TabPane
          tab={
            <Space>
              <WechatOutlined />
              扫码登录
            </Space>
          }
          key="qrcode"
        >
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <QRCode
              value="https://example.com/wechat-login"
              size={200}
              style={{ marginBottom: '16px' }}
            />
            <div>
              <Text type="secondary">使用微信扫码登录</Text>
              <br />
              <Button type="link" onClick={handleWechatLogin}>
                模拟登录成功
              </Button>
            </div>
          </div>
        </TabPane>

        <TabPane
          tab={
            <Space>
              <MobileOutlined />
              手机登录
            </Space>
          }
          key="mobile"
        >
          <Form onFinish={handleMobileLogin} layout="vertical">
            <Form.Item
              name="mobile"
              label="手机号"
              rules={[{ required: true, message: '请输入手机号' }]}
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>

            <Form.Item
              name="code"
              label="验证码"
              rules={[{ required: true, message: '请输入验证码' }]}
            >
              <Row gutter={8}>
                <Col span={16}>
                  <Input placeholder="请输入验证码" />
                </Col>
                <Col span={8}>
                  <Button type="dashed" block>
                    获取验证码
                  </Button>
                </Col>
              </Row>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>

      <Divider />
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#999' }}>
        <Text type="secondary">
          登录即表示同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a>
        </Text>
      </div>
    </Modal>
  );

  if (!isLoggedIn) {
    return (
      <div>
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Empty
            image={<UserOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
            description="请先登录以查看历史对话记录"
          >
            <Button type="primary" onClick={() => setLoginModalVisible(true)}>
              立即登录
            </Button>
          </Empty>
        </Card>
        <LoginForm />
      </div>
    );
  }

  return (
    <div className="recent-chat-container">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          最近对话
        </Title>
        <Text type="secondary">
          查看和管理您的历史对话记录
        </Text>
      </div>

      <Card>
        {chatHistory.length === 0 ? (
          <Empty description="暂无对话记录" />
        ) : (
          <List
            loading={loading}
            itemLayout="horizontal"
            dataSource={chatHistory}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="view" type="link" icon={<EyeOutlined />}>
                    查看
                  </Button>,
                  <Button key="delete" type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={48}
                      icon={<MessageOutlined />}
                      style={{ backgroundColor: '#1677ff' }}
                    />
                  }
                  title={
                    <Space>
                      {item.title}
                      <Tag color={getCategoryTag(item.category).color}>
                        {getCategoryTag(item.category).text}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text ellipsis style={{ maxWidth: '500px' }}>
                        {item.lastMessage}
                      </Text>
                      <Space>
                        <ClockCircleOutlined style={{ color: '#999' }} />
                        <Text type="secondary">{item.lastUpdateTime}</Text>
                        <Text type="secondary">•</Text>
                        <Text type="secondary">{item.messageCount} 条消息</Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default RecentChat;