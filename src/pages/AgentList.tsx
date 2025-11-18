/**
 * 智能体列表页面 (占位组件)
 * TODO: 完整实现网格布局、智能体卡片、管理操作等功能
 */

import React from 'react';
import { Card, Typography, Button, Space } from '@/utils/antdComponents';
import { RobotOutlined, PlusOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const AgentList: React.FC = () => {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>智能体列表</Title>
        <Paragraph type="secondary">
          管理和使用智能体，支持基于文档内容的专业问答和分析
        </Paragraph>
      </div>

      <Card>
        <div className="text-center" style={{ padding: '60px 20px' }}>
          <RobotOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} />
          <Title level={3}>智能体管理</Title>
          <Paragraph style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
            此页面将展示智能体网格，支持响应式布局 (xs:1, sm:2, md:2, lg:3, xl:3, xxl:4)，
            提供快速对话入口和管理操作。
          </Paragraph>
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              创建智能体
            </Button>
            <Button icon={<MessageOutlined />}>
              开始对话
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default AgentList;