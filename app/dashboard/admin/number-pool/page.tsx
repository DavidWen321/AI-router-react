"use client"

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Database, Search, DollarSign, TrendingUp, Activity, BarChart3, X, ArrowLeft, Clock, Plus, Edit, Trash2, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useToast } from "@/hooks/use-toast"
import { accountPoolApi, type AccountPoolVO, ApiError } from "@/lib/api"
import { CreateAccountPoolDialog } from "./components/CreateAccountPoolDialog"
import { EditAccountPoolDialog } from "./components/EditAccountPoolDialog"
import { DeleteAccountPoolDialog } from "./components/DeleteAccountPoolDialog"
import { ViewAccountPoolDialog } from "./components/ViewAccountPoolDialog"

export default function NumberPoolPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  // 搜索筛选状态
  const [accountSearch, setAccountSearch] = useState("")
  const [poolIdSearch, setPoolIdSearch] = useState("")
  const [poolKeySearch, setPoolKeySearch] = useState("")
  const [monthlyCostSearch, setMonthlyCostSearch] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()

  // 号池数据状态
  const [accountPools, setAccountPools] = useState<AccountPoolVO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 对话框状态
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedPool, setSelectedPool] = useState<AccountPoolVO | null>(null)

  // 图表相关状态
  const [selectedPoolId, setSelectedPoolId] = useState<number | null>(null)
  const [chartTimePeriod, setChartTimePeriod] = useState<"today" | "7days" | "15days" | "30days">("7days")
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoadingChart, setIsLoadingChart] = useState(false)

  // 获取号池列表
  const fetchAccountPools = async () => {
    setIsLoading(true)
    try {
      const pools = await accountPoolApi.listAll()
      setAccountPools(pools)
    } catch (error) {
      console.error("获取号池列表失败:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError ? error.message : t("无法加载号池列表", "Failed to load account pool list"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 获取图表数据
  const fetchChartData = async (poolId: number, period: string) => {
    setIsLoadingChart(true)
    try {
      const apiMap = {
        today: accountPoolApi.getDailyUsageRate,
        "7days": accountPoolApi.getWeekUsageRate,
        "15days": accountPoolApi.getHalfMonthUsageRate,
        "30days": accountPoolApi.getMonthUsageRate,
      }

      const data = await apiMap[period as keyof typeof apiMap](poolId)

      // 后端现在返回时间序列数据数组: AccountPoolUsageTimeSeriesVO[]
      // { time: string, usageRate: number, used: number, remaining: number }
      // 这个格式正好是图表需要的格式,直接使用
      if (data && Array.isArray(data)) {
        const formattedData = data.map((item) => ({
          time: item.time,
          usageRate: Number(item.usageRate),
          used: Number(item.used),
          remaining: Number(item.remaining),
        }))
        setChartData(formattedData)
      } else {
        // 如果返回数据格式不符,使用空数组
        setChartData([])
        toast({
          title: t("数据格式错误", "Data Format Error"),
          description: t("后端返回的数据格式不正确", "Backend returned incorrect data format"),
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("获取图表数据失败:", error)
      // 加载失败时显示空图表
      setChartData([])

      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError ? error.message : t("无法获取图表数据", "Failed to fetch chart data"),
        variant: "destructive",
      })
    } finally {
      setIsLoadingChart(false)
    }
  }


  // 组件加载时获取数据
  useEffect(() => {
    fetchAccountPools()
  }, [])

  // 当选中号池或时间周期变化时,获取图表数据
  useEffect(() => {
    if (selectedPoolId) {
      fetchChartData(selectedPoolId, chartTimePeriod)
    }
  }, [selectedPoolId, chartTimePeriod])

  // CRUD操作处理器
  const handleCreateSuccess = () => {
    fetchAccountPools()
  }

  const handleEditClick = (pool: AccountPoolVO) => {
    setSelectedPool(pool)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    fetchAccountPools()
  }

  const handleDeleteClick = (pool: AccountPoolVO) => {
    setSelectedPool(pool)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    fetchAccountPools()
    if (selectedPoolId === selectedPool?.id) {
      setSelectedPoolId(null)
    }
  }

  const handleViewClick = (pool: AccountPoolVO) => {
    setSelectedPool(pool)
    setIsViewDialogOpen(true)
  }

  const calculateUsageRate = (quota: number, remaining: number) => {
    if (quota === 0) return 0
    return ((quota - remaining) / quota) * 100
  }

  const getChartData = (poolId: string, period: string) => {
    const baseData = {
      "POOL-001": {
        today: [
          { time: "00:00", usageRate: 12.5 },
          { time: "01:00", usageRate: 10.2 },
          { time: "02:00", usageRate: 8.7 },
          { time: "03:00", usageRate: 7.3 },
          { time: "04:00", usageRate: 9.1 },
          { time: "05:00", usageRate: 11.8 },
          { time: "06:00", usageRate: 15.4 },
          { time: "07:00", usageRate: 18.9 },
          { time: "08:00", usageRate: 22.3 },
          { time: "09:00", usageRate: 25.7 },
          { time: "10:00", usageRate: 28.2 },
          { time: "11:00", usageRate: 26.5 },
          { time: "12:00", usageRate: 24.1 },
          { time: "13:00", usageRate: 23.8 },
          { time: "14:00", usageRate: 26.9 },
          { time: "15:00", usageRate: 29.3 },
          { time: "16:00", usageRate: 27.8 },
          { time: "17:00", usageRate: 25.4 },
          { time: "18:00", usageRate: 22.6 },
          { time: "19:00", usageRate: 20.1 },
          { time: "20:00", usageRate: 18.5 },
          { time: "21:00", usageRate: 16.7 },
          { time: "22:00", usageRate: 14.9 },
          { time: "23:00", usageRate: 13.2 },
        ],
        "7days": [
          { time: "10/01", usageRate: 15.2 },
          { time: "10/02", usageRate: 18.5 },
          { time: "10/03", usageRate: 22.1 },
          { time: "10/04", usageRate: 19.8 },
          { time: "10/05", usageRate: 25.3 },
          { time: "10/06", usageRate: 23.7 },
          { time: "10/07", usageRate: 27.66 },
        ],
        "15days": [
          { time: "09/23", usageRate: 12.5 },
          { time: "09/25", usageRate: 14.8 },
          { time: "09/27", usageRate: 16.2 },
          { time: "09/29", usageRate: 18.9 },
          { time: "10/01", usageRate: 15.2 },
          { time: "10/03", usageRate: 22.1 },
          { time: "10/05", usageRate: 25.3 },
          { time: "10/07", usageRate: 27.66 },
        ],
        "30days": Array.from({ length: 30 }, (_, i) => {
          const today = new Date()
          const date = new Date(today)
          date.setDate(date.getDate() - (29 - i))
          return {
            time: `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`,
            usageRate: 8 + (i / 29) * 19.66 + Math.random() * 3, // Gradual increase from ~8% to ~27.66%
          }
        }),
      },
      "POOL-002": {
        today: [
          { time: "00:00", usageRate: 8.2 },
          { time: "01:00", usageRate: 7.1 },
          { time: "02:00", usageRate: 6.3 },
          { time: "03:00", usageRate: 5.8 },
          { time: "04:00", usageRate: 6.9 },
          { time: "05:00", usageRate: 8.5 },
          { time: "06:00", usageRate: 10.2 },
          { time: "07:00", usageRate: 12.4 },
          { time: "08:00", usageRate: 14.8 },
          { time: "09:00", usageRate: 16.3 },
          { time: "10:00", usageRate: 17.9 },
          { time: "11:00", usageRate: 16.5 },
          { time: "12:00", usageRate: 15.2 },
          { time: "13:00", usageRate: 15.8 },
          { time: "14:00", usageRate: 17.1 },
          { time: "15:00", usageRate: 18.4 },
          { time: "16:00", usageRate: 17.2 },
          { time: "17:00", usageRate: 15.9 },
          { time: "18:00", usageRate: 14.3 },
          { time: "19:00", usageRate: 12.8 },
          { time: "20:00", usageRate: 11.6 },
          { time: "21:00", usageRate: 10.4 },
          { time: "22:00", usageRate: 9.5 },
          { time: "23:00", usageRate: 8.7 },
        ],
        "7days": [
          { time: "10/01", usageRate: 10.2 },
          { time: "10/02", usageRate: 12.5 },
          { time: "10/03", usageRate: 14.1 },
          { time: "10/04", usageRate: 13.8 },
          { time: "10/05", usageRate: 15.3 },
          { time: "10/06", usageRate: 14.7 },
          { time: "10/07", usageRate: 16.88 },
        ],
        "15days": [
          { time: "09/23", usageRate: 8.5 },
          { time: "09/25", usageRate: 9.8 },
          { time: "09/27", usageRate: 11.2 },
          { time: "09/29", usageRate: 12.9 },
          { time: "10/01", usageRate: 10.2 },
          { time: "10/03", usageRate: 14.1 },
          { time: "10/05", usageRate: 15.3 },
          { time: "10/07", usageRate: 16.88 },
        ],
        "30days": Array.from({ length: 30 }, (_, i) => {
          const today = new Date()
          const date = new Date(today)
          date.setDate(date.getDate() - (29 - i))
          return {
            time: `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`,
            usageRate: 5 + (i / 29) * 11.88 + Math.random() * 2.5, // Gradual increase from ~5% to ~16.88%
          }
        }),
      },
      "POOL-003": {
        today: [
          { time: "00:00", usageRate: 95.2 },
          { time: "01:00", usageRate: 95.8 },
          { time: "02:00", usageRate: 96.1 },
          { time: "03:00", usageRate: 96.5 },
          { time: "04:00", usageRate: 96.9 },
          { time: "05:00", usageRate: 97.2 },
          { time: "06:00", usageRate: 97.6 },
          { time: "07:00", usageRate: 98.1 },
          { time: "08:00", usageRate: 98.5 },
          { time: "09:00", usageRate: 98.9 },
          { time: "10:00", usageRate: 99.2 },
          { time: "11:00", usageRate: 99.5 },
          { time: "12:00", usageRate: 99.7 },
          { time: "13:00", usageRate: 99.8 },
          { time: "14:00", usageRate: 99.9 },
          { time: "15:00", usageRate: 100 },
          { time: "16:00", usageRate: 100 },
          { time: "17:00", usageRate: 100 },
          { time: "18:00", usageRate: 100 },
          { time: "19:00", usageRate: 100 },
          { time: "20:00", usageRate: 100 },
          { time: "21:00", usageRate: 100 },
          { time: "22:00", usageRate: 100 },
          { time: "23:00", usageRate: 100 },
        ],
        "7days": [
          { time: "10/01", usageRate: 85.2 },
          { time: "10/02", usageRate: 88.5 },
          { time: "10/03", usageRate: 92.1 },
          { time: "10/04", usageRate: 94.8 },
          { time: "10/05", usageRate: 97.3 },
          { time: "10/06", usageRate: 98.7 },
          { time: "10/07", usageRate: 100 },
        ],
        "15days": [
          { time: "09/23", usageRate: 62.5 },
          { time: "09/25", usageRate: 68.8 },
          { time: "09/27", usageRate: 74.2 },
          { time: "09/29", usageRate: 78.9 },
          { time: "10/01", usageRate: 85.2 },
          { time: "10/03", usageRate: 92.1 },
          { time: "10/05", usageRate: 97.3 },
          { time: "10/07", usageRate: 100 },
        ],
        "30days": Array.from({ length: 30 }, (_, i) => {
          const today = new Date()
          const date = new Date(today)
          date.setDate(date.getDate() - (29 - i))
          return {
            time: `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`,
            usageRate: 38 + (i / 29) * 62 + Math.random() * 2, // Gradual increase from ~38% to ~100%
          }
        }),
      },
    }

    return baseData[poolId as keyof typeof baseData]?.[period] || []
  }

  const filteredData = useMemo(() => {
    return accountPools.filter((pool) => {
      // 按账号筛选
      if (accountSearch && !pool.account?.toLowerCase().includes(accountSearch.toLowerCase())) {
        return false
      }

      // 按号池ID筛选
      if (poolIdSearch && pool.id && !String(pool.id).includes(poolIdSearch)) {
        return false
      }

      // 按号池密钥筛选
      if (poolKeySearch && !pool.accountPoolKey?.toLowerCase().includes(poolKeySearch.toLowerCase())) {
        return false
      }

      // 按月成本筛选
      if (monthlyCostSearch) {
        const searchCost = Number.parseFloat(monthlyCostSearch)
        if (!isNaN(searchCost) && pool.accountCost !== searchCost) {
          return false
        }
      }

      // 按日期范围筛选 (检查开始时间)
      if (startDate || endDate) {
        const poolStartDate = new Date(pool.startTime)
        if (startDate && poolStartDate < startDate) {
          return false
        }
        if (endDate && poolStartDate > endDate) {
          return false
        }
      }

      return true
    })
  }, [accountPools, accountSearch, poolIdSearch, poolKeySearch, monthlyCostSearch, startDate, endDate])

  const totalPools = filteredData.length
  const activePools = filteredData.filter((pool) => new Date(pool.expireTime) > new Date()).length
  const totalDailyQuota = filteredData.reduce((sum, pool) => sum + pool.accountDailyUsage, 0)
  const totalMonthlyCost = filteredData.reduce((sum, pool) => sum + pool.accountCost, 0)

  const clearFilters = () => {
    setAccountSearch("")
    setPoolIdSearch("")
    setPoolKeySearch("")
    setMonthlyCostSearch("")
    setStartDate(undefined)
    setEndDate(undefined)
  }

  const getTimePeriodLabel = (period: string) => {
    const labels = {
      today: t("当天", "Today"),
      "7days": t("最近7天", "Last 7 Days"),
      "15days": t("最近15天", "Last 15 Days"),
      "30days": t("最近30天", "Last 30 Days"),
    }
    return labels[period as keyof typeof labels]
  }

  const handleBackToTable = () => {
    setSelectedPoolId(null)
  }

  if (selectedPoolId) {
    const selectedPool = accountPools.find((pool) => pool.id === selectedPoolId)

    // 使用fetchChartData获取的chartData
    // TODO: 根据实际API返回的数据结构计算统计数据
    // 当前chartData可能为空,需要根据后端实际返回调整
    const overallAvgRate = chartData.length > 0 ? chartData.reduce((sum, d: any) => sum + (d.usageRate || 0), 0) / chartData.length : 0
    const overallMaxRate = chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.usageRate || 0)) : 0
    const overallMinRate = chartData.length > 0 ? Math.min(...chartData.map((d: any) => d.usageRate || 0)) : 0
    const currentRate = chartData[chartData.length - 1]?.usageRate || 0

    const peakData = chartData.length > 0 ? chartData.reduce(
      (max: any, current: any) => ((current.usageRate || 0) > (max.usageRate || 0) ? current : max),
      chartData[0],
    ) : { time: "", usageRate: 0 }
    const peakTime = peakData?.time || ""

    return (
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-2">
        {/* Header with back button */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t("使用率统计", "Usage Rate Statistics")} - {t("号池", "Pool")} #{selectedPoolId}
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={handleBackToTable}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border-2 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-400 dark:hover:border-cyan-600 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm hover:shadow-md font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("返回号池列表", "Back to Pool List")}
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedPool?.account} • {t("每日额度", "Daily Quota")}: ${selectedPool?.accountDailyUsage.toFixed(2) || "0.00"}
          </p>
        </div>

        {/* Time period selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap gap-2">
            {(["today", "7days", "15days", "30days"] as const).map((period) => (
              <Button
                key={period}
                variant={chartTimePeriod === period ? "default" : "outline"}
                size="lg"
                onClick={() => setChartTimePeriod(period)}
                className={cn(
                  "transition-all font-semibold text-sm px-4 sm:px-6 py-2 sm:py-3 whitespace-nowrap",
                  chartTimePeriod === period
                    ? "bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/30"
                    : "hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-400",
                )}
              >
                {getTimePeriodLabel(period)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t("高峰时段", "Peak Period")}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{peakTime}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{peakData?.usageRate.toFixed(1)}%</p>
          </div>

          <div className="bg-gradient-to-br from-white to-red-50 dark:from-gray-800 dark:to-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800 p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t("最高使用率", "Peak Rate")}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
              {overallMaxRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800 p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400 rotate-180" />
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{t("最低使用率", "Lowest Rate")}</p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
              {overallMinRate.toFixed(1)}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-white to-cyan-50 dark:from-gray-800 dark:to-cyan-900/20 rounded-xl border-2 border-cyan-200 dark:border-cyan-800 p-4 sm:p-6 shadow-md hover:shadow-lg transition-all hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {t("当前使用率", "Current Rate")}
              </p>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">{currentRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Chart card */}
        {/* Made padding responsive and reduced bottom margin */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-4 sm:mb-6">
          {/* Reduced bottom margin from mb-6 to mb-4 */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t("每日调用量趋势", "Daily Usage Trend")}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getTimePeriodLabel(chartTimePeriod)}
              {t("的使用率变化", "'s usage rate changes")}
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700 shadow-inner overflow-hidden">
            {/* Made chart height responsive: smaller on mobile, larger on desktop */}
            <ResponsiveContainer width="100%" height={300} className="sm:hidden">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="colorUsageRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  className="text-xs font-medium"
                  tick={{ fill: "currentColor" }}
                  stroke="currentColor"
                  height={40}
                  interval={chartData.length > 20 ? "preserveStartEnd" : "preserveStart"}
                />
                <YAxis
                  className="text-xs font-medium"
                  tick={{ fill: "currentColor" }}
                  stroke="currentColor"
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    border: "2px solid #06b6d4",
                    borderRadius: "12px",
                    padding: "8px 12px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: "700", fontSize: "12px", marginBottom: "4px" }}
                  itemStyle={{ color: "#06b6d4", fontWeight: "600", fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="usageRate"
                  name={t("使用率", "Usage Rate")}
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#colorUsageRate)"
                  dot={{ fill: "#06b6d4", r: 4, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Tablet and desktop chart with larger dimensions */}
            <ResponsiveContainer width="100%" height={400} className="hidden sm:block md:hidden">
              <AreaChart data={chartData} margin={{ top: 15, right: 30, left: 10, bottom: 15 }}>
                <defs>
                  <linearGradient id="colorUsageRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  className="text-sm font-medium"
                  tick={{ fill: "currentColor" }}
                  stroke="currentColor"
                  height={50}
                  interval={chartData.length > 20 ? "preserveStartEnd" : "preserveStart"}
                />
                <YAxis
                  className="text-sm font-medium"
                  tick={{ fill: "currentColor" }}
                  stroke="currentColor"
                  width={50}
                  label={{
                    value: t("使用率 (%)", "Usage Rate (%)"),
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fontSize: "13px", fontWeight: "600" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    border: "2px solid #06b6d4",
                    borderRadius: "12px",
                    padding: "10px 14px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: "700", fontSize: "13px", marginBottom: "4px" }}
                  itemStyle={{ color: "#06b6d4", fontWeight: "600", fontSize: "13px" }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "15px" }}
                  iconType="line"
                  iconSize={18}
                  formatter={(value) => (
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="usageRate"
                  name={t("使用率", "Usage Rate")}
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  fill="url(#colorUsageRate)"
                  dot={{ fill: "#06b6d4", r: 5, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Desktop chart with full dimensions */}
            <ResponsiveContainer width="100%" height={500} className="hidden md:block">
              <AreaChart data={chartData} margin={{ top: 20, right: 50, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorUsageRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-600" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  className="text-sm font-medium"
                  tick={{ fill: "currentColor" }}
                  stroke="currentColor"
                  height={60}
                  interval={chartData.length > 20 ? "preserveStartEnd" : "preserveStart"}
                />
                <YAxis
                  className="text-sm font-medium"
                  tick={{ fill: "currentColor" }}
                  stroke="currentColor"
                  width={70}
                  label={{
                    value: t("使用率 (%)", "Usage Rate (%)"),
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle", fontSize: "14px", fontWeight: "600" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.98)",
                    border: "2px solid #06b6d4",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
                  }}
                  labelStyle={{ color: "#374151", fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}
                  itemStyle={{ color: "#06b6d4", fontWeight: "600", fontSize: "14px" }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "20px" }}
                  iconType="line"
                  iconSize={20}
                  formatter={(value) => (
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{value}</span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="usageRate"
                  name={t("使用率", "Usage Rate")}
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fill="url(#colorUsageRate)"
                  dot={{ fill: "#06b6d4", r: 6, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-green-600 dark:text-green-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("号池管理", "Number Pool Management")}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t(
            "管理所有号池的配置、额度和成本信息",
            "Manage all number pool configurations, quotas, and cost information",
          )}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {t("搜索筛选", "Search & Filter")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("账号", "Account")}
            </label>
            <Input
              placeholder={t("输入账号搜索...", "Search by account...")}
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition-all hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("号池ID", "Pool ID")}
            </label>
            <Input
              placeholder={t("输入号池ID搜索...", "Search by pool ID...")}
              value={poolIdSearch}
              onChange={(e) => setPoolIdSearch(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition-all hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("号池密钥", "Pool Key")}
            </label>
            <Input
              placeholder={t("输入号池密钥搜索...", "Search by pool key...")}
              value={poolKeySearch}
              onChange={(e) => setPoolKeySearch(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition-all hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("月成本", "Monthly Cost")}
            </label>
            <Input
              placeholder={t("输入月成本搜索...", "Search by monthly cost...")}
              value={monthlyCostSearch}
              onChange={(e) => setMonthlyCostSearch(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 transition-all hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span>
            {t("找到", "Found")} {filteredData.length} {t("个号池", "pools")}
          </span>
          {(accountSearch || poolIdSearch || poolKeySearch || monthlyCostSearch || startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            >
              <X className="w-4 h-4 mr-1" />
              {t("清除筛选", "Clear Filters")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("总号池数", "Total Pools")}</p>
            <Database className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalPools}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-green-400 dark:hover:border-green-500 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("活跃号池", "Active Pools")}</p>
            <Activity className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activePools}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-cyan-400 dark:hover:border-cyan-500 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t("总每日额度", "Total Daily Quota")}
            </p>
            <TrendingUp className="w-5 h-5 text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{totalDailyQuota.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-orange-400 dark:hover:border-orange-500 cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t("总月成本", "Total Monthly Cost")}
            </p>
            <DollarSign className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">¥{totalMonthlyCost.toFixed(2)}</p>
        </div>
      </div>

      {/* 创建号池按钮 */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("创建号池", "Create Pool")}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-md">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">{t("加载中...", "Loading...")}</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Database className="w-12 h-12 mb-4 text-gray-300" />
              <p>{t("暂无号池数据", "No account pool data available")}</p>
            </div>
          ) : (
            <table className="w-full min-w-max">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("号池ID", "Pool ID")}
                  </th>
                  <th className="hidden xl:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("供应商网址", "Provider URL")}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("账号", "Account")}
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("号池密钥", "Pool Key")}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("每日额度", "Daily Quota")}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("每日剩余", "Daily Remaining")}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("使用率", "Usage Rate")}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("月成本", "Monthly Cost")}
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("开始时间", "Start Time")}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("过期时间", "Expiration Time")}
                  </th>
                  <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                    {t("操作", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((pool) => {
                  const usageRate = calculateUsageRate(pool.accountDailyUsage, pool.accountDailyRemainingUsage)
                return (
                  <tr
                    key={pool.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all hover:shadow-sm"
                  >
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {pool.id || "-"}
                    </td>
                    <td className="hidden xl:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-cyan-600 dark:text-cyan-400 hover:underline whitespace-nowrap max-w-[200px] truncate">
                      <a href={pool.supplierWeb} target="_blank" rel="noopener noreferrer" title={pool.supplierWeb}>
                        {pool.supplierWeb}
                      </a>
                    </td>
                    <td
                      className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap max-w-[150px] truncate"
                      title={pool.account}
                    >
                      {pool.account || "-"}
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {pool.accountPoolKey ? `${pool.accountPoolKey.substring(0, 15)}...` : "-"}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 dark:text-white whitespace-nowrap">
                      ${pool.accountDailyUsage.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                      <span
                        className={cn(
                          "font-medium",
                          pool.accountDailyRemainingUsage > pool.accountDailyUsage * 0.5
                            ? "text-green-600 dark:text-green-400"
                            : pool.accountDailyRemainingUsage > pool.accountDailyUsage * 0.2
                              ? "text-orange-600 dark:text-orange-400"
                              : "text-red-600 dark:text-red-400",
                        )}
                      >
                        ${pool.accountDailyRemainingUsage.toFixed(2)}
                      </span>
                    </td>
                    <td
                      className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap cursor-pointer group"
                      onClick={() => {
                        if (pool.id) {
                          setSelectedPoolId(pool.id)
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 group-hover:opacity-80 transition-opacity">
                        <div className="flex-1 min-w-[80px]">
                          <Progress
                            value={usageRate}
                            className={cn(
                              "h-2",
                              usageRate < 50
                                ? "[&>div]:bg-green-500"
                                : usageRate < 80
                                  ? "[&>div]:bg-orange-500"
                                  : "[&>div]:bg-red-500",
                            )}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 min-w-[45px] text-right">
                          {usageRate.toFixed(1)}%
                        </span>
                        <BarChart3 className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      ${pool.accountCost.toFixed(2)}
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {new Date(pool.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                      <span
                        className={cn(
                          new Date(pool.expireTime) < new Date()
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : "text-gray-600 dark:text-gray-400",
                        )}
                      >
                        {new Date(pool.expireTime).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewClick(pool)}
                          className="p-1.5 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded transition-colors"
                          title={t("查看", "View")}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(pool)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title={t("编辑", "Edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pool)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title={t("删除", "Delete")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        </div>
      </div>

      {/* 对话框组件 */}
      <CreateAccountPoolDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
      <EditAccountPoolDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        pool={selectedPool}
        onSuccess={handleEditSuccess}
      />
      <DeleteAccountPoolDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        pool={selectedPool}
        onSuccess={handleDeleteSuccess}
      />
      <ViewAccountPoolDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        pool={selectedPool}
      />
    </div>
  )
}
