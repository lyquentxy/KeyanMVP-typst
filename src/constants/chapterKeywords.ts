import type { ChapterType } from '@/types/aiModule';

export const CHAPTER_KEYWORDS: Record<ChapterType, string> = {
  project_overview: '项目概况',
  construction_conditions: '建设条件分析',
  technical_solution: '技术方案',
  construction_organization: '施工组织设计',
  investment_analysis: '财务评价',
  risk_analysis: '风险分析',
  conclusion: '结论与建议'
};

export const CHAPTER_LABELS: Record<ChapterType, string> = {
  project_overview: '第一章 项目概况',
  construction_conditions: '第二章 建设条件分析',
  technical_solution: '第三章 技术方案',
  construction_organization: '第四章 施工组织设计',
  investment_analysis: '第五章 投资估算与经济效益',
  risk_analysis: '第六章 风险分析与应对措施',
  conclusion: '第七章 结论与建议'
};
