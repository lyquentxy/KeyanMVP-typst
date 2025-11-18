/**
 * 首页概览组件
 * 展示系统概览、统计数据、快速功能入口
 * 布局：连接状态栏 + 统计卡片组 + 功能卡片组 + 快速开始指南
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Alert,
  Space,
  Typography,
  Progress,
  Tag,
  Divider,
  List,
  Badge,
} from '@/utils/antdComponents';
import {
  DatabaseOutlined,
  FileTextOutlined,
  RobotOutlined,
  MessageOutlined,
  CloudServerOutlined,
  CheckCircleOutlined,
  RightOutlined,
  PlayCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { ragflowApi } from '@/services/ragflowApi';
import type { SystemStats, ServiceStatus } from '@/types/ragflow';

const { Title, Text, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    ragflow_connected: false,
    last_check_time: '',
  });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    dataset_count: 0,
    document_count: 0,
    agent_count: 0,
    chat_count: 0,
    total_chunks: 0,
    total_tokens: 0,
  });

  // 获取服务状态和统计数据
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 并行请求服务状态和统计数据
      const [statusResponse, statsResponse] = await Promise.allSettled([
        ragflowApi.checkConnection(),
        ragflowApi.getSystemStats(),
      ]);

      if (statusResponse.status === 'fulfilled') {
        setServiceStatus(statusResponse.value);
      }

      if (statsResponse.status === 'fulfilled' && statsResponse.value.data) {
        setSystemStats(statsResponse.value.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 快速开始指南数据
  const quickStartItems = [
    {
      title: '开始AI对话',
      description: '与博创电力AI助手进行专业咨询',
      action: () => navigate('/qa'),
      completed: systemStats?.chat_count > 0,
    },
    {
      title: '搜索标准规范',
      description: '查询行业标准和建设规范',
      action: () => navigate('/standard'),
      completed: false,
    },
    {
      title: '工程计算工具',
      description: '使用AI辅助进行工程计算',
      action: () => navigate('/calc'),
      completed: false,
    },
    {
      title: '下载项目模板',
      description: '获取专业的工程项目文档模板',
      action: () => navigate('/template-download'),
      completed: false,
    },
  ];

  const completedSteps = quickStartItems.filter(item => item.completed).length;
  const progressPercent = Math.round((completedSteps / quickStartItems.length) * 100);

  return (
    <div className="page-container fade-in">
      {/* 页面标题 */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          博创电力 AI 系统概览
        </Title>
        <Text type="secondary">
          专注于工程建设行业的AI助手平台，提供智能问答、标准规范、工程计算等专业服务
        </Text>
      </div>

      {/* 服务连接状态栏 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space align="center">
              <CloudServerOutlined
                style={{
                  fontSize: '24px',
                  color: serviceStatus.ragflow_connected ? '#52c41a' : '#ff4d4f',
                }}
              />
              <div>
                <Text strong>RAGFlow服务状态</Text>
                <br />
                <Space>
                  <Badge
                    status={serviceStatus.ragflow_connected ? 'success' : 'error'}
                    text={serviceStatus.ragflow_connected ? '已连接' : '未连接'}
                  />
                  {serviceStatus.ragflow_version && (
                    <Tag>v{serviceStatus.ragflow_version}</Tag>
                  )}
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">
                最后检查: {serviceStatus.last_check_time
                  ? new Date(serviceStatus.last_check_time).toLocaleString()
                  : '未知'
                }
              </Text>
              <Button onClick={fetchData} loading={loading}>
                刷新状态
              </Button>
              {!serviceStatus.ragflow_connected && (
                <Button
                  type="primary"
                  onClick={() => navigate('/settings')}
                >
                  配置服务
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {serviceStatus.error_message && (
          <Alert
            message="连接错误"
            description={serviceStatus.error_message}
            type="error"
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
      </Card>

      {/* 统计卡片组 - 4等分布局 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="知识库数量"
              value={systemStats?.dataset_count || 0}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="文档总数"
              value={systemStats?.document_count || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="智能体数量"
              value={systemStats?.agent_count || 0}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="对话总数"
              value={systemStats?.chat_count || 0}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 功能卡片组 - 3等分布局 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={8}>
          <Card
            hoverable
            actions={[
              <Button
                type="link"
                icon={<RightOutlined />}
                onClick={() => navigate('/chapter-manager')}
              >
                进入管理
              </Button>,
            ]}
          >
            <Card.Meta
              avatar={
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1677ff, #69c0ff)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                  }}
                >
                  <FileTextOutlined />
                </div>
              }
              title="章节管理"
              description={
                <div>
                  <Paragraph ellipsis={{ rows: 2 }}>
                    上传和处理DOCX文档，智能解析章节结构，管理文档内容块
                  </Paragraph>
                  <Space>
                    <Text type="secondary">文档总数: {systemStats?.document_count || 0}</Text>
                    <Text type="secondary">内容块: {systemStats?.total_chunks || 0}</Text>
                  </Space>
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            hoverable
            actions={[
              <Button
                type="link"
                icon={<RightOutlined />}
                onClick={() => navigate('/agent-list')}
              >
                查看智能体
              </Button>,
            ]}
          >
            <Card.Meta
              avatar={
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #52c41a, #95de64)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                  }}
                >
                  <RobotOutlined />
                </div>
              }
              title="智能体对话"
              description={
                <div>
                  <Paragraph ellipsis={{ rows: 2 }}>
                    基于文档内容创建智能体，提供专业的文档问答和内容分析
                  </Paragraph>
                  <Space>
                    <Text type="secondary">智能体: {systemStats?.agent_count || 0}</Text>
                    <Text type="secondary">对话: {systemStats?.chat_count || 0}</Text>
                  </Space>
                </div>
              }
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            hoverable
            actions={[
              <Button
                type="link"
                icon={<RightOutlined />}
                onClick={() => navigate('/settings')}
              >
                系统设置
              </Button>,
            ]}
          >
            <Card.Meta
              avatar={
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #faad14, #ffd666)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                  }}
                >
                  <SettingOutlined />
                </div>
              }
              title="文档导出"
              description={
                <div>
                  <Paragraph ellipsis={{ rows: 2 }}>
                    配置RAGFlow服务连接，管理系统设置和用户偏好
                  </Paragraph>
                  <Space>
                    <Text type="secondary">
                      状态: {serviceStatus.ragflow_connected ? '已连接' : '未连接'}
                    </Text>
                    <Text type="secondary">Token: {systemStats?.total_tokens || 0}</Text>
                  </Space>
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 快速开始指南 */}
      <Card
        title={
          <Space>
            <PlayCircleOutlined />
            快速开始指南
            <Tag color="blue">{completedSteps}/{quickStartItems.length}步已完成</Tag>
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>完成进度</Text>
                <Text>{progressPercent}%</Text>
              </div>
              <Progress
                percent={progressPercent}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </div>

            <div className="system-display-scroll" style={{ maxHeight: '300px' }}>
              <List
                itemLayout="horizontal"
                dataSource={quickStartItems}
                renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Button
                      type={item.completed ? 'default' : 'primary'}
                      icon={item.completed ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={item.action}
                    >
                      {item.completed ? '已完成' : '开始'}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: item.completed ? '#52c41a' : '#1677ff',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        {item.completed ? (
                          <CheckCircleOutlined />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>
                    }
                    title={
                      <Space>
                        {item.title}
                        {item.completed && (
                          <Tag color="success">
                            已完成
                          </Tag>
                        )}
                      </Space>
                    }
                    description={item.description}
                  />
                </List.Item>
              )}
              />
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <Card size="small" title="系统资源" style={{ background: '#fafafa' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">内容块总数</Text>
                  <br />
                  <Text strong style={{ fontSize: '20px' }}>
                    {systemStats?.total_chunks?.toLocaleString() || 0}
                  </Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text type="secondary">Token总数</Text>
                  <br />
                  <Text strong style={{ fontSize: '20px' }}>
                    {systemStats?.total_tokens?.toLocaleString() || 0}
                  </Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text type="secondary">服务状态</Text>
                  <br />
                  <Badge
                    status={serviceStatus.ragflow_connected ? 'success' : 'error'}
                    text={
                      <Text strong>
                        {serviceStatus.ragflow_connected ? 'RAGFlow已连接' : '服务未连接'}
                      </Text>
                    }
                  />
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Home;