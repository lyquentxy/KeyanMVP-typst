/**
 * 全局设置组件
 * 管理文档的全局配置，包括字体、页面布局、样式等设置
 */

import React, { useState } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Slider,
  Button,
  Space,
  Typography,
  Divider,
  Card,
  Row,
  Col,
  Message,
  useMessage,
  Collapse,
  ColorPicker
} from '@/utils/antdComponents';
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  FileTextOutlined,
  BgColorsOutlined,
  FontSizeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// 全局设置接口
interface GlobalSettings {
  fontSize: number;
  fontFamily: string;
  pageMargin: number;
  lineSpacing: number;
  pageWidth?: string;
  pageHeight?: string;
  textColor?: string;
  backgroundColor?: string;
  headerFont?: string;
  codeFont?: string;
  enableLineNumbers?: boolean;
  enableSyntaxHighlight?: boolean;
  autoSave?: boolean;
  autoCompile?: boolean;
}

interface GlobalSettingsProps {
  settings: GlobalSettings;
  onSettingsChange: (settings: GlobalSettings) => void;
}

// 预设字体选项
const FONT_OPTIONS = [
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Palatino', value: 'Palatino' },
  { label: 'Source Han Sans', value: 'Source Han Sans' },
  { label: 'Noto Sans CJK', value: 'Noto Sans CJK' },
  { label: 'SimSun', value: 'SimSun' },
  { label: 'Microsoft YaHei', value: 'Microsoft YaHei' }
];

// 页面尺寸选项
const PAGE_SIZE_OPTIONS = [
  { label: 'A4 (210×297mm)', width: '210mm', height: '297mm' },
  { label: 'A3 (297×420mm)', width: '297mm', height: '420mm' },
  { label: 'Letter (8.5×11in)', width: '8.5in', height: '11in' },
  { label: 'Legal (8.5×14in)', width: '8.5in', height: '14in' },
  { label: '自定义', width: 'custom', height: 'custom' }
];

const GlobalSettings: React.FC<GlobalSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [form] = Form.useForm();
  const [tempSettings, setTempSettings] = useState<GlobalSettings>(settings);
  const [messageApi, contextHolder] = useMessage();

  // 处理设置变更
  const handleSettingChange = (field: keyof GlobalSettings, value: any) => {
    const newSettings = { ...tempSettings, [field]: value };
    setTempSettings(newSettings);
  };

  // 保存设置
  const handleSave = () => {
    try {
      onSettingsChange(tempSettings);
      messageApi.success('设置已保存');
    } catch (error) {
      messageApi.error('保存失败：' + (error as Error).message);
    }
  };

  // 重置设置
  const handleReset = () => {
    const defaultSettings: GlobalSettings = {
      fontSize: 12,
      fontFamily: 'Times New Roman',
      pageMargin: 2.5,
      lineSpacing: 1.5,
      pageWidth: '210mm',
      pageHeight: '297mm',
      textColor: '#000000',
      backgroundColor: '#ffffff',
      headerFont: 'Arial',
      codeFont: 'Consolas',
      enableLineNumbers: true,
      enableSyntaxHighlight: true,
      autoSave: true,
      autoCompile: true
    };

    setTempSettings(defaultSettings);
    form.setFieldsValue(defaultSettings);
    messageApi.info('设置已重置为默认值');
  };

  // 预览设置变更
  const previewSettings = () => {
    onSettingsChange(tempSettings);
    messageApi.info('预览模式已激活');
  };

  return (
    <>
      {contextHolder}
      <div style={{ maxHeight: 600, overflow: 'auto' }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={tempSettings}
        onValuesChange={(_, allValues) => setTempSettings(allValues)}
      >
        <Collapse defaultActiveKey={['basic', 'layout']} size="small">
          {/* 基础设置 */}
          <Panel
            header={
              <Space>
                <FontSizeOutlined />
                <span>基础设置</span>
              </Space>
            }
            key="basic"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="主字体" name="fontFamily">
                  <Select
                    options={FONT_OPTIONS}
                    placeholder="选择字体"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="字体大小" name="fontSize">
                  <InputNumber
                    min={8}
                    max={24}
                    step={0.5}
                    suffix="pt"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="标题字体" name="headerFont">
                  <Select
                    options={FONT_OPTIONS}
                    placeholder="选择标题字体"
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="代码字体" name="codeFont">
                  <Select
                    options={[
                      { label: 'Consolas', value: 'Consolas' },
                      { label: 'Monaco', value: 'Monaco' },
                      { label: 'Courier New', value: 'Courier New' },
                      { label: 'Source Code Pro', value: 'Source Code Pro' },
                      { label: 'JetBrains Mono', value: 'JetBrains Mono' }
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="行间距">
              <Slider
                min={1.0}
                max={3.0}
                step={0.1}
                value={tempSettings.lineSpacing}
                onChange={(value) => handleSettingChange('lineSpacing', value)}
                marks={{
                  1.0: '1.0',
                  1.5: '1.5',
                  2.0: '2.0',
                  3.0: '3.0'
                }}
              />
            </Form.Item>
          </Panel>

          {/* 页面布局 */}
          <Panel
            header={
              <Space>
                <FileTextOutlined />
                <span>页面布局</span>
              </Space>
            }
            key="layout"
          >
            <Form.Item label="页面尺寸">
              <Select
                placeholder="选择页面尺寸"
                onChange={(value) => {
                  const size = PAGE_SIZE_OPTIONS.find(s => `${s.width}×${s.height}` === value);
                  if (size) {
                    handleSettingChange('pageWidth', size.width);
                    handleSettingChange('pageHeight', size.height);
                  }
                }}
              >
                {PAGE_SIZE_OPTIONS.map((size, index) => (
                  <Select.Option
                    key={index}
                    value={`${size.width}×${size.height}`}
                  >
                    {size.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="页面宽度" name="pageWidth">
                  <Input placeholder="如: 210mm" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="页面高度" name="pageHeight">
                  <Input placeholder="如: 297mm" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="页边距">
              <Slider
                min={1.0}
                max={5.0}
                step={0.5}
                value={tempSettings.pageMargin}
                onChange={(value) => handleSettingChange('pageMargin', value)}
                marks={{
                  1.0: '1cm',
                  2.5: '2.5cm',
                  5.0: '5cm'
                }}
              />
            </Form.Item>
          </Panel>

          {/* 颜色设置 */}
          <Panel
            header={
              <Space>
                <BgColorsOutlined />
                <span>颜色设置</span>
              </Space>
            }
            key="colors"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="文本颜色">
                  <ColorPicker
                    value={tempSettings.textColor}
                    onChange={(color) => handleSettingChange('textColor', color.toHexString())}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item label="背景颜色">
                  <ColorPicker
                    value={tempSettings.backgroundColor}
                    onChange={(color) => handleSettingChange('backgroundColor', color.toHexString())}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Panel>

          {/* 编辑器设置 */}
          <Panel
            header={
              <Space>
                <SettingOutlined />
                <span>编辑器设置</span>
              </Space>
            }
            key="editor"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                name="enableLineNumbers"
                valuePropName="checked"
                style={{ marginBottom: 8 }}
              >
                <Switch
                  checkedChildren="显示行号"
                  unCheckedChildren="隐藏行号"
                />
              </Form.Item>

              <Form.Item
                name="enableSyntaxHighlight"
                valuePropName="checked"
                style={{ marginBottom: 8 }}
              >
                <Switch
                  checkedChildren="语法高亮"
                  unCheckedChildren="纯文本"
                />
              </Form.Item>

              <Form.Item
                name="autoSave"
                valuePropName="checked"
                style={{ marginBottom: 8 }}
              >
                <Switch
                  checkedChildren="自动保存"
                  unCheckedChildren="手动保存"
                />
              </Form.Item>

              <Form.Item
                name="autoCompile"
                valuePropName="checked"
                style={{ marginBottom: 8 }}
              >
                <Switch
                  checkedChildren="自动编译"
                  unCheckedChildren="手动编译"
                />
              </Form.Item>
            </Space>
          </Panel>
        </Collapse>

        {/* 操作按钮 */}
        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Space>
            <Button onClick={handleReset} icon={<ReloadOutlined />}>
              重置
            </Button>
            <Button onClick={previewSettings}>
              预览
            </Button>
            <Button type="primary" onClick={handleSave} icon={<SaveOutlined />}>
              保存设置
            </Button>
          </Space>
        </div>
      </Form>

      {/* 设置预览 */}
      <Divider />
      <Card size="small" title="当前设置预览" style={{ marginTop: 16 }}>
        <div style={{
          fontFamily: tempSettings.fontFamily,
          fontSize: tempSettings.fontSize,
          lineHeight: tempSettings.lineSpacing,
          color: tempSettings.textColor,
          backgroundColor: tempSettings.backgroundColor,
          padding: 16,
          border: '1px solid #e8e8e8',
          borderRadius: 4
        }}>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ fontFamily: tempSettings.headerFont }}>
              示例标题 (字体: {tempSettings.headerFont})
            </strong>
          </div>
          <div style={{ marginBottom: 8 }}>
            这是一段示例正文，使用 {tempSettings.fontFamily} 字体，
            {tempSettings.fontSize}pt 大小，{tempSettings.lineSpacing} 倍行间距。
          </div>
          <div style={{
            fontFamily: tempSettings.codeFont,
            background: '#f5f5f5',
            padding: 8,
            borderRadius: 4,
            fontSize: tempSettings.fontSize - 1
          }}>
            代码示例 (字体: {tempSettings.codeFont})
          </div>
        </div>
      </Card>
    </div>
    </>
  );
};

export default GlobalSettings;