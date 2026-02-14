"use client"

import { useEffect, useMemo, useState } from "react"
import {
  adminApi,
  ApiError,
  type MonthlyOperationRevenueData,
  type OperationMonthlyDetailData,
} from "@/lib/api"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, DollarSign, Users, UserCog, BarChart3 } from "lucide-react"
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}

function formatDateTime(dateTime?: string) {
  if (!dateTime) return "-"
  return dateTime.replace("T", " ").slice(0, 16)
}

export default function OperationsPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<MonthlyOperationRevenueData[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalAdminRevenue, setTotalAdminRevenue] = useState(0)
  const [totalAgentRevenue, setTotalAgentRevenue] = useState(0)

  const [selectedMonth, setSelectedMonth] = useState("")
  const [detailLoading, setDetailLoading] = useState(false)
  const [monthTotalRevenue, setMonthTotalRevenue] = useState(0)
  const [monthAdminRevenue, setMonthAdminRevenue] = useState(0)
  const [monthAgentRevenue, setMonthAgentRevenue] = useState(0)
  const [monthlyDetails, setMonthlyDetails] = useState<OperationMonthlyDetailData[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await adminApi.getOperationStats()

        setChartData(data.monthlyStats || [])
        setTotalRevenue(data.totalRevenue || 0)
        setTotalAdminRevenue(data.totalAdminRevenue || 0)
        setTotalAgentRevenue(data.totalAgentRevenue || 0)

        const defaultMonth = data.monthlyStats?.[data.monthlyStats.length - 1]?.month || ""
        if (defaultMonth) {
          setSelectedMonth(defaultMonth)
        }
      } catch (error) {
        toast({
          title: t("加载失败", "Load Failed"),
          description:
            error instanceof ApiError
              ? error.message
              : t("无法加载运营统计数据", "Failed to load operation statistics"),
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [t, toast])

  useEffect(() => {
    if (!selectedMonth) {
      return
    }

    const loadMonthlyDetails = async () => {
      try {
        setDetailLoading(true)
        const detailsData = await adminApi.getOperationMonthlyDetails(selectedMonth)
        setMonthTotalRevenue(detailsData.totalRevenue || 0)
        setMonthAdminRevenue(detailsData.adminRevenue || 0)
        setMonthAgentRevenue(detailsData.agentRevenue || 0)
        setMonthlyDetails(detailsData.details || [])
      } catch (error) {
        toast({
          title: t("加载失败", "Load Failed"),
          description:
            error instanceof ApiError
              ? error.message
              : t("无法加载月度明细", "Failed to load monthly details"),
          variant: "destructive",
        })
      } finally {
        setDetailLoading(false)
      }
    }

    loadMonthlyDetails()
  }, [selectedMonth, t, toast])

  const latestGrowthRate = useMemo(() => {
    if (chartData.length === 0) {
      return 0
    }
    return chartData[chartData.length - 1]?.growthRate || 0
  }, [chartData])

  const chartDisplayData = useMemo(() => {
    return chartData.map((item) => {
      const normalizedGrowthRate = Number(item.growthRate ?? 0)
      return {
        ...item,
        growthRateForChart: normalizedGrowthRate > 0 ? normalizedGrowthRate : 0,
      }
    })
  }, [chartData])

  return (
    <div className="dash-page-stagger max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("运营情况", "Operations")}
            </h1>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {selectedMonth ? `${t("当前明细月份", "Current Detail Month")}: ${selectedMonth}` : "-"}
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {t(
            "查看每月总收入、管理员收入、代理商收入以及环比增长率",
            "View monthly total revenue, admin revenue, agent revenue and MoM growth rate",
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t("总收入", "Total Revenue")}</p>
              <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t("管理员收入", "Admin Revenue")}</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">{formatCurrency(totalAdminRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <UserCog className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t("代理商收入", "Agent Revenue")}</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">{formatCurrency(totalAgentRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t("最新增长率", "Latest Growth Rate")}</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400 truncate">{formatPercent(latestGrowthRate)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 shadow-sm mb-4 sm:mb-6">
        <div className="mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t("月度收入与增长率", "Monthly Revenue & Growth")}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t("柱状图展示各收入，折线图展示收入增长率", "Bar chart shows revenue, line chart shows revenue growth rate")}
          </p>
        </div>

        <div className="h-[260px] sm:h-[340px] lg:h-[420px]">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t("加载中...", "Loading...")}
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              {t("暂无数据", "No data")}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartDisplayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, (dataMax: number) => {
                    if (!Number.isFinite(dataMax) || dataMax <= 0) {
                      return 100
                    }
                    return Math.ceil(dataMax / 50) * 50
                  }]}
                  tickFormatter={(value) => `${Number(value).toFixed(0)}%`}
                  tick={{ fontSize: 12 }}
                />
                <ReferenceLine yAxisId="right" y={0} stroke="#f97316" strokeDasharray="4 4" ifOverflow="extendDomain" />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === "growthRate" || name === "growthRateForChart") {
                      return [formatPercent(Number(value)), t("增长率", "Growth Rate")]
                    }
                    if (name === "totalRevenue") {
                      return [formatCurrency(Number(value)), t("总收入", "Total Revenue")]
                    }
                    if (name === "adminRevenue") {
                      return [formatCurrency(Number(value)), t("管理员收入", "Admin Revenue")]
                    }
                    if (name === "agentRevenue") {
                      return [formatCurrency(Number(value)), t("代理商收入", "Agent Revenue")]
                    }
                    return [value, name]
                  }}
                  labelFormatter={(label) => `${t("月份", "Month")}: ${label}`}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value) => {
                    if (value === "totalRevenue") return t("总收入", "Total Revenue")
                    if (value === "adminRevenue") return t("管理员收入", "Admin Revenue")
                    if (value === "agentRevenue") return t("代理商收入", "Agent Revenue")
                    if (value === "growthRate") return t("增长率", "Growth Rate")
                    return value
                  }}
                />

                <Bar yAxisId="left" dataKey="totalRevenue" name="totalRevenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="adminRevenue" name="adminRevenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="agentRevenue" name="agentRevenue" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="growthRateForChart"
                  name="growthRate"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("月度套餐明细", "Monthly Package Details")}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t(
                "可按月份查看用户套餐、开通方（管理员/代理商）、开通账号和成交价格",
                "View package records by month, seller type/account and sold price",
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
            <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {t("选择月份", "Select Month")}
            </label>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm w-full sm:w-[180px]"
            >
              {chartData.map((item) => (
                <option key={item.month} value={item.month}>
                  {item.month}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("当月总收入", "Month Total")}</div>
            <div className="text-lg sm:text-xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(monthTotalRevenue)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("当月管理员收入", "Month Admin Revenue")}</div>
            <div className="text-lg sm:text-xl font-semibold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(monthAdminRevenue)}</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("当月代理商收入", "Month Agent Revenue")}</div>
            <div className="text-lg sm:text-xl font-semibold text-purple-600 dark:text-purple-400 mt-1">{formatCurrency(monthAgentRevenue)}</div>
          </div>
        </div>

        <div className="md:hidden space-y-3">
          {detailLoading ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("加载中...", "Loading...")}
            </div>
          ) : monthlyDetails.length === 0 ? (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center text-sm text-gray-500 dark:text-gray-400">
              {t("该月份暂无数据", "No data in this month")}
            </div>
          ) : (
            monthlyDetails.map((item, index) => (
              <div
                key={item.userMembershipId || `${item.userId}-${item.startTime}-${index}`}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-3"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{item.userEmail || "-"}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${item.saleType === "agent"
                    ? "text-purple-600 border-purple-200 bg-purple-50 dark:text-purple-300 dark:border-purple-800 dark:bg-purple-900/20"
                    : "text-blue-600 border-blue-200 bg-blue-50 dark:text-blue-300 dark:border-blue-800 dark:bg-blue-900/20"
                    }`}>
                    {item.saleType === "agent" ? t("代理商", "Agent") : t("管理员", "Admin")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-gray-500 dark:text-gray-400">{t("套餐", "Package")}</div>
                  <div className="text-gray-900 dark:text-gray-100 text-right truncate">{item.membershipName || "-"}</div>

                  <div className="text-gray-500 dark:text-gray-400">{t("开通账号", "Seller Account")}</div>
                  <div className="text-gray-900 dark:text-gray-100 text-right truncate">{item.sellerAccount || "-"}</div>

                  <div className="text-gray-500 dark:text-gray-400">{t("开始/结束", "Start / Expire")}</div>
                  <div className="text-gray-900 dark:text-gray-100 text-right">
                    {formatDateTime(item.startTime)}<br />
                    {formatDateTime(item.expireTime)}
                  </div>

                  <div className="text-gray-500 dark:text-gray-400">{t("单价 × 月数", "Unit × Months")}</div>
                  <div className="text-gray-900 dark:text-gray-100 text-right">{formatCurrency(item.unitPrice || 0)} × {item.months || 0}</div>

                  <div className="text-gray-500 dark:text-gray-400">{t("收入", "Revenue")}</div>
                  <div className="text-right font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.revenue || 0)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-3 py-2 text-left">{t("用户", "User")}</th>
                <th className="px-3 py-2 text-left">{t("套餐", "Package")}</th>
                <th className="px-3 py-2 text-left">{t("开始时间", "Start Time")}</th>
                <th className="px-3 py-2 text-left">{t("结束时间", "Expire Time")}</th>
                <th className="px-3 py-2 text-left">{t("开通方", "Seller Type")}</th>
                <th className="px-3 py-2 text-left">{t("开通账号", "Seller Account")}</th>
                <th className="px-3 py-2 text-right">{t("单价", "Unit Price")}</th>
                <th className="px-3 py-2 text-right">{t("月数", "Months")}</th>
                <th className="px-3 py-2 text-right">{t("收入", "Revenue")}</th>
              </tr>
            </thead>
            <tbody>
              {detailLoading ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t("加载中...", "Loading...")}
                  </td>
                </tr>
              ) : monthlyDetails.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t("该月份暂无数据", "No data in this month")}
                  </td>
                </tr>
              ) : (
                monthlyDetails.map((item, index) => (
                  <tr key={item.userMembershipId || `${item.userId}-${item.startTime}-${index}`} className="border-t border-gray-100 dark:border-gray-700/60">
                    <td className="px-3 py-2">{item.userEmail || "-"}</td>
                    <td className="px-3 py-2">{item.membershipName || "-"}</td>
                    <td className="px-3 py-2">{formatDateTime(item.startTime)}</td>
                    <td className="px-3 py-2">{formatDateTime(item.expireTime)}</td>
                    <td className="px-3 py-2">{item.saleType === "agent" ? t("代理商", "Agent") : t("管理员", "Admin")}</td>
                    <td className="px-3 py-2">{item.sellerAccount || "-"}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice || 0)}</td>
                    <td className="px-3 py-2 text-right">{item.months || 0}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.revenue || 0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
