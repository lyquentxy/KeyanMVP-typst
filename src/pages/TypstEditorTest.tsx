/**
 * 可研报告编辑器测试页面 - 简化版本
 */

import React from 'react';
import { Typography } from '@/utils/antdComponents';

const { Title, Text } = Typography;

const TypstEditorTest: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>博创电力 Typst 编辑器</Title>
      <Text>这是一个测试页面，用于确认组件能够正常渲染。</Text>
      <div style={{ marginTop: '24px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <p>如果你能看到这段文字，说明基本组件正常工作。</p>
        <p>白屏问题可能在于子组件的错误。</p>
      </div>
    </div>
  );
};

export default TypstEditorTest;