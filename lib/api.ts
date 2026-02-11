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
   * @param email - 邮箱地址
   * @param captchaToken - Cloudflare Turnstile验证码token（可选，启用验证码时必填）
   */
  sendCode: async (email: string, captchaToken?: string): Promise<void> => {
    await request('/login/sendcode', {
      method: 'POST',
      body: JSON.stringify({
        email,
        captchaTicket: captchaToken,
      }),
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

  /**
   * Get user's all active plans (current + future)
   * 对应后端接口: GET /user-membership/all-plans/{userId}
   * @param userId - 字符串类型的userId,避免JavaScript大整数精度丢失
   * @returns 套餐列表（当前在前，未来在后，按开始时间排序）
   */
  getAllActivePlans: async (userId: string): Promise<UserMembershipData[]> => {
    return request(`/user-membership/all-plans/${userId}`)
  },
}

// Agent Pricing API (代理价格套餐管理)
export const agentPricingApi = {
  /**
   * Get all agent pricing
   * 对应后端接口: GET /admin/agent/pricing/list
   */
  getAllPricing: async (): Promise<AgentPricingData[]> => {
    return request('/admin/agent/pricing/list')
  },

  /**
   * Add agent pricing
   * 对应后端接口: POST /admin/agent/pricing
   */
  addPricing: async (data: {
    membershipId: number
    agentPrice: number
    originalPrice: number
    description?: string
    sortOrder?: number
  }): Promise<void> => {
    await request('/admin/agent/pricing', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Update agent pricing
   * 对应后端接口: PUT /admin/agent/pricing/{id}
   */
  updatePricing: async (id: number, data: {
    membershipId: number
    agentPrice: number
    originalPrice: number
    description?: string
    sortOrder?: number
  }): Promise<void> => {
    await request(`/admin/agent/pricing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete agent pricing
   * 对应后端接口: DELETE /admin/agent/pricing/{id}
   */
  deletePricing: async (id: number): Promise<void> => {
    await request(`/admin/agent/pricing/${id}`, {
      method: 'DELETE',
    })
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
   * Get revenue stats for admin users page
   * 对应后端接口: GET /admin/users/revenue-stats
   */
  getRevenueStats: async (): Promise<UserRevenueStatsData> => {
    return request('/admin/users/revenue-stats')
  },

  /**
   * Get operation monthly stats for admin dashboard
   * 对应后端接口: GET /admin/users/operation-stats
   */
  getOperationStats: async (): Promise<UserOperationStatsData> => {
    return request('/admin/users/operation-stats')
  },

  /**
   * Get monthly operation details by month
   * 对应后端接口: GET /admin/users/operation-monthly-details?month=yyyy-MM
   */
  getOperationMonthlyDetails: async (month: string): Promise<OperationMonthlyDetailStatsData> => {
    return request(`/admin/users/operation-monthly-details?month=${encodeURIComponent(month)}`)
  },

  /**
   * Get consumption stats for user management
   * 对应后端接口: GET /admin/users/consumption-stats
   */
  getConsumptionStats: async (): Promise<UserConsumptionStatsData> => {
    return request('/admin/users/consumption-stats')
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
  // ===== 按量计费管理 =====
  getBillingProfile: async (userId: string): Promise<BillingProfileData> => {
    return request(`/admin/billing/users/${userId}/profile`)
  },

  updateBillingProfile: async (userId: string, data: {
    billingMode: "MEMBERSHIP" | "PAYG"
    unlimitedConcurrency: number
    remark?: string
  }): Promise<void> => {
    await request(`/admin/billing/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  getWallet: async (userId: string): Promise<WalletData> => {
    return request(`/admin/billing/users/${userId}/wallet`)
  },

  rechargeWallet: async (userId: string, data: {
    amount: number
    paymentChannel: string
    paymentRef?: string
    remark?: string
    idempotencyKey?: string
  }): Promise<void> => {
    await request(`/admin/billing/users/${userId}/wallet/recharge`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  adjustWallet: async (userId: string, data: {
    amount: number
    remark?: string
    idempotencyKey?: string
  }): Promise<void> => {
    await request(`/admin/billing/users/${userId}/wallet/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getWalletLedger: async (
    userId: string,
    pageNum: number = 1,
    pageSize: number = 20,
  ): Promise<{ list: WalletLedgerRecord[]; total: number; pageNum: number; pageSize: number }> => {
    return request(`/admin/billing/users/${userId}/ledger?pageNum=${pageNum}&pageSize=${pageSize}`)
  },

  getBillingJournal: async (
    userId: string,
    pageNum: number = 1,
    pageSize: number = 20,
  ): Promise<{ list: BillingJournalRecord[]; total: number; pageNum: number; pageSize: number }> => {
    return request(`/admin/billing/users/${userId}/journal?pageNum=${pageNum}&pageSize=${pageSize}`)
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

// Agent Pricing Data Interface (代理价格套餐)
export interface AgentPricingData {
  id: number
  membershipId: number  // 关联的会员套餐ID
  levelName: string  // 会员等级名称
  levelCode: string  // 会员等级代码
  dailyUsage: number  // 每日使用额度（USD）
  agentPrice: number  // 代理价格（积分/月）
  originalPrice: number  // 原价/官方价
  description?: string  // 描述
  sortOrder?: number  // 排序顺序
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
  billingMode?: "MEMBERSHIP" | "PAYG"
  walletBalance?: number
  walletTotalConsumed?: number
  unlimitedConcurrency?: boolean
  hasTempLimit?: boolean
}

export interface BillingProfileData {
  userId: string
  billingMode: "MEMBERSHIP" | "PAYG"
  status: number
  unlimitedConcurrency: number
  remark?: string
}

export interface WalletData {
  userId: string
  currency: string
  availableBalance: number
  frozenBalance: number
  totalRecharged: number
  totalConsumed: number
  status: number
}

export interface BillingJournalRecord {
  id: string
  requestId: string
  billingMode: string
  estimatedAmount: number
  actualAmount: number
  settlementAmount: number
  modelName?: string
  status: number
  createdAt: string
}

export interface WalletLedgerRecord {
  id: string
  ledgerNo: string
  changeType: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  bizType: string
  requestId?: string
  remark?: string
  createdAt: string
}

export interface UserRevenueStatsData {
  totalRevenue: number
  adminRevenue: number
  agentRevenue: number
}

export interface MonthlyOperationRevenueData {
  month: string
  totalRevenue: number
  adminRevenue: number
  agentRevenue: number
  growthRate: number
}

export interface UserOperationStatsData {
  totalRevenue: number
  totalAdminRevenue: number
  totalAgentRevenue: number
  monthlyStats: MonthlyOperationRevenueData[]
}

export interface MonthlyConsumptionStatsData {
  month: string
  totalConsumption: number
  growthRate: number
}

export interface UserConsumptionStatsData {
  totalConsumption: number
  monthlyStats: MonthlyConsumptionStatsData[]
}

export interface BackupConsumptionStatsData {
  totalConsumption: number
  monthlyStats: MonthlyConsumptionStatsData[]
}

export interface OperationMonthlyDetailData {
  userMembershipId: string
  userId: string
  userEmail: string
  membershipId: number
  membershipName: string
  startTime: string
  expireTime: string
  saleType: "admin" | "agent"
  sellerUserId: string
  sellerAccount: string
  unitPrice: number
  months: number
  revenue: number
}

export interface OperationMonthlyDetailStatsData {
  month: string
  totalRevenue: number
  adminRevenue: number
  agentRevenue: number
  details: OperationMonthlyDetailData[]
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
  billingMode?: "MEMBERSHIP" | "PAYG"
  todayCost: number
  dailyLimit?: number | null
  remaining: number
  usagePercentage: number
  walletBalance?: number | null
  walletTotalConsumed?: number | null
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
  enabled: boolean  // ⭐ 新增：渠道启用状态
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

// ==================== 多模型健康监控类型 ====================

/**
 * 单个模型的健康数据
 */
export interface ModelHealthData {
  modelId: string           // 模型ID
  currentStatus: 'available' | 'unavailable'
  ewmaLatencyMs: number     // EWMA延迟
  successRate: number       // 成功率 0-100
  lastProbeTime: string | null
  fullyHealthy: boolean     // 是否完全健康
  availabilityRate: number  // 可用率 0-100
  history: Array<{
    time: string
    status: 'available' | 'unavailable'
    latencyMs: number
  }>
}

/**
 * 单个渠道的多模型健康数据
 */
export interface MultiModelChannelData {
  alias: string
  url: string
  enabled: boolean
  overallStatus: 'available' | 'partial' | 'degraded' | 'unavailable' | 'unknown'
  models: {
    haiku?: ModelHealthData
    sonnet?: ModelHealthData
    opus?: ModelHealthData
  }
}

/**
 * 多模型仪表盘数据
 */
export interface MultiModelDashboardData {
  queryTime: string
  enabled: boolean
  channelCount: number
  probeStrategy: {
    highFrequency: {
      models: string[]
      intervalSeconds: number
      description?: string
    }
    lowFrequency: {
      models: string[]
      intervalSeconds: number
      description?: string
    }
  }
  multiModelHistory?: Record<string, MultiModelChannelData>
  channels?: Record<string, MultiModelChannelData>
  currentStatus: DomainHealthSnapshot[]
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

  /**
   * ⭐ 切换渠道启用状态（toggle）
   * 对应后端接口: PUT /api/domain-health/toggle/{alias}
   */
  toggleChannel: async (alias: string): Promise<{
    alias: string
    enabled: boolean
    message: string
  }> => {
    return request(`/api/domain-health/toggle/${alias}`, {
      method: 'PUT',
    })
  },

  /**
   * 设置渠道启用状态
   * 对应后端接口: PUT /api/domain-health/enabled/{alias}
   */
  setChannelEnabled: async (alias: string, enabled: boolean): Promise<{
    alias: string
    enabled: boolean
    message: string
  }> => {
    return request(`/api/domain-health/enabled/${alias}?enabled=${enabled}`, {
      method: 'PUT',
    })
  },

  /**
   * ⭐ 获取多模型24小时健康历史
   * 对应后端接口: GET /api/domain-health/history/24h/multi-model
   */
  getMultiModel24HourHistory: async (): Promise<MultiModelDashboardData> => {
    return request('/api/domain-health/history/24h/multi-model')
  },

  /**
   * ⭐ 获取多模型综合仪表盘数据
   * 对应后端接口: GET /api/domain-health/dashboard/multi-model
   */
  getMultiModelDashboard: async (): Promise<MultiModelDashboardData> => {
    return request('/api/domain-health/dashboard/multi-model')
  },
}

// ==================== Backup Pool Management API ====================

/**
 * Backup Pool View Object (备用号池数据)
 */
export interface BackupPoolVO {
  id: number
  name: string
  supplierWeb: string
  account: string
  accountUrl: string
  accountPoolKey: string
  accountDailyUsage: number
  accountDailyRemainingUsage: number
  accountCost: number
  priority: number
  status: number
  startTime: string
  expireTime: string
  createdAt: string
  updatedAt: string
}

/**
 * Backup Pool DTO (创建/更新备用号池时使用)
 */
export interface BackupPoolDTO {
  name: string
  supplierWeb: string
  account: string
  accountUrl: string
  accountPoolKey: string
  accountDailyUsage: number
  accountDailyRemainingUsage?: number
  accountCost?: number
  priority: number
  status: number
  startTime: string
  expireTime: string
}

/**
 * Backup Pool Management API
 * 对应后端 BackupPoolController
 */
export const backupPoolApi = {
  /**
   * 查询全部备用号池
   * 对应后端接口: GET /backup-pools
   */
  listAll: async (): Promise<BackupPoolVO[]> => {
    return request('/backup-pools')
  },

  /**
   * 查询备用号池详情
   * 对应后端接口: GET /backup-pools/{id}
   */
  getDetail: async (id: number): Promise<BackupPoolVO> => {
    return request(`/backup-pools/${id}`)
  },

  /**
   * 创建备用号池
   * 对应后端接口: POST /backup-pools
   */
  create: async (data: BackupPoolDTO): Promise<void> => {
    await request('/backup-pools', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 更新备用号池
   * 对应后端接口: PUT /backup-pools/{id}
   */
  update: async (id: number, data: BackupPoolDTO): Promise<void> => {
    await request(`/backup-pools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * 删除备用号池
   * 对应后端接口: DELETE /backup-pools/{id}
   */
  delete: async (id: number): Promise<void> => {
    await request(`/backup-pools/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * 检查是否有可用的备用号池
   * 对应后端接口: GET /backup-pools/available
   */
  checkAvailable: async (): Promise<boolean> => {
    return request('/backup-pools/available')
  },

  /**
   * 获取备用号池额度消耗统计
   * 对应后端接口: GET /backup-pools/consumption-stats
   */
  getConsumptionStats: async (): Promise<BackupConsumptionStatsData> => {
    return request('/backup-pools/consumption-stats')
  },
}

// ==================== Model Pricing Management API ====================

/**
 * Model Pricing Data Interface
 */
export interface ModelPricingData {
  id: number
  modelKey: string              // 模型标识符（如 claude-sonnet-4-5）
  modelName: string             // 模型全名（如 claude-sonnet-4-5-20250929）
  inputPrice: number            // 输入价格（$/百万tokens）
  outputPrice: number           // 输出价格（$/百万tokens）
  cacheWritePrice: number       // 缓存写入价格（$/百万tokens）
  cacheReadPrice: number        // 缓存读取价格（$/百万tokens）
  isActive: boolean             // 是否启用
  isAllowed: boolean            // 是否允许使用
  createdAt: string             // 创建时间
  updatedAt: string             // 更新时间
}

/**
 * Create Pricing Form Data
 */
export interface CreatePricingFormData {
  modelKey: string
  modelName: string
  inputPrice: number
  outputPrice: number
  cacheWritePrice: number
  cacheReadPrice: number
  isActive: boolean
}

/**
 * Edit Pricing Form Data
 */
export interface EditPricingFormData extends CreatePricingFormData {
  id: number
}

/**
 * Model Pricing Management API
 * 对应后端 ModelPricingController
 */
export const modelPricingApi = {
  /**
   * 获取所有模型定价
   * 对应后端接口: GET /model-pricing
   */
  getAllPricings: async (): Promise<ModelPricingData[]> => {
    return request('/model-pricing')
  },

  /**
   * 创建模型定价
   * 对应后端接口: POST /model-pricing
   */
  createPricing: async (data: CreatePricingFormData): Promise<void> => {
    await request('/model-pricing', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 更新模型定价
   * 对应后端接口: PUT /model-pricing (ID在请求体中)
   */
  updatePricing: async (id: number, data: EditPricingFormData): Promise<void> => {
    await request('/model-pricing', {
      method: 'PUT',
      body: JSON.stringify({ ...data, id }),
    })
  },

  /**
   * 删除模型定价
   * 对应后端接口: DELETE /model-pricing/{id}
   */
  deletePricing: async (id: number): Promise<void> => {
    await request(`/model-pricing/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * 刷新价格缓存
   * 注意: 后端暂未实现此接口,暂时注释
   * TODO: 后端需要添加刷新缓存的API端点
   */
  refreshCache: async (): Promise<void> => {
    // 暂时返回成功,不实际调用后端
    console.warn('[API] refreshCache: 后端暂未实现此接口')
    return Promise.resolve()
  },
}

// ==================== Model Restriction Management API ====================

/**
 * Model Restriction Data Interface
 */
export interface ModelRestrictionData {
  id: number
  modelKey: string              // 模型标识符（如 claude-sonnet-4-5）
  modelName: string             // 模型全名（如 claude-sonnet-4-5-20250929）
  isActive: boolean             // 是否启用
  isAllowed: boolean            // 是否允许使用（勾选状态）
}

/**
 * Model Restriction Management API
 * 对应后端 ModelRestrictionController
 */
export const modelRestrictionApi = {
  /**
   * 获取所有可用模型列表（从 model_pricing 表）
   * 对应后端接口: GET /api/model-restriction/available-models
   */
  getAvailableModels: async (): Promise<ModelPricingData[]> => {
    return request('/api/model-restriction/available-models')
  },

  /**
   * 获取当前允许的模型列表
   * 对应后端接口: GET /api/model-restriction/allowed-models
   */
  getAllowedModels: async (): Promise<string[]> => {
    return request('/api/model-restriction/allowed-models')
  },

  /**
   * 更新允许的模型列表（仅管理员）
   * 对应后端接口: POST /api/model-restriction/allowed-models
   * Body: {"modelKeys": ["claude-sonnet-4-5", "claude-haiku-3-5"]}
   */
  updateAllowedModels: async (modelKeys: string[]): Promise<void> => {
    await request('/api/model-restriction/allowed-models', {
      method: 'POST',
      body: JSON.stringify({ modelKeys }),
    })
  },

  /**
   * 清空允许列表（恢复默认）（仅管理员）
   * 对应后端接口: DELETE /api/model-restriction/allowed-models
   */
  clearAllowedModels: async (): Promise<void> => {
    await request('/api/model-restriction/allowed-models', {
      method: 'DELETE',
    })
  },

  /**
   * 刷新缓存（仅管理员）
   * 对应后端接口: POST /api/model-restriction/refresh-cache
   */
  refreshCache: async (): Promise<void> => {
    await request('/api/model-restriction/refresh-cache', {
      method: 'POST',
    })
  },

  /**
   * 测试模型是否允许使用
   * 对应后端接口: GET /api/model-restriction/test?modelName=xxx
   */
  testModel: async (modelName: string): Promise<{ allowed: boolean }> => {
    return request(`/api/model-restriction/test?modelName=${encodeURIComponent(modelName)}`)
  },
}

// ==================== Agent (代理商) API ====================

/**
 * 代理商信息 VO
 */
export interface AgentInfoVO {
  id: string           // 使用string类型避免精度丢失
  userId: string       // 使用string类型避免精度丢失
  email?: string       // 代理商邮箱（来自users表）
  balance: number      // 积分余额
  totalRecharged: number  // 累计充值
  totalConsumed: number   // 累计消费
  redemptionCount?: number  // 兑换次数
  status: number       // 状态：0-禁用，1-正常
  remark?: string      // 备注
  createdAt: string
  updatedAt: string
}

/**
 * 代理价格套餐 VO
 */
export interface AgentPricingVO {
  id: string           // 使用string类型避免精度丢失
  membershipId: string // 使用string类型避免精度丢失
  membershipName?: string  // 会员名称
  levelName?: string       // 会员等级名称
  levelCode?: string       // 会员等级代码
  dailyUsage?: number      // 每日额度（美元）
  agentPrice: number       // 代理价格（积分）
  originalPrice: number    // 原价（展示用）
  description?: string     // 描述
  sortOrder: number
  status: number
}

/**
 * 代理兑换记录 VO
 */
export interface AgentRedemptionLogVO {
  id: string           // 使用string类型避免精度丢失
  userId: string
  membershipId: string // 使用string类型避免精度丢失
  membershipName: string
  months: number
  targetUserEmail: string
  targetUserId?: string
  unitPrice: number
  totalPrice: number
  balanceBefore: number
  balanceAfter: number
  status: number
  remark?: string
  createdAt: string
}

/**
 * 代理充值记录 VO
 */
export interface AgentRechargeLogVO {
  id: string           // 使用string类型避免精度丢失
  userId: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  remark?: string
  createdAt: string
}

/**
 * 代理兑换请求 DTO
 */
export interface AgentRedemptionDTO {
  membershipId: string // 使用string类型避免精度丢失
  months: number        // 开通月数（1-12）
  userEmail: string     // 目标用户邮箱
}

/**
 * 代理商 API
 * 对应后端 AgentController
 */
/**
 * 管理员添加代理商请求 DTO
 */
export interface AgentAddDTO {
  userId: string       // 使用string类型避免JavaScript大整数精度丢失
  remark?: string
}

/**
 * 管理员充值请求 DTO
 */
export interface AgentRechargeDTO {
  userId: string       // 使用string类型避免精度丢失
  amount: number
  remark?: string
}

/**
 * 代理商定价 DTO（添加/更新）
 */
export interface AgentPricingDTO {
  membershipId: string // 使用string类型避免精度丢失
  agentPrice: number
  originalPrice: number
  description?: string
  sortOrder?: number
}

/**
 * 代理商统计数据
 */
export interface AgentStatisticsVO {
  totalAgents: number           // 代理商总数
  activeAgents: number          // 活跃代理商数
  totalBalance: number          // 总余额
  totalRecharged: number        // 总充值金额
  totalConsumed: number         // 总消费金额
  totalRedemptions: number      // 总兑换次数
}

/**
 * 管理员代理商 API
 * 对应后端 AgentAdminController
 */
export const agentAdminApi = {
  /**
   * 获取代理商列表
   * 对应后端接口: GET /admin/agent/list
   */
  listAgents: async (
    pageNum: number = 1,
    pageSize: number = 10,
    keyword?: string,
    status?: number
  ): Promise<{
    list: AgentInfoVO[]
    total: number
    pageNum: number
    pageSize: number
  }> => {
    let url = `/admin/agent/list?pageNum=${pageNum}&pageSize=${pageSize}`
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
    if (status !== undefined) url += `&status=${status}`
    return request(url)
  },

  /**
   * 获取代理商详情
   * 对应后端接口: GET /admin/agent/{userId}
   */
  getAgent: async (userId: string): Promise<AgentInfoVO> => {
    return request(`/admin/agent/${userId}`)
  },

  /**
   * 添加代理商（将用户设为代理商）
   * 对应后端接口: POST /admin/agent/add
   */
  addAgent: async (data: AgentAddDTO): Promise<AgentInfoVO> => {
    return request('/admin/agent/add', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 移除代理商身份
   * 对应后端接口: DELETE /admin/agent/{userId}
   */
  removeAgent: async (userId: string): Promise<void> => {
    await request(`/admin/agent/${userId}`, {
      method: 'DELETE',
    })
  },

  /**
   * 修改代理商状态（启用/禁用）
   * 对应后端接口: PUT /admin/agent/{userId}/status
   */
  updateStatus: async (userId: string, status: number): Promise<void> => {
    await request(`/admin/agent/${userId}/status?status=${status}`, {
      method: 'PUT',
    })
  },

  /**
   * 获取代理商统计数据
   * 对应后端接口: GET /admin/agent/statistics
   */
  getStatistics: async (): Promise<AgentStatisticsVO> => {
    return request('/admin/agent/statistics')
  },

  /**
   * 给代理商充值
   * 对应后端接口: POST /admin/agent/recharge
   */
  recharge: async (data: AgentRechargeDTO): Promise<{
    rechargeId: string
    userId: string
    amount: number
    balanceAfter: number
  }> => {
    return request('/admin/agent/recharge', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 获取代理商充值记录
   * 对应后端接口: GET /admin/agent/{userId}/recharge/list
   */
  getRechargeList: async (
    userId: string,
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<{
    list: AgentRechargeLogVO[]
    total: number
    pageNum: number
    pageSize: number
  }> => {
    return request(`/admin/agent/${userId}/recharge/list?pageNum=${pageNum}&pageSize=${pageSize}`)
  },

  /**
   * 获取代理商兑换记录
   * 对应后端接口: GET /admin/agent/{userId}/redemption/list
   */
  getRedemptionList: async (
    userId: string,
    pageNum: number = 1,
    pageSize: number = 10
  ): Promise<{
    list: AgentRedemptionLogVO[]
    total: number
    pageNum: number
    pageSize: number
  }> => {
    return request(`/admin/agent/${userId}/redemption/list?pageNum=${pageNum}&pageSize=${pageSize}`)
  },

  // =================== 代理价格管理 ===================

  /**
   * 获取所有代理价格列表（包含禁用的）
   * 对应后端接口: GET /admin/agent/pricing/list
   */
  listAllPricing: async (): Promise<AgentPricingVO[]> => {
    return request('/admin/agent/pricing/list')
  },

  /**
   * 添加代理价格
   * 对应后端接口: POST /admin/agent/pricing
   */
  addPricing: async (data: AgentPricingDTO): Promise<AgentPricingVO> => {
    return request('/admin/agent/pricing', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 更新代理价格
   * 对应后端接口: PUT /admin/agent/pricing/{id}
   */
  updatePricing: async (id: string, data: AgentPricingDTO): Promise<AgentPricingVO> => {
    return request(`/admin/agent/pricing/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * 删除代理价格
   * 对应后端接口: DELETE /admin/agent/pricing/{id}
   */
  deletePricing: async (id: string): Promise<void> => {
    await request(`/admin/agent/pricing/${id}`, {
      method: 'DELETE',
    })
  },
}

export const agentApi = {
  /**
   * 获取当前代理商信息（包括余额）
   * 对应后端接口: GET /agent/info
   */
  getInfo: async (): Promise<AgentInfoVO> => {
    return request('/agent/info')
  },

  /**
   * 获取代理价格套餐列表
   * 对应后端接口: GET /agent/pricing/list
   */
  getPricingList: async (): Promise<AgentPricingVO[]> => {
    return request('/agent/pricing/list')
  },

  /**
   * 兑换会员（为用户开通会员）
   * 对应后端接口: POST /agent/redeem
   */
  redeem: async (data: AgentRedemptionDTO): Promise<{
    redemptionId: number
    membershipName: string
    months: number
    targetUserEmail: string
    targetUserId: string
    totalPrice: number
    balanceAfter: number
    expireTime: string
  }> => {
    return request('/agent/redeem', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 获取兑换记录
   * 对应后端接口: GET /agent/redemption/list
   */
  getRedemptionList: async (
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<{
    list: AgentRedemptionLogVO[]
    total: number
    pageNum: number
    pageSize: number
  }> => {
    return request(`/agent/redemption/list?pageNum=${pageNum}&pageSize=${pageSize}`)
  },

  /**
   * 获取充值记录
   * 对应后端接口: GET /agent/recharge/list
   */
  getRechargeList: async (
    pageNum: number = 1,
    pageSize: number = 20
  ): Promise<{
    list: AgentRechargeLogVO[]
    total: number
    pageNum: number
    pageSize: number
  }> => {
    return request(`/agent/recharge/list?pageNum=${pageNum}&pageSize=${pageSize}`)
  },

  /**
   * 检查当前用户是否是代理商
   * 通过调用 getInfo 来判断
   */
  checkIsAgent: async (): Promise<boolean> => {
    try {
      await request('/agent/info')
      return true
    } catch {
      return false
    }
  },
}

export { ApiError }
export type { ApiResponse }

// ==================== Pool Usage Statistics API ====================

/**
 * 号池使用统计汇总
 */
export interface PoolUsageSummaryStats {
  totalRequests: number
  mainPoolRequests: number
  mainPoolPercentage: number
  backupPoolRequests: number
  backupPoolPercentage: number
  totalCost: number
  mainPoolCost: number
  backupPoolCost: number
}

/**
 * 模型分布数据
 */
export interface ModelDistribution {
  modelName: string
  count: number
  percentage: number
  cost: number
}

/**
 * 每日趋势数据
 */
export interface DailyTrendData {
  date: string
  mainPoolRequests: number
  backupPoolRequests: number
  mainPoolCost: number
  backupPoolCost: number
}

/**
 * 号池使用统计完整数据
 */
export interface PoolUsageStatsData {
  queryTime: string
  timeRange: string
  summary: PoolUsageSummaryStats
  modelDistribution: ModelDistribution[]
  dailyTrend: DailyTrendData[]
}

/**
 * 号池使用统计 API
 * 对应后端 StatisticsController
 */
export const statisticsApi = {
  /**
   * 获取号池使用统计
   * 对应后端接口: GET /api/statistics/usage?range=today
   * @param range - 时间范围: today | yesterday | 7days | 30days
   */
  getPoolUsageStats: async (range: 'today' | 'yesterday' | '7days' | '30days' = 'today'): Promise<PoolUsageStatsData> => {
    return request(`/api/statistics/usage?range=${range}`)
  },

  /**
   * 刷新统计缓存
   * 对应后端接口: POST /api/statistics/usage/refresh
   */
  refreshCache: async (): Promise<string> => {
    return request('/api/statistics/usage/refresh', {
      method: 'POST',
    })
  },
}

// ==================== Proxy Config API ====================

/**
 * 代理配置 VO
 */
export interface ProxyConfigVO {
  id?: number
  name: string
  host: string
  port: number
  username?: string
  password?: string
  exitIp?: string  // 代理出口IP（可选）- 用于X-Forwarded-For头伪装
  bindingType: number  // 1-哈希绑定, 2-手动绑定
  maxAccounts: number
  currentBindings?: number  // 当前绑定账号数
  status: number  // 0-禁用, 1-启用
  priority: number
  totalRequests?: number
  successRequests?: number
  failedRequests?: number
  lastUsedAt?: string
  lastErrorAt?: string
  lastErrorMsg?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 代理配置 DTO (创建/更新)
 */
export interface ProxyConfigDTO {
  name: string
  host: string
  port: number
  username?: string
  password?: string
  exitIp?: string  // 代理出口IP（可选）
  bindingType?: number
  maxAccounts?: number
  status?: number
  priority?: number
}

/**
 * 账号-代理绑定 VO
 */
export interface AccountProxyBindingVO {
  id: number
  accountId: number
  poolType: string  // main / backup
  proxyConfigId: number
  createdAt?: string
  updatedAt?: string
}

/**
 * 代理统计信息
 */
export interface ProxyStatsVO {
  totalCount: number
  enabledCount: number
  disabledCount: number
  totalRequests: number
  successRequests: number
  failedRequests: number
  successRate: number
}

/**
 * 代理测试结果
 */
export interface ProxyTestResult {
  success: boolean
  duration?: number
  proxyAddress?: string
  error?: string
}

/**
 * 代理绑定概览 VO
 */
export interface ProxyBindingOverviewVO {
  id: number
  name: string
  host: string
  port: number
  status: number
  maxAccounts: number
  currentBindings: number
  availableSlots: number
  usageRate: number  // 百分比 0-100
}

/**
 * 代理绑定统计 VO
 */
export interface ProxyBindingStatsVO {
  proxyId: number
  proxyName: string
  host: string
  port: number
  maxAccounts: number
  currentBindings: number
  availableSlots: number
  usageRate: number  // 百分比 0-100
  bindings: AccountProxyBindingVO[]
}

/**
 * 批量绑定请求
 */
export interface BatchBindRequest {
  accountIds: number[]
  poolType: string  // main / backup
  proxyConfigId: number
}

/**
 * 批量绑定结果
 */
export interface BatchBindResult {
  success: number
  failed: number
  errors: string[]
}

/**
 * 一键分配结果
 */
export interface AutoDistributeResult {
  mainBound: number
  backupBound: number
  proxyCount: number
  totalBound: number
}

/**
 * 故障转移结果
 */
export interface FailoverResult {
  transferred: number
  targetProxyCount: number
}

/**
 * 代理配置 API
 * 对应后端 ProxyConfigController
 */
export const proxyConfigApi = {
  /**
   * 查询所有代理配置
   * 对应后端接口: GET /api/proxy-config
   */
  listAll: async (): Promise<ProxyConfigVO[]> => {
    return request('/api/proxy-config')
  },

  /**
   * 查询启用的代理配置
   * 对应后端接口: GET /api/proxy-config/enabled
   */
  listEnabled: async (): Promise<ProxyConfigVO[]> => {
    return request('/api/proxy-config/enabled')
  },

  /**
   * 查询单个代理配置
   * 对应后端接口: GET /api/proxy-config/{id}
   */
  getById: async (id: number): Promise<ProxyConfigVO> => {
    return request(`/api/proxy-config/${id}`)
  },

  /**
   * 创建代理配置
   * 对应后端接口: POST /api/proxy-config
   */
  create: async (data: ProxyConfigDTO): Promise<ProxyConfigVO> => {
    return request('/api/proxy-config', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 更新代理配置
   * 对应后端接口: PUT /api/proxy-config/{id}
   */
  update: async (id: number, data: ProxyConfigDTO): Promise<ProxyConfigVO> => {
    return request(`/api/proxy-config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * 删除代理配置
   * 对应后端接口: DELETE /api/proxy-config/{id}
   */
  delete: async (id: number): Promise<void> => {
    await request(`/api/proxy-config/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * 绑定账号到代理
   * 对应后端接口: POST /api/proxy-config/bind
   */
  bindAccount: async (accountId: number, poolType: string, proxyConfigId: number): Promise<void> => {
    await request(`/api/proxy-config/bind?accountId=${accountId}&poolType=${poolType}&proxyConfigId=${proxyConfigId}`, {
      method: 'POST',
    })
  },

  /**
   * 解除账号绑定
   * 对应后端接口: DELETE /api/proxy-config/bind
   */
  unbindAccount: async (accountId: number, poolType: string): Promise<void> => {
    await request(`/api/proxy-config/bind?accountId=${accountId}&poolType=${poolType}`, {
      method: 'DELETE',
    })
  },

  /**
   * 查询代理绑定的账号列表
   * 对应后端接口: GET /api/proxy-config/{id}/bindings
   */
  getBindings: async (id: number): Promise<AccountProxyBindingVO[]> => {
    return request(`/api/proxy-config/${id}/bindings`)
  },

  /**
   * 查询账号绑定的代理
   * 对应后端接口: GET /api/proxy-config/account-binding
   */
  getAccountBinding: async (accountId: number, poolType: string): Promise<ProxyConfigVO | null> => {
    return request(`/api/proxy-config/account-binding?accountId=${accountId}&poolType=${poolType}`)
  },

  /**
   * 获取代理统计概览
   * 对应后端接口: GET /api/proxy-config/stats
   */
  getStats: async (): Promise<ProxyStatsVO> => {
    return request('/api/proxy-config/stats')
  },

  /**
   * 重置代理统计
   * 对应后端接口: POST /api/proxy-config/{id}/reset-stats
   */
  resetStats: async (id: number): Promise<void> => {
    await request(`/api/proxy-config/${id}/reset-stats`, {
      method: 'POST',
    })
  },

  /**
   * 刷新所有代理缓存
   * 对应后端接口: POST /api/proxy-config/refresh-cache
   */
  refreshCache: async (): Promise<void> => {
    await request('/api/proxy-config/refresh-cache', {
      method: 'POST',
    })
  },

  /**
   * 刷新指定代理的缓存
   * 对应后端接口: POST /api/proxy-config/{id}/refresh-cache
   */
  refreshProxyCache: async (id: number): Promise<void> => {
    await request(`/api/proxy-config/${id}/refresh-cache`, {
      method: 'POST',
    })
  },

  /**
   * 测试代理连接
   * 对应后端接口: POST /api/proxy-config/{id}/test
   */
  testProxy: async (id: number): Promise<ProxyTestResult> => {
    return request(`/api/proxy-config/${id}/test`, {
      method: 'POST',
    })
  },

  // ==================== 绑定管理接口 ====================

  /**
   * 获取代理绑定统计信息（包含绑定的账号列表）
   * 对应后端接口: GET /api/proxy-config/{id}/binding-stats
   */
  getBindingStats: async (id: number): Promise<ProxyBindingStatsVO> => {
    return request(`/api/proxy-config/${id}/binding-stats`)
  },

  /**
   * 获取所有代理的绑定概览
   * 对应后端接口: GET /api/proxy-config/binding-overview
   */
  getBindingOverview: async (): Promise<ProxyBindingOverviewVO[]> => {
    return request('/api/proxy-config/binding-overview')
  },

  /**
   * 批量绑定账号到代理
   * 对应后端接口: POST /api/proxy-config/batch-bind
   */
  batchBind: async (data: BatchBindRequest): Promise<BatchBindResult> => {
    return request('/api/proxy-config/batch-bind', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * 同步所有代理的绑定计数（数据修复）
   * 对应后端接口: POST /api/proxy-config/sync-binding-counts
   */
  syncBindingCounts: async (): Promise<void> => {
    await request('/api/proxy-config/sync-binding-counts', {
      method: 'POST',
    })
  },

  // ==================== 一键分配与故障转移 ====================

  /**
   * 一键自动分配所有账号到代理
   * 将所有号池账号平均分配到所有启用的代理（兜底：强制分配，不受max_accounts限制）
   * 对应后端接口: POST /api/proxy-config/auto-distribute
   */
  autoDistribute: async (): Promise<AutoDistributeResult> => {
    return request('/api/proxy-config/auto-distribute', {
      method: 'POST',
    })
  },

  /**
   * 故障转移：将指定代理的账号转移到其他代理
   * 对应后端接口: POST /api/proxy-config/{id}/failover
   */
  failoverProxy: async (id: number): Promise<FailoverResult> => {
    return request(`/api/proxy-config/${id}/failover`, {
      method: 'POST',
    })
  },
}

// ==================== 探测模型配置 API ====================

export interface ProbeModelConfig {
  id?: number
  modelId: string
  displayName: string
  probeFrequency: 'high' | 'low'
  enabled: boolean
  sortOrder: number
  createdAt?: string
  updatedAt?: string
}

export const probeConfigApi = {
  /** 获取所有探测模型配置 */
  list: async (): Promise<ProbeModelConfig[]> => {
    return request('/admin/probe-config/list')
  },

  /** 新增探测模型 */
  create: async (data: Omit<ProbeModelConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    return request('/admin/probe-config', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /** 更新探测模型 */
  update: async (id: number, data: Partial<ProbeModelConfig>): Promise<boolean> => {
    return request(`/admin/probe-config/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /** 删除探测模型 */
  delete: async (id: number): Promise<boolean> => {
    return request(`/admin/probe-config/${id}`, {
      method: 'DELETE',
    })
  },

  /** 切换启用状态 */
  toggle: async (id: number): Promise<boolean> => {
    return request(`/admin/probe-config/${id}/toggle`, {
      method: 'PUT',
    })
  },

  /** 刷新缓存 */
  refresh: async (): Promise<boolean> => {
    return request('/admin/probe-config/refresh', {
      method: 'POST',
    })
  },
}
