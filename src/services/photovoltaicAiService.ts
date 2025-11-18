import type {
  ChapterBlueprint,
  ChapterType,
  GenerationPayload,
  GenerationResult,
  MiniMaxConfig,
  ModuleStatus,
  PhotovoltaicReportInput,
  RecommendationResult,
  ValidationResult
} from '@/types/aiModule';

const STORAGE_KEY = 'minimax_settings';

const DEFAULT_CONFIG: MiniMaxConfig = {
  apiKey: '',
  baseUrl: 'https://api.minimaxi.com/anthropic',
  model: 'MiniMax-M2',
  temperature: 0.8,
  maxTokens: 1800,
  enableThinking: true,
};

export const SAMPLE_INPUT: PhotovoltaicReportInput = {
  basic: {
    projectName: '成都某科技园区屋顶分布式光伏项目',
    location: '四川省成都市',
    capacityKw: 5000,
    coordinates: '30.5728, 104.0668',
    projectGoal: '建设高安全性分布式光伏示范工程'
  },
  technical: {
    moduleSpecification: 'N型TOPCon 625Wp组件',
    panelSize: '2382×1134×30mm',
    designLife: 25,
    safetyLevel: '二级',
    climateZone: '温和地区',
    buildingType: '厂房屋顶',
    structureSafetyLevel: '二级'
  },
  construction: {
    season: '冬季',
    steelType: 'Q355B',
    antiCorrosion: '热镀锌',
    specialRequirements: '需满足冬季焊接与混凝土施工要求'
  },
  financial: {
    initialInvestment: 3200,
    annualGeneration: 6500000,
    electricityPrice: 0.38,
    oAndMCost: 85
  },
  customNotes: '重点突出冬季施工措施与经济效益分析'
};

const CHAPTER_BLUEPRINTS: Record<ChapterType, ChapterBlueprint> = {
  project_overview: {
    id: 'project_overview',
    title: '第一章 项目概况',
    outline: ['项目背景', '项目地点与条件', '建设规模', '项目目标与意义'],
    emphasis: ['突出项目在新能源战略中的价值', '明确容量和站址信息']
  },
  construction_conditions: {
    id: 'construction_conditions',
    title: '第二章 建设条件分析',
    outline: ['自然条件', '技术条件', '政策环境', '市场条件'],
    emphasis: ['给出气象、荷载、地质条件', '引用GB50009-2012等规范']
  },
  technical_solution: {
    id: 'technical_solution',
    title: '第三章 技术方案',
    outline: ['光伏系统设计', '结构设计', '电气设计', '系统集成方案'],
    emphasis: ['列出电池板尺寸与结构设计年限', '明确组件、逆变器及并网方案']
  },
  construction_organization: {
    id: 'construction_organization',
    title: '第四章 施工组织设计',
    outline: ['施工条件与部署', '冬季施工措施', '施工进度计划', '质量保证体系'],
    emphasis: ['冬季焊接、混凝土、砌体、钢结构措施必须详述', '突出安全与质量']
  },
  investment_analysis: {
    id: 'investment_analysis',
    title: '第五章 投资估算与经济效益分析',
    outline: ['投资估算', '财务测算', '经济与社会效益'],
    emphasis: ['结合用户提供的投资、发电量、电价、运维成本']
  },
  risk_analysis: {
    id: 'risk_analysis',
    title: '第六章 风险分析与应对措施',
    outline: ['技术风险', '市场风险', '政策风险', '风险应对策略'],
    emphasis: ['结合项目地点政策和市场条件提出措施']
  },
  conclusion: {
    id: 'conclusion',
    title: '第七章 结论与建议',
    outline: ['综合评价', '实施建议', '后续工作安排'],
    emphasis: ['形成明确结论并提出落地措施']
  }
};

class DataValidator {
  validate(input: PhotovoltaicReportInput): ValidationResult {
    const issues = [] as ValidationResult['issues'];

    if (!input.basic.projectName?.trim()) {
      issues.push({ field: 'basic.projectName', message: '项目名称为必填项' });
    }
    if (!input.basic.location?.trim()) {
      issues.push({ field: 'basic.location', message: '项目地点为必填项' });
    }
    if (!Number.isFinite(input.basic.capacityKw) || input.basic.capacityKw <= 0) {
      issues.push({ field: 'basic.capacityKw', message: '请提供有效的项目规模(kW)' });
    }
    if (!input.technical.moduleSpecification?.trim()) {
      issues.push({ field: 'technical.moduleSpecification', message: '光伏组件规格为必填项' });
    }
    if (!input.technical.panelSize?.trim()) {
      issues.push({ field: 'technical.panelSize', message: '电池板尺寸为必填项' });
    }
    if (!input.construction.season) {
      issues.push({ field: 'construction.season', message: '施工季节为必填项' });
    }

    const normalized: PhotovoltaicReportInput = {
      basic: {
        ...input.basic,
        capacityKw: Number(input.basic.capacityKw) || 0,
      },
      technical: {
        ...input.technical,
        designLife: input.technical.designLife || 25,
        safetyLevel: input.technical.safetyLevel || '二级',
        structureSafetyLevel: input.technical.structureSafetyLevel || '二级',
      },
      construction: {
        ...input.construction,
      },
      financial: {
        initialInvestment: Number(input.financial.initialInvestment) || 0,
        annualGeneration: Number(input.financial.annualGeneration) || 0,
        electricityPrice: Number(input.financial.electricityPrice) || 0,
        oAndMCost: Number(input.financial.oAndMCost) || 0,
      },
      customNotes: input.customNotes?.trim() || undefined,
    };

    return {
      valid: issues.length === 0,
      normalized,
      issues,
    };
  }
}

class PromptGenerator {
  buildSystemPrompt(input: PhotovoltaicReportInput): string {
    return `你是一名光伏电站可行性研究报告撰写专家，需要遵循以下规范：\n- 引用《建筑结构荷载规范》GB50009-2012\n- 引用《光伏发电站设计规范》GB50797-2012\n- 引用《钢结构设计标准》GB50017-2017\n- 结构设计年限 ${input.technical.designLife} 年，安全等级 ${input.technical.safetyLevel}`;
  }

  buildChapterPrompt(chapter: ChapterBlueprint, input: PhotovoltaicReportInput, extraContext?: string): string {
    const { basic, technical, construction, financial } = input;
    return `你是一名专业的光伏项目可研报告工程师，请根据以下数据撰写章节《${chapter.title}》。\n\n【项目基本信息】\n- 项目名称：${basic.projectName}\n- 项目地点：${basic.location}\n- 项目规模：${basic.capacityKw} kW\n- 项目目标：${basic.projectGoal || '围绕新能源示范工程建设'}\n\n【技术参数】\n- 光伏组件规格：${technical.moduleSpecification}\n- 电池板尺寸：${technical.panelSize}\n- 系统设计年限：${technical.designLife} 年\n- 结构安全等级：${technical.safetyLevel}\n- 气候条件：${technical.climateZone}\n- 建筑类型：${technical.buildingType}\n\n【施工条件】\n- 施工季节：${construction.season}\n- 钢材类型：${construction.steelType}\n- 防腐要求：${construction.antiCorrosion}\n- 特殊要求：${construction.specialRequirements || '无'}\n\n【财务数据】\n- 初始投资：${financial.initialInvestment} 万元\n- 年发电量：${financial.annualGeneration} kWh\n- 电价：${financial.electricityPrice} 元/kWh\n- 运维成本：${financial.oAndMCost} 万元/年\n\n【章节重点】\n- 章节结构：${chapter.outline.join('、')}\n- 重点关注：${chapter.emphasis.join('；')}\n${extraContext ? `\n【额外上下文】\n${extraContext}` : ''}\n\n请严格按照技术报告的行文规范进行撰写，语言专业、准确、客观。`;
  }

  buildRecommendationPrompt(input: PhotovoltaicReportInput): string {
    return `根据以下项目参数，为光伏可研报告推荐最重要的章节组合，并解释理由。\n项目名称：${input.basic.projectName}\n所在地点：${input.basic.location}\n规模：${input.basic.capacityKw} kW\n施工季节：${input.construction.season}\n钢材类型：${input.construction.steelType}\n防腐要求：${input.construction.antiCorrosion}\n\n输出格式：\n1. 推荐章节英文标识数组（project_overview等）；\n2. 推荐理由摘要。`;
  }
}

class TypstTemplateAssembler {
  wrapChapter(blueprint: ChapterBlueprint, content: string): string {
    return `#pagebreak()\n\n= ${blueprint.title}\n\n${content}`;
  }
}

class MiniMaxClient {
  async invoke(prompt: string, config: MiniMaxConfig, options?: { systemPrompt?: string; maxTokens?: number }): Promise<GenerationResult> {
    type ContentBlock = {
      type: string;
      text?: string;
      thinking?: string;
    };
    const endpoint = `${config.baseUrl.replace(/\/$/, '')}/v1/messages`;
    const body: Record<string, unknown> = {
      model: config.model,
      max_tokens: options?.maxTokens ?? config.maxTokens,
      temperature: config.temperature,
      system: options?.systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    };

    if (config.enableThinking) {
      body.thinking = { budget_tokens: 1024 };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`MiniMax调用失败(${response.status}): ${errorBody}`);
    }

    const data = await response.json() as { content?: ContentBlock[]; usage?: { output_tokens?: number } };
    const contentBlocks: ContentBlock[] = Array.isArray(data?.content) ? data.content : [];
    const text = contentBlocks
      .filter(block => block.type === 'text' && block.text)
      .map(block => block.text as string)
      .join('\n')
      .trim();
    const reasoningBlocks = contentBlocks
      .filter(block => block.type === 'thinking' && block.thinking)
      .map(block => block.thinking as string)
      .join('\n')
      .trim();

    return {
      content: text,
      reasoning: reasoningBlocks || undefined,
      tokensUsed: data?.usage?.output_tokens,
    };
  }
}

export class PhotovoltaicAIModule {
  private config: MiniMaxConfig = { ...DEFAULT_CONFIG };
  private lastInput: PhotovoltaicReportInput = SAMPLE_INPUT;
  private readonly validator = new DataValidator();
  private readonly prompt = new PromptGenerator();
  private readonly assembler = new TypstTemplateAssembler();
  private readonly client = new MiniMaxClient();

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('MiniMax配置读取失败', error);
    }
  }

  private persistConfig(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (error) {
      console.warn('MiniMax配置保存失败', error);
    }
  }

  public setConfig(partial: Partial<MiniMaxConfig>): MiniMaxConfig {
    this.config = { ...this.config, ...partial };
    this.persistConfig();
    return this.config;
  }

  public getConfig(): MiniMaxConfig {
    return this.config;
  }

  public getCachedInput(): PhotovoltaicReportInput {
    return this.lastInput;
  }

  public validateInput(input: PhotovoltaicReportInput): ValidationResult {
    return this.validator.validate(input);
  }

  public async generateChapter(payload: GenerationPayload): Promise<GenerationResult> {
    const validation = this.validator.validate(payload.input);
    if (!validation.valid) {
      const message = validation.issues.map(issue => `${issue.field}: ${issue.message}`).join('\n');
      throw new Error(`项目数据未通过校验:\n${message}`);
    }

    const blueprint = CHAPTER_BLUEPRINTS[payload.chapter];
    if (!blueprint) {
      throw new Error(`未知章节标识: ${payload.chapter}`);
    }

    const systemPrompt = this.prompt.buildSystemPrompt(validation.normalized);
    const chapterPrompt = this.prompt.buildChapterPrompt(blueprint, validation.normalized, payload.customContext);
    this.lastInput = validation.normalized;
    const result = await this.client.invoke(chapterPrompt, this.config, { systemPrompt });
    return {
      ...result,
      content: this.assembler.wrapChapter(blueprint, result.content),
    };
  }

  public async generateDocument(chapters: ChapterType[], input: PhotovoltaicReportInput): Promise<GenerationResult> {
    const outputs: string[] = [];
    let reasoning = '';
    for (const chapter of chapters) {
      const result = await this.generateChapter({ chapter, input });
      outputs.push(result.content);
      if (result.reasoning) {
        reasoning += `\n[${CHAPTER_BLUEPRINTS[chapter].title}] ${result.reasoning}`;
      }
    }
    return {
      content: outputs.join('\n\n'),
      reasoning: reasoning.trim() || undefined,
    };
  }

  public async recommendChapters(input: PhotovoltaicReportInput): Promise<RecommendationResult> {
    const validation = this.validator.validate(input);
    if (!validation.valid) {
      const message = validation.issues.map(issue => `${issue.field}: ${issue.message}`).join('\n');
      throw new Error(`数据校验失败:\n${message}`);
    }

    const prompt = this.prompt.buildRecommendationPrompt(validation.normalized);
    this.lastInput = validation.normalized;
    const response = await this.client.invoke(prompt, this.config, {
      systemPrompt: '请只输出JSON，包含fields: chapters(string array)和rationale。'
    });

    try {
      const parsed = JSON.parse(response.content);
      const recommended = Array.isArray(parsed.chapters) ? parsed.chapters : [];
      const valid = recommended.filter((id: string): id is ChapterType => id in CHAPTER_BLUEPRINTS);
      return {
        recommendedChapters: valid.length ? valid : Object.keys(CHAPTER_BLUEPRINTS) as ChapterType[],
        rationale: parsed.rationale || '模型未提供理由',
      };
    } catch {
      return {
        recommendedChapters: Object.keys(CHAPTER_BLUEPRINTS) as ChapterType[],
        rationale: '未能解析模型返回，已回退到默认章节组合。'
      };
    }
  }

  public async askExpert(question: string): Promise<GenerationResult> {
    if (!question.trim()) {
      throw new Error('请输入有效问题');
    }

    const context = this.lastInput || SAMPLE_INPUT;
    const prompt = `你是光伏可研报告专家，请结合以下项目参数回答问题：\n项目：${context.basic.projectName}\n地点：${context.basic.location}\n规模：${context.basic.capacityKw}kW\n施工季节：${context.construction.season}\n钢材：${context.construction.steelType}\n防腐：${context.construction.antiCorrosion}\n\n问题：${question}\n\n回答要求：\n- 使用技术术语并引用规范\n- 对问题进行条理化解答\n- 如需要可给出Typst片段或建议`; 

    return this.client.invoke(prompt, this.config, {
      systemPrompt: this.prompt.buildSystemPrompt(context),
      maxTokens: Math.min(this.config.maxTokens, 1200)
    });
  }

  public async getModuleStatus(): Promise<ModuleStatus> {
    if (!this.config.apiKey) {
      return {
        connected: false,
        message: 'MiniMax API Key未配置',
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      connected: true,
      message: '配置完整，可调用MiniMax接口',
      model: this.config.model,
      lastChecked: new Date().toISOString(),
    };
  }
}

export const photovoltaicAIService = new PhotovoltaicAIModule();
