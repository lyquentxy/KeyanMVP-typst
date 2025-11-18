/**
 * Tinymist服务客户端
 * 处理与Tinymist服务器的通信和实时预览
 */

export interface CompileResult {
  pdf: string;
  pdfPath: string;
  stdout: string;
  stderr: string;
}

export interface TinymistStatus {
  isRunning: boolean;
  port: number | null;
  clients: number;
}

class TinymistService {
  private ws: WebSocket | null = null;
  private serverUrl = 'http://localhost:3000';
  private wsUrl = 'ws://localhost:3001';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private wsDisabled = false;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initEventListeners();
  }

  private initEventListeners() {
    // 为不同事件类型初始化监听器数组
    ['compiled', 'error', 'connected', 'disconnected'].forEach(event => {
      this.listeners.set(event, []);
    });
  }

  /**
   * 连接WebSocket服务器
   */
  async connect(): Promise<void> {
    if (this.wsDisabled) {
      return Promise.reject(new Error('Tinymist WebSocket 已禁用'));
    }

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket连接已建立');
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('解析WebSocket消息失败:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket连接已关闭');
          this.emit('disconnected');
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket错误:', error);
          this.emit('error', { message: 'WebSocket连接错误' });
          reject(error);
        };

        // 连接超时
        setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            reject(new Error('WebSocket连接超时'));
          }
        }, 5000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 断开WebSocket连接
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 尝试重新连接
   */
  private attemptReconnect(): void {
    if (this.wsDisabled) {
      return;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.connect().catch(error => {
          console.error('重新连接失败:', error);
        });
      }, this.reconnectDelay);
    } else {
      console.warn('达到最大重连次数，将禁用WebSocket');
      this.wsDisabled = true;
      this.emit('error', { message: 'Tinymist WebSocket 不可用，请启动后台服务或稍后重试。' });
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'compiled':
        this.emit('compiled', data.result);
        break;
      case 'error':
        this.emit('error', { message: data.error });
        break;
      default:
        console.log('未知消息类型:', data.type);
    }
  }

  /**
   * 启动Tinymist服务
   */
  async startTinymist(): Promise<TinymistStatus> {
    const response = await fetch(`${this.serverUrl}/api/tinymist/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`启动Tinymist失败: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 停止Tinymist服务
   */
  async stopTinymist(): Promise<void> {
    const response = await fetch(`${this.serverUrl}/api/tinymist/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`停止Tinymist失败: ${response.statusText}`);
    }
  }

  /**
   * 获取Tinymist服务状态
   */
  async getStatus(): Promise<TinymistStatus> {
    const response = await fetch(`${this.serverUrl}/api/tinymist/status`);

    if (!response.ok) {
      throw new Error(`获取状态失败: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 编译Typst文档
   */
  async compileDocument(content: string, filename: string = 'document.typ'): Promise<CompileResult> {
    // 如果WebSocket连接可用，使用实时编译
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return new Promise((resolve, reject) => {
        const messageId = Date.now().toString();

        // 设置超时
        const timeout = setTimeout(() => {
          reject(new Error('编译超时'));
        }, 10000);

        // 临时监听编译结果
        const onCompiled = (result: CompileResult) => {
          clearTimeout(timeout);
          this.off('compiled', onCompiled);
          this.off('error', onError);
          resolve(result);
        };

        const onError = (error: any) => {
          clearTimeout(timeout);
          this.off('compiled', onCompiled);
          this.off('error', onError);
          reject(new Error(error.message));
        };

        this.on('compiled', onCompiled);
        this.on('error', onError);

        // 发送编译请求
        this.ws!.send(JSON.stringify({
          type: 'compile',
          content,
          filename,
          messageId
        }));
      });
    } else {
      // 回退到HTTP API
      try {
        const response = await fetch(`${this.serverUrl}/api/tinymist/compile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content, filename }),
        });

        if (!response.ok) {
          throw new Error(`编译失败: ${response.statusText}`);
        }

        const data = await response.json();
        return data.result;
      } catch (error) {
        throw new Error('无法连接到 Tinymist 服务，请确认本地服务器已启动');
      }
    }
  }

  /**
   * 事件监听器管理
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('事件监听器执行失败:', error);
        }
      });
    }
  }

  /**
   * 获取连接状态
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.disconnect();
    this.listeners.clear();
  }
}

// 导出单例实例
export const tinymistService = new TinymistService();
export default tinymistService;
