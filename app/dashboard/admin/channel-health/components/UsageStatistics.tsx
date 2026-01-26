"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/lib/language-context"
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  Server,
  Database,
  DollarSign,
  ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  statisticsApi,
  type PoolUsageStatsData,
  ApiError,
} from "@/lib/api"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts"

type TimeRange = 'today' | 'yesterday' | '7days' | '30days'

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string; labelEn: string }[] = [
  { value: 'today', label: '今日', labelEn: 'Today' },
  { value: 'yesterday', label: '昨日', labelEn: 'Yesterday' },
  { value: '7days', label: '7天', labelEn: '7 Days' },
  { value: '30days', label: '30天', labelEn: '30 Days' },
]

// 饼图颜色
const PIE_COLORS = ['#06b6d4', '#8b5cf6'] // cyan-500, violet-500

// 模型颜色映射
const MODEL_COLORS: Record<string, string> = {
  'claude-sonnet-4-5': '#8b5cf6',  // violet
  'claude-haiku-4-5': '#06b6d4',   // cyan
  'claude-opus-4-5': '#f59e0b',    // amber
}

/**
 * 使用统计组件
 *
 * 展示主池/备用池的请求分布、成本统计、模型分布、每日趋势
 */
export function UsageStatistics() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [data, setData] = useState<PoolUsageStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('today')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // 获取统计数据
  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const result = await statisticsApi.getPoolUsageStats(timeRange)
      setData(result)
    } catch (error) {
      console.error("获取使用统计失败:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError ? error.message : t("无法获取使用统计数据", "Failed to fetch usage statistics"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [timeRange, toast, t])

  // 手动刷新
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData(false)
  }

  // 切换时间范围
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
    setIsDropdownOpen(false)
  }

  // 初始加载
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // 格式化成本
  const formatCost = (cost: number) => {
    return `$${cost.toFixed(2)}`
  }

  // 准备饼图数据
  const pieData = data ? [
    { name: t('主池', 'Main Pool'), value: data.summary.mainPoolRequests, percentage: data.summary.mainPoolPercentage },
    { name: t('备用池', 'Backup Pool'), value: data.summary.backupPoolRequests, percentage: data.summary.backupPoolPercentage },
  ] : []

  // 准备模型分布数据
  const modelData = data?.modelDistribution?.map(item => ({
    name: item.modelName.replace('claude-', '').replace('-4-5', ''),
    count: item.count,
    percentage: item.percentage,
    cost: item.cost,
    fill: MODEL_COLORS[item.modelName] || '#94a3b8',
  })) || []

  // 准备趋势数据
  const trendData = data?.dailyTrend?.map(item => ({
    date: item.date.slice(5), // 只显示 MM-DD
    mainPoolCost: item.mainPoolCost,
    backupPoolCost: item.backupPoolCost,
    mainPoolRequests: item.mainPoolRequests,
    backupPoolRequests: item.backupPoolRequests,
  })) || []

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("加载统计数据...", "Loading statistics...")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8">
      {/* 标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg sm:rounded-xl shadow-lg shadow-cyan-500/20">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {t("使用统计", "Usage Statistics")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t("主池/备用池请求分布与成本分析", "Main/Backup pool request distribution and cost analysis")}
            </p>
          </div>
        </div>

        {/* 操作区 */}
        <div className="flex items-center gap-2">
          {/* 时间范围选择器 */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label}
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isDropdownOpen && "rotate-180")} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-28 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                {TIME_RANGE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeRangeChange(option.value)}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                      timeRange === option.value && "text-cyan-600 dark:text-cyan-400 font-medium"
                    )}
                  >
                    {t(option.label, option.labelEn)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 刷新按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm px-2 sm:px-3"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* 总请求数 */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-gray-200 dark:bg-gray-600 rounded-lg">
              <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("总请求", "Total Requests")}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(data?.summary.totalRequests || 0)}
          </p>
        </div>

        {/* 主池请求 */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-900/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-cyan-200 dark:bg-cyan-800 rounded-lg">
              <Server className="w-4 h-4 text-cyan-600 dark:text-cyan-300" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("主池", "Main Pool")}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">
            {formatNumber(data?.summary.mainPoolRequests || 0)}
            <span className="text-sm font-normal text-gray-500 ml-1">
              ({data?.summary.mainPoolPercentage || 0}%)
            </span>
          </p>
        </div>

        {/* 备用池请求 */}
        <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-900/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-violet-200 dark:bg-violet-800 rounded-lg">
              <Database className="w-4 h-4 text-violet-600 dark:text-violet-300" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("备用池", "Backup Pool")}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-violet-600 dark:text-violet-400">
            {formatNumber(data?.summary.backupPoolRequests || 0)}
            <span className="text-sm font-normal text-gray-500 ml-1">
              ({data?.summary.backupPoolPercentage || 0}%)
            </span>
          </p>
        </div>

        {/* 总成本 */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-amber-200 dark:bg-amber-800 rounded-lg">
              <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-300" />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {t("总成本", "Total Cost")}
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCost(data?.summary.totalCost || 0)}
          </p>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 请求分布饼图 */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t("请求分布", "Request Distribution")}
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [formatNumber(value), name]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value, entry) => {
                    const item = pieData.find(d => d.name === value)
                    return `${value} (${item?.percentage || 0}%)`
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 模型分布条形图 */}
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t("模型分布", "Model Distribution")}
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'count') return [formatNumber(value), t('请求数', 'Requests')]
                    return [value, name]
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {modelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 7天成本趋势图 */}
      {trendData.length > 0 && (
        <div className="mt-4 sm:mt-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t("成本趋势（最近7天）", "Cost Trend (Last 7 Days)")}
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBackup" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const label = name === 'mainPoolCost' ? t('主池成本', 'Main Pool Cost') : t('备用池成本', 'Backup Pool Cost')
                    return [formatCost(value), label]
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Legend
                  formatter={(value) => value === 'mainPoolCost' ? t('主池', 'Main Pool') : t('备用池', 'Backup Pool')}
                />
                <Area
                  type="monotone"
                  dataKey="mainPoolCost"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorMain)"
                />
                <Area
                  type="monotone"
                  dataKey="backupPoolCost"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBackup)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 成本明细 */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
          {t("主池成本", "Main Pool Cost")}: {formatCost(data?.summary.mainPoolCost || 0)}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
          {t("备用池成本", "Backup Pool Cost")}: {formatCost(data?.summary.backupPoolCost || 0)}
        </span>
      </div>
    </div>
  )
}
