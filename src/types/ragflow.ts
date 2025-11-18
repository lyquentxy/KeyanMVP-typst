/**
 * RAGFlow API 相关类型定义
 * 完整的 TypeScript 类型支持，确保类型安全
 */

// 基础 API 响应类型
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

// 分页参数类型
export interface PaginationParams {
  page: number;
  page_size: number;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
}

// ==================== 数据集相关类型 ====================

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  language: string;
  embedding_model: string;
  permission: 'me' | 'team';
  document_count: number;
  chunk_count: number;
  parse_method: string;
  avatar: string;
  created_time: string;
  updated_time: string;
}

export interface CreateDatasetRequest {
  name: string;
  description?: string;
  language?: string;
  embedding_model?: string;
  permission?: 'me' | 'team';
  parse_method?: string;
}

export interface UpdateDatasetRequest {
  name?: string;
  description?: string;
  language?: string;
  embedding_model?: string;
  permission?: 'me' | 'team';
  parse_method?: string;
}

// ==================== 文档相关类型 ====================

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  token_count: number;
  chunk_count: number;
  progress: number;
  progress_msg: string;
  process_begin_at: string;
  process_duation: number;
  run: string;
  status: 'UNSTART' | 'RUNNING' | 'CANCEL' | 'DONE' | 'FAIL';
  created_time: string;
  updated_time: string;
}

export interface UploadDocumentRequest {
  dataset_id: string;
  file: File;
}

// ==================== 章节相关类型 ====================

export interface Chapter {
  id: string;
  document_id: string;
  title: string;
  content: string;
  level: number;
  page_number?: number;
  position: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_time: string;
  updated_time: string;
  parent_id?: string;
  children?: Chapter[];
}

export interface ChapterNode extends Chapter {
  key: string;
  title: string;
  children?: ChapterNode[];
}

// ==================== 智能体相关类型 ====================

export interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  language: string;
  dataset_ids: string[];
  llm: {
    model: string;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    max_tokens: number;
  };
  prompt: string;
  created_time: string;
  updated_time: string;
}

export interface CreateAgentRequest {
  name: string;
  description?: string;
  avatar?: string;
  language?: string;
  dataset_ids?: string[];
  llm?: {
    model?: string;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
    max_tokens?: number;
  };
  prompt?: string;
}

export interface UpdateAgentRequest extends CreateAgentRequest {
  id: string;
}

// ==================== 对话相关类型 ====================

export interface Chat {
  id: string;
  name: string;
  assistant_id: string;
  message_count: number;
  created_time: string;
  updated_time: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  reference?: Reference[];
  created_time: string;
}

export interface Reference {
  id: string;
  chunk_id: string;
  document_id: string;
  document_name: string;
  content: string;
  page_number?: number;
  similarity: number;
}

export interface SendMessageRequest {
  conversation_id?: string;
  message: string;
  quote?: boolean;
  doc_ids?: string[];
  stream?: boolean;
}

export interface CreateChatRequest {
  name?: string;
  assistant_id: string;
}

// ==================== 用户设置相关类型 ====================

export interface UserSettings {
  ragflow_api_key: string;
  ragflow_base_url: string;
  default_language: string;
  default_model: string;
  auto_save: boolean;
  theme: 'light' | 'dark';
  default_agent_id?: string;
  default_dataset_id?: string;
}

// ==================== 统计信息相关类型 ====================

export interface SystemStats {
  dataset_count: number;
  document_count: number;
  agent_count: number;
  chat_count: number;
  total_chunks: number;
  total_tokens: number;
}

export interface ServiceStatus {
  ragflow_connected: boolean;
  ragflow_version?: string;
  last_check_time: string;
  error_message?: string;
}

// ==================== 错误类型 ====================

export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

class RagflowApiError extends Error {
  public code: number;
  public details?: any;

  constructor(message: string, code: number, details?: any) {
    super(message);
    this.name = 'RagflowApiError';
    this.code = code;
    this.details = details;
  }
}

// ==================== HTTP 相关类型 ====================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
}

export interface StreamResponse {
  data: string;
  done: boolean;
}

// ==================== 组件状态相关类型 ====================

export interface LoadingState {
  loading: boolean;
  error?: string;
}

export interface TableState<T> extends LoadingState {
  data: T[];
  total: number;
  current: number;
  pageSize: number;
}

export interface FormState<T> extends LoadingState {
  data?: T;
  visible: boolean;
  mode: 'create' | 'edit' | 'view';
}

// ==================== 路由参数类型 ====================

export interface AgentChatParams {
  agentId: string;
  chatId?: string;
}

// ==================== 文件上传相关类型 ====================

export interface UploadFileInfo {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
  percent?: number;
  response?: any;
  error?: any;
}

// ==================== 树形数据相关类型 ====================

export interface TreeNodeData {
  key: string;
  title: string;
  children?: TreeNodeData[];
  disabled?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  isLeaf?: boolean;
  icon?: React.ReactNode;
}

// ==================== 搜索相关类型 ====================

export interface SearchParams {
  keyword?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ==================== 主题相关类型 ====================

export interface ThemeSettings {
  primary_color: string;
  border_radius: number;
  font_size: number;
  compact_mode: boolean;
}

// 导出错误类作为值
export { RagflowApiError };