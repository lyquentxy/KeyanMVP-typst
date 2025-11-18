/**
 * 数据查询页面组件
 * 工程数据检索系统，支持多条件筛选、数据可视化、导出功能
 */

import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Select,
  Table,
  Empty,
  Tag,
} from '@/utils/antdComponents';
import {
  SearchOutlined,
  DatabaseOutlined,
  FilterOutlined,
  ExportOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const DataSearch: React.FC = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          数据查询
        </Title>
        <Text type="secondary">
          工程数据检索系统，支持多条件筛选和数据分析
        </Text>
      </div>

      <Card>
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={8}>
            <Input.Search placeholder="搜索工程数据..." />
          </Col>
          <Col span={6}>
            <Select placeholder="数据类型" style={{ width: '100%' }}>
              <Select.Option value="material">材料数据</Select.Option>
              <Select.Option value="structure">结构数据</Select.Option>
              <Select.Option value="environment">环境数据</Select.Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select placeholder="时间范围" style={{ width: '100%' }}>
              <Select.Option value="recent">最近一月</Select.Option>
              <Select.Option value="quarter">最近一季度</Select.Option>
              <Select.Option value="year">最近一年</Select.Option>
            </Select>
          </Col>
          <Col span={4}>
            <Button type="primary" block icon={<SearchOutlined />}>
              查询
            </Button>
          </Col>
        </Row>

        <Empty
          image={<DatabaseOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
          description="请输入查询条件开始数据检索"
        />
      </Card>
    </div>
  );
};

export default DataSearch;