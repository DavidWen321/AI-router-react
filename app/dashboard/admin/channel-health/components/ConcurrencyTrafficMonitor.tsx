"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import {
  domainHealthApi,
  type ConcurrencyTrafficMetricsData,
  ApiError,
} from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Activity,
  ChevronDown,
  RefreshCw,
  Signal,
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  Waves,
} from "lucide-react"
import {
  AreaChart,
  Area,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts"

type MonitorRange = "1h" | "6h" | "24h" | "7d" | "30d"

const RANGE_OPTIONS: { value: MonitorRange; label: string; labelEn: string }[] = [
  { value: "1h", label: "1小时", labelEn: "1 Hour" },
  { value: "6h", label: "6小时", labelEn: "6 Hours" },
  { value: "24h", label: "24小时", labelEn: "24 Hours" },
  { value: "7d", label: "7天", labelEn: "7 Days" },
  { value: "30d", label: "30天", labelEn: "30 Days" },
]

function formatBps(value: number) {
  if (value >= 1024 * 1024 * 1024) return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB/s`
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB/s`
  if (value >= 1024) return `${(value / 1024).toFixed(2)} KB/s`
  return `${Math.round(value)} B/s`
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024 * 1024) return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`
  if (value >= 1024) return `${(value / 1024).toFixed(2)} KB`
  return `${Math.round(value)} B`
}

function formatTimeLabel(isoTime: string, range: MonitorRange) {
  const date = new Date(isoTime)
  if (Number.isNaN(date.getTime())) return isoTime
  if (range === "7d" || range === "30d") {
    return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
  }
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function ConcurrencyTrafficMonitor() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [range, setRange] = useState<MonitorRange>("24h")
  const [data, setData] = useState<ConcurrencyTrafficMetricsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const fetchData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const maxPoints = range === "30d" ? 720 : range === "7d" ? 600 : 360
      const result = await domainHealthApi.getConcurrencyTrafficMetrics(range, maxPoints)
      setData(result)
    } catch (error) {
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError
          ? error.message
          : t("无法获取并发与流量监控数据", "Failed to fetch concurrency and traffic metrics"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [range, t, toast])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData(false)
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    const intervalMs = range === "1h" || range === "6h" || range === "24h" ? 10000 : 30000
    const timer = setInterval(() => {
      fetchData(false)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [range, fetchData])

  const concurrencyChartData = useMemo(() => {
    if (!data?.concurrency?.series) return []
    return data.concurrency.series.map((item) => ({
      ...item,
      label: formatTimeLabel(item.time, range),
    }))
  }, [data, range])

  const trafficChartData = useMemo(() => {
    if (!data?.traffic?.series) return []
    return data.traffic.series.map((item) => ({
      ...item,
      label: formatTimeLabel(item.time, range),
    }))
  }, [data, range])

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-center min-h-[220px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("加载并发与流量监控...", "Loading metrics...")}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg sm:rounded-xl shadow-lg shadow-cyan-500/20">
            <Signal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {t("并发与流量监控", "Concurrency & Traffic Monitor")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t("实时监控并发峰值、平均并发与吞吐趋势", "Track peak/average concurrency and throughput trends")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {RANGE_OPTIONS.find((o) => o.value === range)?.label}
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isDropdownOpen && "rotate-180")} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-28 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setRange(option.value)
                      setIsDropdownOpen(false)
                    }}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-xs sm:text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                      range === option.value && "text-cyan-600 dark:text-cyan-400 font-medium"
                    )}
                  >
                    {t(option.label, option.labelEn)}
                  </button>
                ))}
              </div>
            )}
          </div>

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

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-900/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("当前并发", "Current Concurrency")}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">{Math.round(data?.concurrency.current || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("平均并发", "Avg Concurrency")}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round(data?.concurrency.avg || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-900/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Signal className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("峰值并发", "Peak Concurrency")}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-violet-600 dark:text-violet-400">{Math.round(data?.concurrency.peak || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-900/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Waves className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("当前流量", "Current Throughput")}</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatBps(data?.traffic.currentBps || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/30 dark:to-sky-900/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("平均流量", "Avg Throughput")}</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-sky-600 dark:text-sky-400">{formatBps(data?.traffic.avgBps || 0)}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/10 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("峰值流量", "Peak Throughput")}</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400">{formatBps(data?.traffic.peakBps || 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t("并发趋势", "Concurrency Trend")}
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={concurrencyChartData}
                margin={{ top: 10, right: 80, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="concurrencyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  minTickGap={30}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [Math.round(value), t("并发", "Concurrency")]}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend wrapperStyle={{ paddingTop: "10px" }} />

                {/* 参考线：合并相近值的标签，放在右侧避免遮挡坐标轴 */}
                {(() => {
                  const refLines = data?.concurrency.referenceLines || []
                  if (refLines.length === 0) return null

                  // 计算 Y 轴范围，用于判断值是否"相近"
                  const maxY = Math.max(
                    ...concurrencyChartData.map((d: any) => d.concurrency || 0),
                    ...refLines.map((r: any) => r.value),
                    1
                  )
                  const threshold = maxY * 0.08 // 8% 以内视为相近

                  // 按值排序后分组合并
                  const sorted = [...refLines].sort((a: any, b: any) => a.value - b.value)
                  const groups: { value: number; names: string[]; color: string; style: string }[] = []
                  for (const line of sorted) {
                    const last = groups[groups.length - 1]
                    if (last && Math.abs(line.value - last.value) <= threshold) {
                      last.names.push(line.name)
                    } else {
                      groups.push({ value: line.value, names: [line.name], color: line.color, style: line.style })
                    }
                  }

                  return groups.map((group, idx) => {
                    const labelText = group.names.length > 1
                      ? `${group.names.join(" / ")}: ${Math.round(group.value)}`
                      : `${group.names[0]}: ${Math.round(group.value)}`

                    return (
                      <ReferenceLine
                        key={`ref-${idx}`}
                        y={group.value}
                        stroke={group.color}
                        strokeDasharray={group.style === "dashed" ? "5 5" : "0"}
                        strokeWidth={1.5}
                        strokeOpacity={0.6}
                        label={{
                          value: labelText,
                          fill: group.color,
                          fontSize: 10,
                          position: "insideTopRight",
                          offset: idx * -16,
                        }}
                      />
                    )
                  })
                })()}

                <Area
                  type="monotone"
                  dataKey="concurrency"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#concurrencyFill)"
                  name={t("并发", "Concurrency")}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t("流量趋势", "Traffic Trend")}
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trafficChartData}
                margin={{ top: 10, right: 80, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  minTickGap={30}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => formatBps(value)}
                  width={85}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "ingressBps") return [formatBps(value), t("入口流量", "Ingress")]
                    if (name === "egressBps") return [formatBps(value), t("出口流量", "Egress")]
                    return [formatBps(value), t("总流量", "Total")]
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: "10px" }}
                  formatter={(value) => {
                    if (value === "ingressBps") return t("入口", "Ingress")
                    if (value === "egressBps") return t("出口", "Egress")
                    return t("总量", "Total")
                  }}
                />

                {/* 参考线标签放在右侧，避免与 Y 轴刻度重叠 */}
                {(() => {
                  const refLines = data?.traffic.referenceLines || []
                  if (refLines.length === 0) return null

                  // 合并相近值
                  const maxY = Math.max(
                    ...trafficChartData.map((d: any) => d.totalBps || 0),
                    ...refLines.map((r: any) => r.value),
                    1
                  )
                  const threshold = maxY * 0.08

                  const sorted = [...refLines].sort((a: any, b: any) => a.value - b.value)
                  const groups: { value: number; names: string[]; color: string; style: string }[] = []
                  for (const line of sorted) {
                    const last = groups[groups.length - 1]
                    if (last && Math.abs(line.value - last.value) <= threshold) {
                      last.names.push(line.name)
                    } else {
                      groups.push({ value: line.value, names: [line.name], color: line.color, style: line.style })
                    }
                  }

                  return groups.map((group, idx) => {
                    const labelText = group.names.length > 1
                      ? `${group.names.join(" / ")}: ${formatBps(group.value)}`
                      : `${group.names[0]}: ${formatBps(group.value)}`

                    return (
                      <ReferenceLine
                        key={`traffic-ref-${idx}`}
                        y={group.value}
                        stroke={group.color}
                        strokeDasharray={group.style === "dashed" ? "5 5" : "0"}
                        strokeWidth={1.5}
                        strokeOpacity={0.6}
                        label={{
                          value: labelText,
                          fill: group.color,
                          fontSize: 10,
                          position: "insideTopRight",
                          offset: idx * -16,
                        }}
                      />
                    )
                  })
                })()}

                <Line type="monotone" dataKey="ingressBps" stroke="#22c55e" strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="egressBps" stroke="#0ea5e9" strokeWidth={1.8} dot={false} />
                <Line type="monotone" dataKey="totalBps" stroke="#f59e0b" strokeWidth={2.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t("并发高峰时段 Top 3", "Top 3 Concurrency Periods")}
          </h3>
          <div className="space-y-2">
            {data?.hotPeriods.topConcurrencyPeriods?.map((item, index) => (
              <div key={`${item.hour}-${index}`} className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-800/60 px-3 py-2 border border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.hour}</span>
                <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                  {Math.round(item.avgConcurrency)} / {Math.round(item.peakConcurrency)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {t("流量高峰时段 Top 3", "Top 3 Traffic Periods")}
          </h3>
          <div className="space-y-2">
            {data?.hotPeriods.topTrafficPeriods?.map((item, index) => (
              <div key={`${item.hour}-${index}`} className="flex items-center justify-between rounded-lg bg-white dark:bg-gray-800/60 px-3 py-2 border border-gray-100 dark:border-gray-700">
                <span className="text-sm text-gray-700 dark:text-gray-300">{item.hour}</span>
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  {formatBps(item.avgTrafficBps)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-4">
        <span>{t("入口总流量", "Ingress Total")}: {formatBytes(data?.traffic.ingressTotalBytes || 0)}</span>
        <span>{t("出口总流量", "Egress Total")}: {formatBytes(data?.traffic.egressTotalBytes || 0)}</span>
        <span>{t("P95并发", "P95 Concurrency")}: {Math.round(data?.concurrency.p95 || 0)}</span>
      </div>
    </div>
  )
}
