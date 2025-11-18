/**
 * 认证服务
 * 基于良策金宝AI的认证系统设计，支持微信扫码登录和手机号登录
 */

import axios from 'axios';

export interface User {
  id: string;
  username: string;
  mobile?: string;
  wechatId?: string;
  avatar?: string;
  role: 'user' | 'admin';
  permissions: string[];
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface WechatQRResponse {
  qrcode: string;
  scene: string;
  expireTime: number;
}

export interface MobileLoginRequest {
  mobile: string;
  verificationCode: string;
}

export interface SendSMSRequest {
  mobile: string;
  type: 'login' | 'register';
}

class AuthService {
  private baseURL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  private api = axios.create({ baseURL: this.baseURL });

  constructor() {
    // 请求拦截器 - 添加token
    this.api.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 响应拦截器 - 处理token过期
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token过期，尝试刷新
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              this.setTokens(response.data.token, response.data.refreshToken);

              // 重试原请求
              error.config.headers.Authorization = `Bearer ${response.data.token}`;
              return this.api.request(error.config);
            } catch (refreshError) {
              this.logout();
              window.location.href = '/login';
            }
          } else {
            this.logout();
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // 获取微信登录二维码
  async getWechatQR(): Promise<WechatQRResponse> {
    const response = await this.api.post('/auth/wechat/qr');
    return response.data;
  }

  // 检查微信扫码状态
  async checkWechatScanStatus(scene: string): Promise<LoginResponse | null> {
    try {
      const response = await this.api.get(`/auth/wechat/status/${scene}`);
      if (response.data.status === 'confirmed') {
        return response.data.loginData;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // 发送短信验证码
  async sendSMSCode(request: SendSMSRequest): Promise<boolean> {
    try {
      await this.api.post('/auth/sms/send', request);
      return true;
    } catch (error) {
      throw new Error('发送验证码失败');
    }
  }

  // 手机号登录
  async mobileLogin(request: MobileLoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.api.post('/auth/mobile/login', request);
      this.setTokens(response.data.token, response.data.refreshToken);
      this.setUser(response.data.user);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '登录失败');
    }
  }

  // 用户名密码登录
  async passwordLogin(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.api.post('/auth/login', { username, password });
      this.setTokens(response.data.token, response.data.refreshToken);
      this.setUser(response.data.user);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || '登录失败');
    }
  }

  // 刷新token
  async refreshToken(refreshToken: string) {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  // 退出登录
  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await this.api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  // 获取当前用户信息
  async getCurrentUser(): Promise<User> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Token管理
  setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // 用户信息管理
  setUser(user: User): void {
    localStorage.setItem('user_info', JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user_info');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 清除认证信息
  clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
  }

  // 检查是否已登录
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // 检查权限
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    // 管理员拥有所有权限
    if (user.role === 'admin') return true;

    return user.permissions.includes(permission);
  }

  // 模拟登录（开发环境使用）
  mockLogin(type: 'wechat' | 'mobile', identifier: string): Promise<LoginResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: 'mock_user_' + Date.now(),
          username: type === 'wechat' ? '微信用户' : '手机用户',
          mobile: type === 'mobile' ? identifier : undefined,
          wechatId: type === 'wechat' ? identifier : undefined,
          avatar: 'https://example.com/avatar.jpg',
          role: 'user',
          permissions: ['read', 'write'],
        };

        const loginData: LoginResponse = {
          user: mockUser,
          token: 'mock_token_' + Date.now(),
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600,
        };

        this.setTokens(loginData.token, loginData.refreshToken);
        this.setUser(mockUser);

        resolve(loginData);
      }, 1000);
    });
  }
}

export const authService = new AuthService();