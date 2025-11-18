/**
 * 标准规范搜索页面组件
 * 基于博创电力AI的行业标准和规范查询功能
 * 支持智能搜索、分类筛选、结果展示
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Typography,
  Row,
  Col,
  Select,
  List,
  Tag,
  Empty,
  Spin,
  Breadcrumb,
  Divider,
  Tooltip,
} from '@/utils/antdComponents';
import {
  SearchOutlined,
  FileTextOutlined,
  StarOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  BookOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

interface Standard {
  id: string;
  code: string;
  title: string;
  category: string;
  publishDate: string;
  status: 'active' | 'draft' | 'obsolete';
  summary: string;
  keywords: string[];
  downloadUrl?: string;
}

const StandardSearch: React.FC = () => {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // 分类选项
  const categories = [
    { value: 'all', label: '全部分类' },
    { value: '建筑工程', label: '建筑工程' },
    { value: '市政工程', label: '市政工程' },
    { value: '水利工程', label: '水利工程' },
    { value: '交通工程', label: '交通工程' },
    { value: '环境工程', label: '环境工程' },
    { value: '安全管理', label: '安全管理' },
    { value: '质量管理', label: '质量管理' },
  ];

  // 状态选项
  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'active', label: '现行有效' },
    { value: 'draft', label: '征求意见' },
    { value: 'obsolete', label: '已废止' },
  ];

  // 模拟标准数据
  const mockStandards: Standard[] = [
    {
      id: '1',
      code: 'GB 50157-2013',
      title: '地铁设计规范',
      category: '交通工程',
      publishDate: '2014-02-01',
      status: 'active',
      summary: '本标准适用于城市轨道交通地铁工程的设计，规定了地铁工程设计的基本原则、技术要求和设计标准。',
      keywords: ['地铁', '城市轨道交通', '设计规范', '工程标准'],
    },
    {
      id: '2',
      code: 'GB 50010-2021',
      title: '混凝土结构设计规范',
      category: '建筑工程',
      publishDate: '2021-04-01',
      status: 'active',
      summary: '本标准适用于房屋和一般构筑物的混凝土结构设计，规定了混凝土结构设计的基本原则和方法。',
      keywords: ['混凝土', '结构设计', '房屋建筑', '构筑物'],
    },
    {
      id: '3',
      code: 'JGJ 59-2011',
      title: '建筑施工安全检查标准',
      category: '安全管理',
      publishDate: '2011-12-01',
      status: 'active',
      summary: '本标准适用于房屋建筑工程施工现场安全生产的检查和评价，规定了安全检查的内容、方法和标准。',
      keywords: ['施工安全', '安全检查', '建筑工程', '安全标准'],
    },
    {
      id: '4',
      code: 'GB 50202-2018',
      title: '建筑地基基础工程施工质量验收规范',
      category: '质量管理',
      publishDate: '2018-03-01',
      status: 'active',
      summary: '本标准适用于建筑工程地基基础施工质量的验收，规定了地基基础工程质量验收的程序、内容和方法。',
      keywords: ['地基基础', '施工质量', '质量验收', '建筑工程'],
    },
  ];

  useEffect(() => {
    fetchStandards();
  }, [searchValue, selectedCategory, selectedStatus]);

  const fetchStandards = async () => {
    setLoading(true);
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 800));

      let filteredStandards = mockStandards;

      // 搜索筛选
      if (searchValue) {
        filteredStandards = filteredStandards.filter(s =>
          s.title.toLowerCase().includes(searchValue.toLowerCase()) ||
          s.code.toLowerCase().includes(searchValue.toLowerCase()) ||
          s.keywords.some(keyword => keyword.toLowerCase().includes(searchValue.toLowerCase()))
        );
      }

      // 分类筛选
      if (selectedCategory !== 'all') {
        filteredStandards = filteredStandards.filter(s => s.category === selectedCategory);
      }

      // 状态筛选
      if (selectedStatus !== 'all') {
        filteredStandards = filteredStandards.filter(s => s.status === selectedStatus);
      }

      setStandards(filteredStandards);
    } catch (error) {
      console.error('Failed to fetch standards:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取状态标签
  const getStatusTag = (status: Standard['status']) => {
    const statusMap = {
      active: { color: 'green', text: '现行有效' },
      draft: { color: 'orange', text: '征求意见' },
      obsolete: { color: 'red', text: '已废止' },
    };
    return statusMap[status];
  };

  return (
    <div className="page-container standard-search-container">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          标准规范搜索
        </Title>
        <Text type="secondary">
          行业标准和规范智能查询系统
        </Text>
      </div>

      {/* 搜索区域 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Input.Search
              placeholder="输入标准号、标准名称或关键词搜索..."
              size="large"
              allowClear
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={fetchStandards}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} lg={6}>
            <Select
              placeholder="选择分类"
              size="large"
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              {categories.map(cat => (
                <Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} lg={6}>
            <Select
              placeholder="选择状态"
              size="large"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              {statusOptions.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Row justify="space-between" align="middle">
          <Col>
            <Text type="secondary">
              找到 <Text strong>{standards.length}</Text> 个相关标准规范
            </Text>
          </Col>
          <Col>
            <Button onClick={fetchStandards} loading={loading}>
              刷新结果
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 搜索结果 */}
      <Card>
        <Spin spinning={loading}>
          {standards.length === 0 ? (
            <Empty
              description="未找到匹配的标准规范"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              itemLayout="vertical"
              size="large"
              dataSource={standards}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button key="view" type="link" icon={<EyeOutlined />}>
                      查看详情
                    </Button>,
                    <Button key="download" type="link" icon={<DownloadOutlined />}>
                      下载
                    </Button>,
                    <Button key="star" type="link" icon={<StarOutlined />}>
                      收藏
                    </Button>,
                  ]}
                  extra={
                    <div style={{ textAlign: 'center', minWidth: '100px' }}>
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #1677ff, #69c0ff)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px',
                        }}
                      >
                        <BookOutlined style={{ fontSize: '24px', color: 'white' }} />
                      </div>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        国家标准
                      </Text>
                    </div>
                  }
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong style={{ fontSize: '16px' }}>
                          {item.code}
                        </Text>
                        <Tag color={getStatusTag(item.status).color}>
                          {getStatusTag(item.status).text}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Title level={5} style={{ margin: '8px 0' }}>
                          {item.title}
                        </Title>
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ color: '#666', marginBottom: '12px' }}
                        >
                          {item.summary}
                        </Paragraph>

                        <Space wrap style={{ marginBottom: '8px' }}>
                          {item.keywords.map(keyword => (
                            <Tag key={keyword} color="blue">
                              {keyword}
                            </Tag>
                          ))}
                        </Space>

                        <div style={{ color: '#999', fontSize: '12px' }}>
                          <Row>
                            <Col span={12}>
                              <Space>
                                <FileTextOutlined />
                                <Text>分类：{item.category}</Text>
                              </Space>
                            </Col>
                            <Col span={12}>
                              <Space>
                                <CalendarOutlined />
                                <Text>发布：{item.publishDate}</Text>
                              </Space>
                            </Col>
                          </Row>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default StandardSearch;