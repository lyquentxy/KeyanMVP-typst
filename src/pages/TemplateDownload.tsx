/**
 * 模板下载页面组件
 * 基于博创电力AI的模板下载功能，提供工程项目模板的搜索、筛选和下载
 * 支持分页显示、分类筛选、搜索功能
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
  Pagination,
  Select,
  Tag,
  Spin,
  Empty,
  Modal,
  Divider,
  Progress,
  Message,
} from '@/utils/antdComponents';
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  StarOutlined,
  FolderOutlined,
} from '@ant-design/icons';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  size: string;
  downloadCount: number;
  uploadDate: string;
  author: string;
  rating: number;
  tags: string[];
  previewUrl?: string;
}

const TemplateDownload: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<string>('');
  const [previewModal, setPreviewModal] = useState<{ visible: boolean; template?: Template }>({
    visible: false,
  });

  // 模拟模板数据
  const mockTemplates: Template[] = [
    {
      id: '1',
      name: '建筑工程施工组织设计模板',
      description: '标准建筑工程施工组织设计文档模板，包含施工方案、进度计划、质量控制等完整内容',
      category: '施工管理',
      size: '2.3MB',
      downloadCount: 1245,
      uploadDate: '2024-01-15',
      author: '工程部',
      rating: 4.8,
      tags: ['施工组织', '质量控制', '进度管理'],
    },
    {
      id: '2',
      name: '工程项目可行性研究报告',
      description: '工程项目可行性研究报告标准模板，含技术可行性、经济可行性分析框架',
      category: '项目管理',
      size: '1.8MB',
      downloadCount: 892,
      uploadDate: '2024-01-12',
      author: '项目部',
      rating: 4.6,
      tags: ['可行性研究', '项目分析', '投资评估'],
    },
    {
      id: '3',
      name: '安全生产管理制度汇编',
      description: '完整的建筑施工安全生产管理制度模板，符合最新安全规范要求',
      category: '安全管理',
      size: '3.1MB',
      downloadCount: 756,
      uploadDate: '2024-01-10',
      author: '安全部',
      rating: 4.9,
      tags: ['安全管理', '规章制度', '安全规范'],
    },
    {
      id: '4',
      name: '工程量清单计价模板',
      description: '标准工程量清单计价表格模板，支持多种工程类型的造价计算',
      category: '造价管理',
      size: '1.5MB',
      downloadCount: 1156,
      uploadDate: '2024-01-08',
      author: '造价部',
      rating: 4.7,
      tags: ['工程量清单', '造价计算', '预算编制'],
    },
    {
      id: '5',
      name: '质量检查验收表格',
      description: '建筑工程质量检查验收记录表格套装，包含各工序质量控制点',
      category: '质量管理',
      size: '2.7MB',
      downloadCount: 634,
      uploadDate: '2024-01-05',
      author: '质量部',
      rating: 4.5,
      tags: ['质量检查', '验收标准', '质量控制'],
    },
    {
      id: '6',
      name: '环境保护方案模板',
      description: '建筑工程环境保护专项方案模板，包含环保措施和监测方案',
      category: '环保管理',
      size: '2.0MB',
      downloadCount: 423,
      uploadDate: '2024-01-03',
      author: '环保部',
      rating: 4.4,
      tags: ['环境保护', '专项方案', '环保措施'],
    },
  ];

  // 分类选项
  const categories = [
    { value: 'all', label: '全部分类' },
    { value: '项目管理', label: '项目管理' },
    { value: '施工管理', label: '施工管理' },
    { value: '安全管理', label: '安全管理' },
    { value: '质量管理', label: '质量管理' },
    { value: '造价管理', label: '造价管理' },
    { value: '环保管理', label: '环保管理' },
  ];

  // 加载模板数据
  useEffect(() => {
    fetchTemplates();
  }, [currentPage, selectedCategory, searchValue]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredTemplates = mockTemplates;

      // 分类筛选
      if (selectedCategory !== 'all') {
        filteredTemplates = filteredTemplates.filter(t => t.category === selectedCategory);
      }

      // 搜索筛选
      if (searchValue) {
        filteredTemplates = filteredTemplates.filter(t =>
          t.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          t.description.toLowerCase().includes(searchValue.toLowerCase()) ||
          t.tags.some(tag => tag.toLowerCase().includes(searchValue.toLowerCase()))
        );
      }

      setTemplates(filteredTemplates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      // Message.error('获取模板列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  // 分类筛选
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  };

  // 下载模板
  const handleDownload = async (template: Template) => {
    setDownloadingId(template.id);
    try {
      // 模拟下载过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Message.success(`${template.name} 下载完成`);
    } catch (error) {
      // Message.error('下载失败，请重试');
    } finally {
      setDownloadingId('');
    }
  };

  // 预览模板
  const handlePreview = (template: Template) => {
    setPreviewModal({ visible: true, template });
  };

  // 分页显示的模板
  const startIndex = (currentPage - 1) * pageSize;
  const displayTemplates = templates.slice(startIndex, startIndex + pageSize);

  return (
    <div className="template-download-container">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          模板下载中心
        </Title>
        <Text type="secondary">
          工程项目标准模板库，提供各类专业文档模板下载
        </Text>
      </div>

      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} lg={8}>
            <Input.Search
              placeholder="搜索模板名称、描述或标签..."
              allowClear
              size="large"
              onSearch={handleSearch}
              onChange={(e) => !e.target.value && handleSearch('')}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="选择分类"
              size="large"
              value={selectedCategory}
              onChange={handleCategoryChange}
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
          <Col xs={24} sm={24} lg={10}>
            <Space>
              <Text type="secondary">
                共找到 <Text strong>{templates.length}</Text> 个模板
              </Text>
              <Button onClick={fetchTemplates} loading={loading}>
                刷新
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 模板列表 */}
      <Spin spinning={loading}>
        {displayTemplates.length === 0 ? (
          <Card>
            <Empty
              description="暂无匹配的模板"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {displayTemplates.map(template => (
              <Col key={template.id} xs={24} sm={12} lg={8} xl={6}>
                <Card
                  hoverable
                  actions={[
                    <Button
                      key="preview"
                      type="link"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(template)}
                    >
                      预览
                    </Button>,
                    <Button
                      key="download"
                      type="link"
                      icon={<DownloadOutlined />}
                      loading={downloadingId === template.id}
                      onClick={() => handleDownload(template)}
                    >
                      下载
                    </Button>,
                  ]}
                  style={{ height: '100%' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', height: '280px' }}>
                    {/* 模板图标 */}
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #1677ff, #69c0ff)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                        }}
                      >
                        <FileTextOutlined style={{ fontSize: '36px', color: 'white' }} />
                      </div>
                    </div>

                    {/* 模板信息 */}
                    <div style={{ flex: 1 }}>
                      <Title level={5} style={{ marginBottom: '8px' }}>
                        {template.name}
                      </Title>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}
                      >
                        {template.description}
                      </Paragraph>

                      {/* 标签 */}
                      <div style={{ marginBottom: '12px' }}>
                        <Space wrap>
                          {template.tags.map(tag => (
                            <Tag key={tag} color="blue">
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                      </div>

                      {/* 模板详情 */}
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Space size={4}>
                              <FolderOutlined />
                              <Text>{template.category}</Text>
                            </Space>
                            <Text>{template.size}</Text>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Space size={4}>
                              <UserOutlined />
                              <Text>{template.author}</Text>
                            </Space>
                            <Space size={4}>
                              <StarOutlined />
                              <Text>{template.rating}</Text>
                            </Space>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Space size={4}>
                              <CalendarOutlined />
                              <Text>{template.uploadDate}</Text>
                            </Space>
                            <Text>下载 {template.downloadCount}</Text>
                          </div>
                        </Space>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* 分页 */}
      {templates.length > 0 && (
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Pagination
              current={currentPage}
              total={templates.length}
              pageSize={pageSize}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
              }
              onChange={setCurrentPage}
            />
          </div>
        </Card>
      )}

      {/* 预览弹窗 */}
      <Modal
        title="模板预览"
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false })}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setPreviewModal({ visible: false })}>
            关闭
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloadingId === previewModal.template?.id}
            onClick={() => {
              if (previewModal.template) {
                handleDownload(previewModal.template);
                setPreviewModal({ visible: false });
              }
            }}
          >
            下载模板
          </Button>,
        ]}
      >
        {previewModal.template && (
          <div>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #1677ff, #69c0ff)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 16px',
                    }}
                  >
                    <FileTextOutlined style={{ fontSize: '48px', color: 'white' }} />
                  </div>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>{previewModal.template.category}</Text>
                    <Text type="secondary">{previewModal.template.size}</Text>
                    <Space>
                      <StarOutlined style={{ color: '#faad14' }} />
                      <Text>{previewModal.template.rating}</Text>
                    </Space>
                  </Space>
                </div>
              </Col>
              <Col span={16}>
                <Title level={4}>{previewModal.template.name}</Title>
                <Paragraph>{previewModal.template.description}</Paragraph>

                <Divider />

                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text type="secondary">上传作者</Text>
                    <br />
                    <Text strong>{previewModal.template.author}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">上传时间</Text>
                    <br />
                    <Text strong>{previewModal.template.uploadDate}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">下载次数</Text>
                    <br />
                    <Text strong>{previewModal.template.downloadCount}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary">文件大小</Text>
                    <br />
                    <Text strong>{previewModal.template.size}</Text>
                  </Col>
                </Row>

                <Divider />

                <div>
                  <Text type="secondary">标签</Text>
                  <br />
                  <Space wrap style={{ marginTop: '8px' }}>
                    {previewModal.template.tags.map(tag => (
                      <Tag key={tag} color="blue">{tag}</Tag>
                    ))}
                  </Space>
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TemplateDownload;