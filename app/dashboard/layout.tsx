"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Users, Key, Database, Package, Activity, Shield, DollarSign, Globe, Link2, Gift, History, UserPlus } from "lucide-react"
import Link from "next/link"
import { agentApi, authApi } from "@/lib/api"
import { DashboardHeader } from "@/components/dashboard-header"

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

  // 渲染带侧边栏的布局
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* 顶部导航 */}
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

      <div className="flex">
        {/* 左侧栏 */}
        <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-28 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-40">
          <div className="flex flex-col items-center py-8 gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center gap-2 group">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? `${item.color} shadow-lg scale-110`
                        : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 hover:shadow-md"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${isActive ? "text-white" : "text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white"}`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium text-center transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </aside>

        {/* 主内容区域 - 为左侧栏留出空间，为顶部导航留出空间 */}
        <main className="flex-1 ml-28 pt-[72px] flex justify-center">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
