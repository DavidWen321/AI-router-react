"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // ✅ 增强认证检查：验证登录状态、token和管理员权限
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const accessToken = localStorage.getItem("accessToken")
    const isAdmin = localStorage.getItem("isAdmin") === "true"

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
  }, [router])

  if (!mounted) {
    return null
  }

  // admin/* 路径的子页面
  // 侧边栏、顶部栏和统一背景已经在父级 dashboard/layout.tsx 渲染
  // 这里只做权限守卫 + 内容容器，避免重复 Header/背景
  return (
    <main className="relative z-10 px-2 sm:px-4 lg:px-6 pb-4 sm:pb-6 lg:pb-8">{children}</main>
  )
}
