/**
 * 章节管理页面 (占位组件)
 * TODO: 完整实现多栏布局、文档上传、章节树等功能
 */

import React from 'react';
import { Card, Typography, Button, Space } from '@/utils/antdComponents';
import { FileTextOutlined, UploadOutlined, ApartmentOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ChapterManager: React.FC = () => {
  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>章节管理</Title>
        <Paragraph type="secondary">
          上传和处理DOCX文档，智能解析章节结构，管理文档内容块
        </Paragraph>
      </div>

      <Card>
        <div className="text-center" style={{ padding: '60px 20px' }}>
          <FileTextOutlined style={{ fontSize: '64px', color: '#1677ff', marginBottom: '24px' }} />
          <Title level={3}>章节管理功能</Title>
          <Paragraph style={{ maxWidth: '500px', margin: '0 auto 24px' }}>
            此页面将包含文档上传、章节解析、结构树展示等完整功能。
            按照架构文档设计，将采用16:8黄金比例的多栏布局。
          </Paragraph>
          <Space>
            <Button type="primary" icon={<UploadOutlined />}>
              上传文档
            </Button>
            <Button icon={<ApartmentOutlined />}>
              查看章节树
            </Button>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default ChapterManager;