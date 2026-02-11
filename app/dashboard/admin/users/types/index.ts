/**
 * 用户管理页面 - 类型定义
 */

export interface UserData {
  id: string
  email: string
  registrationDate: string
  planType: string
  planStatus: "活跃" | "已过期" | "已取消" | "临时" | "无套餐"
  planExpiry: string
  planStartTime?: string
  dailyBudget: number
  hasTempLimit?: boolean
  todayUsage: number
  totalUsage: number
  totalCalls: number
  lastActive: string
  userMembershipId?: number
  membershipId?: number
  billingMode?: "MEMBERSHIP" | "PAYG"
  walletBalance?: number
  walletTotalConsumed?: number
  unlimitedConcurrency?: boolean
}

export interface SearchFilters {
  email: string
  planType: string
  apiKey: string
}

export interface EditFormData {
  planType: string
  planStatus: "活跃" | "已过期" | "已取消"
  planExpiry: string
}

export type TimePeriod = "today" | "7days" | "15days" | "30days"

export interface ChartDataPoint {
  time: string
  usageRate: number
}

export interface ChartStats {
  peakTime: string
  peakRate: number
  maxRate: number
  minRate: number
  currentRate: number
  highestUsageUser: UserData
}

export interface MonthlyConsumptionData {
  month: string
  totalConsumption: number
  growthRate: number
}

export interface UserConsumptionStatsData {
  totalConsumption: number
  monthlyStats: MonthlyConsumptionData[]
}
