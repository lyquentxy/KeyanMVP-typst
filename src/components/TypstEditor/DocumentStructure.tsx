/**
 * 文档结构管理组件
 * 显示文档的章节结构树，支持章节选择、添加、删除等操作
 */

import React from 'react';
import {
  Tree,
  Button,
  Space,
  Typography,
  Divider,
  Tag,
  Tooltip,
  Dropdown,
  Card,
  Checkbox
} from '@/utils/antdComponents';
import {
  FileTextOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  BookOutlined,
  UnorderedListOutlined,
  RobotOutlined,
  MoreOutlined
} from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';

const { Text, Title } = Typography;

// 文档章节接口
interface DocumentSection {
  id: string;
  type: 'header' | 'cover1' | 'cover2' | 'toc' | 'chapter';
  title: string;
  content: string;
  order: number;
  aiAgent?: string;
  selected?: boolean;
}

// 文档数据接口
interface DocumentData {
  title: string;
  author: string;
  date: string;
  sections: DocumentSection[];
  globalSettings: any;
}

interface DocumentStructureProps {
  document: DocumentData;
  activeSection: string;
  onSectionSelect: (sectionId: string) => void;
  onToggleChapter: (chapterId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onGetRecommendations: () => void;
  isGettingRecommendations?: boolean;
}

const DocumentStructure: React.FC<DocumentStructureProps> = ({
  document,
  activeSection,
  onSectionSelect,
  onToggleChapter,
  onDeleteSection,
  onGetRecommendations,
  isGettingRecommendations = false
}) => {
  // 获取章节图标
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'header':
        return <EditOutlined />; // 头文件图标（虽然不会显示）
      case 'cover1':
      case 'cover2':
        return <BookOutlined />;
      case 'toc':
        return <UnorderedListOutlined />;
      case 'chapter':
        return <FileTextOutlined />;
      default:
        return <FileTextOutlined />;
    }
  };

  // 获取章节标签
  const getSectionTag = (section: DocumentSection) => {
    switch (section.type) {
      case 'header':
        return <Tag color="purple">头文件</Tag>;
      case 'cover1':
        return <Tag color="blue">封面1</Tag>;
      case 'cover2':
        return <Tag color="cyan">封面2</Tag>;
      case 'toc':
        return <Tag color="green">目录</Tag>;
      case 'chapter':
        return section.aiAgent ?
          <Tag color="orange" icon={<RobotOutlined />}>AI章节</Tag> :
          <Tag color="default">章节</Tag>;
      default:
        return null;
    }
  };

  // 构建树形数据
  const buildTreeData = (): DataNode[] => {
    return document.sections
      .filter(section =>
        section.type !== 'header' && // 过滤掉头文件
        (section.type !== 'chapter' || section.selected !== false) // 只显示选中的章节或非章节部分
      )
      .sort((a, b) => a.order - b.order)
      .map(section => ({
        key: section.id,
        title: (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '4px 0',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              {getSectionIcon(section.type)}
              <span style={{ marginLeft: 8, fontSize: 13 }}>{section.title}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {getSectionTag(section)}

              {section.type === 'chapter' && (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'edit',
                        label: '编辑',
                        icon: <EditOutlined />
                      },
                      {
                        key: 'ai',
                        label: 'AI优化',
                        icon: <RobotOutlined />
                      },
                      {
                        key: 'delete',
                        label: '删除',
                        icon: <DeleteOutlined />,
                        danger: true
                      }
                    ],
                    onClick: ({ key }) => {
                      if (key === 'delete') {
                        onDeleteSection(section.id);
                      }
                    }
                  }}
                  trigger={['click']}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<MoreOutlined />}
                    style={{ padding: 2 }}
                  />
                </Dropdown>
              )}
            </div>
          </div>
        ),
        icon: null,
        isLeaf: true
      }));
  };

  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      {/* 文档信息 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <div>
          <Title level={5} style={{ margin: '0 0 8px 0' }}>
            {document.title}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            作者：{document.author || '未设置'}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            日期：{document.date}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            章节数：{document.sections.filter(s => s.type === 'chapter').length}
          </Text>
        </div>
      </Card>

      {/* 文档结构标题和章节选择 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
      }}>
        <Text strong>文档结构</Text>
        <Space>
          <Tooltip title="获取AI章节推荐">
            <Button
              size="small"
              icon={<RobotOutlined />}
              onClick={onGetRecommendations}
              loading={isGettingRecommendations}
              disabled={isGettingRecommendations}
            >
              {isGettingRecommendations ? '获取中...' : 'AI推荐'}
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* 章节选择区域 */}
      <Card size="small" style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <Text strong style={{ fontSize: 12 }}>章节选择</Text>
        </div>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {document.sections
            .filter(section => section.type === 'chapter')
            .sort((a, b) => a.order - b.order)
            .map(section => (
              <div key={section.id} style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={section.selected !== false}
                  onChange={() => onToggleChapter(section.id)}
                  style={{ fontSize: 12 }}
                >
                  {section.title}
                  {section.aiAgent && (
                    <Tag
                      color="orange"
                      icon={<RobotOutlined />}
                      size="small"
                      style={{ marginLeft: 8 }}
                    >
                      AI
                    </Tag>
                  )}
                </Checkbox>
              </div>
            ))}
        </div>
      </Card>

      <Divider style={{ margin: '12px 0' }} />

      {/* 章节树 */}
      <Tree
        treeData={buildTreeData()}
        selectedKeys={[activeSection]}
        showIcon={false}
        showLine={false}
        onSelect={(keys) => {
          if (keys.length > 0) {
            onSectionSelect(keys[0] as string);
          }
        }}
        style={{
          fontSize: 13
        }}
      />

      {/* 统计信息 */}
      <Divider style={{ margin: '16px 0' }} />

      <div style={{ fontSize: 12, color: '#666' }}>
        <div style={{ marginBottom: 4 }}>
          • 总字数：{document.sections
            .filter(s => s.type !== 'chapter' || s.selected !== false)
            .reduce((acc, section) => acc + section.content.length, 0)}
        </div>
        <div style={{ marginBottom: 4 }}>
          • 已选章节：{document.sections.filter(s => s.type === 'chapter' && s.selected !== false).length} / {document.sections.filter(s => s.type === 'chapter').length}
        </div>
        <div>
          • AI章节：{document.sections.filter(s => s.type === 'chapter' && s.aiAgent && s.selected !== false).length}
        </div>
      </div>
    </div>
  );
};

export default DocumentStructure;