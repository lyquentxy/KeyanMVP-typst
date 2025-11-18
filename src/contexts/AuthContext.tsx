/**
 * 认证上下文
 * 基于良策金宝AI的认证模式，提供全局登录状态管理
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService, User, LoginResponse } from '@/services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (type: 'wechat' | 'mobile' | 'password', credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  sendSMSCode: (mobile: string) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  });

  // 初始化时检查登录状态
  useEffect(() => {
    const initializeAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      if (isAuthenticated) {
        const user = authService.getUser();
        if (user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (type: 'wechat' | 'mobile' | 'password', credentials: any) => {
    dispatch({ type: 'AUTH_START' });

    try {
      let response: LoginResponse;

      switch (type) {
        case 'wechat':
          // 微信登录逻辑
          response = await authService.mockLogin('wechat', credentials.wechatId || 'mock_wechat_user');
          break;
        case 'mobile':
          response = await authService.mobileLogin({
            mobile: credentials.mobile,
            verificationCode: credentials.code,
          });
          break;
        case 'password':
          response = await authService.passwordLogin(credentials.username, credentials.password);
          break;
        default:
          throw new Error('不支持的登录方式');
      }

      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // 即使logout失败，也要清除本地状态
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const sendSMSCode = async (mobile: string): Promise<boolean> => {
    try {
      return await authService.sendSMSCode({ mobile, type: 'login' });
    } catch (error) {
      return false;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    sendSMSCode,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};