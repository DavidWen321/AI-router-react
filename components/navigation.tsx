"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Globe, Sun, Moon, User, LogOut, ChevronDown, Menu, X } from "lucide-react"
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
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

    // Scroll handler
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
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

  const navLinks = [
    { href: "/features", label: t("功能特性", "Features") },
    { href: "/pricing", label: t("定价方案", "Pricing") },
    { href: "/docs", label: t("使用文档", "Documentation") },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="w-full px-6 sm:px-10 lg:px-16 h-16 flex items-center justify-between">
          {/* Left - Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src="/ac-logo.png" alt="AiClaude Logo" className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">AiClaude</span>
          </Link>

          {/* Center Navigation Links - Desktop */}
          <div className="hidden md:flex items-center justify-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              <span>{language === "zh" ? "中" : "EN"}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isLoggedIn ? (
              <>
                {/* Dashboard Button */}
                <button
                  onClick={handleDashboardClick}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  title={userEmail}
                >
                  <User className="w-4 h-4" />
                  <span>{isAdmin ? t("管理控制台", "Admin") : t("控制台", "Dashboard")}</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title={t("退出登录", "Logout")}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t("退出", "Logout")}</span>
                </button>
              </>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="hidden sm:flex px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  {t("登录", "Login")}
                </button>

                {/* Get Started Button */}
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="relative group px-5 py-2.5 rounded-full text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-cyan-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative">{t("开始使用", "Get Started")}</span>
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="px-6 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === link.href
                      ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleDashboardClick()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>{isAdmin ? t("管理控制台", "Admin") : t("控制台", "Dashboard")}</span>
                    </button>
                    <button
                      onClick={() => {
                        handleLogout()
                        setMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t("退出登录", "Logout")}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAuthModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500"
                  >
                    {t("开始使用", "Get Started")}
                  </button>
                )}
              </div>

              {/* Language in mobile */}
              <div className="pt-4 flex items-center justify-center gap-4">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>{language === "zh" ? "中文" : "English"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  )
}
