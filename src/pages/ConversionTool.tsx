/**
 * 转换工具页面组件
 * 文档格式转换工具，支持多种格式互转、批量处理、实时预览
 */

import React, { useState } from 'react';
import {
  Card,
  Upload,
  Button,
  Typography,
  Row,
  Col,
  Select,
  Progress,
  Alert,
  Space,
  List,
} from '@/utils/antdComponents';
import {
  SwapOutlined,
  InboxOutlined,
  DownloadOutlined,
  FileOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ConversionTool: React.FC = () => {
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          转换工具
        </Title>
        <Text type="secondary">
          文档格式转换工具，支持多种格式互转
        </Text>
      </div>

      <Row gutter={24}>
        <Col span={16}>
          <Card title="文件转换">
            <Row gutter={16} style={{ marginBottom: '16px' }}>
              <Col span={10}>
                <Select placeholder="源格式" style={{ width: '100%' }}>
                  <Select.Option value="docx">DOCX</Select.Option>
                  <Select.Option value="pdf">PDF</Select.Option>
                  <Select.Option value="txt">TXT</Select.Option>
                </Select>
              </Col>
              <Col span={4} style={{ textAlign: 'center', paddingTop: '6px' }}>
                <SwapOutlined style={{ fontSize: '20px' }} />
              </Col>
              <Col span={10}>
                <Select placeholder="目标格式" style={{ width: '100%' }}>
                  <Select.Option value="pdf">PDF</Select.Option>
                  <Select.Option value="docx">DOCX</Select.Option>
                  <Select.Option value="html">HTML</Select.Option>
                </Select>
              </Col>
            </Row>

            <Dragger>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持单个或批量上传</p>
            </Dragger>

            {converting && (
              <div style={{ marginTop: '16px' }}>
                <Progress percent={progress} status="active" />
              </div>
            )}
          </Card>
        </Col>

        <Col span={8}>
          <Card title="转换记录" size="small">
            <Text type="secondary">暂无转换记录</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ConversionTool;