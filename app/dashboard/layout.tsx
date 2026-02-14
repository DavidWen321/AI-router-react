"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Users, Key, Database, Package, Activity, Shield, DollarSign, Globe, Link2, Gift, History, UserPlus, BarChart3, Menu, X } from "lucide-react"
import { agentApi, authApi } from "@/lib/api"
import { DashboardHeader } from "@/components/dashboard-header"
import { BackgroundParticles } from "@/components/dashboard-canvas"
import Sidebar, { type SidebarItem } from "@/components/liquid-morphing-sidebar"

/**
 * Dashboard 统一布局
 * - 如果是管理员：显示左侧管理栏（在用户页面和管理页面都显示）
 * - 如果是代理商：显示左侧代理商功能栏
 * - 如果是普通用户：不显示左侧管理栏
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAgent, setIsAgent] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [isTabletLandscapeExpanded, setIsTabletLandscapeExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)

    // ✅ 增强认证检查：同时验证 isLoggedIn 和 accessToken
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const accessToken = localStorage.getItem("accessToken")
    const adminStatus = localStorage.getItem("isAdmin") === "true"
    const email = localStorage.getItem("userEmail") || ""

    // 如果未登录或没有token，清理状态并重定向
    if (!isLoggedIn || !accessToken) {
      console.warn("[Dashboard Layout] 未登录或缺少token，清理状态")
      localStorage.clear()
      window.location.href = "/"
      return
    }

    setIsAdmin(adminStatus)
    setUserEmail(email)

    // 检查是否是代理商（仅在访问代理商页面时检查，避免管理员页面出现不必要的错误）
    const checkAgentStatus = async () => {
      // 如果是管理员访问管理员页面，跳过代理商检查
      if (adminStatus && window.location.pathname.startsWith('/dashboard/admin')) {
        setIsAgent(false)
        return
      }

      try {
        const isAgentResult = await agentApi.checkIsAgent()
        setIsAgent(isAgentResult)
        localStorage.setItem("isAgent", String(isAgentResult))
      } catch {
        setIsAgent(false)
        localStorage.setItem("isAgent", "false")
      }
    }

    checkAgentStatus()
  }, [])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  useEffect(() => {
    const updateTabletSidebarMode = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const shortestEdge = Math.min(width, height)
      const longestEdge = Math.max(width, height)

      // iPad/平板常见视口范围：744~1366
      const isTabletViewport = shortestEdge >= 744 && longestEdge <= 1366
      const isLandscape = width > height
      const isTouchPrimary = window.matchMedia("(pointer: coarse)").matches

      // 仅在“触控平板 + 横屏”时使用完整版侧栏
      setIsTabletLandscapeExpanded(isTabletViewport && isLandscape && isTouchPrimary)
    }

    updateTabletSidebarMode()
    window.addEventListener("resize", updateTabletSidebarMode)
    window.addEventListener("orientationchange", updateTabletSidebarMode)

    return () => {
      window.removeEventListener("resize", updateTabletSidebarMode)
      window.removeEventListener("orientationchange", updateTabletSidebarMode)
    }
  }, [])

  // 管理员导航项
  const adminNavItems = [
    {
      name: t("用户管理", "User Management"),
      href: "/dashboard/admin/users",
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      name: t("密钥管理", "Key Management"),
      href: "/dashboard/admin/keys",
      icon: Key,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      name: t("号池管理", "Number Pool Management"),
      href: "/dashboard/admin/number-pool",
      icon: Database,
      color: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      name: t("备用号池", "Backup Pool"),
      href: "/dashboard/admin/backup-pool",
      icon: Shield,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
    {
      name: t("IP代理管理", "IP Proxy"),
      href: "/dashboard/admin/ip-management",
      icon: Globe,
      color: "bg-gradient-to-br from-cyan-500 to-teal-600",
    },
    {
      name: t("代理绑定", "Proxy Binding"),
      href: "/dashboard/admin/proxy-binding",
      icon: Link2,
      color: "bg-gradient-to-br from-violet-500 to-purple-600",
    },
    {
      name: t("套餐管理", "Package Management"),
      href: "/dashboard/admin/packages",
      icon: Package,
      color: "bg-gradient-to-br from-indigo-400 to-indigo-500",
    },
    {
      name: t("代理商套餐管理", "Agent Package Management"),
      href: "/dashboard/admin/agent-packages",
      icon: Gift,
      color: "bg-gradient-to-br from-pink-500 to-rose-500",
    },
    {
      name: t("渠道监控", "Channel Health"),
      href: "/dashboard/admin/channel-health",
      icon: Activity,
      color: "bg-gradient-to-br from-cyan-500 to-teal-500",
    },
    {
      name: t("模型定价", "Model Pricing"),
      href: "/dashboard/admin/model-pricing",
      icon: DollarSign,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
    {
      name: t("模型限制", "Model Restriction"),
      href: "/dashboard/admin/model-restriction",
      icon: Shield,
      color: "bg-gradient-to-br from-rose-500 to-rose-600",
    },
    {
      name: t("代理商管理", "Agent Management"),
      href: "/dashboard/admin/agents",
      icon: UserPlus,
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
    {
      name: t("运营情况", "Operations"),
      href: "/dashboard/admin/operations",
      icon: BarChart3,
      color: "bg-gradient-to-br from-teal-500 to-green-600",
    },
  ]

  // 代理商导航项
  const agentNavItems = [
    {
      name: t("套餐兑换", "Redeem"),
      href: "/dashboard/agent/redeem",
      icon: Gift,
      color: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
    {
      name: t("兑换记录", "History"),
      href: "/dashboard/agent/history",
      icon: History,
      color: "bg-gradient-to-br from-teal-500 to-cyan-500",
    },
  ]

  // 退出登录处理
  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("后端登出失败:", error)
    } finally {
      localStorage.clear()
      router.push("/")
    }
  }

  if (!mounted) {
    return null
  }

  // 判断当前是否在代理商页面
  const isAgentPage = pathname?.startsWith("/dashboard/agent")

  // 如果不是管理员也不是代理商，直接渲染子页面（不带侧边栏）
  if (!isAdmin && !isAgent) {
    return <>{children}</>
  }

  // 确定要显示的导航项
  // 如果是管理员且不在代理商页面，显示管理员导航
  // 如果是代理商，显示代理商导航（无论在哪个页面）
  // 如果是管理员也是代理商，根据当前页面决定
  const showAdminNav = isAdmin && !isAgentPage
  const showAgentNav = isAgent && (isAgentPage || !isAdmin)

  // 如果在代理商页面但不是代理商，返回普通页面
  if (isAgentPage && !isAgent) {
    return <>{children}</>
  }

  // 如果不在代理商页面、不是管理员、也不是代理商，返回普通页面
  if (!isAgentPage && !isAdmin && !isAgent) {
    return <>{children}</>
  }

  const navItems = showAgentNav ? agentNavItems : (showAdminNav ? adminNavItems : [])

  // 如果没有导航项，直接渲染子页面
  if (navItems.length === 0) {
    return <>{children}</>
  }

  const sidebarItems: SidebarItem[] = navItems.map((item) => ({
    id: item.href,
    label: item.name,
    icon: item.icon,
  }))

  const activeSidebarId =
    navItems.find((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))?.href ??
    navItems[0]?.href ??
    ""

  // 渲染带侧边栏的布局
  return (
    <div className="relative min-h-screen dash-bg dark:bg-gray-900">
      <BackgroundParticles />

      {/* 顶部导航 */}
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

      {/* 手机端菜单按钮 */}
      <button
        type="button"
        aria-label={mobileNavOpen ? t("关闭侧边栏", "Close Sidebar") : t("打开侧边栏", "Open Sidebar")}
        onClick={() => setMobileNavOpen((prev) => !prev)}
        className="md:hidden fixed left-3 top-[82px] z-[60] h-10 w-10 rounded-xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur flex items-center justify-center text-slate-600"
      >
        {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {/* 手机端抽屉侧栏 */}
      <div className={`md:hidden fixed inset-0 z-50 transition ${mobileNavOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-300 ${mobileNavOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileNavOpen(false)}
        />
        <aside
          className={`absolute left-0 top-0 h-full w-[86vw] max-w-[280px] bg-white shadow-2xl transition-transform duration-300 ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-[72px] border-b border-gray-100 px-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">{t("管理菜单", "Navigation")}</span>
            <button
              type="button"
              className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
              onClick={() => setMobileNavOpen(false)}
              aria-label={t("关闭", "Close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[calc(100%-72px)]">
            <Sidebar
              className="h-full w-full"
              items={sidebarItems}
              activeId={activeSidebarId}
              onActiveChange={(nextActiveId) => {
                if (nextActiveId && nextActiveId !== activeSidebarId) {
                  router.push(nextActiveId)
                }
                setMobileNavOpen(false)
              }}
            />
          </div>
        </aside>
      </div>

      <div className="relative z-10 flex">
        {/* iPad/中屏：默认紧凑侧栏（平板横屏会自动切换到完整版） */}
        {!isTabletLandscapeExpanded && (
          <aside className="hidden md:block xl:hidden fixed left-0 top-[72px] h-[calc(100vh-72px)] w-[84px] z-40">
            <Sidebar
              compact
              className="h-full w-full"
              items={sidebarItems}
              activeId={activeSidebarId}
              onActiveChange={(nextActiveId) => {
                if (nextActiveId && nextActiveId !== activeSidebarId) {
                  router.push(nextActiveId)
                }
              }}
            />
          </aside>
        )}

        {/* iPad横屏：在中屏断点也使用完整版侧栏 */}
        {isTabletLandscapeExpanded && (
        <aside className="hidden md:block xl:hidden fixed left-0 top-[72px] h-[calc(100vh-72px)] w-[220px] z-40">
            <Sidebar
              className="h-full w-full"
              items={sidebarItems}
              activeId={activeSidebarId}
              onActiveChange={(nextActiveId) => {
                if (nextActiveId && nextActiveId !== activeSidebarId) {
                  router.push(nextActiveId)
                }
              }}
            />
          </aside>
        )}

        {/* 大屏：完整侧栏 */}
        <aside className="hidden xl:block fixed left-0 top-[72px] h-[calc(100vh-72px)] w-[220px] z-40">
          <Sidebar
            className="h-full w-full"
            items={sidebarItems}
            activeId={activeSidebarId}
            onActiveChange={(nextActiveId) => {
              if (nextActiveId && nextActiveId !== activeSidebarId) {
                router.push(nextActiveId)
              }
            }}
          />
        </aside>

        {/* 主内容区域 - 为左侧栏留出空间，为顶部导航留出空间 */}
        <main className={`relative z-10 flex-1 pt-[72px] ${isTabletLandscapeExpanded ? "md:ml-[220px]" : "md:ml-[84px]"} xl:ml-[220px] flex justify-center`}>
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
