// API configuration and utilities

import { captureApiError } from './error-monitor'

// In production, use empty string to make relative path requests through Nginx proxy
// In development, set NEXT_PUBLIC_API_URL=http://localhost:8080
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // 从localStorage获取token
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      // 添加Authorization header（Bearer Token方案）
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include', // Keep for compatibility
    ...options,
  }

  try {
    const response = await fetch(url, defaultOptions)

    if (!response.ok) {
      // Handle 401 Unauthorized - Token expired or invalid
      if (response.status === 401) {
        // ✅ 记录详细的401错误信息，帮助排查问题
        console.warn('[API] 401 Unauthorized:', {
          endpoint,
          method: options.method || 'GET',
          hasToken: !!token,
          timestamp: new Date().toISOString()
        })

        // ✅ 尝试使用 refreshToken 刷新访问令牌
        const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null

        if (refreshToken && endpoint !== '/login/refresh') {
          // 如果正在刷新token，将请求加入队列
          if (isRefreshing) {
            return new Promise((resolve) => {
              subscribeTokenRefresh((newToken: string) => {
                // 用新token重试原始请求
                const newOptions = {
                  ...options,
                  headers: {
                    ...defaultOptions.headers,
                    'Authorization': `Bearer ${newToken}`,
                  }
                }
                resolve(request<T>(endpoint, newOptions))
              })
            })
          }

          // 开始刷新token
          isRefreshing = true

          try {
            const refreshResponse = await fetch(`${API_BASE_URL}/login/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ refreshToken })
            })

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json()

              if (refreshData.code === 200 && refreshData.data) {
                const newAccessToken = refreshData.data.accessToken
                const newRefreshToken = refreshData.data.refreshToken

                // 更新 localStorage
                localStorage.setItem('accessToken', newAccessToken)
                localStorage.setItem('refreshToken', newRefreshToken)

                console.log('[API] Token 刷新成功，重试原始请求')

                // 通知所有等待的请求
                onTokenRefreshed(newAccessToken)
                isRefreshing = false

                // 用新token重试原始请求
                const newOptions = {
                  ...options,
                  headers: {
                    ...defaultOptions.headers,
                    'Authorization': `Bearer ${newAccessToken}`,
                  }
                }
                return request<T>(endpoint, newOptions)
              }
            }

            // 刷新失败，清除状态
            console.warn('[API] Token 刷新失败，清除登录状态')
            isRefreshing = false
            refreshSubscribers = []

          } catch (refreshError) {
            console.error('[API] Token 刷新异常:', refreshError)
            isRefreshing = false
            refreshSubscribers = []
          }
        }

        // 无法刷新token，清除状态并重定向
        if (typeof window !== 'undefined') {
          // 检查当前页面是否已经在首页，避免无限重定向
          if (window.location.pathname !== '/') {
            localStorage.clear()
            window.location.href = '/'
          }
        }
        throw new ApiError(401, '登录已过期，请重新登录')
      }

      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch {
        // If JSON parsing fails, use the default error message
      }
      throw new ApiError(response.status, errorMessage)
    }

    // Check if response has content
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new ApiError(0, 'Invalid response format: expected JSON')
    }

    const text = await response.text()
    if (!text) {
      throw new ApiError(0, 'Empty response from server')
    }

    let result: ApiResponse<T>
    try {
      result = JSON.parse(text)
    } catch (parseError) {
      console.error('Failed to parse JSON:', text)
      throw new ApiError(0, 'Invalid JSON response from server')
    }

    // Check backend response code
    if (result.code !== 200) {
      throw new ApiError(result.code, result.message || 'Unknown error')
    }

    return result.data as T
  } catch (error) {
    if (error instanceof ApiError) {
      // ✅ 记录 API 错误到监控系统
      captureApiError(
        endpoint,
        options.method || 'GET',
        error.code,
        error.message,
        { hasToken: !!token }
      )
      throw error
    }

    // Network or other errors
    console.error('API request failed:', error)

    // ✅ 记录网络错误到监控系统
    captureApiError(
      endpoint,
      options.method || 'GET',
      0,
      error instanceof Error ? error.message : 'Network error',
      { hasToken: !!token, error }
    )

    throw new ApiError(0, error instanceof Error ? error.message : 'Network error')
  }
}

// Login Response Interface（双Token机制）
export interface LoginResponse {
  accessToken: string  // 访问令牌（7天有效期）
  refreshToken: string // 刷新令牌（30天过期）
  userId: string       // 使用string类型避免JavaScript大整数精度丢失
  email: string
  role: string
  expiresIn: number    // AccessToken过期时间（秒，604800=7天）
  refreshExpiresIn: number  // RefreshToken过期时间（秒，2592000=30天）
}

// ✅ 用于防止并发刷新token
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

// 订阅token刷新
function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

// 通知所有订阅者token已刷新
function onTokenRefreshed(newToken: string) {
  refreshSubscribers.forEach(callback => callback(newToken))
  refreshSubscribers = []
}

// Auth API
export const authApi = {
  /**
   * Send verification code to email
   */
  sendCode: async (email: string): Promise<void> => {
    await request('/login/sendcode', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  /**
   * Login with email and verification code
   * 返回包含Token的完整登录信息
   */
  login: async (email: string, code: string): Promise<LoginResponse> => {
    return await request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    })
  },

  /**
   * Logout - clear Sa-Token session
   * 对应后端接口: POST /login/logout
   */
  logout: async (): Promise<void> => {
    await request('/login/logout', {
      method: 'POST',
    })
  },
}

// User API
export const userApi = {
  /**
   * Get current user info
   * 注意: id字段是字符串类型,避免JavaScript精度丢失
   */
  getCurrentUser: async (): Promise<{ id: string; email: string; role: string; status: number }> => {
    return request('/user/current')
  },

  /**
   * Get user by email
   * 注意: id字段是字符串类型,避免JavaScript精度丢失
   */
  getUserByEmail: async (email: string): Promise<{ id: string; email: string; role: string; status: number }> => {
    return request(`/user/email/${encodeURIComponent(email)}`)
  },
}

// Membership API
export const membershipApi = {
  /**
   * Get all active memberships
   * 对应后端接口: GET /membership/active
   */
  getActiveMemberships: async (): Promise<MembershipData[]> => {
    return request('/membership/active')
  },

  /**
   * Get all memberships
   * 对应后端接口: GET /membership
   */
  getAllMemberships: async (): Promise<MembershipData[]> => {
    return request('/membership')
  },

  /**
   * Add membership
   * 对应后端接口: POST /membership
   */
  addMembership: async (data: {
    levelName: string
    levelCode: string
    dailyUsage: number
    price: number
    status: number
  }): Promise<void> => {
    await request('/membership', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update membership
   * 对应后端接口: PUT /membership
   */
  updateMembership: async (data: {
    id: number
    levelName: string
    levelCode: string
    dailyUsage: number
    price: number
    status: number
  }): Promise<void> => {
    await request('/membership', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete membership
   * 对应后端接口: DELETE /membership/{id}
   */
  deleteMembership: async (id: number): Promise<void> => {
    await request(`/membership/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get user's current membership
   * 对应后端接口: GET /user-membership/current/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  getCurrentMembership: async (userId: string): Promise<UserMembershipData | null> => {
    return request(`/user-membership/current/${userId}`)
  },

  /**
   * Get user's membership history (for overlap detection)
   * 对应后端接口: GET /user-membership/history/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  getMembershipHistory: async (userId: string): Promise<UserMembershipData[]> => {
    return request(`/user-membership/history/${userId}`)
  },

  /**
   * Get membership statistics (active members count, etc.)
   * 对应后端接口: GET /membership/business/statistics
   */
  getMembershipStatistics: async (): Promise<MembershipStatisticsData> => {
    return request('/membership/business/statistics')
  },
}

// Admin API
export const adminApi = {
  /**
   * Get all users with details (admin only)
   * 对应后端接口: GET /admin/users
   */
  getAllUsers: async (): Promise<UserManagementData[]> => {
    return request('/admin/users')
  },

  /**
   * Update user membership
   * 对应后端接口: PUT /admin/users/membership
   * @param data.userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  updateUserMembership: async (data: {
    userId: string
    membershipId: number
    orderId?: number
    expireTime?: string  // ISO 8601 格式: "2025-11-10T23:59:59"
  }): Promise<void> => {
    await request('/admin/users/membership', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Renew user membership (inserts new users_memberships record)
   * 对应后端接口: POST /admin/users/membership/renew
   * @param data.userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   * @param data.startTime - 续费开始时间，必须 >= 当前会员结束时间
   */
  renewUserMembership: async (data: {
    userId: string
    membershipId: number
    startTime: string  // ISO 8601 格式: "2025-11-10T00:00:00"
    expireTime: string  // ISO 8601 格式: "2025-11-10T23:59:59"
  }): Promise<void> => {
    await request('/admin/users/membership/renew', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete user
   * 对应后端接口: DELETE /admin/users/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  deleteUser: async (userId: string): Promise<void> => {
    await request(`/admin/users/${userId}`, {
      method: 'DELETE',
    })
  },
}

// Membership Data Interface
export interface MembershipData {
  id: number
  levelName: string  // 会员等级名称
  levelCode: string  // 会员等级代码
  dailyUsage: number  // 每日用量（美元）
  price: number  // 会员价格
  status: number  // 状态: 0-禁用，1-启用
  createdAt: string
  updatedAt: string
}

// User Management Data Interface
export interface UserManagementData {
  id: string         // ✅ 使用string类型避免JavaScript大整数精度丢失(后端已用@JsonSerialize转string)
  email: string
  registrationDate: string  // 后端返回 LocalDateTime，前端接收为 string
  planType: string
  planStatus: string  // "活跃" | "已过期" | "已取消"
  planStartTime?: string  // 后端返回 LocalDateTime，前端接收为 string
  planExpiry?: string  // 后端返回 LocalDateTime，前端接收为 string
  dailyBudget: number
  todayUsage: number
  lastActive: string  // 后端返回 LocalDateTime，前端接收为 string
  userMembershipId?: string  // ✅ 使用string类型避免精度丢失
  membershipId?: number
}

// Usage Statistics API
export const usageApi = {
  /**
   * Get user usage statistics
   * 对应后端接口: GET /usage/stats/{userId}?days=7
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  getUserUsageStats: async (userId: string, days: 1 | 7 | 15 | 30): Promise<UsageStatsData> => {
    return request(`/usage/stats/${userId}?days=${days}`)
  },

  /**
   * Get user today's usage
   * 对应后端接口: GET /usage/daily/today/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  getTodayUsage: async (userId: string): Promise<DailyUsageData> => {
    return request(`/usage/daily/today/${userId}`)
  },

  /**
   * Get user remaining quota for today
   * 对应后端接口: GET /usage/daily/remaining/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  getRemainingQuota: async (userId: string): Promise<RemainingQuotaData> => {
    return request(`/usage/daily/remaining/${userId}`)
  },

  /**
   * Get user month usage
   * 对应后端接口: GET /usage/daily/month/{userId}
   * 注意: 后端实际返回 List<UserDailyUsageVO>,不是包装对象
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  getMonthUsage: async (userId: string): Promise<DailyUsageData[]> => {
    return request(`/usage/daily/month/${userId}`)
  },

  /**
   * Get user today's cost
   * 对应后端接口: GET /usage/today/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  getTodayCost: async (userId: string): Promise<number> => {
    return request(`/usage/today/${userId}`)
  },

  /**
   * Get user daily limit
   * 对应后端接口: GET /usage/limit/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  getDailyLimit: async (userId: string): Promise<number> => {
    return request(`/usage/limit/${userId}`)
  },

  /**
   * Get user usage logs (detailed usage records)
   * 对应后端接口: GET /api/usage-logs/user/{userId}
   * @param userId - 字符串类型的userId
   * @param pageNum - 页码
   * @param pageSize - 每页大小
   * @param days - 时间范围(天数)
   */
  getUserUsageLogs: async (
    userId: string,
    pageNum: number = 1,
    pageSize: number = 20,
    days?: number
  ): Promise<UsageLogsPageData> => {
    const params = new URLSearchParams({
      pageNum: String(pageNum),
      pageSize: String(pageSize),
    })
    if (days) {
      params.append('days', String(days))
    }
    return request(`/api/usage-logs/user/${userId}?${params.toString()}`)
  },

  /**
   * Set temporary daily limit for a user (admin only)
   * 对应后端接口: POST /admin/daily-limit/temp
   * 临时额度仅当天有效，北京时间 23:59:59 自动过期
   * @param userId - 用户ID（必须是字符串）
   * @param tempLimit - 临时额度（美元）
   * @param remark - 备注说明（可选）
   */
  setTempDailyLimit: async (
    userId: string,
    tempLimit: number,
    remark?: string
  ): Promise<boolean> => {
    return request('/admin/daily-limit/temp', {
      method: 'POST',
      body: JSON.stringify({
        userId,  // ✅ 直接使用string，不转换为Number
        tempLimit,
        remark,
      }),
    })
  },

  /**
   * Cancel temporary daily limit for a user (admin only)
   * 对应后端接口: DELETE /admin/daily-limit/temp/{userId}
   * @param userId - 用户ID（必须是字符串）
   */
  cancelTempDailyLimit: async (userId: string): Promise<boolean> => {
    return request(`/admin/daily-limit/temp/${userId}`, {
      method: 'DELETE',
    })
  },

  /**
   * Get user limit detail (admin only)
   * 对应后端接口: GET /admin/daily-limit/detail/{userId}
   * 返回用户的套餐限额、临时限额、实际生效限额等详细信息
   * @param userId - 用户ID（必须是字符串）
   */
  getUserLimitDetail: async (userId: string): Promise<UserLimitDetailData> => {
    return request(`/admin/daily-limit/detail/${userId}`)
  },
}

// Usage Statistics Data Interfaces
export interface UsageStatsData {
  chartData: ChartDataPoint[]
  stats: StatsSummary
}

export interface ChartDataPoint {
  time: string  // "09/13" 或 "14:00"
  usageRate: number  // 使用率百分比 0-100
  actualCost: number  // 实际使用金额 USD
  dailyLimit: number  // 每日限额 USD
}

export interface StatsSummary {
  peakTime: string  // 峰值时间
  peakRate: number  // 峰值使用率
  maxRate: number  // 最高使用率
  minRate: number  // 最低使用率
  currentRate: number  // 当前使用率
  highestUsageUserEmail: string  // 使用量最高用户邮箱
  highestUsageUserTodayCost: number  // 使用量最高用户今日使用
}

// Daily Usage Data Interface (对应后端UserDailyUsageVO)
export interface DailyUsageData {
  id: string         // ✅ 使用string类型避免精度丢失
  userId: string     // ✅ 使用string类型避免精度丢失
  usageDate: string  // 后端是LocalDate,前端接收为string
  totalTokens: number
  inputTokens: number
  outputTokens: number
  cacheCreationTokens: number
  cacheReadTokens: number
  totalCost: number  // 后端是BigDecimal
  requestCount: number
  membershipId?: number
  dailyLimit?: number
}

// Remaining Quota Data Interface
export interface RemainingQuotaData {
  todayCost: number
  dailyLimit: number
  remaining: number
  usagePercentage: number
}

// Month Usage Data Interface
export interface MonthUsageData {
  totalCost: number
  dailyUsages: DailyUsageData[]
}

// User Membership Data Interface
export interface UserMembershipData {
  id: string           // ✅ 使用string类型避免精度丢失
  userId: string       // 使用string类型避免JavaScript大整数精度丢失
  membershipId: number
  membershipName: string
  levelName: string    // 会员等级名称
  levelCode: string    // 会员等级代码
  dailyUsage: number   // 每日用量限额（美元）
  status: number
  startTime: string
  expireTime: string
  orderId?: number
  createdAt: string
  updatedAt: string
}

// Membership Statistics Data Interface
export interface MembershipStatisticsData {
  totalMembers: number       // 总会员数
  activeMembers: number      // 活跃会员数
  expiredMembers: number     // 已过期会员数
  totalRevenue?: number      // 总收入（可选）
}

// API Key Management API
export const apiKeyApi = {
  /**
   * Get all API keys for a user
   * 对应后端接口: GET /api/apikey/user/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  getUserApiKeys: async (userId: string): Promise<ApiKeyData[]> => {
    return request(`/api/apikey/user/${userId}`)
  },

  /**
   * Get API key usage statistics for a user
   * 对应后端接口: GET /api/apikey/usage-stats/user/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   * @param days - 时间范围(天数)
   */
  getUserApiKeyUsageStats: async (userId: string, days?: number): Promise<ApiKeyUsageStats[]> => {
    const queryParam = days ? `?days=${days}` : ''
    return request(`/api/apikey/usage-stats/user/${userId}${queryParam}`)
  },

  /**
   * Create API key for a user (auto-generate key)
   * 对应后端接口: GET /api/apikey/createKey?userId={userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  createApiKey: async (userId: string, name?: string): Promise<ApiKeyData> => {
    const queryParams = new URLSearchParams({ userId: String(userId) })
    if (name) {
      queryParams.append('name', name)
    }
    return request(`/api/apikey/createKey?${queryParams.toString()}`)
  },

  /**
   * Create API key manually (with custom key)
   * 对应后端接口: POST /api/apikey
   * @param data.userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   */
  createApiKeyManually: async (data: {
    userId: string
    apiKey: string
    name?: string
    expirationDays?: number
  }): Promise<ApiKeyData> => {
    return request('/api/apikey', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete API key
   * 对应后端接口: DELETE /api/apikey/key/{apiKey}
   * @param apiKey - API密钥字符串
   */
  deleteApiKey: async (apiKey: string): Promise<void> => {
    await request(`/api/apikey/key/${encodeURIComponent(apiKey)}`, {
      method: 'DELETE',
    })
  },

  /**
   * Update API key (for editing name, expiration)
   * Note: Backend may not have this endpoint yet - check documentation
   * 对应后端接口: PUT /api/apikey/{id} (需要确认后端是否有此接口)
   */
  updateApiKey: async (id: string, data: {
    name?: string
    expirationDays?: number
  }): Promise<ApiKeyData> => {
    return request(`/api/apikey/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },
}

// API Key Data Interface
// 注意: 后端返回的是驼峰命名(camelCase)
export interface ApiKeyData {
  id: string       // ✅ 使用string类型避免精度丢失
  userId?: string  // ✅ 使用string类型避免精度丢失
  apiKey: string  // 后端返回驼峰命名
  name?: string  // 密钥名称(可选)
  status?: number  // 状态: 0-禁用, 1-启用
  countCost?: number  // 累计费用
  createdAt?: string  // 后端返回驼峰命名
  updatedAt?: string  // 后端返回驼峰命名
  expirationTime?: string  // 过期时间
  lastUsedTime?: string  // 最后使用时间
}

// API Key Usage Statistics Interface
export interface ApiKeyUsageStats {
  name?: string  // 密钥名称
  apiKey: string  // 密钥(可能是完整或预览)
  requests: number  // 请求次数
  totalTokens: number  // 总Token数
  inputTokens?: number  // 输入Token数
  outputTokens?: number  // 输出Token数
  cacheCreationTokens?: number  // 缓存创建Token数
  cacheReadTokens?: number  // 缓存读取Token数
  totalCost: number  // 总费用(美元)
  firstUsed?: string  // 首次使用时间
  lastUsed?: string  // 最后使用时间
}

// Usage Logs Page Data Interface (MyBatis-Plus Page对象)
export interface UsageLogsPageData {
  records: UsageLogRecord[]  // 使用记录列表
  total: number  // 总记录数
  size: number  // 每页大小
  current: number  // 当前页码
  pages?: number  // 总页数
}

// Usage Log Record Interface
export interface UsageLogRecord {
  id: string           // ✅ 使用string类型避免精度丢失
  userId: string       // ✅ 使用string类型避免精度丢失
  apiKeyId: string     // ✅ 使用string类型避免精度丢失
  accountKeyId?: string  // ✅ 使用string类型避免精度丢失
  modelName: string
  inputTokens: number
  outputTokens: number
  cacheCreationTokens?: number
  cacheReadTokens?: number
  totalTokens: number  // 注意:后端这个是BigDecimal,单位是K
  cost: number  // 费用(美元),BigDecimal
  createdAt: string  // LocalDateTime格式
  updatedAt?: string  // LocalDateTime格式
}

// User Limit Detail Data Interface (管理员查询用户额度详情)
export interface UserLimitDetailData {
  userId: string       // ✅ 使用string类型避免精度丢失
  membershipLimit: number  // 套餐每日额度
  tempLimit: number | null  // 临时额度（null表示无）
  effectiveLimit: number  // 实际生效额度（临时优先）
  todayCost: number  // 今日已用费用
  remainingLimit: number  // 今日剩余额度
  hasTempLimit: boolean  // 是否有临时额度
}

// ==================== Account Pool Management API ====================

/**
 * Account Pool View Object (后端返回的号池数据)
 */
export interface AccountPoolVO {
  id?: string  // ✅ 号池ID - 使用string类型避免精度丢失
  supplierWeb: string  // 供应商网址
  account: string  // 账号
  accountUrl: string  // 号池URL
  accountPoolKey: string  // 号池密钥
  accountDailyUsage: number  // 每日额度 (BigDecimal from backend)
  accountDailyRemainingUsage: number  // 每日剩余额度
  accountCost: number  // 月成本
  startTime: string  // 开始时间 (LocalDateTime from backend)
  expireTime: string  // 过期时间
  createdAt?: string  // 创建时间
  updatedAt?: string  // 更新时间
}

/**
 * Account Pool Statistics VO (号池统计数据)
 */
export interface AccountPoolStatsVO {
  accountId: string  // ✅ 号池ID - 使用string类型避免精度丢失
  account: string  // 账号名称
  supplierWeb: string  // 供应商网站
  dailyLimit: number  // 每日限额(美元)
  dailyUsed: number  // 今日已使用(美元)
  dailyRemaining: number  // 今日剩余(美元)
  dailyUsageRate: number  // 今日使用率(百分比)
  totalRequests: number  // 总请求次数
  expireTime: string  // 过期时间
  status: string  // 状态(有效/已过期)
}

/**
 * Account Pool Usage Rate VO (号池使用率统计 - 旧版单个值)
 */
export interface AccountPoolUsageRateVO {
  accountId: string  // ✅ 使用string类型避免精度丢失
  account: string
  usageRate: number  // 使用率(百分比)
  used: number  // 已使用额度(美元)
  limit: number  // 每日限额(美元)
  remaining: number  // 剩余额度(美元)
  description: string  // 描述
  totalCost?: number  // 总费用(用于时间段统计)
  avgDailyCost?: number  // 平均每日费用
  days?: number  // 统计天数
  message?: string  // 提示信息
}

/**
 * Account Pool Usage Time Series VO (号池使用率时间序列数据)
 */
export interface AccountPoolUsageTimeSeriesVO {
  time: string  // 时间标签 (例如: "00:00", "01:00" 或 "01/20", "01/21")
  usageRate: number  // 使用率百分比
  used: number  // 已使用额度 (USD)
  remaining: number  // 剩余额度 (USD)
}

/**
 * Account Pool DTO (创建/更新号池时使用)
 */
export interface AccountPoolDTO {
  supplierWeb: string
  account?: string
  accountUrl: string
  accountPoolKey: string
  accountDailyUsage: number
  accountDailyRemainingUsage?: number
  accountCost?: number
  startTime: string  // ISO 8601格式: "2025-01-01T00:00:00"
  expireTime: string
}

/**
 * Account Pool Paginated Response
 */
export interface AccountPoolPageData {
  records: AccountPoolVO[]
  total: number
  size: number
  current: number
  pages?: number
}

// ==================== 号池健康度分析类型定义 ====================

/**
 * 号池健康度详情
 * 包含号池基础信息和实时健康度指标
 */
export interface AccountPoolHealthVO {
  // 基础信息
  accountId: number
  account: string
  supplierWeb: string
  dailyQuota: number
  dailyRemaining: number
  quotaUsageRate: number
  expireTime: string

  // 健康度指标
  healthScore: number
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  successRate: number
  totalRequests: number
  successCount: number
  failureCount: number
  consecutiveFailures: number
  avgResponseTimeMs: number

  // 熔断信息
  isCircuitBreakerOpen: boolean
  circuitBreakerUntil: string | null
  circuitBreakerRemainingSeconds: number

  // 时间信息
  lastSuccessTime: string | null
  lastFailureTime: string | null
  lastFailureReason: string | null
}

/**
 * 号池健康度仪表盘数据
 * 包含汇总统计和详细列表
 */
export interface AccountPoolHealthDashboardVO {
  // 汇总统计
  totalPools: number
  healthyPools: number
  warningPools: number
  criticalPools: number
  circuitBreakerPools: number
  avgHealthScore: number
  avgSuccessRate: number
  avgResponseTimeMs: number
  totalRequests: number
  totalSuccessCount: number
  totalFailureCount: number

  // 详细列表
  pools: AccountPoolHealthVO[]

  // 元数据
  generatedAt: string
  nextRefreshAt: string
}

/**
 * 账号健康度历史事件
 * 单条状态变化或快照记录
 */
export interface AccountHealthEventVO {
  accountId: number
  accountName: string
  healthScore: number
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'CIRCUIT_OPEN'
  successRate: number
  totalRequests: number
  consecutiveFailures: number
  avgResponseTimeMs: number
  isCircuitBreakerOpen: boolean
  lastFailureReason?: string
  eventType: 'STATE_CHANGE' | 'SNAPSHOT'  // 事件类型：状态变化/定时快照
  eventTime: string  // ISO时间字符串
  changeDescription?: string  // 状态变化描述（仅STATE_CHANGE有值）
}

/**
 * 账号24小时健康历史
 * 包含过去24小时内的所有健康度变化记录
 */
export interface AccountHealth24HoursVO {
  accountId: number
  accountName: string
  supplierWeb: string
  currentHealthScore: number
  currentHealthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'CIRCUIT_OPEN'
  stateChangeCount: number  // 24小时内状态变化次数
  minHealthScore: number    // 24小时内最低健康度
  maxHealthScore: number    // 24小时内最高健康度
  avgHealthScore: number    // 24小时平均健康度
  events: AccountHealthEventVO[]  // 历史事件列表（按时间倒序）
  timeRangeDescription: string    // 时间范围描述
}

/**
 * Account Pool Management API
 * 对应后端 AccountPoolController
 */
export const accountPoolApi = {
  /**
   * 查询全部号池
   * 对应后端接口: GET /account-pools
   */
  listAll: async (): Promise<AccountPoolVO[]> => {
    return request('/account-pools')
  },

  /**
   * 分页查询号池
   * 对应后端接口: GET /account-pools/page
   * @param pageNum - 页码
   * @param pageSize - 每页大小
   * @param supplierWeb - 供应商网址(可选筛选)
   * @param accountPoolKey - 号池密钥(可选筛选)
   */
  listPage: async (
    pageNum: number = 1,
    pageSize: number = 10,
    supplierWeb?: string,
    accountPoolKey?: string
  ): Promise<AccountPoolPageData> => {
    const params = new URLSearchParams({
      pageNum: String(pageNum),
      pageSize: String(pageSize),
    })
    if (supplierWeb) params.append('supplierWeb', supplierWeb)
    if (accountPoolKey) params.append('accountPoolKey', accountPoolKey)

    return request(`/account-pools/page?${params.toString()}`)
  },

  /**
   * 查询号池详情
   * 对应后端接口: GET /account-pools/{id}
   */
  getDetail: async (id: string): Promise<AccountPoolVO> => {
    return request(`/account-pools/${id}`)
  },

  /**
   * 创建号池
   * 对应后端接口: POST /account-pools
   */
  create: async (data: AccountPoolDTO): Promise<void> => {
    await request('/account-pools', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 更新号池
   * 对应后端接口: PUT /account-pools/{id}
   */
  update: async (id: string, data: AccountPoolDTO): Promise<void> => {
    await request(`/account-pools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * 删除号池
   * 对应后端接口: DELETE /account-pools/{id}
   */
  delete: async (id: string): Promise<void> => {
    await request(`/account-pools/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * 查询所有号池的使用统计
   * 对应后端接口: GET /account-pools/usage-stats
   */
  getAllUsageStats: async (): Promise<AccountPoolStatsVO[]> => {
    return request('/account-pools/usage-stats')
  },

  /**
   * 查询号池每日使用率 (24小时时间序列数据)
   * 对应后端接口: GET /account-pools/usage-rate/daily/{accountId}
   * 返回今天0点到23点的每小时使用率数据
   */
  getDailyUsageRate: async (accountId: string): Promise<AccountPoolUsageTimeSeriesVO[]> => {
    return request(`/account-pools/usage-rate/daily/${accountId}`)
  },

  /**
   * 查询号池本周使用率 (7天时间序列数据)
   * 对应后端接口: GET /account-pools/usage-rate/week/{accountId}
   * 返回最近7天的每天使用率数据
   */
  getWeekUsageRate: async (accountId: string): Promise<AccountPoolUsageTimeSeriesVO[]> => {
    return request(`/account-pools/usage-rate/week/${accountId}`)
  },

  /**
   * 查询号池半月使用率 (15天时间序列数据)
   * 对应后端接口: GET /account-pools/usage-rate/half-month/{accountId}
   * 返回最近15天的每天使用率数据
   */
  getHalfMonthUsageRate: async (accountId: string): Promise<AccountPoolUsageTimeSeriesVO[]> => {
    return request(`/account-pools/usage-rate/half-month/${accountId}`)
  },

  /**
   * 查询号池本月使用率 (30天时间序列数据)
   * 对应后端接口: GET /account-pools/usage-rate/month/{accountId}
   * 返回最近30天的每天使用率数据
   */
  getMonthUsageRate: async (accountId: string): Promise<AccountPoolUsageTimeSeriesVO[]> => {
    return request(`/account-pools/usage-rate/month/${accountId}`)
  },

  // ==================== 健康度分析 ====================

  /**
   * 获取号池健康度分析数据
   * 对应后端接口: GET /account-pools/health-analysis
   * 返回完整的健康度仪表盘数据（包含汇总和详细列表）
   */
  getHealthAnalysis: async (): Promise<AccountPoolHealthDashboardVO> => {
    return request('/account-pools/health-analysis')
  },

  /**
   * 重置指定号池的健康度数据
   * 对应后端接口: POST /account-pools/health/{accountId}/reset
   * @param accountId 号池ID
   */
  resetHealth: async (accountId: number): Promise<void> => {
    return request(`/account-pools/health/${accountId}/reset`, {
      method: 'POST',
    })
  },

  /**
   * 获取号池24小时健康历史
   * 对应后端接口: GET /account-pools/health/{accountId}/24hours
   * 返回过去24小时内的健康度变化记录，包括状态变化事件和定时快照
   * @param accountId 号池ID
   */
  getHealth24Hours: async (accountId: number): Promise<AccountHealth24HoursVO> => {
    return request(`/account-pools/health/${accountId}/24hours`)
  },
}

// ==================== Domain Health Monitoring API ====================

/**
 * 域名健康记录（单条历史记录）
 */
export interface DomainHealthRecord {
  time: string            // ISO时间字符串
  status: 'available' | 'degraded' | 'unavailable'
  latencyMs: number       // 延迟毫秒
  successRate: number     // 成功率 0-100
}

/**
 * 单个渠道的健康数据
 */
export interface ChannelHealthData {
  alias: string           // 渠道别名
  url: string             // 渠道URL
  currentStatus: 'available' | 'unavailable'
  availabilityRate: number  // 可用率 0-100
  avgLatencyMs: number    // 平均延迟
  checkCount: number      // 检测次数
  availableCount: number  // 可用次数
  degradedCount: number   // 波动次数
  unavailableCount: number // 不可用次数
  lastCheckTime: string | null  // 最后检测时间
  history: DomainHealthRecord[]  // 历史记录
}

/**
 * 域名健康快照
 */
export interface DomainHealthSnapshot {
  url: string
  alias: string
  alive: boolean
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  ewmaLatencyMs: number
  inflightRequests: number
  successCount: number
  failureCount: number
  consecutiveFailures: number
  successRate: string
  score: string
  lastSuccessTime: string | null
  lastProbeTime: string | null
}

/**
 * 仪表盘数据（综合）
 */
export interface DomainHealthDashboardData {
  queryTime: string
  enabled: boolean
  channelCount: number
  currentStatus: DomainHealthSnapshot[]
  history24h: Record<string, ChannelHealthData>
  realtimeData: Array<Record<string, unknown>>
}

/**
 * 域名健康监控 API
 * 对应后端 DomainHealthController
 */
export const domainHealthApi = {
  /**
   * 获取当前所有域名健康状态
   * 对应后端接口: GET /api/domain-health/status
   */
  getStatus: async (): Promise<{
    enabled: boolean
    domainCount: number
    queryTime: string
    domains: DomainHealthSnapshot[]
  }> => {
    return request('/api/domain-health/status')
  },

  /**
   * 获取24小时健康历史（用于条形监测图）
   * 对应后端接口: GET /api/domain-health/history/24h
   */
  get24HourHistory: async (): Promise<{
    queryTime: string
    channels: Record<string, ChannelHealthData>
  }> => {
    return request('/api/domain-health/history/24h')
  },

  /**
   * 获取实时监控数据（用于折线图）
   * 对应后端接口: GET /api/domain-health/realtime
   */
  getRealtimeData: async (): Promise<{
    queryTime: string
    data: Array<Record<string, unknown>>
    currentStatus: DomainHealthSnapshot[]
  }> => {
    return request('/api/domain-health/realtime')
  },

  /**
   * 获取综合仪表盘数据（一次性获取所有数据）
   * 对应后端接口: GET /api/domain-health/dashboard
   */
  getDashboard: async (): Promise<DomainHealthDashboardData> => {
    return request('/api/domain-health/dashboard')
  },

  /**
   * 手动触发探测
   * 对应后端接口: POST /api/domain-health/probe
   */
  triggerProbe: async (): Promise<string> => {
    return request('/api/domain-health/probe', {
      method: 'POST',
    })
  },
}

export { ApiError }
export type { ApiResponse }
