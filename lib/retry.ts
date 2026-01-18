/**
 * 请求重试工具 - 指数退避算法
 * 行业最佳实践：适用于网络抖动、服务暂时不可用等场景
 */

export interface RetryConfig {
  maxRetries?: number      // 最大重试次数，默认 3
  initialDelay?: number    // 初始延迟（毫秒），默认 1000ms
  maxDelay?: number        // 最大延迟（毫秒），默认 30000ms
  backoffFactor?: number   // 退避因子，默认 2（指数增长）
  retryableStatusCodes?: number[]  // 可重试的状态码
  shouldRetry?: (error: any, attempt: number) => boolean  // 自定义重试判断
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  shouldRetry: () => true,
}

/**
 * 等待指定时间
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 计算指数退避延迟
 * 使用抖动（jitter）避免惊群效应
 */
function calculateBackoff(attempt: number, config: Required<RetryConfig>): number {
  // 计算指数退避延迟
  const exponentialDelay = config.initialDelay * Math.pow(config.backoffFactor, attempt - 1)

  // 限制最大延迟
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay)

  // 添加随机抖动（0.5 ~ 1.0 之间）
  // 这样可以避免大量请求同时重试
  const jitter = 0.5 + Math.random() * 0.5

  return Math.floor(cappedDelay * jitter)
}

/**
 * 判断错误是否可重试
 */
function isRetryableError(error: any, config: Required<RetryConfig>): boolean {
  // 如果有自定义判断，优先使用
  if (config.shouldRetry && !config.shouldRetry(error, 0)) {
    return false
  }

  // 网络错误（ERR_NETWORK, TypeError, etc.）
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }

  // HTTP 状态码检查
  if (error.status && config.retryableStatusCodes.includes(error.status)) {
    return true
  }

  // 超时错误
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return true
  }

  return false
}

/**
 * 带重试的请求包装器
 *
 * @example
 * const data = await fetchWithRetry(() => fetch('/api/users'), {
 *   maxRetries: 3,
 *   initialDelay: 1000
 * })
 */
export async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  userConfig: RetryConfig = {}
): Promise<T> {
  const config = { ...DEFAULT_CONFIG, ...userConfig }
  let lastError: any

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      console.log(`[Retry] 尝试请求: attempt ${attempt}/${config.maxRetries + 1}`)
      return await fetchFn()
    } catch (error) {
      lastError = error

      // 记录错误
      console.warn(`[Retry] 请求失败 (attempt ${attempt}):`, error)

      // 如果已达到最大重试次数，抛出错误
      if (attempt > config.maxRetries) {
        console.error('[Retry] 已达到最大重试次数，放弃重试')
        throw error
      }

      // 检查是否应该重试
      if (!isRetryableError(error, config)) {
        console.warn('[Retry] 错误不可重试，直接抛出')
        throw error
      }

      // 计算延迟并等待
      const backoffDelay = calculateBackoff(attempt, config)
      console.log(`[Retry] 等待 ${backoffDelay}ms 后重试...`)
      await delay(backoffDelay)
    }
  }

  // 这里不应该到达，但为了类型安全
  throw lastError
}

/**
 * 简化版：只对特定 API 调用添加重试
 *
 * @example
 * export const userApi = {
 *   getUsers: () => retryable(() => request('/api/users'))
 * }
 */
export function retryable<T>(
  fn: () => Promise<T>,
  config?: RetryConfig
): Promise<T> {
  return fetchWithRetry(fn, config)
}
