"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Inter, JetBrains_Mono } from "next/font/google"
import { useLanguage } from "@/lib/language-context"
import { apiKeyApi, userApi, type ApiKeyData, type ApiKeyUsageStats, ApiError } from "@/lib/api"
import {
  Key,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  Shield,
  Plus,
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import { BackgroundParticles, SparklineCanvas } from "@/components/dashboard-canvas"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface APIKey {
  id: number
  key: string
  fullKey: string
  created: string
  lastUsed: string
  expires: string
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
})

export default function APIManagementPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [newCreatedKey, setNewCreatedKey] = useState<ApiKeyData | null>(null)
  const [isKeyDisplayModalOpen, setIsKeyDisplayModalOpen] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState("7")
  const [isTimeRangeDropdownOpen, setIsTimeRangeDropdownOpen] = useState(false)
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false)
  const [animReady, setAnimReady] = useState(false)

  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)
  const [usageStatsData, setUsageStatsData] = useState<ApiKeyUsageStats[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const truncateTo4 = (value: number) => Math.trunc(value * 10000) / 10000
  const formatCurrency = (value: number) => {
    const truncated = truncateTo4(value)
    return `$${truncated.toLocaleString(undefined, { maximumFractionDigits: 4 })}`
  }

  const convertApiKeyData = (backendKey: ApiKeyData): APIKey => {
    const keyPreview = backendKey.apiKey
      ? `${backendKey.apiKey.substring(0, 9)}...${backendKey.apiKey.substring(backendKey.apiKey.length - 3)}`
      : ""
    return {
      id: backendKey.id,
      key: keyPreview,
      fullKey: backendKey.apiKey,
      created: backendKey.createdAt ? new Date(backendKey.createdAt).toLocaleString() : "",
      lastUsed: backendKey.lastUsedTime ? new Date(backendKey.lastUsedTime).toLocaleString() : t("从未使用", "Never used"),
      expires: backendKey.expirationTime ? new Date(backendKey.expirationTime).toLocaleString() : t("永不过期", "Never expires"),
    }
  }

  const fetchApiKeys = async () => {
    if (!userId) return
    setIsLoadingKeys(true)
    try {
      const keys = await apiKeyApi.getUserApiKeys(userId)
      setApiKeys(keys.map(convertApiKeyData))
    } catch (error) {
      toast({ title: t("加载失败", "Loading Failed"), description: error instanceof ApiError ? error.message : t("无法加载API密钥列表", "Failed to load API key list"), variant: "destructive" })
    } finally { setIsLoadingKeys(false) }
  }

  const fetchUsageStats = async () => {
    if (!userId) return
    setIsLoadingStats(true)
    try {
      const days = Number.parseInt(selectedTimeRange)
      const stats = await apiKeyApi.getUserApiKeyUsageStats(userId, days)
      setUsageStatsData(stats)
    } catch (error) {
      toast({ title: t("加载失败", "Loading Failed"), description: error instanceof ApiError ? error.message : t("无法加载使用统计", "Failed to load usage statistics"), variant: "destructive" })
    } finally { setIsLoadingStats(false) }
  }

  const timeRangeOptions = [
    { value: "1", label: t("今天", "Today") },
    { value: "3", label: t("最近 3 天", "Last 3 days") },
    { value: "7", label: t("最近 7 天", "Last 7 days") },
    { value: "14", label: t("最近 14 天", "Last 14 days") },
    { value: "30", label: t("最近 30 天", "Last 30 days") },
    { value: "60", label: t("最近 60 天", "Last 60 days") },
    { value: "90", label: t("最近 90 天", "Last 90 days") },
    { value: "180", label: t("最近 6 个月", "Last 6 months") },
    { value: "365", label: t("最近 1 年", "Last 1 year") },
  ]

  const handleCreateKey = async () => {
    if (!userId) { toast({ title: t("创建失败", "Creation Failed"), description: t("用户信息缺失", "User information is missing"), variant: "destructive" }); return }
    setIsCreatingKey(true)
    try {
      await apiKeyApi.createApiKey(userId)
      toast({ title: t("创建成功", "Created Successfully"), description: t("密钥已创建,请在列表中查看", "API key created, check list below") })
      await fetchApiKeys()
      await fetchUsageStats()
    } catch (error) {
      toast({ title: t("创建失败", "Creation Failed"), description: error instanceof ApiError ? error.message : t("无法创建API密钥", "Failed to create API key"), variant: "destructive" })
    } finally { setIsCreatingKey(false) }
  }

  const handleCopyNewKey = async () => {
    if (!newCreatedKey) return
    try {
      await navigator.clipboard.writeText(newCreatedKey.apiKey)
      toast({ title: t("复制成功", "Copied Successfully"), description: t("密钥已复制到剪贴板", "API key copied to clipboard") })
    } catch (error) {
      toast({ title: t("复制失败", "Copy Failed"), description: t("无法复制到剪贴板", "Failed to copy to clipboard"), variant: "destructive" })
    }
  }

  const handleCloseKeyDisplayModal = () => { setIsKeyDisplayModalOpen(false); setNewCreatedKey(null) }
  const handleTimeRangeSelect = (value: string) => { setSelectedTimeRange(value); setIsTimeRangeDropdownOpen(false) }
  const currentTimeRangeLabel = timeRangeOptions.find((o) => o.value === selectedTimeRange)?.label || t("最近 7 天", "Last 7 days")

  const usageStats = useMemo(() => {
    return usageStatsData.map((stat) => {
      const maskedKey = stat.apiKey ? `${stat.apiKey.substring(0, 9)}...${stat.apiKey.substring(stat.apiKey.length - 3)}` : t("未命名", "Unnamed")
      return {
        maskedKey,
        fullKey: stat.apiKey || "",
        tokens: (stat.totalTokens ?? 0).toLocaleString(),
        cost: formatCurrency(stat.totalCost ?? 0),
        firstUsed: stat.firstUsed || t("未使用", "Not used"),
        lastUsed: stat.lastUsed || t("未使用", "Not used"),
      }
    })
  }, [usageStatsData, t])

  const totals = useMemo(() => {
    const totalTokens = usageStatsData.reduce((sum, stat) => sum + (stat.totalTokens ?? 0), 0)
    const totalCost = usageStatsData.reduce((sum, stat) => sum + (stat.totalCost ?? 0), 0)
    const allFirstUsed = usageStatsData.filter(s => s.firstUsed).map(s => new Date(s.firstUsed!).getTime())
    const allLastUsed = usageStatsData.filter(s => s.lastUsed).map(s => new Date(s.lastUsed!).getTime())
    return {
      tokens: totalTokens.toLocaleString(),
      cost: formatCurrency(totalCost),
      firstUsed: allFirstUsed.length > 0 ? new Date(Math.min(...allFirstUsed)).toLocaleString() : t("未使用", "Not used"),
      lastUsed: allLastUsed.length > 0 ? new Date(Math.max(...allLastUsed)).toLocaleString() : t("未使用", "Not used"),
    }
  }, [usageStatsData, t])

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

  useEffect(() => { if (userId) fetchApiKeys() }, [userId])
  useEffect(() => { if (userId) fetchUsageStats() }, [userId, selectedTimeRange])

  const handleViewKey = (key: APIKey) => { setSelectedKey(key); setIsViewDialogOpen(true) }
  const handleCopyKey = async (key: APIKey) => {
    try {
      await navigator.clipboard.writeText(key.fullKey)
      toast({ title: t("复制成功", "Copied Successfully"), description: t("密钥已复制到剪贴板", "API key copied to clipboard") })
    } catch (error) { toast({ title: t("复制失败", "Copy Failed"), description: t("无法复制到剪贴板", "Failed to copy to clipboard"), variant: "destructive" }) }
  }
  const handleDeleteKey = (key: APIKey) => { setSelectedKey(key); setIsDeleteDialogOpen(true) }
  const confirmDeleteKey = async () => {
    if (!selectedKey) return
    try {
      await apiKeyApi.deleteApiKey(selectedKey.fullKey)
      setApiKeys((prev) => prev.filter((k) => k.id !== selectedKey.id))
      toast({ title: t("删除成功", "Deleted Successfully"), description: t("密钥已被删除", "API key has been deleted") })
      await fetchApiKeys()
      await fetchUsageStats()
    } catch (error) {
      toast({ title: t("删除失败", "Deletion Failed"), description: error instanceof ApiError ? error.message : t("无法删除API密钥", "Failed to delete API key"), variant: "destructive" })
    } finally { setIsDeleteDialogOpen(false); setSelectedKey(null) }
  }
  const toggleKeyVisibility = (keyName: string) => {
    setRevealedKeys((prev) => { const n = new Set(prev); n.has(keyName) ? n.delete(keyName) : n.add(keyName); return n })
  }
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn"); localStorage.removeItem("userEmail")
    toast({ title: t("已退出登录", "Logged Out"), description: t("您已成功退出登录", "You have been successfully logged out") })
    router.push("/")
  }

  const animCls = `dash-anim ${animReady ? "dash-visible" : ""}`
  const ac = (delay: number, extra = "") => `${extra} ${animCls}`.trim()
  const as_ = (delay: number) => ({ transitionDelay: `${delay}ms` })

  return (
    <div className="min-h-screen dash-bg">
      <BackgroundParticles />
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

      <main className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-[96px] pb-8">
        {/* Page Header */}
        <div className={ac(80)} style={{ marginBottom: 28, ...as_(80) }}>
          <h1 style={{ fontSize: "clamp(22px,2.5vw,32px)", fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{t("API管理", "API Management")}</h1>
          <p style={{ fontSize: 14, color: "#64748b" }}>{t("管理您的API密钥、权限设置和访问控制", "Manage your API keys, permission settings and access control")}</p>
        </div>

        {/* Usage Statistics Section */}
        <div className={`${ac(200, "glass-card")} ${inter.className}`} style={{ marginBottom: 20, ...as_(200) }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="dash-icon-cyan w-8 h-8 rounded-lg flex items-center justify-center"><TrendingUp style={{ width: 15, height: 15 }} /></div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{t("API Key 使用统计", "API Key Usage Statistics")}</h2>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>{t("查看各个 API Key 的使用情况和费用", "View usage and costs for each API Key")}</p>
            </div>

            <div className="flex items-center gap-2 relative">
              <button onClick={() => setIsTimeRangeDropdownOpen(!isTimeRangeDropdownOpen)} className="dash-ghost-btn" style={{ border: "1px solid rgba(6,182,212,0.08)", borderRadius: 10, padding: "7px 14px" }}>
                <Calendar style={{ width: 14, height: 14 }} /> {currentTimeRangeLabel}
              </button>
              <button onClick={() => setIsStatsCollapsed(!isStatsCollapsed)} className="dash-ib" style={{ border: "1px solid rgba(6,182,212,0.08)" }}>
                {isStatsCollapsed ? <ChevronDown style={{ width: 14, height: 14 }} /> : <ChevronUp style={{ width: 14, height: 14 }} />}
              </button>
              {isTimeRangeDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 z-10 glass-card" style={{ padding: 4 }}>
                  {timeRangeOptions.map((option) => (
                    <button key={option.value} onClick={() => handleTimeRangeSelect(option.value)}
                      style={{ width: "100%", textAlign: "left", padding: "8px 12px", fontSize: 13, borderRadius: 8, border: "none", background: selectedTimeRange === option.value ? "rgba(6,182,212,0.06)" : "transparent", color: selectedTimeRange === option.value ? "#06b6d4" : "#334155", fontWeight: selectedTimeRange === option.value ? 600 : 400, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { if (selectedTimeRange !== option.value) (e.target as HTMLElement).style.background = "rgba(0,0,0,0.02)" }}
                      onMouseLeave={(e) => { if (selectedTimeRange !== option.value) (e.target as HTMLElement).style.background = "transparent" }}
                    >{option.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isStatsCollapsed && (
            <div>
              {isLoadingStats ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>{t("加载中...", "Loading...")}</div>
              ) : usageStats.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <TrendingUp style={{ width: 40, height: 40, color: "#e2e8f0", margin: "0 auto 12px" }} />
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("暂无使用统计数据", "No usage statistics available")}</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="md:hidden flex flex-col gap-3">
                    {usageStats.map((stat, index) => (
                      <div key={index} style={{ background: "rgba(6,182,212,0.02)", borderRadius: 14, padding: 16, border: "1px solid rgba(6,182,212,0.06)" }}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="dash-dot-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981" }} />
                          <code className={`${jetbrainsMono.className} inline-flex rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-700`}>{stat.maskedKey}</code>
                        </div>
                        <div className="grid grid-cols-2 gap-3" style={{ fontSize: 12 }}>
                          <div><span style={{ color: "#94a3b8" }}>{t("总 Tokens", "Total Tokens")}</span><p className="tabular-nums font-semibold" style={{ color: "#0f172a", marginTop: 2 }}>{stat.tokens}</p></div>
                          <div><span style={{ color: "#94a3b8" }}>{t("总费用", "Total Cost")}</span><p className="tabular-nums font-semibold" style={{ color: "#06b6d4", marginTop: 2 }}>{stat.cost}</p></div>
                          <div><span style={{ color: "#94a3b8" }}>{t("首次使用", "First Used")}</span><p className="tabular-nums font-medium" style={{ color: "#334155", marginTop: 2 }}>{stat.firstUsed}</p></div>
                          <div><span style={{ color: "#94a3b8" }}>{t("最后使用", "Last Used")}</span><p className="tabular-nums font-medium" style={{ color: "#334155", marginTop: 2 }}>{stat.lastUsed}</p></div>
                        </div>
                      </div>
                    ))}
                    <div style={{ background: "rgba(6,182,212,0.04)", borderRadius: 14, padding: 16, border: "1px solid rgba(6,182,212,0.1)" }}>
                      <div className="flex items-center gap-2 mb-3"><TrendingUp style={{ width: 14, height: 14, color: "#06b6d4" }} /><span style={{ fontSize: 13, fontWeight: 600, color: "#06b6d4" }}>{t("总计", "Total")}</span></div>
                      <div className="grid grid-cols-2 gap-3" style={{ fontSize: 12 }}>
                        <div><span style={{ color: "#06b6d4" }}>{t("总 Tokens", "Total Tokens")}</span><p className="tabular-nums font-semibold" style={{ color: "#0f172a", marginTop: 2 }}>{totals.tokens}</p></div>
                        <div><span style={{ color: "#06b6d4" }}>{t("总费用", "Total Cost")}</span><p className="tabular-nums font-semibold" style={{ color: "#0f172a", marginTop: 2 }}>{totals.cost}</p></div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th className="uppercase tracking-wider text-xs font-semibold text-gray-500"><div className="flex items-center gap-1"><Key style={{ width: 12, height: 12 }} />{t("密钥", "API Key")}</div></th>
                          <th className="uppercase tracking-wider text-xs font-semibold text-gray-500">{t("总 Tokens", "Total Tokens")}</th>
                          <th className="uppercase tracking-wider text-xs font-semibold text-gray-500">{t("总费用", "Total Cost")}</th>
                          <th className="uppercase tracking-wider text-xs font-semibold text-gray-500">{t("首次使用", "First Used")}</th>
                          <th className="uppercase tracking-wider text-xs font-semibold text-gray-500">{t("最后使用", "Last Used")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usageStats.map((stat, index) => (
                          <tr key={index} className="dash-row-anim" style={{ ["--row-delay" as any]: `${index * 0.06}s` }}>
                            <td><div className="flex items-center gap-2"><span className="dash-dot-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} /><code className={`${jetbrainsMono.className} inline-flex rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-700`}>{stat.maskedKey}</code></div></td>
                            <td className="tabular-nums font-medium">{stat.tokens}</td>
                            <td className="tabular-nums font-semibold" style={{ color: "#06b6d4" }}>{stat.cost}</td>
                            <td className="tabular-nums font-medium" style={{ fontSize: 12, color: "#64748b" }}>{stat.firstUsed}</td>
                            <td className="tabular-nums font-medium" style={{ fontSize: 12, color: "#64748b" }}>{stat.lastUsed}</td>
                          </tr>
                        ))}
                        <tr style={{ background: "rgba(6,182,212,0.03)" }}>
                          <td style={{ fontWeight: 700 }}>{t("总计", "Total")}</td>
                          <td className="tabular-nums font-semibold">{totals.tokens}</td>
                          <td className="tabular-nums font-semibold" style={{ color: "#06b6d4" }}>{totals.cost}</td>
                          <td className="tabular-nums font-medium" style={{ fontSize: 12, color: "#64748b" }}>{totals.firstUsed}</td>
                          <td className="tabular-nums font-medium" style={{ fontSize: 12, color: "#64748b" }}>{totals.lastUsed}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* API Key List */}
        <div className={`${ac(550, "glass-card")} ${inter.className}`} style={as_(550)}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="dash-icon-blue w-8 h-8 rounded-lg flex items-center justify-center"><Key style={{ width: 15, height: 15 }} /></div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{t("API密钥列表", "API Key List")}</h2>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8" }}>{t(`当前共有 ${apiKeys.length} 个活跃的API密钥`, `Currently ${apiKeys.length} active API keys`)}</p>
            </div>
            <button onClick={handleCreateKey} disabled={isCreatingKey} className="dash-primary-btn" style={{ opacity: isCreatingKey ? 0.6 : 1 }}>
              {isCreatingKey ? <span style={{ animation: "spin 1s linear infinite" }}>&#8987;</span> : <Plus style={{ width: 14, height: 14 }} />}
              {isCreatingKey ? t("创建中...", "Creating...") : t("创建新密钥", "Create New Key")}
            </button>
          </div>

          {isLoadingKeys ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>{t("加载中...", "Loading...")}</div>
          ) : apiKeys.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <Key style={{ width: 40, height: 40, color: "#e2e8f0", margin: "0 auto 12px" }} />
              <p style={{ color: "#94a3b8", fontSize: 13 }}>{t("暂无API密钥", "No API keys available")}</p>
              <p style={{ color: "#cbd5e1", fontSize: 12, marginTop: 4 }}>{t("点击上方按钮创建新密钥", "Click the button above to create a new key")}</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden flex flex-col gap-2.5">
                {apiKeys.map((key, i) => (
                  <div key={key.id} className="dash-slide-in" style={{ ["--slide-delay" as any]: `${i * 0.08}s`, position: "relative", background: "rgba(6,182,212,0.02)", borderRadius: 14, padding: 16, border: "1px solid rgba(6,182,212,0.06)", overflow: "hidden" }}>
                    <div className="dash-key-glow" />
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="dash-dot-breathe" style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                        <code className={`${jetbrainsMono.className} inline-flex max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-700`}>{revealedKeys.has(String(key.id)) ? key.fullKey : key.key}</code>
                      </div>
                      <button onClick={() => toggleKeyVisibility(String(key.id))} className="dash-ib">
                        {revealedKeys.has(String(key.id)) ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2" style={{ fontSize: 11, marginBottom: 12 }}>
                      <div><span style={{ color: "#94a3b8" }}>{t("创建时间", "Created")}</span><p className="tabular-nums font-medium" style={{ color: "#334155", marginTop: 2 }}>{key.created}</p></div>
                      <div><span style={{ color: "#94a3b8" }}>{t("最后使用", "Last Used")}</span><p className="tabular-nums font-medium" style={{ color: "#334155", marginTop: 2 }}>{key.lastUsed}</p></div>
                      <div className="col-span-2"><span style={{ color: "#94a3b8" }}>{t("过期时间", "Expires")}</span><p className="tabular-nums font-medium" style={{ color: "#334155", marginTop: 2 }}>{key.expires}</p></div>
                    </div>
                    <div className="flex items-center justify-end gap-2" style={{ paddingTop: 10, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                      <button onClick={() => handleViewKey(key)} className="dash-ghost-btn"><Eye style={{ width: 12, height: 12 }} />{t("详细", "Details")}</button>
                      <button onClick={() => handleCopyKey(key)} className="dash-ghost-btn" style={{ color: "#06b6d4" }}><Copy style={{ width: 12, height: 12 }} />{t("复制", "Copy")}</button>
                      <button onClick={() => handleDeleteKey(key)} className="dash-ghost-btn" style={{ color: "#ef4444" }}><Trash2 style={{ width: 12, height: 12 }} />{t("删除", "Delete")}</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Rich Key List */}
              <div className="hidden md:flex md:flex-col md:gap-1">
                {apiKeys.map((key, i) => (
                  <div key={key.id} className="dash-kr-item dash-row-anim" style={{ ["--row-delay" as any]: `${i * 0.06}s`, position: "relative", overflow: "hidden" }}>
                    <div className="dash-key-glow" />
                    <span className="dash-dot-breathe" style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2">
                        <code className={`${jetbrainsMono.className} inline-flex rounded bg-gray-50 px-2 py-0.5 text-sm text-gray-700`}>{revealedKeys.has(String(key.id)) ? key.fullKey : key.key}</code>
                        <button onClick={() => toggleKeyVisibility(String(key.id))} className="dash-ib" style={{ width: 28, height: 28 }}>
                          {revealedKeys.has(String(key.id)) ? <EyeOff style={{ width: 13, height: 13 }} /> : <Eye style={{ width: 13, height: 13 }} />}
                        </button>
                      </div>
                      <div className="tabular-nums font-medium" style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                        {t("创建", "Created")}: {key.created} &middot; {t("最后使用", "Last used")}: {key.lastUsed}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 dash-kr-actions" style={{ opacity: 0, transition: "opacity 0.2s" }}>
                      <button onClick={() => handleViewKey(key)} className="dash-ghost-btn"><Eye style={{ width: 13, height: 13 }} />{t("详细", "Details")}</button>
                      <button onClick={() => handleCopyKey(key)} className="dash-ghost-btn"><Copy style={{ width: 13, height: 13 }} />{t("复制", "Copy")}</button>
                      <button onClick={() => handleDeleteKey(key)} className="dash-ghost-btn" style={{ color: "#ef4444" }}><Trash2 style={{ width: 13, height: 13 }} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Security Tips */}
        <div className={ac(700, "glass-card")} style={{ marginTop: 20, ...as_(700) }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield style={{ width: 16, height: 16, color: "#06b6d4" }} />
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{t("安全提示", "Security Tips")}</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="dash-tip-item">
              <div className="dash-tip-icon"><Key style={{ width: 13, height: 13 }} /></div>
              <span>{t("密钥仅在创建时显示一次，请及时保存到安全位置", "Keys are only shown once during creation, save them securely")}</span>
            </div>
            <div className="dash-tip-item">
              <div className="dash-tip-icon"><Shield style={{ width: 13, height: 13 }} /></div>
              <span>{t("定期更换密钥可以提高账户安全性", "Regularly rotating keys improves account security")}</span>
            </div>
            <div className="dash-tip-item">
              <div className="dash-tip-icon"><Eye style={{ width: 13, height: 13 }} /></div>
              <span>{t("不要在公开场合或代码仓库中暴露密钥", "Never expose keys in public or code repositories")}</span>
            </div>
          </div>
        </div>
      </main>

      {/* View Key Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className={`${inter.className} sm:max-w-[600px]`}>
          <DialogHeader>
            <DialogTitle style={{ fontSize: 18, fontWeight: 700 }}>{t("密钥详情", "Key Details")}</DialogTitle>
            <DialogDescription>{t("查看API密钥的详细信息", "View detailed information about the API key")}</DialogDescription>
          </DialogHeader>
          {selectedKey && (
            <div className="space-y-6 py-4">
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }} className="flex items-center gap-2"><Copy style={{ width: 14, height: 14 }} />{t("API密钥", "API Key")}</h3>
                <div style={{ background: "rgba(6,182,212,0.03)", borderRadius: 12, padding: 16, border: "1px solid rgba(6,182,212,0.06)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <code className={`${jetbrainsMono.className} rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-700`} style={{ wordBreak: "break-all" }}>
                      {selectedKey.fullKey}
                    </code>
                    <button onClick={() => handleCopyKey(selectedKey)} className="dash-ib"><Copy style={{ width: 14, height: 14 }} /></button>
                  </div>
                </div>
              </div>
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 10 }} className="flex items-center gap-2"><Clock style={{ width: 14, height: 14 }} />{t("时间信息", "Time Information")}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ background: "rgba(6,182,212,0.03)", borderRadius: 12, padding: 16, border: "1px solid rgba(6,182,212,0.06)" }}>
                  <div><p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{t("创建时间", "Created")}</p><p className="tabular-nums font-medium" style={{ fontSize: 13, color: "#0f172a" }}>{selectedKey.created}</p></div>
                  <div><p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{t("最后使用", "Last Used")}</p><p className="tabular-nums font-medium" style={{ fontSize: 13, color: "#0f172a" }}>{selectedKey.lastUsed}</p></div>
                  <div><p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{t("过期时间", "Expires")}</p><p className="tabular-nums font-medium" style={{ fontSize: 13, color: "#0f172a" }}>{selectedKey.expires}</p></div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>{t("关闭", "Close")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Key Display Modal */}
      <Dialog open={isKeyDisplayModalOpen} onOpenChange={setIsKeyDisplayModalOpen}>
        <DialogContent className={`${inter.className} sm:max-w-[600px]`}>
          <DialogHeader>
            <DialogTitle style={{ textAlign: "center", fontSize: 18, fontWeight: 700 }}>{t("密钥创建成功!", "API Key Created!")}</DialogTitle>
            <DialogDescription style={{ textAlign: "center" }}>{t("请妥善保存您的API密钥", "Please save your API key securely")}</DialogDescription>
          </DialogHeader>
          {newCreatedKey && (
            <div className="space-y-6 py-4">
              <div style={{ background: "rgba(245,158,11,0.06)", borderRadius: 12, padding: 16, border: "2px solid rgba(245,158,11,0.15)" }}>
                <code className={`${jetbrainsMono.className} mb-3 block rounded bg-gray-50 px-2 py-1 text-xs text-gray-700`} style={{ wordBreak: "break-all" }}>
                  {newCreatedKey.apiKey}
                </code>
                <button onClick={handleCopyNewKey} className="dash-primary-btn" style={{ width: "100%", justifyContent: "center" }}>
                  <Copy style={{ width: 14, height: 14 }} />{t("复制密钥", "Copy API Key")}
                </button>
              </div>
              <div style={{ background: "rgba(239,68,68,0.04)", borderRadius: 10, padding: 14, border: "1px solid rgba(239,68,68,0.08)" }}>
                <p style={{ fontSize: 12, color: "#dc2626", display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>&#9888;</span>
                  {t("请立即复制并保存此密钥。关闭后将无法再次查看。", "Copy and save this key now. It cannot be viewed again.")}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <button onClick={handleCloseKeyDisplayModal} className="dash-outline-btn">{t("我已保存,关闭", "I've Saved It, Close")}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("确认删除密钥", "Confirm Delete Key")}</AlertDialogTitle>
            <AlertDialogDescription>{t("您确定要删除此密钥吗？此操作无法撤销,使用此密钥的应用将无法继续访问API。", "Are you sure? This action cannot be undone.")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("取消", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteKey}>{t("确认删除", "Confirm Delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
