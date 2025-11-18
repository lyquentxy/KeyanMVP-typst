/**
 * 我的收藏页面组件
 * 个人收藏管理，支持按类型分类、快速访问、同步功能
 */

import React, { useState } from 'react';
import {
  Card,
  Typography,
  Row,
  Col,
  List,
  Empty,
  Tag,
  Button,
  Space,
  Select,
  Input,
  Avatar,
} from '@/utils/antdComponents';
import {
  HeartOutlined,
  SearchOutlined,
  StarOutlined,
  FileTextOutlined,
  CalculatorOutlined,
  BookOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface FavoriteItem {
  id: string;
  title: string;
  type: 'document' | 'calculation' | 'standard' | 'template';
  description: string;
  addTime: string;
  source: string;
}

const Favorite: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchValue, setSearchValue] = useState('');

  const mockFavorites: FavoriteItem[] = [
    {
      id: '1',
      title: '建筑工程施工组织设计模板',
      type: 'template',
      description: '标准建筑工程施工组织设计文档模板',
      addTime: '2024-01-20 14:30',
      source: '模板下载',
    },
    {
      id: '2',
      title: '混凝土强度计算结果',
      type: 'calculation',
      description: 'C30混凝土配制强度计算，配制强度38.2MPa',
      addTime: '2024-01-19 16:45',
      source: 'AI工程计算',
    },
    {
      id: '3',
      title: 'GB 50010-2021 混凝土结构设计规范',
      type: 'standard',
      description: '最新版混凝土结构设计规范',
      addTime: '2024-01-18 09:20',
      source: '标准规范搜索',
    },
  ];

  const getTypeIcon = (type: FavoriteItem['type']) => {
    const iconMap = {
      document: <FileTextOutlined />,
      calculation: <CalculatorOutlined />,
      standard: <BookOutlined />,
      template: <FileTextOutlined />,
    };
    return iconMap[type];
  };

  const getTypeColor = (type: FavoriteItem['type']) => {
    const colorMap = {
      document: 'blue',
      calculation: 'orange',
      standard: 'green',
      template: 'purple',
    };
    return colorMap[type];
  };

  const getTypeLabel = (type: FavoriteItem['type']) => {
    const labelMap = {
      document: '文档',
      calculation: '计算',
      standard: '规范',
      template: '模板',
    };
    return labelMap[type];
  };

  const filteredFavorites = mockFavorites.filter(item => {
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (searchValue && !item.title.toLowerCase().includes(searchValue.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          我的收藏
        </Title>
        <Text type="secondary">
          个人收藏内容管理，快速访问常用资源
        </Text>
      </div>

      {/* 筛选区域 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Input.Search
              placeholder="搜索收藏内容..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="选择类型"
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: '100%' }}
            >
              <Select.Option value="all">全部类型</Select.Option>
              <Select.Option value="document">文档</Select.Option>
              <Select.Option value="calculation">计算</Select.Option>
              <Select.Option value="standard">规范</Select.Option>
              <Select.Option value="template">模板</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} lg={10}>
            <Text type="secondary">
              共收藏 <Text strong>{filteredFavorites.length}</Text> 项内容
            </Text>
          </Col>
        </Row>
      </Card>

      {/* 收藏列表 */}
      <Card>
        {filteredFavorites.length === 0 ? (
          <Empty
            image={<HeartOutlined style={{ fontSize: '48px', color: '#ccc' }} />}
            description={searchValue ? '没有找到匹配的收藏内容' : '暂无收藏内容'}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredFavorites}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button key="view" type="link" icon={<EyeOutlined />}>
                    查看
                  </Button>,
                  <Button key="delete" type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={48}
                      icon={getTypeIcon(item.type)}
                      style={{ backgroundColor: getTypeColor(item.type) === 'blue' ? '#1677ff' :
                              getTypeColor(item.type) === 'orange' ? '#faad14' :
                              getTypeColor(item.type) === 'green' ? '#52c41a' : '#722ed1' }}
                    />
                  }
                  title={
                    <Space>
                      <StarOutlined style={{ color: '#faad14' }} />
                      {item.title}
                      <Tag color={getTypeColor(item.type)}>
                        {getTypeLabel(item.type)}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text>{item.description}</Text>
                      <Space>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          来源：{item.source}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          •
                        </Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          收藏时间：{item.addTime}
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default Favorite;