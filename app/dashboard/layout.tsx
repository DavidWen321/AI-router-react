"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Users, Key, Database, Package } from "lucide-react"
import Link from "next/link"

/**
 * Dashboard 统一布局
 * - 如果是管理员：显示左侧管理栏（在用户页面和管理页面都显示）
 * - 如果是普通用户：不显示左侧管理栏
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // ✅ 增强认证检查：同时验证 isLoggedIn 和 accessToken
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const accessToken = localStorage.getItem("accessToken")
    const adminStatus = localStorage.getItem("isAdmin") === "true"

    // 如果未登录或没有token，清理状态并重定向
    if (!isLoggedIn || !accessToken) {
      console.warn("[Dashboard Layout] 未登录或缺少token，清理状态")
      localStorage.clear()
      window.location.href = "/"
      return
    }

    setIsAdmin(adminStatus)
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
      name: t("套餐管理", "Package Management"),
      href: "/dashboard/admin/packages",
      icon: Package,
      color: "bg-gradient-to-br from-indigo-400 to-indigo-500",
    },
  ]

  if (!mounted) {
    return null
  }

  // 如果不是管理员，直接渲染子页面（不带侧边栏）
  if (!isAdmin) {
    return <>{children}</>
  }

  // 如果是管理员，渲染带侧边栏的布局
  return (
    <div className="flex">
      {/* 管理员左侧栏 */}
      <aside className="fixed left-0 top-[72px] h-[calc(100vh-72px)] w-28 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto z-40">
        <div className="flex flex-col items-center py-8 gap-8">
          {adminNavItems.map((item) => {
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

      {/* 主内容区域 - 为左侧栏留出空间 */}
      <main className="flex-1 ml-28">
        {children}
      </main>
    </div>
  )
}
