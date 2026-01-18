"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { TrendingUp, Key, LogOut, Home } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api"

interface DashboardHeaderProps {
  userEmail: string
  onLogout?: () => void
}

export function DashboardHeader({ userEmail, onLogout }: DashboardHeaderProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  // Directly derive activeTab from pathname - no state needed!
  const getActiveTab = () => {
    if (pathname === "/dashboard") return "dashboard"
    if (pathname === "/dashboard/api") return "api"
    if (pathname === "/dashboard/stats") return "stats"
    return "dashboard"
  }

  const activeTab = getActiveTab()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.error("Backend logout failed:", error)
    } finally {
      localStorage.clear()
      toast({
        title: t("已退出登录", "Logged Out"),
        description: t("您已成功退出登录", "You have been successfully logged out"),
      })
      if (onLogout) {
        onLogout()
      } else {
        router.push("/")
      }
    }
  }

  const tabs = [
    {
      id: "dashboard",
      href: "/dashboard",
      label: t("仪表板", "Dashboard"),
      icon: TrendingUp,
    },
    {
      id: "api",
      href: "/dashboard/api",
      label: t("API管理", "API Management"),
      icon: Key,
    },
    {
      id: "stats",
      href: "/dashboard/stats",
      label: t("使用统计", "Usage Statistics"),
      icon: TrendingUp,
    },
  ]

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
      <div className="flex items-center justify-center h-[72px] px-6 relative">
        {/* Logo - Left */}
        <Link href="/dashboard" className="absolute left-6 flex items-center gap-2 group">
          <img
            src="/ac-logo.png"
            alt="AiClaude Logo"
            className="w-10 h-10 transition-transform group-hover:scale-110"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            AiClaude
          </span>
        </Link>

        {/* Navigation - Centered with animated indicator */}
        <nav className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-1 relative">
            {/* Animated sliding background with GPU acceleration */}
            <div
              className="absolute bg-white dark:bg-gray-700 rounded-lg shadow-sm h-[calc(100%-8px)] top-1 gpu-accelerated transition-colors duration-300"
              style={{
                width: `${100 / tabs.length}%`,
                left: `${(tabs.findIndex((tab) => tab.id === activeTab) * 100) / tabs.length}%`,
                transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                willChange: "left, width",
                transform: "translateZ(0)",
              }}
            />

            {/* Tab buttons */}
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  prefetch={true}
                  className={`
                    relative z-10 px-6 py-2.5 flex items-center gap-2 font-medium rounded-lg
                    transition-colors duration-200 ease-out
                    ${
                      isActive
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 transition-transform duration-200" />
                  <span className="transition-colors duration-200">{tab.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Menu - Right with gradient avatar */}
          <div className="absolute right-6 flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
                  {(userEmail || "DH").substring(0, 2).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{t("我的账户", "My Account")}</p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/")}>
                  <Home className="w-4 h-4" />
                  {t("返回首页", "Return to Homepage")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4" />
                  {t("退出登录", "Logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </div>
    </header>
  )
}
