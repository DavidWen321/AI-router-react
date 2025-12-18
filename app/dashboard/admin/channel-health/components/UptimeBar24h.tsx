"use client"

import { useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import type { ChannelHealthData, DomainHealthRecord } from "@/lib/api"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UptimeBar24hProps {
  channelName: string
  channelData: ChannelHealthData
}

/**
 * 24小时可用性条形图组件
 *
 * Apple 风格设计：
 * - 简洁的水平条形
 * - 每个时段用颜色块表示状态
 * - 鼠标悬停显示详情
 * - 流畅的动画过渡
 */
export function UptimeBar24h({ channelName, channelData }: UptimeBar24hProps) {
  const { t } = useLanguage()

  // 将历史记录按时间分组（每5分钟一个块）
  const timeBlocks = useMemo(() => {
    const history = channelData.history || []

    // 如果没有历史数据，生成空白块
    if (history.length === 0) {
      // 生成 96 个空白块（24小时 / 15分钟 = 96）
      return Array(96).fill({ status: "unknown" as const, records: [] })
    }

    // 将历史记录按15分钟分组显示（减少块数量，更清晰）
    const blocks: Array<{
      status: "available" | "degraded" | "unavailable" | "unknown"
      records: DomainHealthRecord[]
      timeRange: string
    }> = []

    // 按时间顺序排序
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    )

    // 分组
    const groupSize = Math.ceil(sortedHistory.length / 96) || 1
    for (let i = 0; i < sortedHistory.length; i += groupSize) {
      const group = sortedHistory.slice(i, i + groupSize)

      // 计算该组的整体状态
      const hasUnavailable = group.some((r) => r.status === "unavailable")
      const hasDegraded = group.some((r) => r.status === "degraded")

      let status: "available" | "degraded" | "unavailable" | "unknown" = "available"
      if (hasUnavailable) {
        status = "unavailable"
      } else if (hasDegraded) {
        status = "degraded"
      }

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
        records: group,
        timeRange,
      })
    }

    // 确保至少有一些块用于显示
    while (blocks.length < 24) {
      blocks.push({ status: "unknown", records: [], timeRange: "" })
    }

    return blocks.slice(-96) // 最多显示96个块
  }, [channelData.history])

  // 状态颜色映射
  const statusColors = {
    available: "bg-green-500 dark:bg-green-400",
    degraded: "bg-yellow-500 dark:bg-yellow-400",
    unavailable: "bg-red-500 dark:bg-red-400",
    unknown: "bg-gray-200 dark:bg-gray-600",
  }

  // 状态悬停颜色
  const statusHoverColors = {
    available: "hover:bg-green-600 dark:hover:bg-green-500",
    degraded: "hover:bg-yellow-600 dark:hover:bg-yellow-500",
    unavailable: "hover:bg-red-600 dark:hover:bg-red-500",
    unknown: "hover:bg-gray-300 dark:hover:bg-gray-500",
  }

  // 状态图标
  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
      case "degraded":
        return <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
      case "unavailable":
        return <XCircle className="w-3.5 h-3.5 text-red-500" />
      default:
        return <Info className="w-3.5 h-3.5 text-gray-400" />
    }
  }

  // 当前状态指示器
  const currentStatusColor =
    channelData.currentStatus === "available"
      ? "bg-green-500"
      : "bg-red-500"

  return (
    <div className="group">
      {/* 渠道信息头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* 状态指示点 */}
          <span
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              currentStatusColor,
              channelData.currentStatus === "available" && "animate-pulse"
            )}
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              {channelName}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[300px]">
              {channelData.url}
            </p>
          </div>
        </div>

        {/* 可用率 */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span
              className={cn(
                "text-lg font-bold",
                channelData.availabilityRate >= 99
                  ? "text-green-600 dark:text-green-400"
                  : channelData.availabilityRate >= 95
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-red-600 dark:text-red-400"
              )}
            >
              {channelData.availabilityRate.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
              {t("可用率", "uptime")}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
              {/* 可用率低于50%或当前不可用时，显示--避免误导 */}
              {channelData.currentStatus === "available" && channelData.availabilityRate >= 50
                ? channelData.avgLatencyMs
                : "--"}
              <span className="text-xs text-gray-500 ml-0.5">ms</span>
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("平均延迟", "avg latency")}
            </p>
          </div>
        </div>
      </div>

      {/* 24小时时间条 */}
      <TooltipProvider delayDuration={0}>
        <div className="flex gap-0.5 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700/50 p-1">
          {timeBlocks.map((block, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "flex-1 rounded-sm transition-all duration-200 cursor-pointer min-w-[2px]",
                    statusColors[block.status],
                    statusHoverColors[block.status],
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
                        : block.status === "degraded"
                          ? t("性能波动", "Performance Issues")
                          : block.status === "unavailable"
                            ? t("服务中断", "Outage")
                            : t("暂无数据", "No Data")}
                    </p>
                    {block.records.length > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {t("检测次数", "Checks")}: {block.records.length}
                      </p>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* 时间轴标签 */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {t("24小时前", "24h ago")}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {t("现在", "Now")}
        </span>
      </div>

      {/* 统计摘要 */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          {channelData.availableCount} {t("正常", "up")}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          {channelData.degradedCount} {t("波动", "degraded")}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          {channelData.unavailableCount} {t("中断", "down")}
        </span>
        <span className="text-gray-400">|</span>
        <span>
          {t("共", "Total")} {channelData.checkCount} {t("次检测", "checks")}
        </span>
      </div>
    </div>
  )
}
