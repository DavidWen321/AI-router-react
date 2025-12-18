"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/lib/language-context"
import {
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  domainHealthApi,
  type DomainHealthDashboardData,
  type DomainHealthSnapshot,
  type ChannelHealthData,
  ApiError,
} from "@/lib/api"
import { RealtimeChart } from "./components/RealtimeChart"
import { UptimeBar24h } from "./components/UptimeBar24h"

/**
 * 渠道健康监控页面
 *
 * Apple 风格设计：
 * - 大量留白，内容呼吸感
 * - 微妙的阴影和圆角
 * - 流畅的过渡动画
 * - 清晰的信息层次
 */
export default function ChannelHealthPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  // 数据状态
  const [dashboardData, setDashboardData] = useState<DomainHealthDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // 自动刷新间隔（毫秒）
  const AUTO_REFRESH_INTERVAL = 30000 // 30秒

  // 获取仪表盘数据
  const fetchDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const data = await domainHealthApi.getDashboard()
      setDashboardData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("获取健康监控数据失败:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description:
          error instanceof ApiError
            ? error.message
            : t("无法获取渠道健康数据", "Failed to fetch channel health data"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [toast, t])

  // 手动刷新
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchDashboard(false)
  }

  // 手动触发探测
  const handleTriggerProbe = async () => {
    try {
      await domainHealthApi.triggerProbe()
      toast({
        title: t("探测已触发", "Probe Triggered"),
        description: t("正在对所有渠道进行健康探测", "Health probe initiated for all channels"),
      })
      // 2秒后刷新数据
      setTimeout(() => fetchDashboard(false), 2000)
    } catch (error) {
      toast({
        title: t("触发失败", "Trigger Failed"),
        description: error instanceof ApiError ? error.message : t("无法触发探测", "Failed to trigger probe"),
        variant: "destructive",
      })
    }
  }

  // 初始加载和自动刷新
  useEffect(() => {
    fetchDashboard()

    const interval = setInterval(() => {
      fetchDashboard(false)
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchDashboard])

  // 计算汇总统计
  const stats = dashboardData
    ? {
        totalChannels: dashboardData.channelCount,
        healthyChannels: dashboardData.currentStatus?.filter((d) => d.alive).length || 0,
        degradedChannels:
          dashboardData.currentStatus?.filter((d) => d.alive && d.consecutiveFailures > 0).length || 0,
        downChannels: dashboardData.currentStatus?.filter((d) => !d.alive).length || 0,
        avgLatency:
          dashboardData.currentStatus?.reduce((sum, d) => sum + d.ewmaLatencyMs, 0) /
            (dashboardData.currentStatus?.length || 1) || 0,
      }
    : null

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">{t("加载中...", "Loading...")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl shadow-lg shadow-cyan-500/20">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t("渠道健康监控", "Channel Health Monitor")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("实时监控所有 API 渠道的健康状态", "Real-time health monitoring for all API channels")}
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {t("更新于", "Updated")} {formatTime(lastUpdated)}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              {t("刷新", "Refresh")}
            </Button>
            <Button
              size="sm"
              onClick={handleTriggerProbe}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4 mr-2" />
              {t("立即探测", "Probe Now")}
            </Button>
          </div>
        </div>
      </div>

      {/* 状态概览卡片 */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* 总渠道数 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Wifi className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("总渠道", "Total")}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalChannels}</p>
          </div>

          {/* 健康渠道 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-green-100 dark:border-green-900/30 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("健康", "Healthy")}
              </span>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.healthyChannels}</p>
          </div>

          {/* 波动渠道 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-yellow-100 dark:border-yellow-900/30 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("波动", "Degraded")}
              </span>
            </div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.degradedChannels}</p>
          </div>

          {/* 离线渠道 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-red-100 dark:border-red-900/30 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("离线", "Offline")}
              </span>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.downChannels}</p>
          </div>

          {/* 平均延迟 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-cyan-100 dark:border-cyan-900/30 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("平均延迟", "Avg Latency")}
              </span>
            </div>
            <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
              {Math.round(stats.avgLatency)}
              <span className="text-lg font-normal text-gray-400 ml-1">ms</span>
            </p>
          </div>
        </div>
      )}

      {/* 实时延迟折线图 */}
      {dashboardData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t("实时延迟监控", "Real-time Latency Monitor")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("最近 1 小时各渠道延迟趋势", "Latency trends for all channels in the last hour")}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {t("实时更新", "Live")}
              </span>
            </div>
          </div>
          <RealtimeChart
            data={dashboardData.realtimeData || []}
            channels={dashboardData.currentStatus || []}
          />
        </div>
      )}

      {/* 24小时可用性监测 */}
      {dashboardData && dashboardData.history24h && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("24 小时可用性", "24-Hour Availability")}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("每个时段的健康状态记录", "Health status for each time period")}
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(dashboardData.history24h).map(([alias, channelData]) => (
              <UptimeBar24h
                key={alias}
                channelName={alias}
                channelData={channelData as ChannelHealthData}
              />
            ))}
          </div>
        </div>
      )}

      {/* 无数据状态 */}
      {!dashboardData?.enabled && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-12 text-center">
          <WifiOff className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("健康监控未启用", "Health Monitoring Disabled")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t(
              "请在后端配置中启用域名健康监控功能",
              "Please enable domain health monitoring in backend configuration"
            )}
          </p>
        </div>
      )}
    </div>
  )
}
