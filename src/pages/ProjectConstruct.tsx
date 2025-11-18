/**
 * 项目建设页面组件
 * 项目建设管理系统，需要登录访问，提供全生命周期项目管理
 */

import React, { useState } from 'react';
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  Empty,
  Modal,
  Tabs,
  Form,
  Input,
} from '@/utils/antdComponents';
import {
  ApartmentOutlined,
  LoginOutlined,
  PlusOutlined,
  ProjectOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const ProjectConstruct: React.FC = () => {
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          项目建设
        </Title>
        <Text type="secondary">
          项目建设管理系统，全生命周期项目管理
        </Text>
      </div>

      <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
        <Empty
          image={<ProjectOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
          description="请先登录以访问项目建设管理系统"
        >
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => setLoginModalVisible(true)}
          >
            立即登录
          </Button>
        </Empty>
      </Card>

      <Modal
        title="登录项目管理系统"
        open={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        footer={null}
      >
        <Form layout="vertical">
          <Form.Item label="用户名" required>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item label="密码" required>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectConstruct;