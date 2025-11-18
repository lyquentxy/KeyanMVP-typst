/**
 * 政策及其他页面组件
 * 政策法规信息查询，支持按地区、行业分类，时间线展示
 */

import React from 'react';
import {
  Card,
  Input,
  Typography,
  Row,
  Col,
  Select,
  Timeline,
  Empty,
  Tag,
} from '@/utils/antdComponents';
import {
  FileProtectOutlined,
  SearchOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const PolicySearch: React.FC = () => {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          政策及其他
        </Title>
        <Text type="secondary">
          政策法规信息查询系统，提供最新政策资讯
        </Text>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="政策搜索">
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={12}>
                <Input.Search placeholder="搜索政策法规..." />
              </Col>
              <Col span={6}>
                <Select placeholder="地区" style={{ width: '100%' }}>
                  <Select.Option value="national">国家级</Select.Option>
                  <Select.Option value="provincial">省级</Select.Option>
                  <Select.Option value="city">市级</Select.Option>
                </Select>
              </Col>
              <Col span={6}>
                <Select placeholder="行业" style={{ width: '100%' }}>
                  <Select.Option value="construction">建筑行业</Select.Option>
                  <Select.Option value="transport">交通行业</Select.Option>
                  <Select.Option value="water">水利行业</Select.Option>
                </Select>
              </Col>
            </Row>

            <Empty
              image={<FileProtectOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
              description="请输入搜索条件查询相关政策"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="政策时间线" size="small">
            <Timeline>
              <Timeline.Item dot={<ClockCircleOutlined />}>
                <Text strong>2024年建筑法修订</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>2024-01-15</Text>
              </Timeline.Item>
              <Timeline.Item>
                <Text strong>绿色建筑评价标准</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>2023-12-20</Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PolicySearch;