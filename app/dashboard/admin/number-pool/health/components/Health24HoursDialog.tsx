"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { accountPoolApi } from "@/lib/api"
import type { AccountHealth24HoursVO, AccountHealthEventVO } from "@/lib/api"
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  RefreshCw,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface Health24HoursDialogProps {
  accountId: number
  accountName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Health24HoursDialog({
  accountId,
  accountName,
  open,
  onOpenChange,
}: Health24HoursDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [data, setData] = useState<AccountHealth24HoursVO | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open, accountId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const result = await accountPoolApi.getHealth24Hours(accountId)
      setData(result)
    } catch (error: any) {
      toast({
        title: t("获取失败", "Failed to fetch"),
        description: error.message || t("无法获取24小时健康历史", "Failed to get 24h health history"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 健康状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300"
      case "WARNING":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300"
      case "CRITICAL":
        return "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300"
      case "CIRCUIT_OPEN":
        return "text-red-700 bg-red-200 dark:bg-red-900 dark:text-red-200"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  // 健康状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return <CheckCircle2 className="w-3 h-3" />
      case "WARNING":
        return <AlertTriangle className="w-3 h-3" />
      case "CRITICAL":
      case "CIRCUIT_OPEN":
        return <XCircle className="w-3 h-3" />
      default:
        return <Activity className="w-3 h-3" />
    }
  }

  // 转换数据为图表格式
  const chartData = data?.events.map(event => ({
    time: new Date(event.eventTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    healthScore: event.healthScore,
    successRate: event.successRate,
    eventType: event.eventType,
  })).reverse() || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            {t("24小时健康历史", "24-Hour Health History")}
            <span className="text-gray-500 font-normal text-base">- {accountName}</span>
          </DialogTitle>
          <DialogDescription>
            {t("查看过去24小时内的健康度变化趋势和状态记录", "View health trends and status records over the past 24 hours")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("暂无健康历史数据", "No health history data available")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                  {t("当前健康度", "Current Score")}
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {data.currentHealthScore}
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {t("最高", "Max")}
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {data.maxHealthScore}
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <div className="text-sm text-red-700 dark:text-red-300 mb-1 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {t("最低", "Min")}
                </div>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {data.minHealthScore}
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {t("状态变化", "Changes")}
                </div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {data.stateChangeCount}
                </div>
              </div>
            </div>

            {/* Health Score Trend Chart */}
            <div className="p-4 rounded-lg border bg-white dark:bg-gray-900">
              <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                {t("健康度趋势图", "Health Score Trend")}
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <ReferenceLine y={70} stroke="#10b981" strokeDasharray="3 3" label="Healthy" />
                  <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label="Critical" />
                  <Line
                    type="monotone"
                    dataKey="healthScore"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Event Timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                {t("事件时间轴", "Event Timeline")}
                <span className="text-xs text-gray-500 font-normal">
                  ({data.events.length} {t("条记录", "records")})
                </span>
              </h3>

              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {data.events.map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Timeline Dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(event.healthStatus)}`}>
                        {getStatusIcon(event.healthStatus)}
                      </div>
                      {index < data.events.length - 1 && (
                        <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700 my-1" />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getStatusColor(event.healthStatus)}>
                          {event.healthStatus}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(event.eventTime).toLocaleString('zh-CN')}
                        </span>
                        {event.eventType === 'STATE_CHANGE' && (
                          <Badge variant="outline" className="text-xs">
                            {t("状态变化", "State Change")}
                          </Badge>
                        )}
                      </div>

                      {event.changeDescription && (
                        <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          {event.changeDescription}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>
                          {t("健康度", "Score")}: <span className="font-medium">{event.healthScore}</span>
                        </span>
                        <span>
                          {t("成功率", "Success")}: <span className="font-medium">{event.successRate.toFixed(1)}%</span>
                        </span>
                        <span>
                          {t("响应时间", "Latency")}: <span className="font-medium">{event.avgResponseTimeMs.toFixed(0)}ms</span>
                        </span>
                        {event.consecutiveFailures > 0 && (
                          <span className="text-red-600">
                            {t("连续失败", "Failures")}: <span className="font-medium">{event.consecutiveFailures}</span>
                          </span>
                        )}
                      </div>

                      {event.lastFailureReason && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {t("失败原因", "Reason")}: {event.lastFailureReason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-xs text-gray-500">
                {t("数据范围", "Data Range")}: {data.timeRangeDescription}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("刷新", "Refresh")}
                </Button>
                <Button variant="default" size="sm" onClick={() => onOpenChange(false)}>
                  {t("关闭", "Close")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
