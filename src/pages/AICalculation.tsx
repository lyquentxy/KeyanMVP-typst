/**
 * AI工程计算页面组件
 * 基于博创电力AI的工程计算功能，提供智能计算工具
 * 支持各种工程计算公式、图表可视化、结果分析
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
  Form,
  InputNumber,
  Tabs,
  Table,
  Progress,
  Alert,
  Divider,
  Tooltip,
  Statistic,
} from '@/utils/antdComponents';
import {
  CalculatorOutlined,
  LineChartOutlined,
  SaveOutlined,
  ClearOutlined,
  ExportOutlined,
  HistoryOutlined,
  FormOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

interface CalculationResult {
  id: string;
  name: string;
  type: string;
  inputs: Record<string, any>;
  result: any;
  timestamp: Date;
}

const AICalculation: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [activeTab, setActiveTab] = useState('concrete');
  const [currentResult, setCurrentResult] = useState<any>(null);

  // 混凝土强度计算
  const handleConcreteCalculation = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模拟计算结果
      const result = {
        designStrength: values.designStrength,
        standardDeviation: 5.0,
        requiredStrength: values.designStrength + 1.645 * 5.0,
        cementRatio: 0.45,
        waterCementRatio: 0.42,
        aggregateRatio: {
          fine: 35,
          coarse: 65,
        },
        additiveRatio: 2.5,
        recommendation: '建议使用42.5级普通硅酸盐水泥，控制水胶比不超过0.45',
      };

      const calculationResult: CalculationResult = {
        id: Date.now().toString(),
        name: '混凝土强度计算',
        type: 'concrete',
        inputs: values,
        result,
        timestamp: new Date(),
      };

      setResults(prev => [calculationResult, ...prev]);
      setCurrentResult(result);

    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 钢筋用量计算
  const handleSteelCalculation = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = {
        tensileSteel: Math.round((values.moment * 1000000) / (values.steelStrength * 0.9 * values.effectiveDepth)),
        compressionSteel: Math.round(values.tensileSteel * 0.1),
        totalWeight: Math.round((values.tensileSteel + values.compressionSteel) * values.length * 0.617 / 1000),
        spacing: Math.round(1000 / (values.tensileSteel / (3.14159 * Math.pow(values.barDiameter / 2, 2)))),
        recommendation: '建议采用HRB400级钢筋，钢筋间距不宜小于70mm',
      };

      const calculationResult: CalculationResult = {
        id: Date.now().toString(),
        name: '钢筋用量计算',
        type: 'steel',
        inputs: values,
        result,
        timestamp: new Date(),
      };

      setResults(prev => [calculationResult, ...prev]);
      setCurrentResult(result);

    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // 基础承载力计算
  const handleFoundationCalculation = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1800));

      const result = {
        bearingCapacity: Math.round(values.soilStrength * values.width * values.length * 1.2),
        settlementPrediction: Math.round(values.load * 100 / (values.soilModulus * values.width)),
        safetyFactor: Math.round((values.bearingCapacity / values.load) * 100) / 100,
        foundationDepth: Math.round(values.load / (values.soilStrength * values.width) * 1000),
        recommendation: values.safetyFactor > 2.5 ? '基础设计安全' : '建议增加基础尺寸或加深基础',
      };

      const calculationResult: CalculationResult = {
        id: Date.now().toString(),
        name: '基础承载力计算',
        type: 'foundation',
        inputs: values,
        result,
        timestamp: new Date(),
      };

      setResults(prev => [calculationResult, ...prev]);
      setCurrentResult(result);

    } catch (error) {
      console.error('Calculation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container ai-calculation-container">
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>
          AI工程计算
        </Title>
        <Text type="secondary">
          智能工程计算工具，提供专业的计算公式和结果分析
        </Text>
      </div>

      <Row gutter={24}>
        {/* 左侧：计算工具 */}
        <Col span={16}>
          <Card title={
            <Space>
              <CalculatorOutlined />
              工程计算工具
            </Space>
          }>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="混凝土强度" key="concrete">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleConcreteCalculation}
                  initialValues={{
                    designStrength: 30,
                    environmentalCondition: 'normal',
                    durabilityRequirement: 50,
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="designStrength"
                        label="设计强度等级 (MPa)"
                        rules={[{ required: true, message: '请输入设计强度' }]}
                      >
                        <InputNumber
                          min={10}
                          max={80}
                          style={{ width: '100%' }}
                          placeholder="如：30"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="environmentalCondition"
                        label="环境条件"
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="选择环境条件">
                          <Option value="normal">一般环境</Option>
                          <Option value="harsh">恶劣环境</Option>
                          <Option value="marine">海洋环境</Option>
                          <Option value="freeze">冻融环境</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="durabilityRequirement"
                        label="设计使用年限 (年)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={25}
                          max={100}
                          style={{ width: '100%' }}
                          placeholder="如：50"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="structureType"
                        label="结构类型"
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="选择结构类型">
                          <Option value="beam">梁</Option>
                          <Option value="column">柱</Option>
                          <Option value="slab">板</Option>
                          <Option value="wall">墙</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        开始计算
                      </Button>
                      <Button onClick={() => form.resetFields()}>
                        重置
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="钢筋用量" key="steel">
                <Form
                  layout="vertical"
                  onFinish={handleSteelCalculation}
                  initialValues={{
                    moment: 100,
                    steelStrength: 360,
                    effectiveDepth: 450,
                    barDiameter: 20,
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="moment"
                        label="弯矩设计值 (kN·m)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={10}
                          max={10000}
                          style={{ width: '100%' }}
                          placeholder="如：100"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="steelStrength"
                        label="钢筋强度 (MPa)"
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="选择钢筋等级">
                          <Option value={300}>HRB300 (300MPa)</Option>
                          <Option value={360}>HRB400 (360MPa)</Option>
                          <Option value={435}>HRB500 (435MPa)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="effectiveDepth"
                        label="有效高度 (mm)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={100}
                          max={2000}
                          style={{ width: '100%' }}
                          placeholder="如：450"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="barDiameter"
                        label="钢筋直径 (mm)"
                        rules={[{ required: true }]}
                      >
                        <Select placeholder="选择钢筋直径">
                          <Option value={12}>φ12</Option>
                          <Option value={16}>φ16</Option>
                          <Option value={20}>φ20</Option>
                          <Option value={25}>φ25</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        开始计算
                      </Button>
                      <Button>重置</Button>
                    </Space>
                  </Form.Item>
                </Form>
              </TabPane>

              <TabPane tab="基础承载力" key="foundation">
                <Form
                  layout="vertical"
                  onFinish={handleFoundationCalculation}
                  initialValues={{
                    soilStrength: 200,
                    width: 2.0,
                    length: 2.0,
                    load: 800,
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="soilStrength"
                        label="地基承载力特征值 (kPa)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={50}
                          max={1000}
                          style={{ width: '100%' }}
                          placeholder="如：200"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="load"
                        label="上部结构荷载 (kN)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={100}
                          max={10000}
                          style={{ width: '100%' }}
                          placeholder="如：800"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="width"
                        label="基础宽度 (m)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={0.5}
                          max={10}
                          step={0.1}
                          style={{ width: '100%' }}
                          placeholder="如：2.0"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="length"
                        label="基础长度 (m)"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          min={0.5}
                          max={10}
                          step={0.1}
                          style={{ width: '100%' }}
                          placeholder="如：2.0"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Space>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        开始计算
                      </Button>
                      <Button>重置</Button>
                    </Space>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* 右侧：计算结果 */}
        <Col span={8}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {/* 计算结果显示 */}
            {currentResult && (
              <Card
                title={
                  <Space>
                    <LineChartOutlined />
                    计算结果
                  </Space>
                }
                extra={
                  <Space>
                    <Tooltip title="保存结果">
                      <Button size="small" icon={<SaveOutlined />} />
                    </Tooltip>
                    <Tooltip title="导出报告">
                      <Button size="small" icon={<ExportOutlined />} />
                    </Tooltip>
                  </Space>
                }
              >
                {activeTab === 'concrete' && (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic title="配制强度" value={currentResult.requiredStrength} precision={1} suffix="MPa" />
                    <Divider style={{ margin: '12px 0' }} />
                    <div>
                      <Text type="secondary">水胶比：</Text>
                      <Text strong>{currentResult.waterCementRatio}</Text>
                    </div>
                    <div>
                      <Text type="secondary">胶凝材料用量：</Text>
                      <Text strong>{currentResult.cementRatio} kg/m³</Text>
                    </div>
                    <Progress
                      percent={Math.round((currentResult.designStrength / currentResult.requiredStrength) * 100)}
                      status="active"
                      format={(percent) => `强度保证率 ${percent}%`}
                    />
                    <Alert
                      message="计算建议"
                      description={currentResult.recommendation}
                      type="info"
                      showIcon
                      style={{ fontSize: '12px' }}
                    />
                  </Space>
                )}

                {activeTab === 'steel' && (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic title="受拉钢筋面积" value={currentResult.tensileSteel} suffix="mm²" />
                    <div>
                      <Text type="secondary">钢筋重量：</Text>
                      <Text strong>{currentResult.totalWeight} kg</Text>
                    </div>
                    <div>
                      <Text type="secondary">建议间距：</Text>
                      <Text strong>{currentResult.spacing} mm</Text>
                    </div>
                    <Alert
                      message="计算建议"
                      description={currentResult.recommendation}
                      type="info"
                      showIcon
                      style={{ fontSize: '12px' }}
                    />
                  </Space>
                )}

                {activeTab === 'foundation' && (
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Statistic title="承载力" value={currentResult.bearingCapacity} suffix="kN" />
                    <div>
                      <Text type="secondary">安全系数：</Text>
                      <Text strong style={{ color: currentResult.safetyFactor > 2.5 ? '#52c41a' : '#ff4d4f' }}>
                        {currentResult.safetyFactor}
                      </Text>
                    </div>
                    <div>
                      <Text type="secondary">沉降预测：</Text>
                      <Text strong>{currentResult.settlementPrediction} mm</Text>
                    </div>
                    <Alert
                      message="安全评估"
                      description={currentResult.recommendation}
                      type={currentResult.safetyFactor > 2.5 ? 'success' : 'warning'}
                      showIcon
                      style={{ fontSize: '12px' }}
                    />
                  </Space>
                )}
              </Card>
            )}

            {/* 计算历史 */}
            <Card
              title={
                <Space>
                  <HistoryOutlined />
                  计算历史
                </Space>
              }
              size="small"
            >
              {results.length === 0 ? (
                <Text type="secondary">暂无计算记录</Text>
              ) : (
                <div className="system-display-scroll" style={{ maxHeight: '300px' }}>
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      style={{
                        padding: '8px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                      }}
                      onClick={() => setCurrentResult(result.result)}
                    >
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
                        {result.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999' }}>
                        {result.timestamp.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default AICalculation;