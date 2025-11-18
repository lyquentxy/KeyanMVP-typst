/**
 * MiniMax AI 助手
 * 根据 typst-ai-module-design.md 对 DataValidator + PromptGenerator 的要求实现章节生成。
 */

import React, { useMemo, useState } from 'react';
import {
  Card,
  Button,
  Input,
  Space,
  Typography,
  Tag,
  Spin,
  Alert,
  Divider,
  Select,
  Collapse,
  useMessage,
  Form,
  Row,
  Col,
  InputNumber,
  List
} from '@/utils/antdComponents';
import {
  RobotOutlined,
  ThunderboltOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { photovoltaicAIService, SAMPLE_INPUT } from '@/services/photovoltaicAiService';
import type { ChapterType, PhotovoltaicReportInput, ValidationIssue } from '@/types/aiModule';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

interface DocumentSection {
  id: string;
  type: 'cover1' | 'cover2' | 'toc' | 'chapter';
  title: string;
  content: string;
  order: number;
  aiAgent?: string;
}

interface AIAssistantProps {
  currentSection?: DocumentSection;
  onContentUpdate: (content: string) => void;
}

const CHAPTER_LABELS: Record<ChapterType, string> = {
  project_overview: '第一章 项目概况',
  construction_conditions: '第二章 建设条件分析',
  technical_solution: '第三章 技术方案',
  construction_organization: '第四章 施工组织设计',
  investment_analysis: '第五章 投资估算与经济效益',
  risk_analysis: '第六章 风险分析与应对措施',
  conclusion: '第七章 结论与建议'
};

const seasonOptions = ['春季', '夏季', '秋季', '冬季'];
const steelOptions = ['Q235B', 'Q355B', 'S250GD', 'S350GD'];
const antiCorrosionOptions = ['热镀锌', '环氧富锌涂层', '其他'];
const climateOptions = ['寒冷地区', '温和地区', '炎热地区'];
const buildingTypes = ['厂房屋顶', '商业建筑', '公共建筑', '工业厂房'];

const mapFormToInput = (values: PhotovoltaicReportInput): PhotovoltaicReportInput => ({
  basic: {
    ...values.basic,
    capacityKw: Number(values.basic.capacityKw) || 0
  },
  technical: {
    ...values.technical,
    designLife: Number(values.technical.designLife) || 25
  },
  construction: values.construction,
  financial: {
    initialInvestment: Number(values.financial.initialInvestment) || 0,
    annualGeneration: Number(values.financial.annualGeneration) || 0,
    electricityPrice: Number(values.financial.electricityPrice) || 0,
    oAndMCost: Number(values.financial.oAndMCost) || 0
  },
  customNotes: values.customNotes
});

const AIAssistant: React.FC<AIAssistantProps> = ({ currentSection, onContentUpdate }) => {
  const [form] = Form.useForm<PhotovoltaicReportInput>();
  const [selectedChapter, setSelectedChapter] = useState<ChapterType>('technical_solution');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [result, setResult] = useState<{ content: string; reasoning?: string } | null>(null);
  const [messageApi, contextHolder] = useMessage();

  const config = photovoltaicAIService.getConfig();
  const configBadge = useMemo(
    () => (config.apiKey ? <Tag color="green">MiniMax已配置</Tag> : <Tag color="orange">待配置API</Tag>),
    [config.apiKey]
  );

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      const input = mapFormToInput(values);
      const validation = photovoltaicAIService.validateInput(input);
      setValidationIssues(validation.issues);
      if (!validation.valid) {
        messageApi.error('填写的数据未通过验证，请完善必填字段');
        return;
      }

      setIsProcessing(true);
      const generation = await photovoltaicAIService.generateChapter({
        chapter: selectedChapter,
        input,
        customContext: customInstruction || input.customNotes
      });
      setResult(generation);
      if (currentSection) {
        onContentUpdate(generation.content);
      }
      messageApi.success(`${CHAPTER_LABELS[selectedChapter]} 已生成`);
    } catch (error) {
      messageApi.error((error as Error).message || 'AI生成失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecommend = async () => {
    try {
      const values = await form.validateFields();
      const input = mapFormToInput(values);
      const recommendation = await photovoltaicAIService.recommendChapters(input);
      setSelectedChapter(recommendation.recommendedChapters[0] || 'project_overview');
      messageApi.success(`优先章节：${recommendation.recommendedChapters.map(ch => CHAPTER_LABELS[ch]).join('、')}`);
    } catch (error) {
      messageApi.error((error as Error).message || '无法获取章节推荐');
    }
  };

  return (
    <Card
      title={
        <Space align="center">
          <RobotOutlined />
          MiniMax 可研助手
          {configBadge}
        </Space>
      }
      extra={
        <Space>
          <Select
            value={selectedChapter}
            style={{ width: 220 }}
            onChange={(value: ChapterType) => setSelectedChapter(value)}
            options={Object.entries(CHAPTER_LABELS).map(([value, label]) => ({ value, label }))}
          />
          <Button icon={<BulbOutlined />} onClick={handleRecommend}>
            智能推荐章节
          </Button>
          <Button type="primary" icon={<ThunderboltOutlined />} loading={isProcessing} onClick={handleGenerate}>
            生成内容
          </Button>
        </Space>
      }
      className="ai-assistant-card"
    >
      {contextHolder}
      {!currentSection && (
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message="请在左侧选择一个章节以应用生成的内容"
          style={{ marginBottom: 16 }}
        />
      )}

      <Collapse defaultActiveKey={['form']} bordered={false} style={{ background: 'transparent' }}>
        <Panel header="项目参数填写" key="form">
          <Form form={form} layout="vertical" initialValues={SAMPLE_INPUT}>
            <Divider orientation="left">项目基本信息</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={['basic', 'projectName']} label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
                  <Input placeholder="例如：XX园区屋顶分布式光伏项目" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['basic', 'location']} label="项目地点" rules={[{ required: true, message: '请输入项目地点' }]}>
                  <Input placeholder="省市+详细位置" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={['basic', 'capacityKw']} label="项目规模(kW)" rules={[{ required: true, message: '请输入规模' }]}>
                  <InputNumber style={{ width: '100%' }} min={1} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['basic', 'coordinates']} label="经纬度(可选)">
                  <Input placeholder="30.57,104.06" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name={['basic', 'projectGoal']} label="项目目标">
              <Input placeholder="项目定位或目标" />
            </Form.Item>

            <Divider orientation="left">技术参数</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={['technical', 'moduleSpecification']} label="光伏组件规格" rules={[{ required: true, message: '请输入组件规格' }]}>
                  <Input placeholder="例如：N型TOPCon 625Wp" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['technical', 'panelSize']} label="电池板尺寸(mm)" rules={[{ required: true, message: '请输入尺寸' }]}>
                  <Input placeholder="2382×1134×30" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name={['technical', 'designLife']} label="系统设计年限(年)">
                  <InputNumber min={1} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['technical', 'safetyLevel']} label="结构安全等级">
                  <Select options={[{ value: '一级' }, { value: '二级' }, { value: '三级' }]} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['technical', 'climateZone']} label="气候条件">
                  <Select options={climateOptions.map(value => ({ value }))} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name={['technical', 'buildingType']} label="建筑物类型">
                  <Select options={buildingTypes.map(value => ({ value }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name={['technical', 'structureSafetyLevel']} label="建筑安全等级">
                  <Select options={[{ value: '一级' }, { value: '二级' }, { value: '三级' }]} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">施工条件</Divider>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name={['construction', 'season']} label="施工季节" rules={[{ required: true, message: '请选择施工季节' }]}>
                  <Select options={seasonOptions.map(value => ({ value }))} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['construction', 'steelType']} label="钢材类型" rules={[{ required: true, message: '请选择钢材' }]}>
                  <Select options={steelOptions.map(value => ({ value }))} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={['construction', 'antiCorrosion']} label="防腐要求" rules={[{ required: true, message: '请选择防腐要求' }]}>
                  <Select options={antiCorrosionOptions.map(value => ({ value }))} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name={['construction', 'specialRequirements']} label="特殊施工要求">
              <Input placeholder="例如：冬季混凝土需添加防冻剂" />
            </Form.Item>

            <Divider orientation="left">财务数据</Divider>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item name={['financial', 'initialInvestment']} label="初始投资(万元)" rules={[{ required: true, message: '请输入投资额' }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['financial', 'annualGeneration']} label="年发电量(kWh)" rules={[{ required: true, message: '请输入发电量' }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['financial', 'electricityPrice']} label="电价(元/kWh)" rules={[{ required: true, message: '请输入电价' }]}>
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item name={['financial', 'oAndMCost']} label="运维成本(万元/年)" rules={[{ required: true, message: '请输入运维成本' }]}>
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="customNotes" label="补充说明">
              <Input placeholder="强调的规范或风格要求" />
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>

      <Divider orientation="left">自定义指令</Divider>
      <TextArea
        autoSize={{ minRows: 3, maxRows: 5 }}
        placeholder="告知AI需要强调的重点或修改方向"
        value={customInstruction}
        onChange={e => setCustomInstruction(e.target.value)}
      />

      {validationIssues.length > 0 && (
        <Alert
          style={{ marginTop: 16 }}
          type="error"
          showIcon
          message="待处理的验证问题"
          description={
            <List
              size="small"
              dataSource={validationIssues}
              renderItem={item => <List.Item>{item.field}：{item.message}</List.Item>}
            />
          }
        />
      )}

      <Divider orientation="left">生成结果</Divider>
      <Spin spinning={isProcessing} tip="MiniMax 正在撰写章节...">
        {result ? (
          <div className="ai-result-panel">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={4}>{CHAPTER_LABELS[selectedChapter]}</Title>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{result.content}</Paragraph>
              {result.reasoning && (
                <Alert
                  type="info"
                  showIcon
                  icon={<FileDoneOutlined />}
                  message="模型推理摘要"
                  description={<Paragraph style={{ whiteSpace: 'pre-wrap' }}>{result.reasoning}</Paragraph>}
                />
              )}
              {currentSection && (
                <Alert
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                  message={`已同步到章节：${currentSection.title}`}
                />
              )}
            </Space>
          </div>
        ) : (
          <Alert
            type="info"
            showIcon
            icon={<RobotOutlined />}
            message="未生成内容"
            description="填写项目参数并点击“生成内容”获取Typst章节。"
          />
        )}
      </Spin>
    </Card>
  );
};

export default AIAssistant;
