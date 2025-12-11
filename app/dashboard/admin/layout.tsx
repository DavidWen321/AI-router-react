"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { authApi } from "@/lib/api"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [userEmail, setUserEmail] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // ✅ 增强认证检查：验证登录状态、token和管理员权限
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const accessToken = localStorage.getItem("accessToken")
    const isAdmin = localStorage.getItem("isAdmin") === "true"
    const email = localStorage.getItem("userEmail") || ""

    // 如果未登录或没有token，清理状态并重定向到首页
    if (!isLoggedIn || !accessToken) {
      console.warn("[Admin Layout] 未登录或缺少token，清理状态")
      localStorage.clear()
      router.push("/")
      return
    }

    // 如果不是管理员，重定向到普通用户dashboard
    if (!isAdmin) {
      console.warn("[Admin Layout] 非管理员用户尝试访问管理后台")
      router.push("/dashboard")
      return
    }

    setUserEmail(email)
  }, [router])

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
      router.push("/")
    }
  }

  if (!mounted) {
    return null
  }

  // admin/* 路径的子页面
  // 侧边栏已经在父级 dashboard/layout.tsx 中渲染，这里只需要渲染内容区域
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

      {/* 管理员页面内容区域，顶部留出 header 空间 */}
      <main className="pt-[72px] px-6 pb-8">{children}</main>
    </div>
  )
}
