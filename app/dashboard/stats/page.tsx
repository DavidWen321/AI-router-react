"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  usageApi,
  userApi,
  ApiError,
  type DailyUsageData,
  type UsageLogRecord,
  type UsageLogsPageData,
} from "@/lib/api"

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const RefreshCw = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
)

const Clock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Eye = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
)

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
)

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

// 图表数据接口
interface ChartData {
  date: string
  cost: number
}

export default function UsageStatsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [timeRange, setTimeRange] = useState(t("最近 30 天", "Last 30 Days"))
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // 数据状态
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [todayCost, setTodayCost] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [usageRecords, setUsageRecords] = useState<UsageLogRecord[]>([])
  const [totalRecords, setTotalRecords] = useState(0)

  useEffect(() => {
    setMounted(true)
    const email = localStorage.getItem("userEmail")
    const storedUserId = localStorage.getItem("userId")

    if (email && storedUserId) {
      setUserEmail(email)
      setUserId(storedUserId)
    } else if (email) {
      // 如果有email但没有userId,从后端获取
      setUserEmail(email)
      fetchUserIdByEmail(email)
    }
  }, [])

  // 根据email获取userId
  const fetchUserIdByEmail = async (email: string) => {
    try {
      const user = await userApi.getUserByEmail(email)
      setUserId(user.id)
      localStorage.setItem("userId", user.id)
    } catch (error) {
      console.error("Failed to fetch user ID:", error)
      toast({
        title: t("错误", "Error"),
        description: t("无法获取用户信息", "Failed to fetch user info"),
        variant: "destructive",
      })
    }
  }

  // 当userId变化时加载数据
  useEffect(() => {
    if (userId) {
      loadAllData()
    }
  }, [userId, timeRange, currentPage, itemsPerPage])

  // 加载所有数据
  const loadAllData = async () => {
    if (!userId) {
      console.log("No userId available")
      return
    }

    console.log("Loading data for userId:", userId)

    try {
      setLoading(true)

      // 并行请求所有数据
      console.log("Fetching today cost and month usage...")
      const [todayCostData, monthUsageData] = await Promise.all([
        usageApi.getTodayCost(userId),
        usageApi.getMonthUsage(userId),
      ])

      console.log("Today cost data:", todayCostData)
      console.log("Month usage data:", monthUsageData)

      // 临时: 使用日志接口需要后端支持按userId查询
      let usageLogsData = null
      try {
        console.log("Fetching usage logs...")
        usageLogsData = await usageApi.getUserUsageLogs(userId, currentPage, itemsPerPage, getDaysFromTimeRange())
        console.log("Usage logs data:", usageLogsData)
      } catch (error) {
        console.log("Usage logs API error:", error)
      }

      // 设置今日费用
      console.log("Setting today cost to:", todayCostData)
      setTodayCost(todayCostData)

      // 设置图表数据和总费用
      // 注意: 后端返回的是 DailyUsageData[],不是包装对象
      if (monthUsageData && Array.isArray(monthUsageData) && monthUsageData.length > 0) {
        console.log("Month usage data sample:", monthUsageData[0])

        // 后端返回的是倒序(最新的在前),需要反转让图表从左到右递增
        const chartDataFormatted: ChartData[] = monthUsageData
          .slice()  // 创建副本避免修改原数组
          .reverse()  // 反转顺序,让时间从旧到新
          .map((usage) => {
            console.log("Processing usage:", usage)
            return {
              date: formatDateShort(usage.usageDate),  // 使用usageDate而不是date
              cost: usage.totalCost,
            }
          })
        console.log("Chart data formatted:", chartDataFormatted)
        setChartData(chartDataFormatted)

        // 计算总费用
        const total = monthUsageData.reduce((sum, usage) => sum + usage.totalCost, 0)
        console.log("Total cost calculated:", total)
        setTotalCost(total)
      } else {
        // 如果没有数据,设置为空数组
        console.log("No month usage data available")
        setChartData([])
        setTotalCost(0)
      }

      // 设置使用记录
      if (usageLogsData && usageLogsData.records) {
        console.log("Usage logs data received:")
        console.log("  - Total records:", usageLogsData.total)
        console.log("  - Current page:", usageLogsData.current)
        console.log("  - Page size:", usageLogsData.size)
        console.log("  - Records count:", usageLogsData.records.length)
        console.log("  - Records:", usageLogsData.records)
        setUsageRecords(usageLogsData.records)
        setTotalRecords(usageLogsData.total || 0)
      } else {
        // 如果没有数据,设置为空数组
        console.log("No usage logs data available")
        setUsageRecords([])
        setTotalRecords(0)
      }
    } catch (error) {
      console.error("Failed to load usage data:", error)
      toast({
        title: t("加载失败", "Load Failed"),
        description:
          error instanceof ApiError
            ? error.message
            : t("无法加载使用统计数据", "Failed to load usage statistics"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 从时间范围获取天数
  const getDaysFromTimeRange = (): number => {
    const match = timeRange.match(/\d+/)
    return match ? Number.parseInt(match[0]) : 30
  }

  // 格式化日期为简短格式 (例如: "10/7")
  // 后端LocalDate格式: "2025-10-12"
  const formatDateShort = (dateStr: string): string => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateStr)
        return dateStr
      }
      return `${date.getMonth() + 1}/${date.getDate()}`
    } catch (error) {
      console.error("Error formatting date:", error, dateStr)
      return dateStr
    }
  }

  // 格式化日期时间 - 后端返回的是LocalDateTime格式的字符串
  const formatDateTime = (dateTimeStr: string): string => {
    if (!dateTimeStr) return "-"
    try {
      // 后端LocalDateTime格式: "2025-10-06T20:26:00"
      const date = new Date(dateTimeStr)
      if (isNaN(date.getTime())) return dateTimeStr // 如果解析失败,返回原字符串

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      return `${year}-${month}-${day} ${hours}:${minutes}`
    } catch (error) {
      console.error("Error formatting date:", error, dateTimeStr)
      return dateTimeStr
    }
  }

  const startRecord = (currentPage - 1) * itemsPerPage + 1
  const endRecord = Math.min(currentPage * itemsPerPage, totalRecords)
  const totalPages = Math.ceil(totalRecords / itemsPerPage)

  const handleRefresh = () => {
    loadAllData()
    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>{t("数据已刷新", "Data Refreshed")}</span>
        </div>
      ),
      className: "bg-green-50 border-green-200",
      duration: 3000,
    })
  }

  const timeRangeOptions = [
    t("最近 7 天", "Last 7 Days"),
    t("最近 15 天", "Last 15 Days"),
    t("最近 30 天", "Last 30 Days"),
    t("最近 60 天", "Last 60 Days"),
    t("最近 90 天", "Last 90 Days"),
  ]

  const handleTimeRangeSelect = (option: string) => {
    setTimeRange(option)
    setIsDropdownOpen(false)
  }

  const handleItemsPerPageChange = (value: number) => {
    console.log("Items per page changed to:", value)
    setItemsPerPage(value)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userId")
    toast({
      title: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>{t("已退出登录", "Logged Out")}</span>
        </div>
      ),
      description: t("您已成功退出登录", "You have been successfully logged out"),
      className: "bg-green-50 border-green-200",
      duration: 3000,
    })
    router.push("/")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Navigation */}
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-12 py-8 pt-24 page-transition">
        {/* Page Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-8 h-8 text-cyan-600" />
              <h1 className="text-3xl font-bold">{t("使用统计", "Usage Statistics")}</h1>
            </div>
            <p className="text-gray-600">{t("查看每日API费用统计", "View daily API cost statistics")}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">{t("刷新", "Refresh")}</span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Calendar className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <span>{timeRange}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleTimeRangeSelect(option)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      <span className="text-gray-700">{option}</span>
                      {timeRange === option && <Check className="w-4 h-4 text-cyan-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">{t("加载中...", "Loading...")}</div>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Today's Cost */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-gray-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">{t("今日费用", "Today's Cost")}</span>
                  <BarChart3 className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-4xl font-bold mb-1">${todayCost.toFixed(4)}</div>
                <div className="text-sm text-gray-500">{new Date().toLocaleDateString()}</div>
              </div>

              {/* Total Cost */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-gray-300 cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">{t("总计费用", "Total Cost")}</span>
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-4xl font-bold mb-1">${totalCost.toFixed(4)}</div>
                <div className="text-sm text-gray-500">
                  {t("过去", "Past")} {getDaysFromTimeRange()} {t("天总计", "days total")}
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t("每日费用趋势", "Daily Cost Trend")}</h2>
                <p className="text-gray-600 text-sm">
                  {t("过去", "Past")} {getDaysFromTimeRange()} {t("天的API费用变化", "days of API cost changes")} (
                  {timeRange})
                </p>
              </div>

              <div className="flex items-center justify-between mb-6 text-sm">
                <span className="text-gray-600">
                  {timeRange} {t("的费用趋势", "'s cost trend")}
                </span>
                <span className="text-gray-600">
                  {t("最高", "Highest")}: <span className="font-semibold">${chartData.length > 0 ? Math.max(...chartData.map((d) => d.cost)).toFixed(4) : "0.0000"}</span>
                </span>
              </div>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 12 }}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number) => [`$${value.toFixed(4)}`, t("费用", "Cost")]}
                      cursor={{ fill: "rgba(6, 182, 212, 0.1)" }}
                    />
                    <Bar dataKey="cost" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Usage Records Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mt-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                    <h2 className="text-xl font-semibold">{t("详细用量记录", "Detailed Usage Records")}</h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {t("查看每次请求的详细 Token 使用和费用明细", "View detailed token usage and cost for each request")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{t("每页显示", "Items per page")}:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {t("请求时间", "Request Time")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        {t("模型", "Model")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        # {t("输入 Tokens", "Input Tokens")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        # {t("输出 Tokens", "Output Tokens")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        {t("总 Tokens", "Total Tokens")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          {t("缓存创建", "Cache Created")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {t("费用", "Cost")}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-500">
                          {t("暂无使用记录", "No usage records found")}
                        </td>
                      </tr>
                    ) : (
                      usageRecords.map((record) => (
                        <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm text-gray-700">{formatDateTime(record.createdAt)}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-md bg-cyan-100 text-cyan-700 text-xs font-medium">
                            {record.modelName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          <div>
                            <div className="font-medium">{record.inputTokens.toLocaleString()}</div>
                            {record.cacheReadTokens && record.cacheReadTokens > 0 && (
                              <div className="text-xs text-gray-500">
                                ({record.cacheReadTokens.toLocaleString()} {t("缓存", "cached")})
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 font-medium">
                          {record.outputTokens.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700 font-medium">
                          {record.totalTokens.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {record.cacheCreationTokens && record.cacheCreationTokens > 0
                            ? record.cacheCreationTokens.toLocaleString()
                            : "-"}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">${record.cost.toFixed(6)}</td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {t("显示第", "Showing")} {startRecord} {t("到", "to")} {endRecord} {t("条,共", "of")} {totalRecords}{" "}
                  {t("条", "records")}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t("上一页", "Previous")}
                  </button>
                  <div className="px-3 py-1.5 text-sm text-gray-700">
                    {t("第", "Page")} {currentPage}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {t("下一页", "Next")}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
