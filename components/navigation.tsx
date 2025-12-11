"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Globe, Sun, Moon, User, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { AuthModal } from "@/components/auth-modal"

export function Navigation() {
  const { language, setLanguage, t } = useLanguage()
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const pathname = usePathname()
  const router = useRouter()
  const isDashboardPage = pathname?.startsWith("/dashboard")

  const isAdmin = userRole === "admin"

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }

    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    const email = localStorage.getItem("userEmail") || ""
    const role = localStorage.getItem("userRole") || "user"
    setIsLoggedIn(loggedIn)
    setUserEmail(email)
    setUserRole(role)
  }, [])

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true"
      const email = localStorage.getItem("userEmail") || ""
      const role = localStorage.getItem("userRole") || "user"
      setIsLoggedIn(loggedIn)
      setUserEmail(email)
      setUserRole(role)
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh")
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userId")
    setIsLoggedIn(false)
    setUserEmail("")
    setUserRole("")
    router.push("/")
  }

  const handleDashboardClick = () => {
    if (isAdmin) {
      router.push("/dashboard/admin")
    } else {
      router.push("/dashboard")
    }
  }

  // Always render the nav structure for Edge compatibility
  // Only hide auth-dependent elements until mounted
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-[1800px] mx-auto px-12 h-16 flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/ac-logo.png" alt="AiClaude Logo" className="w-10 h-10" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">AiClaude</span>
          </Link>

          {/* Center Navigation Links - Absolutely Centered */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <Link href="/features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("功能特性", "Features")}
            </Link>
            <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("定价方案", "Pricing")}
            </Link>
            <Link href="/docs" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("使用文档", "Documentation")}
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle language"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm">{language === "zh" ? "中文" : "EN"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isLoggedIn ? (
              <>
                {/* Dashboard Button */}
                <button
                  onClick={handleDashboardClick}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title={userEmail}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">{isAdmin ? t("管理控制台", "Admin") : t("控制台", "Dashboard")}</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title={t("退出登录", "Logout")}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">{t("退出", "Logout")}</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {t("登录", "Login")}
                </button>

                {/* Get Started Button */}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  {t("开始使用", "Get Started")}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  )
}
