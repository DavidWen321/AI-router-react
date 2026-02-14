"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { TrendingUp, Key, LogOut, Home, BarChart3 } from "lucide-react"
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
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

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
      icon: BarChart3,
    },
  ]

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Nav indicator position
  useEffect(() => {
    const nav = navRef.current
    const indicator = indicatorRef.current
    if (!nav || !indicator) return

    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab)
    const tabEls = nav.querySelectorAll<HTMLElement>(".dash-nav-tab")
    if (tabEls[activeIndex]) {
      const tabRect = tabEls[activeIndex].getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      indicator.style.width = `${tabRect.width}px`
      indicator.style.left = `${tabRect.left - navRect.left}px`
    }
  }, [activeTab])

  return (
    <header className={`dash-header ${scrolled ? "scrolled" : ""}`}>
      <div className="flex items-center justify-center h-[72px] px-6 relative max-w-[1920px] mx-auto">
        {/* Logo - Left */}
        <Link href="/dashboard" className="absolute left-6 flex items-center gap-2 group dash-brand-link" aria-label="AiClaude Dashboard">
          <span className="dash-brand-mark" aria-hidden="true">AC</span>
          <span className="text-xl font-bold dash-brand-text hidden sm:inline">AiClaude</span>
        </Link>

        {/* Navigation - Centered with animated indicator */}
        <nav ref={navRef} className="dash-nav-tabs">
          {/* Animated sliding background */}
          <div ref={indicatorRef} className="dash-nav-indicator" />

          {/* Tab buttons */}
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <Link
                key={tab.id}
                href={tab.href}
                prefetch={true}
                className={`dash-nav-tab ${isActive ? "active" : ""}`}
              >
                <Icon style={{ width: 15, height: 15 }} />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Menu - Right with gradient avatar */}
        <div className="absolute right-6 flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs cursor-pointer focus:outline-none"
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #0ea5e9)",
                  boxShadow: "0 4px 15px rgba(6,182,212,.25)",
                  transition: "all 0.3s cubic-bezier(.34,1.56,.64,1)",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.transform = "scale(1.08)"
                  ;(e.target as HTMLElement).style.boxShadow = "0 6px 25px rgba(6,182,212,.35)"
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.transform = ""
                  ;(e.target as HTMLElement).style.boxShadow = "0 4px 15px rgba(6,182,212,.25)"
                }}
              >
                {(userEmail || "U").substring(0, 2).toUpperCase()}
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
