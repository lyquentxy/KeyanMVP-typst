/**
 * Typst AI 模块类型定义
 * 对应 docx/typst-ai-module-design.md 和应用构想中的结构化需求
 */

export type ChapterType =
  | 'project_overview'
  | 'construction_conditions'
  | 'technical_solution'
  | 'construction_organization'
  | 'investment_analysis'
  | 'risk_analysis'
  | 'conclusion';

export interface BasicProjectInfo {
  projectName: string;
  location: string;
  capacityKw: number;
  coordinates?: string;
  projectGoal?: string;
}

export interface TechnicalParameters {
  moduleSpecification: string;
  panelSize: string;
  designLife: number;
  safetyLevel: string;
  climateZone: string;
  buildingType: string;
  structureSafetyLevel?: string;
}

export interface ConstructionConditions {
  season: '春季' | '夏季' | '秋季' | '冬季';
  steelType: string;
  antiCorrosion: string;
  specialRequirements?: string;
}

export interface FinancialData {
  initialInvestment: number;
  annualGeneration: number;
  electricityPrice: number;
  oAndMCost: number;
}

export interface PhotovoltaicReportInput {
  basic: BasicProjectInfo;
  technical: TechnicalParameters;
  construction: ConstructionConditions;
  financial: FinancialData;
  customNotes?: string;
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  normalized: PhotovoltaicReportInput;
  issues: ValidationIssue[];
}

export interface MiniMaxConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  enableThinking: boolean;
}

export interface ChapterBlueprint {
  id: ChapterType;
  title: string;
  outline: string[];
  emphasis: string[];
}

export interface GenerationPayload {
  chapter: ChapterType;
  input: PhotovoltaicReportInput;
  customContext?: string;
}

export interface GenerationResult {
  content: string;
  tokensUsed?: number;
  reasoning?: string;
}

export interface ModuleStatus {
  connected: boolean;
  message: string;
  model?: string;
  lastChecked: string;
}

export interface RecommendationResult {
  recommendedChapters: ChapterType[];
  rationale: string;
}

