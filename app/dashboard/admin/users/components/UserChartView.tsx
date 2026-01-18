/**
 * 用户图表视图组件 - 对接真实后端API
 */

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, ArrowLeft, Users, Activity, TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useLanguage } from "@/lib/language-context"
import { usageApi, ApiError, type UsageStatsData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { UserData, TimePeriod } from "../types"

interface UserChartViewProps {
  user: UserData
  users: UserData[]
  timePeriod: TimePeriod
  onTimePeriodChange: (period: TimePeriod) => void
  onBack: () => void
}

export function UserChartView({ user, users, timePeriod, onTimePeriodChange, onBack }: UserChartViewProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [statsData, setStatsData] = useState<UsageStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  // 将前端的时间段类型转换为后端的天数参数
  const getPeriodDays = (period: TimePeriod): 1 | 7 | 15 | 30 => {
    const periodMap: Record<TimePeriod, 1 | 7 | 15 | 30> = {
      today: 1,
      "7days": 7,
      "15days": 15,
      "30days": 30,
    }
    return periodMap[period]
  }

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true)
      const days = getPeriodDays(timePeriod)
      // 直接传字符串userId,避免Number()导致的精度丢失
      const data = await usageApi.getUserUsageStats(user.id, days)
      setStatsData(data)
    } catch (error) {
      console.error("Failed to load usage stats:", error)
      toast({
        title: t("加载失败", "Load Failed"),
        description:
          error instanceof ApiError
            ? error.message
            : t("无法加载使用率统计数据", "Failed to load usage statistics"),
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  // 时间段改变时重新加载数据
  useEffect(() => {
    loadStats()
  }, [timePeriod, user.id])

  // 如果加载中，显示加载状态
  if (loading || !statsData) {
    return (
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-2 -mt-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-400">{t("加载中...", "Loading...")}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-2">
      {/* Header with back button */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-600 dark:text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("使用率统计", "Usage Rate Statistics")} - {user.email}
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-400 dark:hover:border-cyan-600 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm hover:shadow-md font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("返回用户列表", "Back to User List")}
          </Button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {user.email} · {t("每日限额", "Daily Limit")}: ${user.dailyBudget.toFixed(2)}
        </p>
      </div>

      {/* Time period selector */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        <Button
          variant={timePeriod === "today" ? "default" : "outline"}
          onClick={() => onTimePeriodChange("today")}
          className={
            timePeriod === "today"
              ? "bg-cyan-600 hover:bg-cyan-700 text-white"
              : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          }
        >
          {t("当天", "Today")}
        </Button>
        <Button
          variant={timePeriod === "7days" ? "default" : "outline"}
          onClick={() => onTimePeriodChange("7days")}
          className={
            timePeriod === "7days"
              ? "bg-cyan-600 hover:bg-cyan-700 text-white"
              : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          }
        >
          {t("最近7天", "Last 7 Days")}
        </Button>
        <Button
          variant={timePeriod === "15days" ? "default" : "outline"}
          onClick={() => onTimePeriodChange("15days")}
          className={
            timePeriod === "15days"
              ? "bg-cyan-600 hover:bg-cyan-700 text-white"
              : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          }
        >
          {t("最近15天", "Last 15 Days")}
        </Button>
        <Button
          variant={timePeriod === "30days" ? "default" : "outline"}
          onClick={() => onTimePeriodChange("30days")}
          className={
            timePeriod === "30days"
              ? "bg-cyan-600 hover:bg-cyan-700 text-white"
              : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          }
        >
          {t("最近30天", "Last 30 Days")}
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Highest usage user card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-sm font-medium text-purple-900 dark:text-purple-300">
              {t("使用量最高用户", "Highest Usage User")}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">
            {statsData.stats.highestUsageUserEmail}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
            ${statsData.stats.highestUsageUserTodayCost.toFixed(2)}
          </div>
        </div>

        {/* Highest usage rate card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 sm:p-6 border border-red-200 dark:border-red-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
              <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="text-sm font-medium text-red-900 dark:text-red-300">
              {t("最高使用率", "Highest Usage Rate")}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
            {statsData.stats.maxRate.toFixed(1)}%
          </div>
        </div>

        {/* Lowest usage rate card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-sm font-medium text-green-900 dark:text-green-300">
              {t("最低使用率", "Lowest Usage Rate")}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
            {statsData.stats.minRate.toFixed(1)}%
          </div>
        </div>

        {/* Current usage rate card */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl p-4 sm:p-6 border border-cyan-200 dark:border-cyan-700 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
              <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-sm font-medium text-cyan-900 dark:text-cyan-300">
              {t("当前使用率", "Current Usage Rate")}
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
            {statsData.stats.currentRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t("每日调用量趋势", "Daily Call Volume Trend")}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {timePeriod === "today"
              ? t("过去24小时的使用率变化", "Usage rate changes over the past 24 hours")
              : timePeriod === "7days"
                ? t("最近7天的使用率变化", "Usage rate changes over the last 7 days")
                : timePeriod === "15days"
                  ? t("最近15天的使用率变化", "Usage rate changes over the last 15 days")
                  : t("最近30天的使用率变化", "Usage rate changes over the last 30 days")}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-inner overflow-hidden">
          {/* Desktop chart */}
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart data={statsData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis
                dataKey="time"
                stroke="#6b7280"
                fontSize={13}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                interval={timePeriod === "today" ? 2 : timePeriod === "7days" ? 0 : timePeriod === "15days" ? 2 : 4}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={13}
                tickLine={false}
                axisLine={{ stroke: "#e5e7eb" }}
                label={{
                  value: t("使用率(%)", "Usage Rate (%)"),
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 13, fill: "#6b7280" },
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, t("使用率", "Usage Rate")]}
              />
              <Area
                type="monotone"
                dataKey="usageRate"
                stroke="#06b6d4"
                strokeWidth={3}
                fill="url(#colorUsage)"
                dot={{ fill: "#06b6d4", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
