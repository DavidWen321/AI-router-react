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
  Power,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  domainHealthApi,
  type DomainHealthDashboardData,
  type DomainHealthSnapshot,
  type ChannelHealthData,
  type MultiModelDashboardData,
  type MultiModelChannelData,
  ApiError,
} from "@/lib/api"
import { RealtimeChart } from "./components/RealtimeChart"
import { MultiModelUptimeBar24h } from "./components/MultiModelUptimeBar24h"
import { UsageStatistics } from "./components/UsageStatistics"
import { ConcurrencyTrafficMonitor } from "./components/ConcurrencyTrafficMonitor"
import { ProbeConfigPanel } from "./components/ProbeConfigPanel"

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
  const [multiModelData, setMultiModelData] = useState<MultiModelDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [togglingChannels, setTogglingChannels] = useState<Set<string>>(new Set()) // 正在切换状态的渠道

  // 自动刷新间隔（毫秒）
  const AUTO_REFRESH_INTERVAL = 30000 // 30秒

  // 获取仪表盘数据
  const fetchDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      // 并行获取普通仪表盘数据和多模型数据
      const [data, multiModel] = await Promise.all([
        domainHealthApi.getDashboard(),
        domainHealthApi.getMultiModelDashboard()
      ])
      setDashboardData(data)
      setMultiModelData(multiModel)
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

  // ⭐ 切换渠道开关
  const handleToggleChannel = async (alias: string, currentEnabled: boolean) => {
    // 添加到正在切换的集合
    setTogglingChannels(prev => new Set(prev).add(alias))

    try {
      const result = await domainHealthApi.toggleChannel(alias)
      toast({
        title: result.enabled
          ? t("渠道已启用", "Channel Enabled")
          : t("渠道已禁用", "Channel Disabled"),
        description: result.enabled
          ? t(`${alias} 将恢复监控和探测`, `${alias} monitoring and probing resumed`)
          : t(`${alias} 已停止监控和探测`, `${alias} monitoring and probing stopped`),
      })
      // 更新本地状态
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          currentStatus: dashboardData.currentStatus.map(channel =>
            channel.alias === alias ? { ...channel, enabled: result.enabled } : channel
          ),
        })
      }
    } catch (error) {
      toast({
        title: t("切换失败", "Toggle Failed"),
        description: error instanceof ApiError ? error.message : t("无法切换渠道状态", "Failed to toggle channel"),
        variant: "destructive",
      })
    } finally {
      // 从正在切换的集合中移除
      setTogglingChannels(prev => {
        const next = new Set(prev)
        next.delete(alias)
        return next
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
      <div className="dash-page-stagger max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
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
    <div className="dash-page-stagger max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-6 sm:pb-8">
      {/* 页面标题 */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg sm:rounded-xl shadow-lg shadow-cyan-500/20">
              <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t("渠道健康监控", "Channel Health Monitor")}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("实时监控所有 API 渠道的健康状态", "Real-time health monitoring for all API channels")}
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {lastUpdated && (
              <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {t("更新于", "Updated")} {formatTime(lastUpdated)}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs sm:text-sm px-2 sm:px-3"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2", isRefreshing && "animate-spin")} />
              {t("刷新", "Refresh")}
            </Button>
            <Button
              size="sm"
              onClick={handleTriggerProbe}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-lg shadow-cyan-500/20 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {t("立即探测", "Probe Now")}
            </Button>
          </div>
        </div>
      </div>

      {/* 状态概览卡片 */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* 总渠道数 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("总渠道", "Total")}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalChannels}</p>
          </div>

          {/* 健康渠道 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-green-100 dark:border-green-900/30 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("健康", "Healthy")}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">{stats.healthyChannels}</p>
          </div>

          {/* 波动渠道 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-yellow-100 dark:border-yellow-900/30 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("波动", "Degraded")}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.degradedChannels}</p>
          </div>

          {/* 离线渠道 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-red-100 dark:border-red-900/30 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <WifiOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("离线", "Offline")}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{stats.downChannels}</p>
          </div>

          {/* 平均延迟 */}
          <div className="col-span-2 sm:col-span-1 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm border border-cyan-100 dark:border-cyan-900/30 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                {t("平均延迟", "Avg Latency")}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
              {Math.round(stats.avgLatency)}
              <span className="text-base sm:text-lg font-normal text-gray-400 ml-1">ms</span>
            </p>
          </div>
        </div>
      )}

      {/* ⭐ 渠道控制开关区域 */}
      {dashboardData && dashboardData.currentStatus && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg sm:rounded-xl shadow-lg shadow-violet-500/20">
              <Power className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {t("渠道控制", "Channel Control")}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("手动启用或禁用渠道的监控和探测", "Manually enable or disable channel monitoring and probing")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {dashboardData.currentStatus.map((channel) => {
              const isToggling = togglingChannels.has(channel.alias)
              const isEnabled = channel.enabled !== false // 默认为启用

              return (
                <div
                  key={channel.alias}
                  className={cn(
                    "relative p-3 sm:p-4 rounded-xl border transition-all duration-300",
                    isEnabled
                      ? "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 border-gray-200 dark:border-gray-700"
                      : "bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50 opacity-70"
                  )}
                >
                  {/* 渠道名称和状态 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          isEnabled && channel.alive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                        )}
                      />
                      <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                        {channel.alias}
                      </span>
                    </div>

                    {/* 开关 - 启用时绿色 */}
                    <Switch
                      checked={isEnabled}
                      disabled={isToggling}
                      onCheckedChange={() => handleToggleChannel(channel.alias, isEnabled)}
                      className={cn(
                        isToggling && "opacity-50 cursor-wait",
                        "data-[state=checked]:bg-green-500 data-[state=checked]:dark:bg-green-500"
                      )}
                    />
                  </div>

                  {/* 渠道 URL */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2" title={channel.url}>
                    {channel.url.replace("https://", "").replace("http://", "")}
                  </p>

                  {/* 状态标签 */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEnabled ? (
                      <>
                        {channel.alive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            <CheckCircle2 className="w-3 h-3" />
                            {t("在线", "Online")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                            <WifiOff className="w-3 h-3" />
                            {t("离线", "Offline")}
                          </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {channel.ewmaLatencyMs}ms
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        <Power className="w-3 h-3" />
                        {t("已禁用", "Disabled")}
                      </span>
                    )}
                  </div>

                  {/* 切换中加载指示器 */}
                  {isToggling && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-xl">
                      <div className="w-5 h-5 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 提示信息 */}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {t(
              "禁用渠道后，该渠道将不再被监控和探测，也不会被选为请求目标",
              "Disabled channels will not be monitored, probed, or selected as request targets"
            )}
          </p>
        </div>
      )}

      {/* 实时延迟折线图 */}
      {dashboardData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {t("实时延迟监控", "Real-time Latency Monitor")}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("最近 1 小时各渠道延迟趋势", "Latency trends for all channels in the last hour")}
              </p>
            </div>
            <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full self-start sm:self-auto">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400">
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

      {/* 多模型24小时可用性监测 */}
      {multiModelData && multiModelData.multiModelHistory && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {t("多模型 24 小时可用性", "Multi-Model 24-Hour Availability")}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {t("分模型健康状态监测（Haiku/Sonnet 30秒，Opus 5分钟）", "Per-model health monitoring (Haiku/Sonnet 30s, Opus 5min)")}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  Haiku
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  Sonnet
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Opus
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {Object.entries(multiModelData.multiModelHistory).map(([alias, channelData]) => (
              <MultiModelUptimeBar24h
                key={alias}
                channelName={alias}
                channelData={channelData}
              />
            ))}
          </div>
        </div>
      )}

      {/* 使用统计 */}
      <UsageStatistics />

      {/* 并发与流量监控 */}
      <ConcurrencyTrafficMonitor />

      {/* 探测模型配置 */}
      <div className="mt-6 sm:mt-8">
        <ProbeConfigPanel />
      </div>

      {/* 无数据状态 */}
      {!dashboardData?.enabled && (
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-8 sm:p-12 text-center">
          <WifiOff className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t("健康监控未启用", "Health Monitoring Disabled")}
          </h3>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
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
