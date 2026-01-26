"use client"

import { useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import type { MultiModelChannelData, ModelHealthData } from "@/lib/api"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle, Info, Power, Zap } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface MultiModelUptimeBar24hProps {
  channelName: string
  channelData: MultiModelChannelData
  enabled?: boolean
}

// 模型配置
const MODEL_CONFIG = {
  haiku: {
    name: "Haiku 4.5",
    color: "cyan",
    interval: "30s",
    badge: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400",
  },
  sonnet: {
    name: "Sonnet 4.5",
    color: "violet",
    interval: "30s",
    badge: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
  },
  opus: {
    name: "Opus 4.5",
    color: "amber",
    interval: "5min",
    badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  },
} as const

type ModelKey = keyof typeof MODEL_CONFIG

/**
 * 多模型24小时可用性条形图组件
 *
 * 每个渠道显示3行状态条：Haiku、Sonnet、Opus
 * - Haiku + Sonnet: 高频探测（每30秒）
 * - Opus: 低频探测（每5分钟）
 */
export function MultiModelUptimeBar24h({
  channelName,
  channelData,
  enabled = true,
}: MultiModelUptimeBar24hProps) {
  const { t } = useLanguage()

  // ⭐⭐⭐ 【基于 Claude Code 使用场景的可用性判断】
  // Claude Code 需要: Sonnet 4.5（主模型）+ Haiku 4.5（读取模型）
  // - 绿色: Sonnet + Haiku 都可用（Opus 可选）
  // - 黄色: 仅 Sonnet 可用，Haiku 不可用
  // - 红色: Sonnet 不可用（无论其他模型状态）
  const { overallStatus, overallStatusColor } = useMemo(() => {
    const models = channelData.models
    const sonnetAvailable = models.sonnet?.currentStatus === "available"
    const haikuAvailable = models.haiku?.currentStatus === "available"

    if (!enabled) {
      return { overallStatus: "disabled", overallStatusColor: "bg-gray-400" }
    }

    if (!sonnetAvailable) {
      // Sonnet 不可用 = 不可用（红色）
      return { overallStatus: "unavailable", overallStatusColor: "bg-red-500" }
    }

    if (sonnetAvailable && haikuAvailable) {
      // Sonnet + Haiku 可用 = 正常（绿色）
      return { overallStatus: "available", overallStatusColor: "bg-green-500" }
    }

    // 仅 Sonnet 可用 = 降级（黄色）
    return { overallStatus: "degraded", overallStatusColor: "bg-yellow-500" }
  }, [channelData.models, enabled])

  // 计算综合可用率（Sonnet 和 Haiku 的平均值，Opus 作为参考不计入）
  const overallAvailability = useMemo(() => {
    const models = channelData.models
    const rates: number[] = []
    // 只计算 Sonnet 和 Haiku 的可用率
    if (models.sonnet) rates.push(models.sonnet.availabilityRate || 0)
    if (models.haiku) rates.push(models.haiku.availabilityRate || 0)
    if (rates.length === 0) return 0
    return rates.reduce((a, b) => a + b, 0) / rates.length
  }, [channelData.models])

  return (
    <div className={cn("group", !enabled && "opacity-60")}>
      {/* 渠道信息头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              overallStatusColor,
              enabled && overallStatus === "available" && "animate-pulse"
            )}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                {channelName}
              </h3>
              {!enabled && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  <Power className="w-3 h-3" />
                  {t("已禁用", "DISABLED")}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[300px]">
              {channelData.url}
            </p>
          </div>
        </div>

        {/* 综合可用率 */}
        <div className="text-right">
          <span
            className={cn(
              "text-lg font-bold",
              !enabled
                ? "text-gray-400"
                : overallAvailability >= 99
                  ? "text-green-600 dark:text-green-400"
                  : overallAvailability >= 95
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
            )}
          >
            {enabled ? `${overallAvailability.toFixed(1)}%` : "--"}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {t("综合可用率", "overall")}
          </span>
        </div>
      </div>

      {/* 多模型状态条 */}
      <div className="space-y-3">
        {(["haiku", "sonnet", "opus"] as ModelKey[]).map((modelKey) => {
          const modelData = channelData.models[modelKey]
          const config = MODEL_CONFIG[modelKey]

          return (
            <ModelStatusBar
              key={modelKey}
              modelKey={modelKey}
              modelData={modelData}
              config={config}
              enabled={enabled}
            />
          )
        })}
      </div>

      {/* 时间轴标签 */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {t("24小时前", "24h ago")}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {t("现在", "Now")}
        </span>
      </div>
    </div>
  )
}

// 单个模型的状态条组件
interface ModelStatusBarProps {
  modelKey: ModelKey
  modelData?: ModelHealthData
  config: (typeof MODEL_CONFIG)[ModelKey]
  enabled: boolean
}

function ModelStatusBar({ modelKey, modelData, config, enabled }: ModelStatusBarProps) {
  const { t } = useLanguage()

  // ⭐⭐⭐ 【参考 UptimeBar24h 的实现】
  // 按数据分组，而不是按固定时间段
  // 格子数量 = 数据组数，没有"未来时间"的概念
  const timeBlocks = useMemo(() => {
    const history = modelData?.history || []

    // 如果没有历史数据，生成空白块
    if (history.length === 0) {
      return Array(48).fill({ status: "unknown" as const, records: [], timeRange: "" })
    }

    const blocks: Array<{
      status: "available" | "unavailable" | "unknown"
      latencyMs: number
      timeRange: string
      records: Array<{ time: string; status: string; latencyMs: number }>
    }> = []

    // 按时间顺序排序
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    )

    // 分组：最多显示48个格子
    const maxBlocks = 48
    const groupSize = Math.ceil(sortedHistory.length / maxBlocks) || 1

    for (let i = 0; i < sortedHistory.length; i += groupSize) {
      const group = sortedHistory.slice(i, i + groupSize)

      // 计算该组的整体状态（有任何失败则显示红色）
      const hasUnavailable = group.some((r) => r.status === "unavailable")
      const status: "available" | "unavailable" | "unknown" = hasUnavailable ? "unavailable" : "available"

      // 计算平均延迟
      const avgLatency = group.reduce((sum, r) => sum + (r.latencyMs || 0), 0) / group.length

      // 时间范围
      const firstTime = new Date(group[0]?.time || "")
      const lastTime = new Date(group[group.length - 1]?.time || "")
      const timeRange = `${firstTime.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${lastTime.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`

      blocks.push({
        status,
        latencyMs: avgLatency,
        timeRange,
        records: group,
      })
    }

    // 确保至少有一些块用于显示
    while (blocks.length < 12) {
      blocks.push({ status: "unknown", records: [], timeRange: "", latencyMs: 0 })
    }

    return blocks.slice(-48) // 最多显示48个块
  }, [modelData?.history])

  // 状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500 dark:bg-green-400"
      case "unavailable":
        return "bg-red-500 dark:bg-red-400"
      default:
        return "bg-gray-200 dark:bg-gray-600"
    }
  }

  const getStatusHoverColor = (status: string) => {
    switch (status) {
      case "available":
        return "hover:bg-green-600 dark:hover:bg-green-500"
      case "unavailable":
        return "hover:bg-red-600 dark:hover:bg-red-500"
      default:
        return "hover:bg-gray-300 dark:hover:bg-gray-500"
    }
  }

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      case "unavailable":
        return <XCircle className="w-3.5 h-3.5 text-red-500" />
      default:
        return <Info className="w-3.5 h-3.5 text-gray-400" />
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* 模型标签 */}
      <div className="w-24 flex-shrink-0">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full",
            config.badge
          )}
        >
          <Zap className="w-3 h-3" />
          {config.name}
        </span>
        <p className="text-[10px] text-gray-400 mt-0.5 ml-1">
          {t(`每${config.interval}`, `every ${config.interval}`)}
        </p>
      </div>

      {/* 状态条 */}
      <div className="flex-1">
        <TooltipProvider delayDuration={0}>
          <div className="flex gap-0.5 h-6 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700/50 p-0.5">
            {timeBlocks.map((block, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex-1 rounded-sm transition-all duration-200 cursor-pointer min-w-[1px]",
                      getStatusColor(block.status),
                      getStatusHoverColor(block.status),
                      "opacity-80 hover:opacity-100 hover:scale-y-110"
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl"
                >
                  <div className="flex items-center gap-2 py-1">
                    <StatusIcon status={block.status} />
                    <div>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {block.timeRange || t("无数据", "No data")}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {block.status === "available"
                          ? t("运行正常", "Operational")
                          : block.status === "unavailable"
                            ? t("服务中断", "Outage")
                            : t("暂无数据", "No Data")}
                      </p>
                      {block.latencyMs > 0 && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {t("延迟", "Latency")}: {Math.round(block.latencyMs)}ms
                        </p>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

      {/* 可用率 */}
      <div className="w-16 text-right flex-shrink-0">
        <span
          className={cn(
            "text-sm font-semibold",
            !enabled || !modelData
              ? "text-gray-400"
              : (modelData.availabilityRate || 0) >= 99
                ? "text-green-600 dark:text-green-400"
                : (modelData.availabilityRate || 0) >= 95
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-red-600 dark:text-red-400"
          )}
        >
          {enabled && modelData ? `${(modelData.availabilityRate || 0).toFixed(1)}%` : "--"}
        </span>
      </div>
    </div>
  )
}
