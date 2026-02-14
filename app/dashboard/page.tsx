"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Key, TrendingUp, DollarSign, Users, Copy, Settings, Mail, Package, ChevronRight, Shield, BookOpen, MessageCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
import { MyPlansDialog } from "@/components/my-plans-dialog"
import {
  BackgroundParticles,
  HeroAurora,
  SparklineCanvas,
  ProgressRing,
} from "@/components/dashboard-canvas"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { authApi, userApi, usageApi, membershipApi, apiKeyApi, type RemainingQuotaData, type DailyUsageData, type UserMembershipData, type ApiKeyData } from "@/lib/api"

export default function DashboardPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [apiKey, setApiKey] = useState<string>("")
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false)
  const [isMyPlansDialogOpen, setIsMyPlansDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false)
  const [activationCode, setActivationCode] = useState("")
  const [animReady, setAnimReady] = useState(false)

  const [remainingQuota, setRemainingQuota] = useState<RemainingQuotaData | null>(null)
  const [monthUsageData, setMonthUsageData] = useState<DailyUsageData[]>([])
  const [currentMembership, setCurrentMembership] = useState<UserMembershipData | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Refs for 3D tilt
  const statRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const accessToken = localStorage.getItem("accessToken")

    if (!isLoggedIn || !accessToken) {
      localStorage.clear()
      router.push("/")
      return
    }

    fetchCurrentUser()
    // Trigger orchestrated animations
    setTimeout(() => setAnimReady(true), 100)
  }, [router])

  // 3D Tilt effect
  useEffect(() => {
    const cards = statRefs.current.filter(Boolean)
    const handlers: Array<{ el: HTMLDivElement; move: (e: MouseEvent) => void; leave: () => void }> = []

    cards.forEach((card) => {
      if (!card) return
      const move = (e: MouseEvent) => {
        const r = card.getBoundingClientRect()
        const dx = ((e.clientX - r.left) / r.width - 0.5) * 2
        const dy = ((e.clientY - r.top) / r.height - 0.5) * 2
        card.style.transform = `translateY(-4px) perspective(600px) rotateX(${dy * -3}deg) rotateY(${dx * 3}deg)`
      }
      const leave = () => {
        card.style.transition = "transform .5s cubic-bezier(.34,1.56,.64,1)"
        card.style.transform = ""
        setTimeout(() => { card.style.transition = "" }, 500)
      }
      card.addEventListener("mousemove", move)
      card.addEventListener("mouseleave", leave)
      handlers.push({ el: card, move, leave })
    })

    return () => {
      handlers.forEach(({ el, move, leave }) => {
        el.removeEventListener("mousemove", move)
        el.removeEventListener("mouseleave", leave)
      })
    }
  }, [loading])

  const fetchCurrentUser = async () => {
    try {
      const user = await userApi.getCurrentUser()
      setUserId(user.id)
      setUserData(user)
      setUserEmail(user.email)
      localStorage.setItem("userId", user.id)
      localStorage.setItem("userEmail", user.email)
      fetchDashboardData(user.id)
    } catch (error) {
      console.error("获取当前用户失败:", error)
      toast({
        title: t("获取用户信息失败", "Failed to get user info"),
        description: t("请重新登录", "Please log in again"),
        variant: "destructive",
      })
      localStorage.clear()
      router.push("/")
    }
  }

  const fetchDashboardData = async (uid: string) => {
    setLoading(true)
    try {
      const [quotaData, monthData, membershipData, apiKeys] = await Promise.all([
        usageApi.getRemainingQuota(uid),
        usageApi.getMonthUsage(uid),
        membershipApi.getCurrentMembership(uid).catch(() => null),
        apiKeyApi.getUserApiKeys(uid).catch(() => []),
      ])

      setRemainingQuota(quotaData)
      setMonthUsageData(monthData)
      setCurrentMembership(membershipData)

      if (apiKeys && apiKeys.length > 0) {
        setApiKey(apiKeys[0].apiKey)
      } else {
        setApiKey("")
      }
    } catch (error) {
      console.error("获取仪表盘数据失败:", error)
      toast({
        title: t("获取数据失败", "Failed to fetch data"),
        description: t("无法获取使用统计", "Unable to retrieve usage statistics"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  const monthTotalCost = monthUsageData.reduce((sum, day) => sum + (day.totalCost || 0), 0)

  const isPaygUser =
    remainingQuota?.billingMode === "PAYG" ||
    userData?.billingMode === "PAYG" ||
    remainingQuota?.walletBalance != null ||
    remainingQuota?.walletTotalConsumed != null
  const paygRemainingBalance = Math.max(0, remainingQuota?.walletBalance ?? remainingQuota?.remaining ?? 0)
  const paygTotalConsumed = Math.max(0, remainingQuota?.walletTotalConsumed ?? monthTotalCost)
  const paygTodayCost = Math.max(0, remainingQuota?.todayCost ?? 0)

  const stats = [
    {
      title: isPaygUser ? t("可用余额", "Available Balance") : t("今日使用额度", "Today's Usage Quota"),
      value: loading ? "..." : isPaygUser ? `$${paygRemainingBalance.toFixed(4)}` : (remainingQuota?.todayCost !== undefined) ? `$${remainingQuota.todayCost.toFixed(4)}` : "$0.00",
      subtitle: loading ? "..." : isPaygUser ? t("按量余额实时扣减", "PAYG balance deducted in real-time") : (remainingQuota?.remaining !== undefined) ? t("剩余", "Remaining") + ` $${remainingQuota.remaining.toFixed(2)}` : t("暂无数据", "No data"),
      icon: TrendingUp,
      sparkColor: "6,182,212",
      iconBg: "dash-icon-cyan",
    },
    {
      title: isPaygUser ? t("累计消费", "Total Consumed") : t("本月消费", "This Month's Cost"),
      value: loading ? "..." : isPaygUser ? `$${paygTotalConsumed.toFixed(4)}` : `$${monthTotalCost.toFixed(4)}`,
      subtitle: loading ? "..." : isPaygUser ? t("今日消费", "Today's Cost") + ` $${paygTodayCost.toFixed(4)}` : (remainingQuota?.dailyLimit !== undefined && remainingQuota?.dailyLimit !== null) ? t("每日限额", "Daily Limit") + ` $${remainingQuota.dailyLimit.toFixed(2)}` : t("暂无数据", "No data"),
      icon: DollarSign,
      sparkColor: "14,165,233",
      iconBg: "dash-icon-blue",
    },
    {
      title: isPaygUser ? t("计费模式", "Billing Mode") : t("套餐类型", "Plan Type"),
      value: loading ? "..." : isPaygUser ? t("按量充值", "Pay-as-you-go") : currentMembership ? (currentMembership.levelName || currentMembership.membershipName) : t("目前暂无套餐", "No active plan"),
      subtitle: loading ? "..." : isPaygUser ? t("由管理员充值/调账", "Managed by admin") : currentMembership ? t("到期", "Expires") + " " + new Date(currentMembership.expireTime).toLocaleDateString() : "",
      icon: Users,
      sparkColor: "20,184,166",
      iconBg: "dash-icon-green",
    },
  ]

  const quickLinks = [
    { icon: TrendingUp, label: t("使用统计", "Usage Statistics"), desc: t("查看API费用和趋势", "View API cost trends"), href: "/dashboard/stats" },
    { icon: Key, label: t("API管理", "API Management"), desc: t("管理密钥和权限", "Manage keys and permissions"), href: "/dashboard/api" },
    { icon: BookOpen, label: t("查看文档", "View Documentation"), desc: t("API接入指南", "API integration guide"), href: "/docs" },
  ]

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      toast({ title: t("复制成功", "Copied Successfully"), description: t("API密钥已复制到剪贴板", "API key has been copied to clipboard") })
    } catch (error) {
      toast({ title: t("复制失败", "Copy Failed"), description: t("无法复制到剪贴板", "Failed to copy to clipboard"), variant: "destructive" })
    }
  }

  const handleManageKeys = () => router.push("/dashboard/api")
  const handleViewMyPlans = () => setIsMyPlansDialogOpen(true)
  const handleActivatePlan = () => { setIsActivateDialogOpen(true); setActivationCode("") }

  const handleConfirmActivation = () => {
    if (!activationCode.trim()) {
      toast({ title: t("激活失败", "Activation Failed"), description: t("请输入激活码", "Please enter an activation code"), variant: "destructive" })
      return
    }
    toast({ title: t("激活成功", "Activation Successful"), description: t("您的套餐已成功激活", "Your plan has been successfully activated") })
    setIsActivateDialogOpen(false)
    setActivationCode("")
    if (userId) fetchDashboardData(userId)
  }

  const handleGetNewPlan = () => router.push("/pricing")

  const handleLogout = async () => {
    try { await authApi.logout() } catch (error) { console.error("后端登出失败:", error) } finally {
      localStorage.clear()
      toast({ title: t("已退出登录", "Logged Out"), description: t("您已成功退出登录", "You have been successfully logged out") })
      router.push("/")
    }
  }

  const handleShowEmail = () => setIsEmailDialogOpen(true)

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(userEmail)
      toast({ title: t("复制成功", "Copied Successfully"), description: t("邮箱已复制到剪贴板", "Email has been copied to clipboard") })
    } catch (error) {
      toast({ title: t("复制失败", "Copy Failed"), description: t("无法复制到剪贴板", "Failed to copy to clipboard"), variant: "destructive" })
    }
  }

  const handleEmailSupport = () => setIsSupportDialogOpen(true)

  const handleSendEmail = () => {
    const supportEmail = "1429703318@qq.com"
    const subject = encodeURIComponent("AiClaude 技术支持")
    const body = encodeURIComponent(`\n您好，\n\n我需要技术支持。\n\n用户邮箱: ${userEmail}\n问题描述: [请在此描述您的问题]\n\n感谢！\n`)
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`
    setIsSupportDialogOpen(false)
  }

  // Animation helpers - ac() returns className string, as_() returns style object
  const animCls = `dash-anim ${animReady ? "dash-visible" : ""}`
  const ac = (delay: number, extra = "") => `${extra} ${animCls}`.trim()
  const as_ = (delay: number): React.CSSProperties => ({ transitionDelay: `${delay}ms` })

  return (
    <div className="min-h-screen dash-bg">
      <BackgroundParticles />
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

      {/* Hero Banner */}
      <div className={ac(50, "dash-hero")} style={as_(50)}>
        <HeroAurora className="absolute inset-0 z-0 opacity-45" />
        <div className="relative z-10 max-w-[1800px] mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="dash-badge-pulse" />
            <span style={{ fontSize: 12, color: "#10b981", fontWeight: 500 }}>{t("系统运行正常", "System Online")}</span>
          </div>
          <h1 style={{ fontSize: "clamp(24px,3vw,40px)", fontWeight: 800, color: "#0f172a", marginBottom: 6, lineHeight: 1.2 }}>
            {t("欢迎回来", "Welcome back")}, <span className="dash-glow-text">{userEmail.split("@")[0]}</span>
          </h1>
          <p style={{ fontSize: "clamp(13px,1.2vw,16px)", color: "#64748b", maxWidth: 500 }}>
            {t("管理您的API密钥、查看使用统计和配置设置", "Manage your API keys, view usage statistics and configure settings")}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-8" style={{ marginTop: -10 }}>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-7 dash-stats-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              ref={(el) => { statRefs.current[index] = el }}
              className={ac(200 + index * 150, "glass-card dash-stat-card")}
              style={as_(200 + index * 150)}
            >
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b", letterSpacing: "0.03em" }}>{stat.title}</span>
                <div className={`${stat.iconBg} w-9 h-9 rounded-xl flex items-center justify-center dash-sc-icon`} style={{ transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1)" }}>
                  <stat.icon style={{ width: 16, height: 16 }} />
                </div>
              </div>
              <div style={{ fontSize: "clamp(22px,2.2vw,32px)", fontWeight: 800, color: "#0f172a", marginBottom: 4, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{stat.subtitle}</div>
              <SparklineCanvas color={stat.sparkColor} />
            </div>
          ))}
        </div>

        {/* API Key + Quick Nav Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
          {/* API Key Management */}
          <div className={ac(700, "lg:col-span-2 glass-card")} style={as_(700)}>
            <div className="flex items-center gap-3 mb-1">
              <div className="dash-icon-cyan w-9 h-9 rounded-xl flex items-center justify-center">
                <Key style={{ width: 16, height: 16 }} />
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{t("API密钥管理", "API Key Management")}</h2>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              {t("管理您的API密钥和配置", "Manage your API keys and configuration")}
            </p>

            {apiKey ? (
              <div style={{ position: "relative", background: "linear-gradient(90deg,rgba(6,182,212,.04),rgba(14,165,233,.06))", borderRadius: 14, padding: "18px 20px", marginBottom: 16, border: "1px solid rgba(6,182,212,0.08)", overflow: "hidden" }}>
                <div className="dash-key-glow" />
                <div className="flex items-center justify-between gap-4">
                  <code style={{ fontSize: 13, fontFamily: "'JetBrains Mono',monospace", color: "#0f172a", fontWeight: 500 }}>
                    {apiKey.substring(0, 9)}...{apiKey.substring(apiKey.length - 4)}
                  </code>
                  <button onClick={handleCopyKey} className="dash-ghost-btn">
                    <Copy style={{ width: 14, height: 14 }} />
                    {t("复制", "Copy")}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>
                {t("暂无API密钥", "No API key available")}
              </div>
            )}

            <button onClick={handleManageKeys} className="dash-outline-btn">
              <Settings style={{ width: 14, height: 14, transition: "transform 0.4s cubic-bezier(.34,1.56,.64,1)" }} />
              {t("管理密钥", "Manage Keys")}
            </button>
          </div>

          {/* Quick Navigation */}
          <div className={ac(850, "glass-card")} style={as_(850)}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{t("快速导航", "Quick Navigation")}</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>{t("常用功能入口", "Common features")}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {quickLinks.map((link, index) => (
                <Link key={index} href={link.href} className="dash-qn-item">
                  <div className="dash-icon-cyan w-9 h-9 rounded-xl flex items-center justify-center dash-qn-icon" style={{ transition: "transform 0.3s" }}>
                    <link.icon style={{ width: 16, height: 16 }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{link.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{link.desc}</div>
                  </div>
                  <ChevronRight className="dash-qn-arrow" style={{ width: 14, height: 14, color: "#cbd5e1", transition: "all 0.3s" }} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Account Info + Plan Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-7">
          {/* Account Information */}
          <div className={ac(1000, "glass-card")} style={as_(1000)}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{t("账户信息", "Account Information")}</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              {t("您的账户详情和使用情况", "Your account details and usage")}
            </p>

            <div>
              <div className="dash-ir">
                <span className="dash-ir-label">{t("邮箱", "Email")}</span>
                <button onClick={handleShowEmail} className="dash-ir-link flex items-center gap-1" style={{ fontSize: 13, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                  {userEmail} <Mail style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div className="dash-ir">
                <span className="dash-ir-label">{t("注册时间", "Registration Time")}</span>
                <span className="dash-ir-val">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "—"}</span>
              </div>
              <div className="dash-ir">
                <span className="dash-ir-label">{isPaygUser ? t("可用余额", "Available Balance") : t("日度预算", "Daily Budget")}</span>
                <span className="dash-ir-val">
                  {loading ? "..." : isPaygUser ? `$${paygRemainingBalance.toFixed(4)}` : currentMembership?.dailyUsage !== undefined ? `$${currentMembership.dailyUsage.toFixed(2)}` : remainingQuota?.dailyLimit !== undefined && remainingQuota?.dailyLimit !== null ? `$${remainingQuota.dailyLimit.toFixed(2)}` : "$0.00"}
                </span>
              </div>
              <div className="dash-ir">
                <span className="dash-ir-label">{isPaygUser ? t("消费额度", "Consumed") : t("今日已用", "Today's Usage")}</span>
                <span className="dash-ir-accent">
                  {loading ? "..." : isPaygUser ? `$${paygTotalConsumed.toFixed(4)}` : remainingQuota?.todayCost !== undefined ? `$${remainingQuota.todayCost.toFixed(4)}` : "$0.00"}
                </span>
              </div>
              <div className="dash-ir">
                <span className="dash-ir-label">{isPaygUser ? t("今日消费", "Today's Cost") : t("本月已用", "This Month Used")}</span>
                <span className="dash-ir-accent">
                  {loading ? "..." : isPaygUser ? `$${paygTodayCost.toFixed(4)}` : `$${monthTotalCost.toFixed(4)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Plan / Billing Management */}
          <div className={ac(1120, "glass-card")} style={as_(1120)}>
            <div className="flex items-center justify-between mb-1">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                {isPaygUser ? t("按量信息", "PAYG Info") : t("套餐管理", "Plan Management")}
              </h2>
            </div>
            <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
              {isPaygUser
                ? t("当前为按量计费，由管理员统一充值和调账", "PAYG billing managed by admin")
                : t("管理您的订阅和激活码", "Manage your subscriptions")}
            </p>

            {!isPaygUser && (
              <button onClick={handleViewMyPlans} className="dash-primary-btn" style={{ width: "100%", justifyContent: "center", marginBottom: 16, padding: "12px 18px" }}>
                <Package style={{ width: 16, height: 16 }} />
                {t("我的套餐", "My Plans")}
              </button>
            )}

            <div>
              {isPaygUser ? (
                <>
                  <div className="dash-ir">
                    <span className="dash-ir-label">{t("计费模式", "Billing Mode")}</span>
                    <span className="dash-badge-pill">{t("按量充值", "Pay-as-you-go")}</span>
                  </div>
                  <div className="dash-ir">
                    <span className="dash-ir-label">{t("可用余额", "Available Balance")}</span>
                    <span className="dash-ir-val">{loading ? "..." : `$${paygRemainingBalance.toFixed(4)}`}</span>
                  </div>
                  <div className="dash-ir">
                    <span className="dash-ir-label">{t("累计消费", "Total Consumed")}</span>
                    <span className="dash-ir-accent">{loading ? "..." : `$${paygTotalConsumed.toFixed(4)}`}</span>
                  </div>
                </>
              ) : !loading && currentMembership ? (
                <>
                  <div className="dash-ir">
                    <span className="dash-ir-label">{t("套餐名称", "Plan Name")}</span>
                    <div className="flex items-center gap-2">
                      <span className="dash-ir-val">{currentMembership.levelName || currentMembership.membershipName}</span>
                      <span className="dash-badge-pill" style={{ background: "rgba(16,185,129,.08)", color: "#10b981", borderColor: "rgba(16,185,129,.12)" }}>{t("活跃", "Active")}</span>
                    </div>
                  </div>
                  <div className="dash-ir">
                    <span className="dash-ir-label">{t("周期开始", "Cycle Start")}</span>
                    <span className="dash-ir-val">{new Date(currentMembership.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="dash-ir">
                    <span className="dash-ir-label">{t("周期结束", "Cycle End")}</span>
                    <span className="dash-ir-val">{new Date(currentMembership.expireTime).toLocaleDateString()}</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>{t("目前暂无套餐", "No active plan")}</p>
                    <p style={{ fontSize: 11, color: "#cbd5e1" }}>{t("请激活套餐以使用服务", "Please activate a plan to use the service")}</p>
                  </div>
                  <div className="dash-ir">
                    <span className="dash-ir-label">{t("周期开始", "Cycle Start")}</span>
                    <span className="dash-ir-val">—</span>
                  </div>
                  <div className="dash-ir">
                    <span className="dash-ir-label">{t("周期结束", "Cycle End")}</span>
                    <span className="dash-ir-val">—</span>
                  </div>
                </>
              )}

              {!isPaygUser && (
                <button onClick={handleGetNewPlan} style={{ width: "100%", textAlign: "center", fontSize: 13, color: "#06b6d4", fontWeight: 500, padding: "12px 0", borderRadius: 10, cursor: "pointer", border: "none", background: "transparent", fontFamily: "inherit", transition: "background 0.2s" }}
                  onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(6,182,212,.04)" }}
                  onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent" }}
                >
                  {t("获取新套餐", "Get New Plan")}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className={ac(1250, "glass-card")} style={as_(1250)}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{t("支持和帮助", "Support and Help")}</h2>
          <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>
            {t("获取帮助和联系支持团队", "Get help and contact support team")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/docs" className="dash-spt-btn">
              <BookOpen style={{ width: 16, height: 16 }} />
              {t("使用文档", "Documentation")}
            </Link>
            <button onClick={handleEmailSupport} className="dash-spt-btn">
              <Mail style={{ width: 16, height: 16 }} />
              {t("邮件支持", "Email Support")}
            </button>
            <button onClick={() => window.open("https://qm.qq.com/q/W5Mv4jBfkO", "_blank")} className="dash-spt-btn">
              <MessageCircle style={{ width: 16, height: 16 }} />
              QQ群: 663248591
            </button>
          </div>
        </div>
      </main>

      {/* Activation Dialog */}
      <Dialog open={isActivateDialogOpen} onOpenChange={setIsActivateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("激活套餐", "Activate Plan")}</DialogTitle>
            <DialogDescription>{t("请输入您的激活码以激活套餐", "Please enter your activation code to activate the plan")}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="activation-code" className="block text-sm font-medium text-gray-700 mb-2">{t("激活码", "Activation Code")}</label>
            <input
              id="activation-code"
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleConfirmActivation() }}
              placeholder={t("例如：PACK-XXXX-XXXX-XXXX", "e.g., PACK-XXXX-XXXX-XXXX")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
          <DialogFooter>
            <button onClick={handleConfirmActivation} className="dash-primary-btn">{t("激活", "Activate")}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="w-5 h-5 text-cyan-600" />{t("邮箱地址", "Email Address")}</DialogTitle>
            <DialogDescription>{t("您的注册邮箱地址", "Your registered email address")}</DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div style={{ background: "linear-gradient(90deg,rgba(6,182,212,.04),rgba(14,165,233,.06))", borderRadius: 14, padding: 24, border: "1px solid rgba(6,182,212,0.08)" }}>
              <p style={{ textAlign: "center", fontSize: 16, fontFamily: "monospace", fontWeight: 600, color: "#0f172a" }}>{userEmail}</p>
            </div>
          </div>
          <DialogFooter>
            <button onClick={handleCopyEmail} className="dash-primary-btn" style={{ width: "100%", justifyContent: "center" }}>
              <Copy className="w-4 h-4" />{t("复制邮箱", "Copy Email")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Dialog */}
      <Dialog open={isSupportDialogOpen} onOpenChange={setIsSupportDialogOpen}>
        <DialogContent className="sm:max-w-lg" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Mail className="w-6 h-6 text-cyan-600" />{t("邮件支持", "Email Support")}</DialogTitle>
            <DialogDescription>{t("联系我们的技术支持团队", "Contact our technical support team")}</DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div style={{ background: "linear-gradient(135deg,rgba(6,182,212,.06),rgba(14,165,233,.08))", borderRadius: 14, padding: 20, border: "1px solid rgba(6,182,212,0.1)" }}>
              <div className="flex items-start gap-4">
                <div className="dash-icon-cyan w-11 h-11 rounded-xl flex items-center justify-center">
                  <Mail style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>{t("技术支持邮箱", "Support Email")}</h3>
                  <p style={{ fontSize: 16, fontFamily: "monospace", fontWeight: 600, color: "#06b6d4" }}>1429703318@qq.com</p>
                </div>
              </div>
            </div>
            <div style={{ background: "rgba(6,182,212,.03)", borderRadius: 10, padding: 14, border: "1px solid rgba(6,182,212,0.06)" }}>
              <p style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{t("请使用您的这个邮箱发送", "Please send using your email")}:</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{userEmail}</p>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsSupportDialogOpen(false)} className="dash-outline-btn">{t("取消", "Cancel")}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MyPlansDialog open={isMyPlansDialogOpen} onOpenChange={setIsMyPlansDialogOpen} userId={userId} />
    </div>
  )
}
