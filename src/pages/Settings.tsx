/**
 * 系统设置页面 (占位组件)
 * TODO: 完整实现14:10布局、RAGFlow配置、系统偏好等功能
 */

import React from 'react';
import { Card, Typography, Button, Space } from '@/utils/antdComponents';
import { SettingOutlined, ApiOutlined, SaveOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Settings: React.FC = () => {
  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>系统设置</Title>
        <Paragraph type="secondary">
          配置RAGFlow服务连接、系统偏好设置和默认参数
        </Paragraph>
      </div>

      <Card>
        <div className="text-center" style={{ padding: '60px 20px' }}>
          <SettingOutlined style={{ fontSize: '64px', color: '#faad14', marginBottom: '24px' }} />
          <Title level={3}>系统配置中心</Title>
          <Paragraph style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
            此页面将实现14:10信息密度优化布局，左侧配置区包含RAGFlow服务连接、
            系统偏好设置等，右侧信息面板显示配置说明和系统信息。
          </Paragraph>
          <Space>
            <Button type="primary" icon={<ApiOutlined />}>
              配置API
            </Button>
            <Button icon={<SaveOutlined />}>
              保存设置
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default Settings;