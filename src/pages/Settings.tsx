import React, { useState } from 'react';
import {
  Card,
  Typography,
  Button,
  Space,
  Form,
  Input,
  Select,
  InputNumber,
  Divider,
  Tag,
  Alert,
  Row,
  Col,
  Switch,
  useMessage
} from '@/utils/antdComponents';
import { ApiOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { photovoltaicAIService } from '@/services/photovoltaicAiService';
import type { MiniMaxConfig, ModuleStatus } from '@/types/aiModule';

const { Title, Paragraph, Text } = Typography;

const Settings: React.FC = () => {
  const [form] = Form.useForm<MiniMaxConfig>();
  const [status, setStatus] = useState<ModuleStatus | null>(null);
  const [testing, setTesting] = useState(false);
  const [messageApi, contextHolder] = useMessage();

  const initialConfig = photovoltaicAIService.getConfig();

  const handleSave = async () => {
    const values = await form.validateFields();
    photovoltaicAIService.setConfig(values);
    messageApi.success('MiniMax配置已保存');
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const result = await photovoltaicAIService.getModuleStatus();
      setStatus(result);
      if (result.connected) {
        messageApi.success('MiniMax 配置有效');
      } else {
        messageApi.warning(result.message);
      }
    } catch (error) {
      messageApi.error((error as Error).message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="page-container fade-in">
      {contextHolder}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>MiniMax 模块设置</Title>
        <Paragraph type="secondary">
          配置光伏项目可研助手的底层模型参数，确保符合 docx/typst-ai-module-design.md 的模块化要求。
        </Paragraph>
      </div>

      <Row gutter={24}>
        <Col span={14}>
          <Card title="MiniMax API配置" extra={<Tag color={initialConfig.apiKey ? 'green' : 'orange'}>{initialConfig.apiKey ? '已配置' : '待配置'}</Tag>}>
            <Form form={form} layout="vertical" initialValues={initialConfig}>
              <Form.Item label="API Key" name="apiKey" rules={[{ required: true, message: '请输入MiniMax API Key' }]}>
                <Input.Password placeholder="sk-..." autoComplete="off" />
              </Form.Item>
              <Form.Item label="Base URL" name="baseUrl" rules={[{ required: true, message: '请输入API地址' }]}>
                <Input placeholder="https://api.minimaxi.com/anthropic" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="模型" name="model" rules={[{ required: true }]}>
                    <Select
                      options={[
                        { value: 'MiniMax-M2', label: 'MiniMax-M2 (推荐)' },
                        { value: 'MiniMax-M2-Stable', label: 'MiniMax-M2-Stable' }
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="随机性 (temperature)" name="temperature" rules={[{ required: true }]}>
                    <InputNumber min={0.1} max={1} step={0.1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="最大Token" name="maxTokens" rules={[{ required: true }]}>
                    <InputNumber min={500} max={4000} step={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="启用Thinking模式" name="enableThinking" valuePropName="checked">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>

              <Space>
                <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                  保存设置
                </Button>
                <Button icon={<ThunderboltOutlined />} loading={testing} onClick={handleTest}>
                  测试连接
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col span={10}>
          <Card title="模块状态">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                type="info"
                showIcon
                message="模块职责"
                description="数据验证、提示词生成、章节级别生成、Typst拼装以及PDF导出。"
              />
              {status && (
                <Alert
                  type={status.connected ? 'success' : 'warning'}
                  showIcon
                  message={status.connected ? '连接正常' : '未连接'}
                  description={
                    <div>
                      <Text>模型：{status.model || initialConfig.model}</Text>
                      <br />
                      <Text>时间：{new Date(status.lastChecked).toLocaleString()}</Text>
                      <br />
                      <Text>{status.message}</Text>
                    </div>
                  }
                />
              )}
              <Divider />
              <Paragraph>
                该配置用于 docx/typst-ai-module-design.md 描述的 DataValidator、PromptGenerator、ChapterGenerator 等核心组件。
                当 API Key 失效或配置信息缺失时，Typst 编辑器和 QA 助手将无法正常调用 MiniMax 模型。
              </Paragraph>
              <Space>
                <Button icon={<ApiOutlined />} onClick={handleTest} disabled={testing}>
                  立即检测
                </Button>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;
