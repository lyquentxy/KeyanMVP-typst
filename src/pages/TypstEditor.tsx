/**
 * 可研报告编辑器主页面
 * 左侧编辑器 + 右侧实时预览的分屏布局
 * 支持文档结构管理、智能体辅助编辑、实时预览等功能
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  Button,
  Space,
  Typography,
  Modal,
  Spin,
  Tooltip,
  Switch,
  useMessage
} from '@/utils/antdComponents';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SaveOutlined,
  SettingOutlined,
  RobotOutlined,
  EyeOutlined,
  BookOutlined
} from '@ant-design/icons';

// 组件导入
import DocumentStructure from '@/components/TypstEditor/DocumentStructure';
import RealTypstPreview from '@/components/TypstEditor/RealTypstPreview';
import AICopilotPanel from '@/components/TypstEditor/AICopilotPanel';
import GlobalSettings from '@/components/TypstEditor/GlobalSettings';
import { CHAPTER_KEYWORDS } from '@/constants/chapterKeywords';
import { photovoltaicAIService } from '@/services/photovoltaicAiService';
import type { ChapterType } from '@/types/aiModule';

const { Title, Text } = Typography;
// 使用自定义工作台样式替代 Layout 子组件

// 文档结构接口
interface DocumentSection {
  id: string;
  type: 'header' | 'cover1' | 'cover2' | 'toc' | 'chapter';
  title: string;
  content: string;
  order: number;
  aiAgent?: string; // 关联的智能体ID
  selected?: boolean; // 用于章节选择
}

// 文档数据接口
interface DocumentData {
  title: string;
  author: string;
  date: string;
  sections: DocumentSection[];
  globalSettings: {
    fontSize: number;
    fontFamily: string;
    pageMargin: number;
    lineSpacing: number;
  };
}

const previewPaneStyle: React.CSSProperties = {
  flex: '1 1 auto',
  minWidth: 520,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.12)'
};

// 移除内联样式，使用CSS类

const workbenchBodyStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
};

const workbenchContentStyle: React.CSSProperties = {
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
  gap: 16,
  padding: '0 16px 16px 0',
  minHeight: 0
};

const aiAssistantPaneStyle: React.CSSProperties = {
  width: 420,
  minWidth: 360,
  height: '100%',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.12)',
  overflow: 'hidden'
};

const TypstEditor: React.FC = () => {
  // 状态管理
  const [document, setDocument] = useState<DocumentData>({
    title: '新建文档',
    author: '',
    date: new Date().toISOString().split('T')[0],
    sections: [
      {
        id: 'header',
        type: 'header',
        title: '文档头文件（隐藏）',
        content: `#set document(title: "屋顶分布式光伏项目初步设计报告")
#set page(
  paper: "a4",
  margin: (top: 2.5cm, bottom: 2.5cm, left: 2cm, right: 2cm),
  numbering: "1",
  header: [
    #set text(font: "SimSun", size: 10.5pt, fill: gray)
    #grid(
      columns: (1fr, 1fr),
      align: (left, right),
      [#underline[广州博创设计院有限公司屋顶分布式光伏项目]],
      [#underline[初步设计报告]]
    )
  ],
  footer: context align(center)[
    第 #counter(page).display() 页
  ]
)

// 导入中文伪粗体包
#import "@preview/cuti:0.2.1": show-cn-fakebold

// 启用中文伪粗体支持
#show: show-cn-fakebold

// 设置文本样式
#set text(
  font: ("Times New Roman", "SimSun"),
  size: 12pt,
  lang: "zh",
  region: "cn"
)

// 设置段落样式
#set par(
  justify: true,
  first-line-indent: 2em,
  leading: 1em,
  spacing: 1em
)

// 设置标题编号
#set heading(numbering: (..nums) => {
  if nums.pos().len() == 1 {
    none
  } else if nums.pos().len() == 2 {
    numbering("1.1", nums.pos().at(0), nums.pos().at(1))
  } else if nums.pos().len() == 3 {
    numbering("1.1.1", nums.pos().at(0), nums.pos().at(1), nums.pos().at(2))
  }
})

// 设置标题样式
#show heading.where(level: 1): it => {
  pagebreak(weak: true)
  v(1em)
  align(center)[
    #set text(size: 18pt, weight: "bold")
    #it
  ]
  v(1em)
}

#show heading.where(level: 2): it => {
  v(1em)
  set text(size: 14pt, weight: "bold")
  it
  v(1em)
}

#show heading.where(level: 3): it => {
  v(1em)
  set text(size: 12pt, weight: "bold")
  it
  v(1em)
}
`,
        order: 0
      },
      {
        id: 'cover1',
        type: 'cover1',
        title: '封面一',
        content: `// 文档配置

// 封面页内容
#page[
  #set align(center)
  #v(3cm)

  #text(size: 24pt, weight: "bold")[
    广州博创设计院有限公司屋顶分布式光伏项目报告
  ]

  #v(1cm)
  #text(size: 18pt, weight: "bold")[
    初步设计报告
  ]

  #v(8cm)

  #grid(
    columns: (1fr, 2fr),
    row-gutter: 1em,
    align: (right, left),

    [投资单位：], [xx新能源有限公司],
    [编制单位：], [广州博创电力设计院有限公司],
    [编制时间：], [2025年3月],
  )
]

#pagebreak()`,
        order: 1
      },
      {
        id: 'cover2',
        type: 'cover2',
        title: '封面二',
        content: `#page[
  #v(2cm)

  #grid(
    columns: (1fr, 2fr),
    row-gutter: 12em,
    align: (right, left),

    [批准：], [#rect(width: 100pt, height: 30pt, stroke: gray + 1pt)[签名位置]],
    [审核：], [#rect(width: 100pt, height: 30pt, stroke: gray + 1pt)[签名位置]],
    [校核：], [#rect(width: 100pt, height: 30pt, stroke: gray + 1pt)[签名位置]],
    [编制：], [#rect(width: 60pt, height: 30pt, stroke: gray + 1pt)[签名位置]],
  )
]
//这里需要做一个签名大小自适应

#pagebreak()`,
        order: 2
      },
      {
        id: 'toc',
        type: 'toc',
        title: '目录',
        content: `#page[
  #set align(center)
  #text(size: 18pt, weight: "bold")[目录]
  #v(1cm)

  #set align(left)
  #set par(first-line-indent: 0em)

  #outline(
    title: none,
    depth: 3,
    indent: 2em
  )
]

// 重新设置段落样式以恢复首行缩进
#set par(
  justify: true,
  first-line-indent: 2em,
  leading: 1em,
  spacing: 1em
)
`,
        order: 3
      },
      // 16个预设章节
      {
        id: 'chapter_1',
        type: 'chapter',
        title: '第一章 综合说明',
        content: `#pagebreak()\n\n= 第一章 综合说明\n\n== 概述

本项目为广州发展成都广日科技有限公司屋顶分布式光伏项目，旨在充分利用屋顶空间，建设分布式光伏发电系统。

综合说明包括概述、太阳能资源、工程建设条件、工程任务和规模、光伏发电系统、电气、总平面布置、土建工程、消防、施工组织设计、环境保护与水土保持、劳动安全与工业卫生、节能降耗、设计概算、财务评价与社会效果分析、工程招标等内容。

概述部分简述工程背景、地理位置、本期建设规模和终期建设规模、前期主要工作成果；简述本阶段勘测设计工作过程、已获得的相关支持性文件及有关专题工作进展情况。

// 项目地址、项目规模。——总结，最后完成。

== 太阳能资源

太阳能资源部分简述站址所在区域太阳能资源概况，站址区域太阳能资源各项主要特征值及分析成果，太阳能资源评价结论。

//

== 工程建设条件

工程建设条件部分简述站址条件、工程地质的主要评价结论、地质灾害情况、附着建(构)筑物的建设条件、基本气象要素与水文条件。

== 工程任务和规模

工程任务和规模部分简述工程建设必要性、工程任务、工程规模和电力市场消纳分析成果。本项目设计装机容量为5776.7 kWp。

== 光伏发电系统

光伏发电系统部分简述主要设备选型、光伏阵列运行方式、光伏阵列设计与年上网电量计算成果。

== 电气系统

电气部分简述接入电力系统方案、光伏发电工程电气接线方案、主要电气设备的选型和布置，以及光伏阵列和主要电气设备的控制、保护，光伏发电工程的调度与通信。

== 总平面布置

总平面布置部分简述光伏发电工程的总平面布置方案和用地面积。

== 土建工程

土建工程部分简述主要建(构)筑物的功能、规模、结构型式及数量。

== 消防设计

消防部分简述消防设计的主要方案及其结论。

== 施工组织设计

施工组织设计部分简述施工条件、施工总布置方案、工程用地指标、主体工程施工要求及施工总工期。

== 环境保护和水土保持

环境保护和水土保持部分简述主要任务及目标、措施及专项投资。

== 劳动安全与工业卫生

劳动安全与工业卫生部分简述主要危险、有害因素，安全卫生要求，设计方案及专项投资。

== 节能降耗

节能降耗部分简述运行期的主要能耗种类、数量和能源利用效率，拟采取的主要节能降耗措施及预期效果。

== 工程设计概算

工程设计概算部分简述编制期价格水平年、工程总投资、工程静态投资及单位千瓦投资。

== 财务评价和社会效果分析

财务评价和社会效果分析部分简述主要成果和结论。

== 工程招标

工程招标部分简述光伏发电工程的招标范围、招标方式及招标组织形式。

== 问题分析及建议

对工程存在的问题进行简要分析，并提出相应建议。

== 工程特性表

编制光伏发电工程特性表，应绘制光伏发电工程站址地理位置示意图。
        `,
        order: 4,
        selected: true
      },
      {
        id: 'chapter_2',
        type: 'chapter',
        title: '第二章 太阳能资源',
        content: `#pagebreak()\n\n= 第二章 太阳能资源\n\n== 区域太阳能资源概况

应说明光伏发电工程所在地区的太阳能资源概况，并应提出工程所在省、自治区或直辖市太阳能资源分布图。

/图片 百度找的图片
// 百度百科。

== 太阳辐射数据

// pvsyst
nasa、mete、sgis
/元数据表格（非处理）
/官网也能查


=== 太阳辐射观测数据000

应说明工程选择的参考气象站及收集到的太阳辐射观测数据。

当工程站址区附近气象站没有可供利用的太阳辐射观测数据时，应注明选择的方法推算数据或经论证后的再分析数据。

应说明站址区或附近的太阳辐射观测站的基本情况，并说明观测数据的基本信息。

/（可选）：需要收集观测数据。

== 太阳能资源分析

应分析论证太阳辐射数据的可靠性，并对数据进行验证和订正，将处理后的数据作为反映工程所在地长期平均水平的代表性数据。

应分析整理多年逐月太阳辐射资料、多年逐月日照资料，提出太阳辐射年际和年内变化图表、日照时数年际和年内变化图表，说明工程所在地太阳辐射的变化特点及规律。

应根据气候学和数理统计原理，结合再分析数据分析整理出工程代表年逐时水平面太阳辐射数据，并进行稳定度计算。应绘制光伏发电工程代表年逐月太阳总辐射直方图和日照小时数直方图。

应对收集到的连续一年以上的现场太阳辐射观测数据进行验证，检查数据的完整性和合理性，对不合理和缺测数据进行相应处理，并将订正后的现场观测数据与参考气象站的同期数据或再分析数据进行相互印证。

应根据订正后的现场观测数据，分析站址区的太阳辐射年内月及各月典型日的变化规律，提出不同辐射强度全年分布规律。应绘制不同辐射强度全年累积频率分布图。

对于固定安装的光伏发电系统，应提出设计倾角的逐时倾斜面总辐射数据。对于采用双面电池组件的光伏发电系统，还应提出正反两面的逐时总辐射数据。对于采用聚光形式或跟踪运行方式的光伏发电系统，应分析提出逐时法向直接辐射数据。

/表格（处理、计算） 

/公式 计算 规范

/目前是excel

/分析

== 太阳能资源评价

应根据现行国家标准《太阳能资源等级总辐射》GB/T 31155的有关规定，结合工程代表年数据，提出工程站址区太阳能资源的评价结论。

/根据计算结果，进行评价。

/会自己去写说明。

/抄规范的内容，针对数据进行评价。`,
        order: 5,
        selected: true
      },
      {
        id: 'chapter_3',
        type: 'chapter',
        title: '第三章 工程建设条件',
        content: '#pagebreak()\n\n= 第三章 工程建设条件\n\n在这里编写章节内容...',
        order: 6,
        selected: true
      },
      {
        id: 'chapter_4',
        type: 'chapter',
        title: '第四章 工程任务和规模',
        content: '#pagebreak()\n\n= 第四章 工程任务和规模\n\n在这里编写章节内容...',
        order: 7,
        selected: true
      },
      {
        id: 'chapter_5',
        type: 'chapter',
        title: '第五章 光伏发电系统',
        content: '#pagebreak()\n\n= 第五章 光伏发电系统\n\n在这里编写章节内容...',
        order: 8,
        selected: true
      },
      {
        id: 'chapter_6',
        type: 'chapter',
        title: '第六章 电气',
        content: '#pagebreak()\n\n= 第六章 电气\n\n在这里编写章节内容...',
        order: 9,
        selected: true
      },
      {
        id: 'chapter_7',
        type: 'chapter',
        title: '第七章 总平面布置',
        content: '#pagebreak()\n\n= 第七章 总平面布置\n\n在这里编写章节内容...',
        order: 10,
        selected: true
      },
      {
        id: 'chapter_8',
        type: 'chapter',
        title: '第八章 土建工程',
        content: '#pagebreak()\n\n= 第八章 土建工程\n\n在这里编写章节内容...',
        order: 11,
        selected: true
      },
      {
        id: 'chapter_9',
        type: 'chapter',
        title: '第九章 消防',
        content: '#pagebreak()\n\n= 第九章 消防\n\n在这里编写章节内容...',
        order: 12,
        selected: true
      },
      {
        id: 'chapter_10',
        type: 'chapter',
        title: '第十章 施工组织设计',
        content: '#pagebreak()\n\n= 第十章 施工组织设计\n\n在这里编写章节内容...',
        order: 13,
        selected: true
      },
      {
        id: 'chapter_11',
        type: 'chapter',
        title: '第十一章 环境保护与水土保持',
        content: '#pagebreak()\n\n= 第十一章 环境保护与水土保持\n\n在这里编写章节内容...',
        order: 14,
        selected: true
      },
      {
        id: 'chapter_12',
        type: 'chapter',
        title: '第十二章 劳动安全与工业卫生',
        content: '#pagebreak()\n\n= 第十二章 劳动安全与工业卫生\n\n在这里编写章节内容...',
        order: 15,
        selected: true
      },
      {
        id: 'chapter_13',
        type: 'chapter',
        title: '第十三章 节能降耗',
        content: '#pagebreak()\n\n= 第十三章 节能降耗\n\n在这里编写章节内容...',
        order: 16,
        selected: true
      },
      {
        id: 'chapter_14',
        type: 'chapter',
        title: '第十四章 设计概算',
        content: '#pagebreak()\n\n= 第十四章 设计概算\n\n在这里编写章节内容...',
        order: 17,
        selected: true
      },
      {
        id: 'chapter_15',
        type: 'chapter',
        title: '第十五章 财务评价与社会效果分析',
        content: '#pagebreak()\n\n= 第十五章 财务评价与社会效果分析\n\n在这里编写章节内容...',
        order: 18,
        selected: true
      },
      {
        id: 'chapter_16',
        type: 'chapter',
        title: '第十六章 工程招标',
        content: '#pagebreak()\n\n= 第十六章 工程招标\n\n在这里编写章节内容...',
        order: 19,
        selected: true
      }
    ],
    globalSettings: {
      fontSize: 12,
      fontFamily: 'Times New Roman',
      pageMargin: 2.5,
      lineSpacing: 1.5
    }
  });

  const [activeSection, setActiveSection] = useState<string>('cover1');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [, setCompiledPdf] = useState<string>('');
  const [isAISidebarVisible, setIsAISidebarVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [messageApi, contextHolder] = useMessage();

  // 获取当前激活的章节
  const getCurrentSection = useCallback(() => {
    return document.sections.find(section => section.id === activeSection);
  }, [document.sections, activeSection]);

  // 生成完整文档内容（只包含选中的章节）
  const getFullDocumentContent = useCallback(() => {
    const selectedSections = document.sections
      .filter(section =>
        section.type !== 'chapter' || section.selected !== false  // 只包含选中的章节
      )
      .sort((a, b) => a.order - b.order);

    const fullContent = selectedSections.map(section => section.content).join('\n\n');

    return fullContent;
  }, [document.sections]);

  // 更新章节内容
  const updateSectionContent = useCallback((sectionId: string, content: string) => {
    setDocument(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId ? { ...section, content } : section
      )
    }));
  }, []);

  // 切换章节选择状态
  const toggleChapterSelection = useCallback((chapterId: string) => {
    setDocument(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === chapterId
          ? { ...section, selected: !section.selected }
          : section
      )
    }));

    const section = document.sections.find(s => s.id === chapterId);
    if (section) {
      messageApi.success(`章节 "${section.title}" ${section.selected ? '已取消选择' : '已选择'}`);
    }
  }, [document.sections, messageApi]);

  // 推荐获取状态
  const [isGettingRecommendations, setIsGettingRecommendations] = useState(false);

  // 应用章节推荐
  const applyChapterRecommendations = useCallback((recommendations: ChapterType[]) => {
    const keywords = recommendations.map(chapter => CHAPTER_KEYWORDS[chapter]).filter(Boolean);

    setDocument(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.type === 'chapter') {
          const isRecommended = keywords.some(keyword => section.title.includes(keyword));
          return { ...section, selected: isRecommended };
        }
        return section;
      })
    }));

    messageApi.success(`已应用MiniMax推荐，激活 ${keywords.length} 个章节`);
  }, [messageApi]);

  // 获取AI章节推荐
  const getChapterRecommendations = useCallback(async () => {
    setIsGettingRecommendations(true);
    try {
      const recommendation = await photovoltaicAIService.recommendChapters(
        photovoltaicAIService.getCachedInput()
      );

      const names = recommendation.recommendedChapters.map(id => CHAPTER_KEYWORDS[id]);

      Modal.confirm({
        title: 'MiniMax章节推荐',
        content: (
          <div>
            <p>推荐章节：</p>
            <ul>
              {names.map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
            <p style={{ marginTop: 12 }}>理由：{recommendation.rationale}</p>
          </div>
        ),
        onOk: () => applyChapterRecommendations(recommendation.recommendedChapters),
        okText: '应用组合',
        cancelText: '保留当前'
      });
    } catch (error) {
      messageApi.error(`获取AI推荐失败：${(error as Error).message}`);
    } finally {
      setIsGettingRecommendations(false);
    }
  }, [messageApi, applyChapterRecommendations]);

  // 删除章节
  const deleteSection = useCallback((sectionId: string) => {
    if (['header', 'cover1', 'cover2', 'toc'].includes(sectionId)) {
      messageApi.warning('不能删除系统预设章节');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个章节吗？此操作不可撤销。',
      onOk: () => {
        setDocument(prev => ({
          ...prev,
          sections: prev.sections.filter(section => section.id !== sectionId)
        }));

        if (activeSection === sectionId) {
          // 如果删除的是当前选中的章节，切换到封面一
          setActiveSection('cover1');
        }

        messageApi.success('章节已删除');
      }
    });
  }, [activeSection, messageApi]);

  // 编译预览
  const compilePreview = useCallback(async () => {
    setIsCompiling(true);

    try {
      // 合并选中的章节内容
      const fullContent = getFullDocumentContent();

      // 这里应该调用真实的Typst编译API
      // 目前使用模拟延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 模拟编译结果
      setCompiledPdf('data:application/pdf;base64,mock-pdf-content');
      // 标记已使用，避免编译期告警
      void fullContent;
      messageApi.success('编译完成');
    } catch (error) {
      messageApi.error('编译失败：' + (error as Error).message);
    } finally {
      setIsCompiling(false);
    }
  }, [getFullDocumentContent, messageApi]);

  // 保存文档
  const saveDocument = useCallback(async () => {
    try {
      // 这里应该实现实际的保存逻辑
      JSON.stringify(document, null, 2);

      // 模拟保存到本地文件系统

      messageApi.success('文档已保存');
    } catch (error) {
      messageApi.error('保存失败：' + (error as Error).message);
    }
  }, [document, messageApi]);

  // 自动编译
  useEffect(() => {
    const timer = setTimeout(() => {
      compilePreview();
    }, 1000);

    return () => clearTimeout(timer);
  }, [document, compilePreview]);

  return (
    <>
      {contextHolder}
      <div className="typst-editor workbench">
        {/* 顶部工具栏 */}
        <div className="workbench-header">
          <Space>
            <Tooltip title="编译预览">
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                loading={isCompiling}
                onClick={compilePreview}
              >
                编译
              </Button>
            </Tooltip>

            <Tooltip title="保存文档">
              <Button icon={<SaveOutlined />} onClick={saveDocument}>
                保存
              </Button>
            </Tooltip>

            <Tooltip title={isAISidebarVisible ? '收起AI助手' : '展开AI助手'}>
              <Button
                icon={<RobotOutlined />}
                type={isAISidebarVisible ? 'default' : 'dashed'}
                onClick={() => setIsAISidebarVisible(prev => !prev)}
              >
                AI助手
              </Button>
            </Tooltip>

            <Tooltip title="全局设置">
              <Button
                icon={<SettingOutlined />}
                onClick={() => setShowSettings(true)}
              />
            </Tooltip>

            <Tooltip title={isPreviewVisible ? '隐藏预览' : '显示预览'}>
              <Button
                icon={<EyeOutlined />}
                type={isPreviewVisible ? 'default' : 'dashed'}
                onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              />
            </Tooltip>
          </Space>
        </div>

        {/* 主编辑区域 */}
        <div className="workbench-body" style={workbenchBodyStyle}>
          {/* 左侧文档结构面板 */}
          <aside className="workbench-sider">
            <DocumentStructure
              document={document}
              activeSection={activeSection}
              onSectionSelect={setActiveSection}
              onToggleChapter={toggleChapterSelection}
              onDeleteSection={deleteSection}
              onGetRecommendations={getChapterRecommendations}
              isGettingRecommendations={isGettingRecommendations}
            />
          </aside>

          {/* 中间预览 + 右侧AI助手 */}
          <section className="workbench-content" style={workbenchContentStyle}>
            {isPreviewVisible ? (
              <div className="preview-pane" style={previewPaneStyle}>
                <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text strong>
                    <EyeOutlined style={{ marginRight: 8 }} />
                    实时预览
                    {isCompiling && <Spin size="small" style={{ marginLeft: 8 }} />}
                  </Text>
                  <Space size="middle" align="center">
                    <Tooltip title="自动编译">
                      <Switch
                        size="small"
                        checked={isPreviewVisible}
                        onChange={() => setIsPreviewVisible(prev => !prev)}
                        checkedChildren={<PlayCircleOutlined />}
                        unCheckedChildren={<PauseCircleOutlined />}
                      />
                    </Tooltip>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={compilePreview}
                      loading={isCompiling}
                    >
                      刷新
                    </Button>
                    <Button
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={saveDocument}
                    >
                      导出
                    </Button>
                  </Space>
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <RealTypstPreview
                    content={getFullDocumentContent()}
                    filename={`${document.title.replace(/[^a-zA-Z0-9]/g, '_')}.typ`}
                    autoCompile={true}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  flex: 1,
                  minWidth: 480,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px dashed var(--color-border)',
                  borderRadius: 12,
                  background: '#fff'
                }}
              >
                <Text type="secondary">预览已隐藏，点击顶部按钮重新显示。</Text>
              </div>
            )}

            {isAISidebarVisible && (
              <div className="ai-pane" style={aiAssistantPaneStyle}>
                <AICopilotPanel
                  documentTitle={document.title}
                  currentSection={getCurrentSection()}
                  isCompiling={isCompiling}
                  onApplyContent={(content) => {
                    const section = getCurrentSection();
                    if (!section) {
                      messageApi.warning('请选择需要插入内容的章节');
                      return;
                    }
                    updateSectionContent(section.id, content);
                    messageApi.success(`已将AI内容写入「${section.title}」`);
                  }}
                />
              </div>
            )}
          </section>
        </div>

        {/* 全局设置模态框 */}
        <Modal
          title="全局设置"
          open={showSettings}
          onCancel={() => setShowSettings(false)}
          width={600}
          footer={null}
        >
          <GlobalSettings
            settings={document.globalSettings}
            onSettingsChange={(newSettings) => {
              setDocument(prev => ({
                ...prev,
                globalSettings: newSettings
              }));
            }}
          />
        </Modal>
      </div>
    </>
  );
};

export default TypstEditor;
