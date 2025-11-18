/**
 * RAGFlow API客户端
 * 采用单例模式 + 拦截器模式
 * 支持流式消息处理和统一错误处理
 */

import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError
} from 'axios';
import type {
  ApiResponse,
  PaginatedResponse,
  Dataset,
  CreateDatasetRequest,
  UpdateDatasetRequest,
  Document,
  Chapter,
  Agent,
  CreateAgentRequest,
  UpdateAgentRequest,
  Chat,
  CreateChatRequest,
  Message,
  SendMessageRequest,
  SystemStats,
  ServiceStatus,
} from '@/types/ragflow';
import { RagflowApiError } from '@/types/ragflow';

class RagflowApiClient {
  private api: AxiosInstance;
  private apiKey: string | null = null;
  private baseURL: string = 'http://localhost:9380';

  constructor() {
    this.api = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.loadConfig();
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器 - 自动添加认证头
    this.api.interceptors.request.use(
      (config) => {
        if (this.apiKey) {
          config.headers.Authorization = `Bearer ${this.apiKey}`;
        }

        // 设置base URL
        config.baseURL = this.baseURL;

        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          data: config.data,
        });

        return config;
      },
      (error: AxiosError) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器 - 统一错误处理
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
          status: response.status,
          data: response.data,
        });

        return response;
      },
      (error: AxiosError) => {
        console.error('[API Response Error]', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
        });

        // 统一错误处理
        const apiError = this.handleApiError(error);
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * 处理API错误
   */
  private handleApiError(error: AxiosError): RagflowApiError {
    if (error.response) {
      // 服务器返回错误状态码
      const { status, data } = error.response;
      const message = (data as any)?.message || `HTTP ${status} Error`;
      return new RagflowApiError(message, status, data);
    } else if (error.request) {
      // 网络错误
      return new RagflowApiError('网络连接失败，请检查网络设置', 0);
    } else {
      // 其他错误
      return new RagflowApiError(error.message || '未知错误', -1);
    }
  }

  /**
   * 从localStorage加载配置
   */
  private loadConfig(): void {
    try {
      const settings = localStorage.getItem('ragflow_settings');
      if (settings) {
        const config = JSON.parse(settings);
        this.setConfig(config.ragflow_api_key, config.ragflow_base_url);
      }
    } catch (error) {
      console.warn('Failed to load config from localStorage:', error);
    }
  }

  /**
   * 设置API配置
   */
  public setConfig(apiKey: string, baseURL: string): void {
    this.apiKey = apiKey;
    this.baseURL = baseURL || 'http://localhost:9380';

    // 保存到localStorage
    try {
      const settings = {
        ragflow_api_key: apiKey,
        ragflow_base_url: this.baseURL,
      };
      localStorage.setItem('ragflow_settings', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save config to localStorage:', error);
    }
  }

  /**
   * 检查服务连接状态
   */
  public async checkConnection(): Promise<ServiceStatus> {
    try {
      const response = await this.api.get('/api/v1/system/status');
      return {
        ragflow_connected: true,
        ragflow_version: response.data.version,
        last_check_time: new Date().toISOString(),
      };
    } catch (error) {
      return {
        ragflow_connected: false,
        last_check_time: new Date().toISOString(),
        error_message: error instanceof RagflowApiError ? error.message : '连接失败',
      };
    }
  }

  // ==================== 数据集管理 API ====================

  /**
   * 获取数据集列表
   */
  public async getDatasets(
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Dataset>>> {
    const response = await this.api.get('/api/v1/dataset', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  /**
   * 创建数据集
   */
  public async createDataset(data: CreateDatasetRequest): Promise<ApiResponse<Dataset>> {
    const response = await this.api.post('/api/v1/dataset', data);
    return response.data;
  }

  /**
   * 更新数据集
   */
  public async updateDataset(
    id: string,
    data: UpdateDatasetRequest
  ): Promise<ApiResponse<Dataset>> {
    const response = await this.api.put(`/api/v1/dataset/${id}`, data);
    return response.data;
  }

  /**
   * 删除数据集
   */
  public async deleteDataset(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/api/v1/dataset/${id}`);
    return response.data;
  }

  /**
   * 获取数据集详情
   */
  public async getDataset(id: string): Promise<ApiResponse<Dataset>> {
    const response = await this.api.get(`/api/v1/dataset/${id}`);
    return response.data;
  }

  // ==================== 文档管理 API ====================

  /**
   * 获取文档列表
   */
  public async getDocuments(
    datasetId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Document>>> {
    const response = await this.api.get(`/api/v1/dataset/${datasetId}/document`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  /**
   * 上传文档
   */
  public async uploadFile(
    file: File,
    datasetId?: string
  ): Promise<ApiResponse<Document>> {
    const formData = new FormData();
    formData.append('file', file);
    if (datasetId) {
      formData.append('dataset_id', datasetId);
    }

    const response = await this.api.post('/api/v1/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * 删除文档
   */
  public async deleteDocument(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/api/v1/document/${id}`);
    return response.data;
  }

  /**
   * 重新解析文档
   */
  public async reprocessDocument(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/api/v1/document/${id}/reprocess`);
    return response.data;
  }

  // ==================== 章节管理 API ====================

  /**
   * 获取文档章节
   */
  public async getChapters(documentId: string): Promise<ApiResponse<Chapter[]>> {
    const response = await this.api.get(`/api/v1/document/${documentId}/chapters`);
    return response.data;
  }

  /**
   * 更新章节状态
   */
  public async updateChapter(
    id: string,
    data: Partial<Chapter>
  ): Promise<ApiResponse<Chapter>> {
    const response = await this.api.put(`/api/v1/chapter/${id}`, data);
    return response.data;
  }

  // ==================== 智能体管理 API ====================

  /**
   * 获取智能体列表
   */
  public async getAgents(
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Agent>>> {
    const response = await this.api.get('/api/v1/agent', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  /**
   * 创建智能体
   */
  public async createAgent(data: CreateAgentRequest): Promise<ApiResponse<Agent>> {
    const response = await this.api.post('/api/v1/agent', data);
    return response.data;
  }

  /**
   * 更新智能体
   */
  public async updateAgent(data: UpdateAgentRequest): Promise<ApiResponse<Agent>> {
    const response = await this.api.put(`/api/v1/agent/${data.id}`, data);
    return response.data;
  }

  /**
   * 删除智能体
   */
  public async deleteAgent(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/api/v1/agent/${id}`);
    return response.data;
  }

  /**
   * 获取智能体详情
   */
  public async getAgent(id: string): Promise<ApiResponse<Agent>> {
    const response = await this.api.get(`/api/v1/agent/${id}`);
    return response.data;
  }

  // ==================== 对话管理 API ====================

  /**
   * 获取对话列表
   */
  public async getChats(
    page: number = 1,
    pageSize: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Chat>>> {
    const response = await this.api.get('/api/v1/chat', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  /**
   * 创建对话
   */
  public async createChat(data: CreateChatRequest): Promise<ApiResponse<Chat>> {
    const response = await this.api.post('/api/v1/chat', data);
    return response.data;
  }

  /**
   * 删除对话
   */
  public async deleteChat(id: string): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/api/v1/chat/${id}`);
    return response.data;
  }

  /**
   * 获取对话消息列表
   */
  public async getMessages(
    conversationId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    const response = await this.api.get(`/api/v1/chat/${conversationId}/message`, {
      params: { page, page_size: pageSize },
    });
    return response.data;
  }

  /**
   * 发送消息 (非流式)
   */
  public async sendMessage(data: SendMessageRequest): Promise<ApiResponse<Message>> {
    const response = await this.api.post('/api/v1/chat/message', {
      ...data,
      stream: false,
    });
    return response.data;
  }

  /**
   * 发送流式消息
   */
  public async sendMessageStream(
    data: SendMessageRequest,
    onMessage: (chunk: string) => void,
    onComplete: (finalMessage: string) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          ...data,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream reader not available');
      }

      const decoder = new TextDecoder();
      let finalMessage = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();

            if (data === '[DONE]') {
              onComplete(finalMessage);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                finalMessage += parsed.content;
                onMessage(parsed.content);
              }
            } catch (error) {
              console.warn('Failed to parse stream data:', data, error);
            }
          }
        }
      }

      onComplete(finalMessage);
    } catch (error) {
      console.error('Stream error:', error);
      onError(error);
    }
  }

  // ==================== 系统统计 API ====================

  /**
   * 获取系统统计信息
   */
  public async getSystemStats(): Promise<ApiResponse<SystemStats>> {
    const response = await this.api.get('/api/v1/system/stats');
    return response.data;
  }

  // ==================== 工具方法 ====================

  /**
   * 通用GET请求
   */
  public async get<T = any>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  /**
   * 通用POST请求
   */
  public async post<T = any>(
    url: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  /**
   * 通用PUT请求
   */
  public async put<T = any>(
    url: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  /**
   * 通用DELETE请求
   */
  public async delete<T = any>(
    url: string,
    params?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const response = await this.api.delete(url, { params });
    return response.data;
  }
}

// 导出单例实例
export const ragflowApi = new RagflowApiClient();

// 默认导出类，用于需要多实例的场景
export default RagflowApiClient;