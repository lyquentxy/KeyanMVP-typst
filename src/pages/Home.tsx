/**
 * 首页概览 - 光伏项目可研助手
 * 展示 MiniMax 模块状态、章节指标、功能入口和快速指南
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
  Badge
} from '@/utils/antdComponents';
import {
  FileTextOutlined,
  RobotOutlined,
  MessageOutlined,
  CloudServerOutlined,
  CheckCircleOutlined,
  RightOutlined,
  PlayCircleOutlined,
  SettingOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { photovoltaicAIService, SAMPLE_INPUT } from '@/services/photovoltaicAiService';
import type { ModuleStatus } from '@/types/aiModule';

const { Title, Text, Paragraph } = Typography;

const normativeReferences = ['GB50009-2012', 'GB50797-2012', 'GB50017-2017'];

const capabilityCards = [
  {
    title: 'Typst 编辑器',
    description: '实时编译屋顶分布式光伏可研报告，保证章节编号和排版完全符合项目规范。',
    icon: <FileTextOutlined />,
    actionText: '打开编辑器',
    action: '/typst-editor',
  },
  {
    title: 'MiniMax AI 助手',
    description: '基于 docx/typst-ai-module-design.md 的 DataValidator + PromptGenerator 流程生成高质量章节。',
    icon: <RobotOutlined />,
    actionText: '启动助手',
    action: '/typst-editor',
  },
  {
    title: '专家问答',
    description: '在 QA 界面随时咨询冬季施工措施、投资估算、风险分析等专业问题。',
    icon: <MessageOutlined />,
    actionText: '进入对话',
    action: '/qa',
  }
];

const moduleMetrics = [
  { title: '章节覆盖', value: 7, suffix: '章', icon: <FileTextOutlined />, color: '#1677ff' },
  { title: '冬季施工要点', value: 4, suffix: '项', icon: <CheckCircleOutlined />, color: '#52c41a' },
  { title: '强制规范引用', value: normativeReferences.length, suffix: '部', icon: <CloudServerOutlined />, color: '#faad14' },
  { title: '模板迭代', value: 'v1.0', icon: <ThunderboltOutlined />, color: '#722ed1' }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [moduleStatus, setModuleStatus] = useState<ModuleStatus | null>(null);
  const [projectContext, setProjectContext] = useState(SAMPLE_INPUT);

  useEffect(() => {
    refreshStatus();
    setProjectContext(photovoltaicAIService.getCachedInput());
  }, []);

  const refreshStatus = async () => {
    setLoading(true);
    try {
      const status = await photovoltaicAIService.getModuleStatus();
      setModuleStatus(status);
    } finally {
      setLoading(false);
    }
  };

  const quickStartItems = [
    {
      title: '配置 MiniMax API',
      description: '在系统设置中填写 API Key、Base URL 与模型参数。',
      action: () => navigate('/settings'),
      completed: moduleStatus?.connected ?? false,
    },
    {
      title: '录入项目数据',
      description: '在 Typst 编辑器的 AI 助手中填写项目概况、技术参数和财务数据。',
      action: () => navigate('/typst-editor'),
      completed: false,
    },
    {
      title: '生成章节内容',
      description: '调用 MiniMax 模块生成技术方案、施工组织、投资分析等章节。',
      action: () => navigate('/typst-editor'),
      completed: false,
    },
    {
      title: '导出 Typst PDF',
      description: '通过 Typst 编译器预览排版并导出正式的可行性研究报告。',
      action: () => navigate('/typst-editor'),
      completed: false,
    }
  ];

  const completedSteps = quickStartItems.filter(item => item.completed).length;
  const progressPercent = Math.round((completedSteps / quickStartItems.length) * 100);

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>光伏项目可研助手概览</Title>
        <Text type="secondary">
          聚焦 docx/应用构想.md 定义的光伏项目可行性研究报告结构，协同 MiniMax 模型与 Typst 模板。
        </Text>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row align="middle" justify="space-between">
          <Col>
            <Space align="center">
              <CloudServerOutlined style={{ fontSize: 24, color: moduleStatus?.connected ? '#52c41a' : '#ff4d4f' }} />
              <div>
                <Text strong>MiniMax 模块状态</Text>
                <br />
                <Space>
                  <Badge status={moduleStatus?.connected ? 'success' : 'warning'} text={moduleStatus?.connected ? '已连接' : '待配置'} />
                  {moduleStatus?.model && <Tag>{moduleStatus.model}</Tag>}
                </Space>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">最后检查：{moduleStatus?.lastChecked ? new Date(moduleStatus.lastChecked).toLocaleString() : '未检测'}</Text>
              <Button onClick={refreshStatus} loading={loading}>刷新状态</Button>
              {!moduleStatus?.connected && (
                <Button type="primary" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
                  前往设置
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {!moduleStatus?.connected && (
          <Alert
            style={{ marginTop: 16 }}
            type="warning"
            showIcon
            message="MiniMax API 尚未配置"
            description="请参考 docx/API密钥.md 获取密钥后在系统设置中填写。"
          />
        )}
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {moduleMetrics.map(metric => (
          <Col key={metric.title} xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title={metric.title}
                value={metric.value}
                suffix={metric.suffix}
                prefix={metric.icon}
                valueStyle={{ color: metric.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {capabilityCards.map(card => (
          <Col xs={24} md={8} key={card.title}>
            <Card
              hoverable
              actions={[
                <Button type="link" icon={<RightOutlined />} onClick={() => navigate(card.action)}>
                  {card.actionText}
                </Button>,
              ]}
            >
              <Card.Meta
                avatar={
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #1677ff, #69c0ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 24
                    }}
                  >
                    {card.icon}
                  </div>
                }
                title={card.title}
                description={<Paragraph ellipsis={{ rows: 3 }}>{card.description}</Paragraph>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        title={
          <Space>
            <PlayCircleOutlined />
            快速开始指南
            <Tag color="blue">{completedSteps}/{quickStartItems.length} 步</Tag>
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>完成进度</Text>
                <Text>{progressPercent}%</Text>
              </div>
              <Progress percent={progressPercent} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
            </div>

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
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: item.completed ? '#52c41a' : '#1677ff',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {item.completed ? <CheckCircleOutlined /> : index + 1}
                      </div>
                    }
                    title={<Space>{item.title}{item.completed && <Tag color="success">完成</Tag>}</Space>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Col>

          <Col xs={24} lg={8}>
            <Card size="small" title="系统资源" style={{ background: '#fafafa' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">项目上下文</Text>
                  <br />
                  <Text strong>{projectContext.basic.projectName}</Text>
                  <br />
                  <Text type="secondary">{projectContext.basic.location} · {projectContext.basic.capacityKw}kW</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text type="secondary">施工条件</Text>
                  <br />
                  <Text strong>{projectContext.construction.season} · {projectContext.construction.steelType} · {projectContext.construction.antiCorrosion}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text type="secondary">引用规范</Text>
                  <br />
                  <Space wrap>
                    {normativeReferences.map(ref => (
                      <Tag key={ref} color="blue">{ref}</Tag>
                    ))}
                  </Space>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text type="secondary">模块状态</Text>
                  <br />
                  <Badge
                    status={moduleStatus?.connected ? 'success' : 'warning'}
                    text={<Text strong>{moduleStatus?.connected ? '可调用 MiniMax' : '待配置'}</Text>}
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
