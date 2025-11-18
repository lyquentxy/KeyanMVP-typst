# Typst AI生成模块设计文档

## 1. 模块概述

Typst AI生成模块是一个专注于高质量技术文档生成的AI驱动系统，基于MiniMax M2模型和Typst排版引擎，专为光伏项目可行性研究报告等专业技术文档设计。

### 1.1 设计原则
- **模块化设计**：各章节独立生成，便于维护和扩展
- **标准化输出**：严格遵循Typst格式规范
- **智能整合**：自动按逻辑顺序整合章节内容
- **高质量编译**：确保生成的PDF文档专业美观
- **兼容性保障**：与现有系统无缝集成

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    Typst AI生成模块                          │
├─────────────────────────────────────────────────────────────┤
│  输入层                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │
│  │   表单数据   │ │  文件上传   │ │     API接口数据        │  │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  处理层                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │
│  │  数据验证器  │ │  提示词生成器 │ │     章节生成器         │  │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  生成层                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │
│  │ AI内容生成器 │ │ Typst模板引擎│ │    文档整合器          │  │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  输出层                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐  │
│  │  章节验证器  │ │  编译引擎   │ │      PDF导出器          │  │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

#### 2.2.1 DataValidator（数据验证器）
- **功能**：验证输入数据的完整性和规范性
- **输入**：用户表单数据、文件数据
- **输出**：验证结果、标准化数据对象
- **规则**：遵循应用构想中定义的数据要求

#### 2.2.2 PromptGenerator（提示词生成器）
- **功能**：根据数据生成专业的AI提示词
- **输入**：标准化数据对象、章节类型
- **输出**：结构化提示词
- **模板**：基于应用构想中的提示词模板设计

#### 2.2.3 ChapterGenerator（章节生成器）
- **功能**：生成独立章节的Typst内容
- **输入**：提示词、AI模型响应
- **输出**：章节Typst源码
- **支持章节**：
  - 项目概况 (ProjectOverview)
  - 建设条件分析 (ConstructionConditions)
  - 技术方案 (TechnicalSolution)
  - 施工组织设计 (ConstructionOrganization)
  - 投资估算与经济效益 (InvestmentAnalysis)
  - 风险分析 (RiskAnalysis)
  - 结论与建议 (Conclusion)

#### 2.2.4 TemplateEngine（Typst模板引擎）
- **功能**：提供预定义的Typst模板和样式
- **输入**：章节内容、模板标识
- **输出**：格式化的Typst源码
- **模板类型**：
  - 标准技术报告模板
  - 光伏专业文档模板
  - 图表模板
  - 公式模板

#### 2.2.5 DocumentIntegrator（文档整合器）
- **功能**：按逻辑顺序整合各章节
- **输入**：章节Typst源码集合
- **输出**：完整文档Typst源码
- **整合规则**：
  1. 文档头部（包导入、样式定义）
  2. 标题页
  3. 目录
  4. 各章节按顺序整合
  5. 附录和参考文献

#### 2.2.6 CompilerEngine（编译引擎）
- **功能**：将Typst源码编译为PDF
- **输入**：完整文档Typst源码
- **输出**：高质量PDF文档
- **编译选项**：
  - 页面大小：A4
  - 字体：思源黑体、宋体
  - 行间距：1.5倍
  - 页边距：2.5cm

## 3. 数据结构设计

### 3.1 输入数据结构

```javascript
// ProjectData 标准化输入数据
interface ProjectData {
  // 项目基本信息
  projectBasicInfo: {
    name: string;           // 项目名称（必填）
    location: string;       // 项目地点（必填）
    scale: number;          // 项目规模 kW（必填）
    coordinates?: string;   // 项目地点经纬度（可选）
  };
  
  // 技术参数
  technicalParams: {
    panelSpec: string;      // 光伏组件规格（必填）
    panelSize: string;      // 电池板尺寸（必填，如2382×1134×30）
    designLife: number;     // 系统设计年限（默认25）
    safetyLevel: string;    // 结构安全等级（默认二级）
    climateCondition: string; // 地点气候条件
    buildingType: string;   // 建筑物类型
  };
  
  // 施工条件
  constructionConditions: {
    season: string;         // 施工季节（必填）
    steelType: string;      // 钢材类型（必填）
    antiCorrosion: string;  // 防腐要求（必填）
    specialRequirements?: string; // 特殊施工要求
  };
  
  // 财务数据
  financialData: {
    initialInvestment: number; // 初始投资估算 万元（必填）
    annualGeneration: number;  // 年发电量 kWh（必填）
    electricityPrice: number;  // 电价 元/kWh（必填）
    operationCost: number;     // 运维成本 万元/年（必填）
  };
}
```

### 3.2 章节数据结构

```javascript
// Chapter 生成章节数据
interface Chapter {
  id: string;              // 章节ID
  type: ChapterType;       // 章节类型
  title: string;           // 章节标题
  content: string;         // 章节内容（Typst格式）
  order: number;           // 章节顺序
  dependencies: string[];  // 依赖的章节ID
  variables: Record<string, any>; // 章节变量
}

// ChapterType 章节类型枚举
enum ChapterType {
  PROJECT_OVERVIEW = "project_overview",
  CONSTRUCTION_CONDITIONS = "construction_conditions",
  TECHNICAL_SOLUTION = "technical_solution",
  CONSTRUCTION_ORGANIZATION = "construction_organization",
  INVESTMENT_ANALYSIS = "investment_analysis",
  RISK_ANALYSIS = "risk_analysis",
  CONCLUSION = "conclusion"
}
```

### 3.3 文档模板结构

```javascript
// Template 文档模板
interface Template {
  id: string;
  name: string;
  version: string;
  structure: ChapterStructure[];
  styles: TemplateStyles;
  metadata: TemplateMetadata;
}

interface ChapterStructure {
  type: ChapterType;
  title: string;
  required: boolean;
  order: number;
  template: string; // Typst模板标识
}

interface TemplateStyles {
  fonts: {
    chinese: string;
    english: string;
    code: string;
  };
  spacing: {
    lineHeight: number;
    paragraphSpacing: number;
    sectionSpacing: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}
```

## 4. 接口设计

### 4.1 主要API接口

```javascript
// TypstAIService 主要服务接口
class TypstAIService {
  // 生成完整文档
  async generateDocument(
    projectData: ProjectData,
    options?: GenerationOptions
  ): Promise<DocumentResult>;
  
  // 生成单个章节
  async generateChapter(
    chapterType: ChapterType,
    projectData: ProjectData,
    context?: ChapterContext
  ): Promise<Chapter>;
  
  // 编译文档
  async compileDocument(
    typstSource: string,
    options?: CompilationOptions
  ): Promise<CompilationResult>;
  
  // 验证文档质量
  async validateDocument(
    documentId: string
  ): Promise<ValidationResult>;
}

// GenerationOptions 生成选项
interface GenerationOptions {
  template?: string;
  language?: 'zh-CN' | 'en-US';
  quality?: 'draft' | 'standard' | 'premium';
  includeGraphics?: boolean;
  includeCharts?: boolean;
}

// DocumentResult 文档生成结果
interface DocumentResult {
  documentId: string;
  chapters: Chapter[];
  typstSource: string;
  pdfUrl?: string;
  metadata: {
    generatedAt: Date;
    wordCount: number;
    pageCount: number;
    generationTime: number;
  };
}
```

### 4.2 数据流转流程

```
用户输入数据 → 数据验证 → 提示词生成 → AI内容生成 → 
章节格式化 → 模板应用 → 文档整合 → 编译生成PDF → 
质量验证 → 结果输出
```

## 5. 章节生成逻辑

### 5.1 提示词模板设计

基于应用构想中的LLM提示词模板，设计结构化的提示词生成系统：

```javascript
// PromptTemplates 提示词模板
const PromptTemplates = {
  [ChapterType.PROJECT_OVERVIEW]: `
作为光伏项目可行性研究报告专家，请撰写项目概况章节。

项目信息：
- 项目名称：{projectName}
- 项目地点：{projectLocation}
- 项目规模：{projectScale}kW
- 项目背景：{projectBackground}

技术参数：
- 光伏组件规格：{panelSpec}
- 电池板尺寸：{panelSize}
- 系统设计年限：{designLife}年
- 结构安全等级：{safetyLevel}

请按照以下结构生成Typst格式内容：
1. 项目基本情况
2. 项目建设的必要性
3. 项目建设的可行性
4. 项目实施的基础条件

要求：
- 使用专业技术术语
- 数据准确，逻辑清晰
- 符合Typst格式规范
- 内容详实，论述充分
`,

  [ChapterType.CONSTRUCTION_CONDITIONS]: `
请撰写建设条件分析章节。

自然条件：
- 地点：{projectLocation}
- 气候条件：{climateCondition}
- 经纬度：{coordinates}

建设条件：
- 建设地点选择依据
- 自然条件对项目建设的影响
- 交通运输条件
- 供水供电条件
- 原材料供应条件

请生成符合Typst格式的专业内容。
`,

  // ... 其他章节模板
};
```

### 5.2 章节生成流程

```javascript
class ChapterGenerationService {
  async generateChapter(
    chapterType: ChapterType,
    projectData: ProjectData,
    context?: ChapterContext
  ): Promise<Chapter> {
    
    // 1. 数据预处理
    const processedData = this.preprocessData(projectData, chapterType);
    
    // 2. 生成提示词
    const prompt = this.generatePrompt(chapterType, processedData);
    
    // 3. 调用AI模型
    const aiResponse = await this.callAIModel(prompt);
    
    // 4. 解析和格式化内容
    const content = this.formatContent(aiResponse, chapterType);
    
    // 5. 应用Typst模板
    const typstContent = this.applyTemplate(content, chapterType);
    
    // 6. 创建章节对象
    return {
      id: this.generateChapterId(chapterType),
      type: chapterType,
      title: this.getChapterTitle(chapterType),
      content: typstContent,
      order: this.getChapterOrder(chapterType),
      dependencies: this.getDependencies(chapterType),
      variables: processedData
    };
  }
}
```

## 6. Typst模板系统

### 6.1 基础模板结构

```typst
#import "@preview/cthulu:0.3.0": *
#import "@preview/ella:0.1.0": *
#import "@preview/cheq:0.2.0": *

#set page(
  paper: "a4",
  margin: (2.5cm, 2.5cm, 2.5cm, 2.5cm),
  header: context {
    if counter(page).get().first() > 1 {
      align(right, text(10pt, rgb(100, 100, 100))[
        #h(1fr) #smartquote[#smartquote[#smartquote[#smartquote[#smartquote[#smartquote[#smartquote[#smartquote[#smartquote[#smartquote[光伏项目可行性研究报告]]]]]]]]]]]
      ]
    }
  },
  footer: context {
    if counter(page).get().first() > 1 {
      align(center, text(10pt, rgb(100, 100, 100))[
        #counter(page).display("第 1 页，共 1 页")
      ])
    }
  }
)

#set text(
  font: ("Source Han Sans", "SimHei"),
  size: 12pt,
  lang: "zh",
  hyphenate: false,
)

#set heading(numbering: "1.1")
#set outline(title: "目录", depth: 3)

// 专业报告样式定义
#let report-header(title: "", authors: (), date: datetime.today()) = {
  v(3cm)
  align(center)[
    #block({
      text(24pt, weight: "bold")[
        智能光伏项目可行性研究报告
      ]
      v(0.5cm)
      text(18pt, weight: "bold")[#title]
    })
    v(2cm)
    #block({
      text(14pt)[
        #authors.join(", ")
      ]
      v(0.3cm)
      text(12pt)[#date.display("[year]年[month]月[day]日")]
    })
  ]
  pagebreak()
}
```

### 6.2 章节模板

```typst
#let chapter-template(title: "", content: "") = {
  v(1cm)
  heading(level: 1, numbering: none)[#title]
  v(0.5cm)
  content
  v(1cm)
}

#let section-template(title: "", content: "") = {
  v(0.8cm)
  heading(level: 2)[#title]
  v(0.3cm)
  content
}

#let subsection-template(title: "", content: "") = {
  v(0.5cm)
  heading(level: 3)[#title]
  v(0.2cm)
  content
}
```

### 6.3 专业内容模板

```typst
#let technical-spec(specs: (:)) = {
  table(
    columns: (auto, 1fr),
    align: (left, left),
    ..specs.pairs().map(((k, v)) => (k, str(v))).flatten()
  )
}

#let construction-measures(measures: ()) = {
  for measure in measures {
    block(breakable: false)[
      #measure
    ]
  }
}

#let financial-analysis(data: (:)) = {
  table(
    columns: (auto, auto, auto, auto),
    table.header[*项目*][*数值*][*单位*][*备注*],
    ..data.pairs().map(((k, v)) => (k, str(v.value), v.unit, v.note)).flatten()
  )
}
```

## 7. 文档整合流程

### 7.1 整合器设计

```javascript
class DocumentIntegrator {
  async integrateChapters(
    chapters: Chapter[],
    template: Template
  ): Promise<string> {
    
    // 1. 按依赖关系排序章节
    const sortedChapters = this.sortChaptersByDependencies(chapters);
    
    // 2. 生成文档头部
    const documentHeader = this.generateDocumentHeader(template);
    
    // 3. 生成标题页
    const titlePage = this.generateTitlePage(template);
    
    // 4. 生成目录
    const tableOfContents = this.generateTableOfContents(sortedChapters);
    
    // 5. 整合各章节内容
    const chaptersContent = this.integrateChapterContent(sortedChapters);
    
    // 6. 生成文档尾部
    const documentFooter = this.generateDocumentFooter(template);
    
    // 7. 合并所有内容
    return [
      documentHeader,
      titlePage,
      tableOfContents,
      chaptersContent,
      documentFooter
    ].join("\n");
  }
}
```

### 7.2 质量保证流程

```javascript
class DocumentQualityAssurance {
  async validateDocument(typstSource: string): Promise<ValidationResult> {
    const checks = [
      this.checkSyntax(typstSource),
      this.checkStructure(typstSource),
      this.checkContent(typstSource),
      this.checkReferences(typstSource),
      this.checkFormatting(typstSource)
    ];
    
    const results = await Promise.all(checks);
    return this.aggregateValidationResults(results);
  }
  
  private async checkSyntax(source: string): Promise<CheckResult> {
    // 检查Typst语法正确性
    // 验证括号匹配、引用格式等
  }
  
  private async checkStructure(source: string): Promise<CheckResult> {
    // 检查文档结构完整性
    // 验证章节顺序、标题层级等
  }
}
```

## 8. 编译和导出

### 8.1 编译引擎

```javascript
class TypstCompiler {
  async compile(
    source: string,
    options: CompilationOptions = {}
  ): Promise<CompilationResult> {
    
    // 1. 预处理源码
    const processedSource = this.preprocessSource(source);
    
    // 2. 创建临时文件
    const tempDir = await this.createTempDirectory();
    const sourceFile = await this.writeSourceFile(processedSource, tempDir);
    
    // 3. 执行编译
    const compilationResult = await this.executeCompilation(sourceFile, options);
    
    // 4. 验证输出
    const validationResult = await this.validateOutput(compilationResult);
    
    // 5. 清理临时文件
    await this.cleanup(tempDir);
    
    return {
      success: compilationResult.success,
      pdfPath: compilationResult.pdfPath,
      metadata: compilationResult.metadata,
      validation: validationResult
    };
  }
}
```

### 8.2 导出选项

```javascript
interface CompilationOptions {
  format: 'pdf' | 'png' | 'svg';
  quality: 'draft' | 'print' | 'archive';
  fontSize?: number;
  lineHeight?: number;
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  includeMetadata?: boolean;
  watermark?: {
    text: string;
    opacity: number;
    position: 'center' | 'corners';
  };
}
```

## 9. 性能优化

### 9.1 缓存策略

- **章节缓存**：已生成的章节内容缓存，避免重复生成
- **模板缓存**：Typst模板预编译和缓存
- **AI响应缓存**：相同提示词的AI响应缓存
- **编译缓存**：已编译文档的缓存

### 9.2 并行处理

- **章节并行生成**：独立章节可并行生成
- **批量编译**：多个文档可批量编译
- **异步处理**：非关键步骤异步执行

### 9.3 资源管理

- **内存优化**：及时释放大对象
- **文件清理**：临时文件自动清理
- **连接池**：数据库和API连接复用

## 10. 监控和日志

### 10.1 监控指标

```javascript
interface Metrics {
  generationTime: {
    total: number;
    perChapter: Record<ChapterType, number>;
  };
  successRate: {
    overall: number;
    perChapter: Record<ChapterType, number>;
  };
  resourceUsage: {
    memory: number;
    cpu: number;
    disk: number;
  };
  qualityMetrics: {
    averageWordCount: number;
    averagePageCount: number;
    userSatisfaction: number;
  };
}
```

### 10.2 日志系统

```javascript
class TypstAILogger {
  logGenerationStart(documentId: string, projectData: ProjectData): void {
    this.info('Generation started', {
      documentId,
      projectName: projectData.projectBasicInfo.name,
      timestamp: new Date().toISOString()
    });
  }
  
  logChapterComplete(chapterId: string, duration: number, success: boolean): void {
    this.info('Chapter generation completed', {
      chapterId,
      duration,
      success,
      timestamp: new Date().toISOString()
    });
  }
  
  logError(error: Error, context: any): void {
    this.error('Operation failed', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }
}
```

## 11. 安全规范

### 11.1 数据安全

- **输入验证**：严格验证所有输入数据
- **SQL注入防护**：使用参数化查询
- **XSS防护**：对输出内容进行转义
- **文件上传安全**：限制文件类型和大小

### 11.2 AI模型安全

- **提示词注入防护**：对用户输入进行过滤
- **内容审核**：对AI生成内容进行审核
- **输出限制**：限制AI生成内容的范围和格式

### 11.3 访问控制

- **身份验证**：基于JWT的身份验证
- **权限控制**：基于角色的访问控制
- **API限制**：请求频率和并发数限制

## 12. 扩展性设计

### 12.1 插件系统

```javascript
interface Plugin {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  
  // 生命周期钩子
  onInit(context: PluginContext): Promise<void>;
  onGenerateChapter(chapter: Chapter): Promise<Chapter>;
  onValidateDocument(document: string): Promise<ValidationResult>;
  onCompile(source: string): Promise<string>;
}
```

### 12.2 多文档类型支持

- **报告类型扩展**：支持其他类型的技术报告
- **模板系统扩展**：支持自定义模板
- **语言支持扩展**：支持多语言文档生成

### 12.3 API扩展

- **RESTful API**：提供标准REST接口
- **GraphQL API**：支持复杂查询
- **WebSocket API**：支持实时更新

## 13. 与现有系统集成

### 13.1 数据库集成

```javascript
// 使用现有的PostgreSQL数据库
class DatabaseIntegration {
  async saveGeneratedDocument(document: GeneratedDocument): Promise<void> {
    const query = `
      INSERT INTO generated_documents (
        document_id, project_data, typst_source, pdf_url,
        generation_time, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await this.db.query(query, [
      document.id,
      JSON.stringify(document.projectData),
      document.typstSource,
      document.pdfUrl,
      document.generationTime,
      document.status,
      JSON.stringify(document.metadata)
    ]);
  }
}
```

### 13.2 API接口适配

```javascript
// 适配现有的RESTful API
class APIIntegration {
  async handleDocumentGenerationRequest(req: Request): Promise<Response> {
    // 1. 解析请求数据
    const projectData = await this.parseRequestData(req);
    
    // 2. 调用Typst AI模块
    const result = await this.typstAIService.generateDocument(projectData);
    
    // 3. 返回标准响应格式
    return this.formatResponse(result);
  }
}
```

### 13.3 前端集成

```javascript
// 前端集成接口
const TypstAIModule = {
  async generateReport(formData: FormData): Promise<GenerationResult> {
    const response = await fetch('/api/documents/generate', {
      method: 'POST',
      body: JSON.stringify(formData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    return response.json();
  },
  
  async previewDocument(documentId: string): Promise<PreviewResult> {
    const response = await fetch(`/api/documents/${documentId}/preview`);
    return response.json();
  }
};
```

## 14. 总结

本Typst AI生成模块设计严格遵循应用构想中的技术架构和业务需求，具备以下特点：

### 14.1 核心优势

1. **专业性**：专门针对光伏项目可行性研究报告优化
2. **模块化**：各组件独立，便于维护和扩展
3. **标准化**：严格遵循Typst格式规范
4. **智能化**：基于MiniMax M2模型的内容生成
5. **高质量**：完整质量保证流程
6. **可集成**：与现有系统无缝集成

### 14.2 技术特色

1. **分层架构**：清晰的分层设计，职责明确
2. **数据驱动**：基于标准化的数据模型
3. **模板系统**：灵活的Typst模板引擎
4. **质量保证**：多层次的质量验证机制
5. **性能优化**：缓存、并行处理等优化策略
6. **安全可靠**：完善的安全和监控体系

### 14.3 扩展能力

1. **文档类型扩展**：支持多种技术报告类型
2. **模板扩展**：支持自定义模板和样式
3. **功能扩展**：插件系统支持功能扩展
4. **集成扩展**：支持多种集成方式

该设计为光伏项目可行性研究报告生成系统提供了一个强大、灵活、可扩展的AI文档生成解决方案，能够显著提升文档生成效率和质量，同时保持与现有系统的完美兼容。