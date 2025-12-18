"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import {
  HeartPulse,
  TrendingUp,
  Activity,
  AlertTriangle,
  CircleDot,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  Filter,
  RotateCcw,
  History
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { accountPoolApi } from "@/lib/api"
import type { AccountPoolHealthDashboardVO, AccountPoolHealthVO } from "@/lib/api"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Health24HoursDialog } from "./components/Health24HoursDialog"

export default function NumberPoolHealthPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()

  // 数据状态
  const [dashboard, setDashboard] = useState<AccountPoolHealthDashboardVO | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"ALL" | "HEALTHY" | "WARNING" | "CRITICAL" | "CIRCUIT_BREAKER">("ALL")
  const [autoRefresh, setAutoRefresh] = useState(true)

  // 24小时历史对话框状态
  const [historyDialog, setHistoryDialog] = useState<{
    open: boolean
    accountId: number | null
    accountName: string
  }>({
    open: false,
    accountId: null,
    accountName: ""
  })

  // 自动刷新计时器
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchHealthData(true)
      }, 30000) // 30秒刷新一次
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  // 初始加载
  useEffect(() => {
    fetchHealthData()
  }, [])

  // 获取健康度数据
  const fetchHealthData = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      const data = await accountPoolApi.getHealthAnalysis()
      setDashboard(data)
    } catch (error) {
      toast({
        title: t("获取失败", "Failed to fetch"),
        description: t("无法获取健康度数据", "Failed to get health data"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // 重置健康度
  const handleResetHealth = async (accountId: number, accountName: string) => {
    try {
      await accountPoolApi.resetHealth(accountId)
      toast({
        title: t("重置成功", "Reset successful"),
        description: t(`已重置号池 ${accountName} 的健康度数据`, `Health data for ${accountName} has been reset`),
      })
      fetchHealthData()
    } catch (error) {
      toast({
        title: t("重置失败", "Reset failed"),
        description: t("无法重置健康度数据", "Failed to reset health data"),
        variant: "destructive",
      })
    }
  }

  // 打开24小时历史对话框
  const handleViewHistory = (accountId: number, accountName: string) => {
    setHistoryDialog({
      open: true,
      accountId,
      accountName
    })
  }

  // 筛选后的号池列表
  const filteredPools = useMemo(() => {
    if (!dashboard) return []

    let pools = dashboard.pools

    if (filter === "HEALTHY") {
      pools = pools.filter(p => p.healthStatus === "HEALTHY")
    } else if (filter === "WARNING") {
      pools = pools.filter(p => p.healthStatus === "WARNING")
    } else if (filter === "CRITICAL") {
      pools = pools.filter(p => p.healthStatus === "CRITICAL")
    } else if (filter === "CIRCUIT_BREAKER") {
      pools = pools.filter(p => p.isCircuitBreakerOpen)
    }

    return pools
  }, [dashboard, filter])

  // 饼图数据
  const pieData = useMemo(() => {
    if (!dashboard) return []

    return [
      {
        name: t("健康", "Healthy"),
        value: dashboard.healthyPools,
        color: "#10b981"
      },
      {
        name: t("预警", "Warning"),
        value: dashboard.warningPools,
        color: "#f59e0b"
      },
      {
        name: t("危险", "Critical"),
        value: dashboard.criticalPools,
        color: "#ef4444"
      },
    ].filter(item => item.value > 0)
  }, [dashboard, t])

  // 健康状态徽章
  const getHealthBadge = (pool: AccountPoolHealthVO) => {
    if (pool.isCircuitBreakerOpen) {
      return (
        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
          <XCircle className="w-3 h-3 mr-1" />
          {t("熔断", "Circuit Breaker")}
        </Badge>
      )
    }

    switch (pool.healthStatus) {
      case "HEALTHY":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {t("健康", "Healthy")}
          </Badge>
        )
      case "WARNING":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {t("预警", "Warning")}
          </Badge>
        )
      case "CRITICAL":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            {t("危险", "Critical")}
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("加载健康度数据中...", "Loading health data...")}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return (
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("无法加载健康度数据", "Failed to load health data")}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <HeartPulse className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("号池健康度分析", "Number Pool Health Analysis")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "text-green-600" : ""}
            >
              <Clock className="w-4 h-4 mr-2" />
              {autoRefresh ? t("自动刷新", "Auto Refresh") : t("手动刷新", "Manual Refresh")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchHealthData()}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {t("刷新", "Refresh")}
            </Button>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 ml-[52px]">
          {t("实时监控所有号池的健康状态和性能指标", "Real-time monitoring of all number pools' health status and performance metrics")}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Pools */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                  {t("总号池数", "Total Pools")}
                </p>
                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {dashboard.totalPools}
                </p>
              </div>
              <CircleDot className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Healthy Pools */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                  {t("健康号池", "Healthy Pools")}
                </p>
                <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {dashboard.healthyPools}
                  <span className="text-base ml-2 text-green-600">
                    ({dashboard.totalPools > 0 ? Math.round(dashboard.healthyPools / dashboard.totalPools * 100) : 0}%)
                  </span>
                </p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        {/* Warning Pools */}
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">
                  {t("预警号池", "Warning Pools")}
                </p>
                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                  {dashboard.warningPools}
                  <span className="text-base ml-2 text-yellow-600">
                    ({dashboard.totalPools > 0 ? Math.round(dashboard.warningPools / dashboard.totalPools * 100) : 0}%)
                  </span>
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        {/* Circuit Breaker Pools */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 dark:text-red-300 mb-1">
                  {t("熔断号池", "Circuit Breaker")}
                </p>
                <p className="text-3xl font-bold text-red-900 dark:text-red-100">
                  {dashboard.circuitBreakerPools}
                  <span className="text-base ml-2 text-red-600">
                    ({dashboard.totalPools > 0 ? Math.round(dashboard.circuitBreakerPools / dashboard.totalPools * 100) : 0}%)
                  </span>
                </p>
              </div>
              <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Health Distribution Pie Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              {t("健康度分布", "Health Distribution")}
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Metrics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              {t("平均指标", "Average Metrics")}
            </h3>
            <div className="space-y-4">
              {/* Average Health Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("平均健康度", "Avg Health Score")}
                  </span>
                  <span className="text-lg font-bold">
                    {dashboard.avgHealthScore.toFixed(1)}
                  </span>
                </div>
                <Progress
                  value={dashboard.avgHealthScore}
                  className="h-2"
                />
              </div>

              {/* Average Success Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("平均成功率", "Avg Success Rate")}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {dashboard.avgSuccessRate.toFixed(2)}%
                  </span>
                </div>
                <Progress
                  value={dashboard.avgSuccessRate}
                  className="h-2"
                />
              </div>

              {/* Average Response Time */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("平均响应时间", "Avg Response Time")}
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {dashboard.avgResponseTimeMs.toFixed(0)} ms
                  </span>
                </div>
              </div>

              {/* Total Requests */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("总请求数", "Total Requests")}
                  </span>
                  <span className="text-lg font-bold">
                    {dashboard.totalRequests.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-green-600">
                    {t("成功", "Success")}: {dashboard.totalSuccessCount.toLocaleString()}
                  </span>
                  <span className="text-sm text-red-600">
                    {t("失败", "Failed")}: {dashboard.totalFailureCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              {t("详细数据", "Detailed Data")}
              <span className="text-sm text-gray-500 ml-2">
                ({filteredPools.length} {t("个号池", "pools")})
              </span>
            </h3>
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">{t("全部", "All")}</SelectItem>
                <SelectItem value="HEALTHY">{t("健康", "Healthy")}</SelectItem>
                <SelectItem value="WARNING">{t("预警", "Warning")}</SelectItem>
                <SelectItem value="CRITICAL">{t("危险", "Critical")}</SelectItem>
                <SelectItem value="CIRCUIT_BREAKER">{t("熔断", "Circuit Breaker")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("状态", "Status")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("号池", "Pool")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("健康度", "Health Score")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("成功率", "Success Rate")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("响应时间", "Response Time")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("请求数", "Requests")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("连续失败", "Consecutive Failures")}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t("操作", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPools.map((pool) => (
                  <tr
                    key={pool.accountId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      {getHealthBadge(pool)}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {pool.account}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {pool.accountId}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress
                            value={pool.healthScore}
                            className="h-2"
                          />
                        </div>
                        <span className="text-sm font-medium min-w-[40px]">
                          {pool.healthScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className={pool.successRate >= 95 ? "text-green-600" : pool.successRate >= 80 ? "text-yellow-600" : "text-red-600"}>
                          {pool.successRate.toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {pool.successCount}/{pool.totalRequests}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <div className={pool.avgResponseTimeMs < 1000 ? "text-green-600" : pool.avgResponseTimeMs < 3000 ? "text-yellow-600" : "text-red-600"}>
                          {pool.avgResponseTimeMs.toFixed(0)} ms
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {pool.totalRequests.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {pool.consecutiveFailures > 0 ? (
                          <Badge variant="destructive">
                            {pool.consecutiveFailures}
                          </Badge>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewHistory(pool.accountId, pool.account)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <History className="w-4 h-4 mr-1" />
                          {t("历史", "History")}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetHealth(pool.accountId, pool.account)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          {t("重置", "Reset")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPools.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t("暂无数据", "No data available")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        {t("数据生成时间", "Generated at")}: {new Date(dashboard.generatedAt).toLocaleString()}
        {autoRefresh && (
          <>
            {" | "}
            {t("下次刷新", "Next refresh")}: {new Date(dashboard.nextRefreshAt).toLocaleString()}
          </>
        )}
      </div>

      {/* 24小时历史对话框 */}
      {historyDialog.accountId && (
        <Health24HoursDialog
          accountId={historyDialog.accountId}
          accountName={historyDialog.accountName}
          open={historyDialog.open}
          onOpenChange={(open) => setHistoryDialog({ ...historyDialog, open })}
        />
      )}
    </div>
  )
}
