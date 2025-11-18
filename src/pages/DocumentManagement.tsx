/**
 * 项目推荐书页面组件
 * 项目建议书生成和管理，提供文档编辑、模板选择、导出功能
 */

import React from 'react';
import {
  Card,
  Button,
  Typography,
  Row,
  Col,
  List,
  Empty,
  Space,
  Tag,
} from '@/utils/antdComponents';
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const DocumentManagement: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          项目推荐书
        </Title>
        <Text type="secondary">
          项目建议书生成和管理系统
        </Text>
      </div>

      <Row gutter={24}>
        <Col span={18}>
          <Card
            title="项目文档列表"
            extra={
              <Button type="primary" icon={<PlusOutlined />}>
                新建项目推荐书
              </Button>
            }
          >
            <Empty
              image={<FileTextOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
              description="暂无项目推荐书"
            >
              <Button type="primary" icon={<PlusOutlined />}>
                创建第一个推荐书
              </Button>
            </Empty>
          </Card>
        </Col>

        <Col span={6}>
          <Card title="快速模板" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block size="small">工程项目可研报告</Button>
              <Button block size="small">基础设施建设方案</Button>
              <Button block size="small">技术改造项目书</Button>
              <Button block size="small">环保治理项目</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DocumentManagement;