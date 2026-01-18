/**
 * 前端错误监控系统
 * 支持 Sentry 集成，也可单独使用
 */

export interface ErrorInfo {
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  url: string
  userAgent: string
  userId?: string
  userEmail?: string
  type: 'error' | 'warning' | 'info'
  context?: Record<string, any>
}

class ErrorMonitor {
  private errors: ErrorInfo[] = []
  private maxErrors = 100  // 最多保存100条错误
  private sentryEnabled = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initGlobalHandlers()
    }
  }

  /**
   * 初始化全局错误处理器
   */
  private initGlobalHandlers() {
    // 捕获未处理的错误
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        type: 'error',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      })
    })

    // 捕获未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        type: 'error',
        context: {
          reason: event.reason,
        }
      })
    })

    console.log('[ErrorMonitor] 全局错误处理器已初始化')
  }

  /**
   * 手动捕获错误
   */
  captureError(error: Partial<ErrorInfo> & { message: string }) {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      componentStack: error.componentStack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      userId: this.getUserId(),
      userEmail: this.getUserEmail(),
      type: error.type || 'error',
      context: error.context,
    }

    // 保存到内存
    this.errors.push(errorInfo)
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()  // 移除最旧的错误
    }

    // 打印到控制台
    console.error('[ErrorMonitor]', errorInfo)

    // 发送到 Sentry（如果已配置）
    if (this.sentryEnabled && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(error.message), {
        extra: errorInfo
      })
    }

    // TODO: 可以发送到自定义的错误收集服务
    // this.sendToServer(errorInfo)
  }

  /**
   * 捕获 API 错误
   */
  captureApiError(endpoint: string, method: string, status: number, message: string, context?: any) {
    this.captureError({
      message: `API Error: ${method} ${endpoint} - ${status} ${message}`,
      type: 'error',
      context: {
        endpoint,
        method,
        status,
        ...context
      }
    })
  }

  /**
   * 捕获警告
   */
  captureWarning(message: string, context?: Record<string, any>) {
    this.captureError({
      message,
      type: 'warning',
      context
    })
  }

  /**
   * 捕获信息
   */
  captureInfo(message: string, context?: Record<string, any>) {
    this.captureError({
      message,
      type: 'info',
      context
    })
  }

  /**
   * 获取所有错误
   */
  getErrors(): ErrorInfo[] {
    return [...this.errors]
  }

  /**
   * 清除所有错误
   */
  clearErrors() {
    this.errors = []
  }

  /**
   * 启用 Sentry
   */
  enableSentry() {
    this.sentryEnabled = true
    console.log('[ErrorMonitor] Sentry 集成已启用')
  }

  /**
   * 获取用户ID
   */
  private getUserId(): string | undefined {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || undefined
    }
    return undefined
  }

  /**
   * 获取用户邮箱
   */
  private getUserEmail(): string | undefined {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userEmail') || undefined
    }
    return undefined
  }

  /**
   * 发送到服务器（可选）
   */
  private async sendToServer(errorInfo: ErrorInfo) {
    try {
      // TODO: 实现发送到自定义错误收集服务
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorInfo)
      // })
    } catch (error) {
      // 静默失败，避免错误监控本身抛出错误
      console.error('[ErrorMonitor] 发送错误到服务器失败:', error)
    }
  }
}

// 创建全局单例
const errorMonitor = new ErrorMonitor()

export default errorMonitor

// 导出便捷方法
export const captureError = (error: Partial<ErrorInfo> & { message: string }) =>
  errorMonitor.captureError(error)

export const captureApiError = (endpoint: string, method: string, status: number, message: string, context?: any) =>
  errorMonitor.captureApiError(endpoint, method, status, message, context)

export const captureWarning = (message: string, context?: Record<string, any>) =>
  errorMonitor.captureWarning(message, context)

export const captureInfo = (message: string, context?: Record<string, any>) =>
  errorMonitor.captureInfo(message, context)
