"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { DashboardHeader } from "@/components/dashboard-header"
import { BackgroundParticles, SummaryBlobCanvas } from "@/components/dashboard-canvas"
import { useToast } from "@/hooks/use-toast"
import { userApi, usageApi, type UsageLogRecord, type UsageLogsPageData, type DailyUsageData } from "@/lib/api"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import {
  TrendingUp, DollarSign, Calendar, ChevronLeft, ChevronRight, BarChart3,
} from "lucide-react"

export default function UsageStatsPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [animReady, setAnimReady] = useState(false)

  const [usageLogs, setUsageLogs] = useState<UsageLogRecord[]>([])
  const [dailyUsage, setDailyUsage] = useState<DailyUsageData[]>([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(true)
  const [isLoadingDaily, setIsLoadingDaily] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState("30")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const pageSize = 20

  const timeRangeOptions = [
    { value: "1", label: t("今天", "Today") },
    { value: "7", label: t("最近 7 天", "Last 7 days") },
    { value: "30", label: t("最近 30 天", "Last 30 days") },
    { value: "90", label: t("最近 90 天", "Last 90 days") },
  ]

  useEffect(() => {
    setMounted(true)
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    const email = localStorage.getItem("userEmail")
    if (!isLoggedIn) { router.push("/"); return }
    if (email) {
      setUserEmail(email)
      userApi.getUserByEmail(email).then((user) => setUserId(user.id)).catch(() => {
        toast({ title: t("加载失败", "Loading Failed"), description: t("无法获取用户信息", "Failed to get user information"), variant: "destructive" })
      })
    }
    setTimeout(() => setAnimReady(true), 100)
  }, [router, toast, t])

  const fetchDailyUsage = useCallback(async () => {
    if (!userId) return
    setIsLoadingDaily(true)
    try {
      const data = await usageApi.getMonthUsage(userId)
      setDailyUsage(data)
    } catch (error) {
      toast({ title: t("加载失败", "Loading Failed"), description: t("无法加载使用数据", "Failed to load usage data"), variant: "destructive" })
    } finally { setIsLoadingDaily(false) }
  }, [userId, toast, t])

  const fetchUsageLogs = useCallback(async () => {
    if (!userId) return
    setIsLoadingLogs(true)
    try {
      const days = Number.parseInt(selectedTimeRange)
      const data = await usageApi.getUserUsageLogs(userId, currentPage, pageSize, days)
      setUsageLogs(data.records)
      setTotalPages(data.pages ?? Math.ceil(data.total / pageSize))
      setTotalRecords(data.total)
    } catch (error) {
      toast({ title: t("加载失败", "Loading Failed"), description: t("无法加载使用记录", "Failed to load usage records"), variant: "destructive" })
    } finally { setIsLoadingLogs(false) }
  }, [userId, selectedTimeRange, currentPage, toast, t])

  useEffect(() => { if (userId) fetchDailyUsage() }, [userId, fetchDailyUsage])
  useEffect(() => { if (userId) fetchUsageLogs() }, [userId, selectedTimeRange, currentPage, fetchUsageLogs])

  const todayCost = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    const todayData = dailyUsage.find((d) => d.usageDate === today)
    return todayData?.totalCost ?? 0
  }, [dailyUsage])

  const totalCost = useMemo(() => dailyUsage.reduce((sum, d) => sum + (d.totalCost ?? 0), 0), [dailyUsage])

  const chartData = useMemo(() => {
    return dailyUsage.map((d) => ({
      name: d.usageDate ? d.usageDate.substring(5) : "",
      cost: d.totalCost ?? 0,
    }))
  }, [dailyUsage])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); localStorage.removeItem("userEmail")
    toast({ title: t("已退出登录", "Logged Out"), description: t("您已成功退出登录", "You have been successfully logged out") })
    router.push("/")
  }

  const animCls = `dash-anim ${animReady ? "dash-visible" : ""}`
  const ac = (delay: number, extra = "") => `${extra} ${animCls}`.trim()
  const as_ = (delay: number) => ({ transitionDelay: `${delay}ms` })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 10, padding: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 12, color: "#06b6d4" }}>{t("费用", "Cost")}: ${payload[0].value.toFixed(4)}</p>
        </div>
      )
    }
    return null
  }

  const summaryCards = [
    {
      label: t("今日费用", "Today's Cost"),
      value: `$${todayCost.toFixed(4)}`,
      icon: DollarSign,
      hue: 185,
      iconBg: "dash-icon-cyan",
    },
    {
      label: t("周期总费用", "Period Total Cost"),
      value: `$${totalCost.toFixed(4)}`,
      icon: TrendingUp,
      hue: 200,
      iconBg: "dash-icon-blue",
    },
  ]

  return (
    <div className="min-h-screen dash-bg">
      <BackgroundParticles />
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

      <main className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-[96px] pb-8">
        {/* Page Header */}
        <div className={ac(80)} style={{ marginBottom: 28, ...as_(80) }}>
          <h1 style={{ fontSize: "clamp(22px,2.5vw,32px)", fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{t("使用统计", "Usage Statistics")}</h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>{t("查看API使用量、费用趋势和详细记录", "View API usage, cost trends, and detailed records")}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-7">
          {summaryCards.map((card, index) => (
            <div key={index} className={ac(200 + index * 120, "glass-card dash-summary-card")} style={{ position: "relative", overflow: "hidden", ...as_(200 + index * 120) }}>
              <SummaryBlobCanvas hue={card.hue} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.03em" }}>{card.label}</span>
                  <div className={`${card.iconBg} w-9 h-9 rounded-xl flex items-center justify-center dash-smc-icon`} style={{ transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1)" }}>
                    <card.icon style={{ width: 16, height: 16 }} />
                  </div>
                </div>
                <div style={{ fontSize: "clamp(26px,2.5vw,36px)", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                  {card.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Card */}
        <div className={ac(450, "glass-card")} style={{ marginBottom: 20, ...as_(450) }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="dash-icon-cyan w-8 h-8 rounded-lg flex items-center justify-center"><BarChart3 style={{ width: 15, height: 15 }} /></div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{t("每日费用趋势", "Daily Cost Trend")}</h2>
          </div>
          <div style={{ height: 340, width: "100%" }}>
            {isLoadingDaily ? (
              <div className="flex items-center justify-center h-full">
                <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("加载中...", "Loading...")}</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <BarChart3 style={{ width: 48, height: 48, color: "#e2e8f0", marginBottom: 12 }} />
                <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("暂无数据", "No data available")}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barCategoryGap="20%">
                  <defs>
                    <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(6,182,212,0.35)" />
                      <stop offset="60%" stopColor="rgba(6,182,212,0.08)" />
                      <stop offset="100%" stopColor="rgba(6,182,212,0)" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="0" stroke="rgba(0,0,0,0.04)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v) => `$${v.toFixed(1)}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(6,182,212,0.04)" }} />
                  <Bar dataKey="cost" fill="url(#barFill)" stroke="rgba(6,182,212,0.6)" strokeWidth={1} radius={[4, 4, 0, 0]} maxBarSize={20} animationDuration={1000} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Usage Logs Table */}
        <div className={ac(700, "glass-card")} style={as_(700)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="dash-icon-blue w-8 h-8 rounded-lg flex items-center justify-center"><Calendar style={{ width: 15, height: 15 }} /></div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{t("详细使用记录", "Detailed Usage Records")}</h2>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>{t(`共 ${totalRecords} 条记录`, `${totalRecords} records total`)}</p>
            </div>
            <select
              value={selectedTimeRange}
              onChange={(e) => { setSelectedTimeRange(e.target.value); setCurrentPage(1) }}
              className="dash-select"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {isLoadingLogs ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>{t("加载中...", "Loading...")}</div>
          ) : usageLogs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Calendar style={{ width: 40, height: 40, color: "#e2e8f0", margin: "0 auto 12px" }} />
              <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("暂无使用记录", "No usage records")}</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col gap-2.5">
                {usageLogs.map((log, index) => (
                  <div key={index} className="dash-row-anim" style={{ ["--row-delay" as any]: `${index * 0.04}s`, background: "rgba(6,182,212,0.02)", borderRadius: 14, padding: 14, border: "1px solid rgba(6,182,212,0.06)" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2" style={{ fontSize: 12 }}>
                      <div><span style={{ color: "#94a3b8" }}>{t("模型", "Model")}</span><p style={{ color: "#0f172a", fontWeight: 500, marginTop: 2 }}>{log.modelName || "—"}</p></div>
                      <div><span style={{ color: "#94a3b8" }}>{t("输入", "Input")}</span><p style={{ color: "#0f172a", fontWeight: 500, marginTop: 2 }}>{(log.inputTokens ?? 0).toLocaleString()}</p></div>
                      <div><span style={{ color: "#94a3b8" }}>{t("输出", "Output")}</span><p style={{ color: "#0f172a", fontWeight: 500, marginTop: 2 }}>{(log.outputTokens ?? 0).toLocaleString()}</p></div>
                      <div><span style={{ color: "#94a3b8" }}>{t("缓存创建", "Cache Create")}</span><p style={{ color: "#0f172a", fontWeight: 500, marginTop: 2 }}>{(log.cacheCreationTokens ?? 0).toLocaleString()}</p></div>
                      <div><span style={{ color: "#94a3b8" }}>{t("缓存读取", "Cache Read")}</span><p style={{ color: "#0f172a", fontWeight: 500, marginTop: 2 }}>{(log.cacheReadTokens ?? 0).toLocaleString()}</p></div>
                      <div><span style={{ color: "#94a3b8" }}>{t("总Tokens", "Total Tokens")}</span><p style={{ color: "#06b6d4", fontWeight: 500, marginTop: 2 }}>{(log.totalTokens ?? 0).toLocaleString()}</p></div>
                      <div className="col-span-2"><span style={{ color: "#94a3b8" }}>{t("费用", "Cost")}</span><p style={{ color: "#06b6d4", fontWeight: 600, marginTop: 2 }}>${(log.cost ?? 0).toFixed(6)}</p></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>{t("时间", "Time")}</th>
                      <th>{t("模型", "Model")}</th>
                      <th>{t("输入", "Input")}</th>
                      <th>{t("输出", "Output")}</th>
                      <th>{t("缓存创建", "Cache Create")}</th>
                      <th>{t("缓存读取", "Cache Read")}</th>
                      <th>{t("总Tokens", "Total Tokens")}</th>
                      <th>{t("费用", "Cost")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageLogs.map((log, index) => (
                      <tr key={index} className="dash-row-anim" style={{ ["--row-delay" as any]: `${index * 0.03}s` }}>
                        <td style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>
                          {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                        </td>
                        <td>
                          <span className={`dash-mbadge ${log.modelName?.includes("opus") ? "dash-mbadge-opus" : log.modelName?.includes("sonnet") ? "dash-mbadge-sonnet" : log.modelName?.includes("haiku") ? "dash-mbadge-haiku" : "dash-mbadge-sonnet"}`}>
                            {log.modelName || "—"}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{(log.inputTokens ?? 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 500 }}>{(log.outputTokens ?? 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 500 }}>{(log.cacheCreationTokens ?? 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 500 }}>{(log.cacheReadTokens ?? 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 500, color: "#06b6d4" }}>{(log.totalTokens ?? 0).toLocaleString()}</td>
                        <td style={{ fontWeight: 600, color: "#06b6d4" }}>${(log.cost ?? 0).toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="dash-pagi">
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {t("第", "Page")} {currentPage} / {totalPages} {t("页", "")}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="dash-pg-btn">
                      <ChevronLeft style={{ width: 14, height: 14 }} />
                    </button>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#06b6d4", minWidth: 40, textAlign: "center" }}>{currentPage}</span>
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages} className="dash-pg-btn">
                      <ChevronRight style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
