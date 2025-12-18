"use client"

import { useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import type { DomainHealthSnapshot } from "@/lib/api"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

interface RealtimeChartProps {
  data: Array<Record<string, unknown>>
  channels: DomainHealthSnapshot[]
}

// 行业标准调色板 - Datadog/Grafana 风格
const CHANNEL_COLORS: Record<string, { line: string; fill: string }> = {
  AnyRouter: { line: "#22c55e", fill: "rgba(34, 197, 94, 0.15)" },
  CSPOK: { line: "#8b5cf6", fill: "rgba(139, 92, 246, 0.15)" },
  FCApp: { line: "#06b6d4", fill: "rgba(6, 182, 212, 0.15)" },
  RainApp: { line: "#f97316", fill: "rgba(249, 115, 22, 0.15)" },
}

const DEFAULT_COLORS = [
  { line: "#22c55e", fill: "rgba(34, 197, 94, 0.15)" },
  { line: "#8b5cf6", fill: "rgba(139, 92, 246, 0.15)" },
  { line: "#06b6d4", fill: "rgba(6, 182, 212, 0.15)" },
  { line: "#f97316", fill: "rgba(249, 115, 22, 0.15)" },
  { line: "#ec4899", fill: "rgba(236, 72, 153, 0.15)" },
  { line: "#eab308", fill: "rgba(234, 179, 8, 0.15)" },
]

/**
 * 实时延迟监控图表
 *
 * 设计参考: Grafana + Datadog + Vercel Analytics
 * - 平滑曲线 + 渐变填充
 * - 实时数值显示
 * - 自适应Y轴
 */
export function RealtimeChart({ data, channels }: RealtimeChartProps) {
  const { t } = useLanguage()

  // 处理数据 - 确保格式正确
  const { chartData, channelList, latestValues, sortedChannelsForCards } = useMemo(() => {
    const channelAliases = channels.map(c => c.alias)

    // 调试日志
    console.log('[RealtimeChart] 输入数据:', {
      dataLength: data?.length,
      channels: channelAliases,
      sampleData: data?.[0]
    })

    if (!data || data.length === 0) {
      return { chartData: [], channelList: channelAliases, latestValues: {} }
    }

    // 转换数据格式
    const processed = data.map((point) => {
      const timeStr = point.time as string
      let displayTime = ""

      if (timeStr) {
        try {
          const date = new Date(timeStr)
          displayTime = date.toLocaleTimeString("zh-CN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        } catch {
          displayTime = timeStr
        }
      }

      const result: Record<string, unknown> = { time: displayTime }

      // 提取各渠道延迟 - 尝试多种键名格式
      // ⭐⭐⭐ 修复：只有当渠道可用（available=true）时才记录延迟数据
      // 离线渠道的延迟为0，如果不过滤会在图表上显示一条平线
      channelAliases.forEach((alias) => {
        // 检查渠道是否可用
        const availableKey = `${alias}_available`
        const isAvailable = point[availableKey] === true

        // 只有可用的渠道才记录延迟
        if (!isAvailable) {
          return  // 跳过离线渠道
        }

        // 标准格式: AnyRouter_latency
        const latencyKey = `${alias}_latency`
        // 可能的其他格式
        const altKey1 = alias.toLowerCase() + "_latency"
        const altKey2 = alias

        let value = point[latencyKey] ?? point[altKey1] ?? point[altKey2]

        // 确保值有效且大于0
        if (value !== undefined && value !== null && Number(value) > 0) {
          result[alias] = Number(value)
        }
      })

      return result
    })

    // 调试日志
    console.log('[RealtimeChart] 处理后数据:', {
      processedLength: processed.length,
      sample: processed[0],
      lastSample: processed[processed.length - 1],
      // 显示哪些渠道有数据
      channelsWithData: channelAliases.filter(alias =>
        processed.some(p => p[alias] !== undefined)
      ),
      // 显示哪些渠道没有数据（离线）
      channelsWithoutData: channelAliases.filter(alias =>
        !processed.some(p => p[alias] !== undefined)
      )
    })

    // 获取最新值 - 倒序遍历找到每个渠道的最新非空值
    const latest: Record<string, number> = {}
    if (processed.length > 0) {
      channelAliases.forEach(alias => {
        // 从最后一条记录开始往前找，找到第一个有该渠道数据的点
        for (let i = processed.length - 1; i >= 0; i--) {
          const point = processed[i]
          if (point[alias] !== undefined && point[alias] !== null) {
            latest[alias] = point[alias] as number
            break
          }
        }
      })
    }

    // ⭐⭐⭐ 渠道卡片排序：在线的按延迟升序，离线的排最后
    const sortedCards = [...channelAliases].sort((a, b) => {
      const channelA = channels.find(c => c.alias === a)
      const channelB = channels.find(c => c.alias === b)
      const isOnlineA = channelA?.alive ?? false
      const isOnlineB = channelB?.alive ?? false
      const latencyA = latest[a] ?? Infinity
      const latencyB = latest[b] ?? Infinity

      // 离线的排最后
      if (isOnlineA && !isOnlineB) return -1
      if (!isOnlineA && isOnlineB) return 1
      // 都离线按名称排序
      if (!isOnlineA && !isOnlineB) return a.localeCompare(b)
      // 都在线按延迟升序
      return latencyA - latencyB
    })

    return {
      chartData: processed,
      channelList: channelAliases,
      latestValues: latest,
      sortedChannelsForCards: sortedCards
    }
  }, [data, channels])

  // 获取颜色
  const getColor = (alias: string, index: number) => {
    return CHANNEL_COLORS[alias] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  }

  // 自定义 Tooltip - 丝滑淡入效果，跟随鼠标
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null

    return (
      <div
        className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-2xl p-3 min-w-[160px] animate-in fade-in duration-150"
        style={{
          pointerEvents: 'none',
        }}
      >
        <p className="text-xs font-medium text-gray-400 mb-2 pb-1.5 border-b border-gray-700">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload
            .filter((entry: any) => entry.value !== undefined)
            .sort((a: any, b: any) => (a.value || 0) - (b.value || 0))  // 按延迟升序
            .map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: entry.stroke || entry.color }}
                  />
                  <span className="text-xs text-gray-300">{entry.name}</span>
                </div>
                <span className="text-xs font-mono font-semibold text-white">
                  {Math.round(entry.value)}
                  <span className="text-gray-500 ml-0.5">ms</span>
                </span>
              </div>
            ))}
        </div>
      </div>
    )
  }

  // 空数据状态
  if (chartData.length === 0) {
    return (
      <div className="h-[320px] flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {t("等待探测数据", "Waiting for probe data")}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {t("数据将在探测后自动显示", "Data will appear after probing")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 实时数值卡片 - 按延迟排序：低延迟在左，离线在右 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sortedChannelsForCards.map((alias) => {
          const originalIndex = channelList.indexOf(alias)
          const color = getColor(alias, originalIndex)
          const value = latestValues[alias]
          const isOnline = channels.find(c => c.alias === alias)?.alive

          return (
            <div
              key={alias}
              className={cn(
                "relative px-4 py-3 rounded-xl border transition-all",
                "bg-white dark:bg-gray-800/50",
                isOnline
                  ? "border-gray-100 dark:border-gray-700"
                  : "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color.line }}
                />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {alias}
                </span>
                {!isOnline && (
                  <span className="ml-auto text-[10px] font-medium text-red-500 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded">
                    OFFLINE
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-bold tabular-nums"
                  style={{ color: isOnline ? color.line : '#ef4444' }}
                >
                  {/* 不可用时显示 -- 而不是 0，避免误导用户 */}
                  {isOnline && value !== undefined ? Math.round(value) : '--'}
                </span>
                <span className="text-sm text-gray-400">ms</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 图表区域 */}
      <div className="h-[280px] w-full bg-gray-50/50 dark:bg-gray-900/30 rounded-xl p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -10, bottom: 5 }}
          >
            <defs>
              {channelList.map((alias, index) => {
                const color = getColor(alias, index)
                return (
                  <linearGradient key={alias} id={`gradient-${alias}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color.line} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color.line} stopOpacity={0.02} />
                  </linearGradient>
                )
              })}
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              strokeOpacity={0.4}
              vertical={false}
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              dy={8}
              interval="preserveStartEnd"
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              tickFormatter={(v) => `${v}`}
              width={45}
              domain={['dataMin - 10', 'dataMax + 50']}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '4 4' }}
              isAnimationActive={false}
              allowEscapeViewBox={{ x: false, y: false }}
              wrapperStyle={{
                transition: 'opacity 150ms ease-out',
                zIndex: 50,
              }}
            />

            {channelList.map((alias, index) => {
              const color = getColor(alias, index)
              return (
                <Area
                  key={alias}
                  type="monotone"
                  dataKey={alias}
                  name={alias}
                  stroke={color.line}
                  strokeWidth={2}
                  fill={`url(#gradient-${alias})`}
                  dot={false}
                  activeDot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#fff",
                    fill: color.line,
                  }}
                  connectNulls
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
