/**
 * 文件管理系统组件
 * 管理Typst文档的本地存储、导入导出、版本控制等功能
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Typography,
  List,
  Tag,
  Input,
  Modal,
  Upload,
  Message,
  useMessage,
  Dropdown,
  Tooltip,
  Progress,
  Alert,
  Divider,
  Empty
} from '@/utils/antdComponents';
import type { MenuProps } from '@/utils/antdComponents';
import {
  FolderOutlined,
  FileTextOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  ShareAltOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  HistoryOutlined,
  ExportOutlined,
  ImportOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Search } = Input;

// 文件信息接口
interface FileInfo {
  id: string;
  name: string;
  type: 'typst' | 'pdf' | 'template';
  size: number;
  lastModified: number;
  created: number;
  path: string;
  content?: string;
  metadata?: {
    title: string;
    author: string;
    description: string;
    tags: string[];
  };
}

// 文件夹接口
interface FolderInfo {
  id: string;
  name: string;
  path: string;
  parentId?: string;
  created: number;
  files: FileInfo[];
  subFolders: FolderInfo[];
}

interface FileManagerProps {
  onFileSelect?: (file: FileInfo) => void;
  onFileLoad?: (content: string, metadata: any) => void;
}

const FileManager: React.FC<FileManagerProps> = ({
  onFileSelect,
  onFileLoad
}) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [folders, setFolders] = useState<FolderInfo[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messageApi, contextHolder] = useMessage();

  // 初始化示例文件
  useEffect(() => {
    const sampleFiles: FileInfo[] = [
      {
        id: 'sample1',
        name: '学术论文模板.typ',
        type: 'typst',
        size: 2048,
        lastModified: Date.now() - 86400000,
        created: Date.now() - 172800000,
        path: '/templates/academic.typ',
        metadata: {
          title: '学术论文模板',
          author: '可研报告编辑器',
          description: '标准学术论文格式模板',
          tags: ['模板', '学术', '论文']
        }
      },
      {
        id: 'sample2',
        name: '技术报告.typ',
        type: 'typst',
        size: 4096,
        lastModified: Date.now() - 43200000,
        created: Date.now() - 259200000,
        path: '/documents/tech-report.typ',
        metadata: {
          title: '技术报告',
          author: '用户',
          description: '项目技术实现报告',
          tags: ['报告', '技术', '项目']
        }
      },
      {
        id: 'sample3',
        name: '会议纪要模板.typ',
        type: 'typst',
        size: 1024,
        lastModified: Date.now() - 21600000,
        created: Date.now() - 345600000,
        path: '/templates/meeting.typ',
        metadata: {
          title: '会议纪要模板',
          author: '可研报告编辑器',
          description: '标准会议纪要格式',
          tags: ['模板', '会议', '纪要']
        }
      }
    ];

    setFiles(sampleFiles);
  }, []);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 86400000) { // 24小时内
      return date.toLocaleTimeString();
    } else if (diff < 604800000) { // 7天内
      return `${Math.floor(diff / 86400000)}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // 过滤文件
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchText.toLowerCase()) ||
    file.metadata?.title.toLowerCase().includes(searchText.toLowerCase()) ||
    file.metadata?.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  // 创建新文件
  const handleCreateFile = () => {
    if (!newFileName.trim()) {
      messageApi.warning('请输入文件名');
      return;
    }

    const newFile: FileInfo = {
      id: `file_${Date.now()}`,
      name: newFileName.endsWith('.typ') ? newFileName : `${newFileName}.typ`,
      type: 'typst',
      size: 0,
      lastModified: Date.now(),
      created: Date.now(),
      path: `/documents/${newFileName}.typ`,
      content: '= 新文档\n\n开始编写您的内容...',
      metadata: {
        title: newFileName,
        author: '用户',
        description: '',
        tags: []
      }
    };

    setFiles(prev => [...prev, newFile]);
    setNewFileName('');
    setShowNewFileModal(false);
    messageApi.success('文件创建成功');

    // 自动选择新文件
    handleFileSelect(newFile);
  };

  // 选择文件
  const handleFileSelect = (file: FileInfo) => {
    setSelectedFile(file.id);
    onFileSelect?.(file);

    // 如果有文件内容，加载到编辑器
    if (file.content && onFileLoad) {
      onFileLoad(file.content, file.metadata);
    }
  };

  // 删除文件
  const handleDeleteFile = (fileId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个文件吗？此操作不可撤销。',
      onOk: () => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        if (selectedFile === fileId) {
          setSelectedFile(null);
        }
        messageApi.success('文件已删除');
      }
    });
  };

  // 重命名文件
  const handleRenameFile = (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    Modal.confirm({
      title: '重命名文件',
      content: (
        <Input
          defaultValue={file.name}
          onPressEnter={(e) => {
            const newName = (e.target as HTMLInputElement).value;
            if (newName && newName !== file.name) {
              setFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, name: newName } : f
              ));
              messageApi.success('文件已重命名');
            }
          }}
        />
      )
    });
  };

  // 导出文件
  const handleExportFile = (file: FileInfo) => {
    try {
      const content = file.content || '// 空文件';
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      messageApi.success('文件导出成功');
    } catch (error) {
      messageApi.error('导出失败：' + (error as Error).message);
    }
  };

  // 文件操作菜单
  const getFileActions = (file: FileInfo): MenuProps => ({
    items: [
      {
        key: 'open',
        label: '打开',
        icon: <EditOutlined />,
        onClick: () => handleFileSelect(file)
      },
      {
        key: 'rename',
        label: '重命名',
        icon: <EditOutlined />,
        onClick: () => handleRenameFile(file.id)
      },
      {
        key: 'export',
        label: '导出',
        icon: <ExportOutlined />,
        onClick: () => handleExportFile(file)
      },
      {
        type: 'divider' as const
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteFile(file.id)
      }
    ]
  });

  return (
    <>
      {contextHolder}
      <div style={{ height: 500, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e8e8e8',
        background: '#fafafa'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <Title level={5} style={{ margin: 0 }}>
            <FolderOutlined style={{ marginRight: 8 }} />
            文件管理
          </Title>

          <Space>
            <Tooltip title="新建文件">
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setShowNewFileModal(true)}
              >
                新建
              </Button>
            </Tooltip>

            <Tooltip title="导入文件">
              <Button
                size="small"
                icon={<ImportOutlined />}
                onClick={() => setShowUploadModal(true)}
              >
                导入
              </Button>
            </Tooltip>
          </Space>
        </div>

        {/* 搜索框 */}
        <Search
          size="small"
          placeholder="搜索文件、标题或标签..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      {/* 文件列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        {filteredFiles.length === 0 ? (
          <Empty
            description="暂无文件"
            style={{ marginTop: 60 }}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowNewFileModal(true)}
            >
              创建第一个文件
            </Button>
          </Empty>
        ) : (
          <List
            size="small"
            dataSource={filteredFiles}
            renderItem={(file) => (
              <List.Item
                style={{
                  padding: '8px 16px',
                  cursor: 'pointer',
                  background: selectedFile === file.id ? '#e6f4ff' : 'transparent',
                  borderLeft: selectedFile === file.id ? '3px solid #1677ff' : '3px solid transparent'
                }}
                onClick={() => handleFileSelect(file)}
                actions={[
                  <Dropdown
                    menu={getFileActions(file)}
                    trigger={['click']}
                    key="actions"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <FileTextOutlined
                      style={{
                        fontSize: 16,
                        color: file.type === 'typst' ? '#1677ff' : '#666'
                      }}
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text strong style={{ fontSize: 13 }}>
                        {file.metadata?.title || file.name}
                      </Text>
                      {file.metadata?.tags.map(tag => (
                        <Tag key={tag} color="blue">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  }
                  description={
                    <div style={{ fontSize: 11, color: '#666' }}>
                      <div>{file.name}</div>
                      <div style={{ marginTop: 2 }}>
                        {formatFileSize(file.size)} • {formatTime(file.lastModified)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* 新建文件模态框 */}
      <Modal
        title="新建文件"
        open={showNewFileModal}
        onCancel={() => {
          setShowNewFileModal(false);
          setNewFileName('');
        }}
        onOk={handleCreateFile}
        okText="创建"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">输入文件名，系统会自动添加 .typ 扩展名</Text>
        </div>
        <Input
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="例如：我的文档"
          onPressEnter={handleCreateFile}
        />
      </Modal>

      {/* 上传文件模态框 */}
      <Modal
        title="导入文件"
        open={showUploadModal}
        onCancel={() => setShowUploadModal(false)}
        footer={null}
      >
        <Upload.Dragger
          accept=".typ,.txt,.md"
          beforeUpload={(file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const content = e.target?.result as string;
              const newFile: FileInfo = {
                id: `file_${Date.now()}`,
                name: file.name,
                type: 'typst',
                size: file.size,
                lastModified: Date.now(),
                created: Date.now(),
                path: `/imported/${file.name}`,
                content,
                metadata: {
                  title: file.name.replace(/\.[^/.]+$/, ''),
                  author: '用户',
                  description: '导入的文件',
                  tags: ['导入']
                }
              };

              setFiles(prev => [...prev, newFile]);
              setShowUploadModal(false);
              messageApi.success('文件导入成功');
            };
            reader.readAsText(file);
            return false; // 阻止默认上传
          }}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域导入</p>
          <p className="ant-upload-hint">
            支持 .typ、.txt、.md 格式文件
          </p>
        </Upload.Dragger>
      </Modal>
    </div>
    </>
  );
};

export default FileManager;
