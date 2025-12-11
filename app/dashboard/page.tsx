"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { Key, TrendingUp, DollarSign, Users, Copy, Settings, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DashboardHeader } from "@/components/dashboard-header"
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
  const [userId, setUserId] = useState<string | null>(null)  // 改为string类型,避免JavaScript精度丢失
  const [mounted, setMounted] = useState(false)
  const [apiKey, setApiKey] = useState<string>("")  // 从后端获取的第一个API密钥
  const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false)
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false)
  const [activationCode, setActivationCode] = useState("")

  // 数据状态
  const [remainingQuota, setRemainingQuota] = useState<RemainingQuotaData | null>(null)
  const [monthUsageData, setMonthUsageData] = useState<DailyUsageData[]>([])  // 后端返回的是数组
  const [currentMembership, setCurrentMembership] = useState<UserMembershipData | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)

    // ✅ 增强认证检查：同时验证 isLoggedIn 和 accessToken
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    const accessToken = localStorage.getItem("accessToken")

    if (!isLoggedIn || !accessToken) {
      console.warn("[Dashboard] 未登录或缺少token，重定向到首页")
      localStorage.clear()
      router.push("/")
      return
    }

    // 从后端获取当前登录用户信息（基于Sa-Token session）
    fetchCurrentUser()
  }, [router])

  // 获取当前登录用户数据（从后端Sa-Token session）
  const fetchCurrentUser = async () => {
    try {
      const user = await userApi.getCurrentUser()
      setUserId(user.id)
      setUserData(user)
      setUserEmail(user.email)

      // 同步更新localStorage (user.id已经是string类型)
      localStorage.setItem("userId", user.id)
      localStorage.setItem("userEmail", user.email)

      // 获取仪表盘数据
      fetchDashboardData(user.id)
    } catch (error) {
      console.error("获取当前用户失败:", error)
      toast({
        title: t("获取用户信息失败", "Failed to get user info"),
        description: t("请重新登录", "Please log in again"),
        variant: "destructive",
      })
      // 清除登录状态
      localStorage.clear()
      router.push("/")
    }
  }

  // 获取仪表盘数据
  const fetchDashboardData = async (uid: string) => {  // uid是string类型
    setLoading(true)
    try {
      // 直接传字符串uid,避免parseInt导致的精度丢失!
      // 后端Spring会自动将URL中的字符串转换为Long类型
      const [quotaData, monthData, membershipData, apiKeys] = await Promise.all([
        usageApi.getRemainingQuota(uid),
        usageApi.getMonthUsage(uid),  // 返回的是DailyUsageData[]数组
        membershipApi.getCurrentMembership(uid).catch(() => null), // 如果没有套餐返回null
        apiKeyApi.getUserApiKeys(uid).catch(() => []),  // 获取用户的API密钥列表
      ])

      setRemainingQuota(quotaData)
      setMonthUsageData(monthData)  // 直接保存数组
      setCurrentMembership(membershipData)

      // 设置第一个API密钥（如果存在）
      if (apiKeys && apiKeys.length > 0) {
        setApiKey(apiKeys[0].apiKey)
      } else {
        setApiKey("")  // 没有密钥则设置为空
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

  if (!mounted) {
    return null
  }

  // 计算本月总消费 - 从monthUsageData数组中累加totalCost
  const monthTotalCost = monthUsageData.reduce((sum, day) => sum + (day.totalCost || 0), 0)

  const stats = [
    {
      title: t("今日使用额度", "Today's Usage Quota"),
      value: loading ? "..." : (remainingQuota && remainingQuota.todayCost !== undefined) ? `$${remainingQuota.todayCost.toFixed(4)}` : "$0.00",
      subtitle: loading ? "..." : (remainingQuota && remainingQuota.remaining !== undefined) ? t("剩余", "Remaining") + ` $${remainingQuota.remaining.toFixed(2)}` : t("暂无数据", "No data"),
      icon: TrendingUp,
    },
    {
      title: t("本月消费", "This Month's Cost"),
      value: loading ? "..." : `$${monthTotalCost.toFixed(4)}`,
      subtitle: loading ? "..." : (remainingQuota && remainingQuota.dailyLimit !== undefined) ? t("每日限额", "Daily Limit") + ` $${remainingQuota.dailyLimit.toFixed(2)}` : t("暂无数据", "No data"),
      icon: DollarSign,
    },
    {
      title: t("套餐类型", "Plan Type"),
      value: loading ? "..." : currentMembership ? (currentMembership.levelName || currentMembership.membershipName) : t("目前暂无套餐", "No active plan"),
      subtitle: loading ? "..." : currentMembership ? t("到期", "Expires") + " " + new Date(currentMembership.expireTime).toLocaleDateString() : "",
      icon: Users,
    },
  ]

  const quickLinks = [
    { icon: TrendingUp, label: t("使用统计", "Usage Statistics"), href: "/dashboard/stats" },
    { icon: Key, label: t("API管理", "API Management"), href: "/dashboard/api" },
    { icon: Settings, label: t("查看文档", "View Documentation"), href: "/docs" },
  ]

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      toast({
        title: t("复制成功", "Copied Successfully"),
        description: t("API密钥已复制到剪贴板", "API key has been copied to clipboard"),
      })
    } catch (error) {
      toast({
        title: t("复制失败", "Copy Failed"),
        description: t("无法复制到剪贴板", "Failed to copy to clipboard"),
        variant: "destructive",
      })
    }
  }


  const handleManageKeys = () => {
    router.push("/dashboard/api")
  }

  const handleActivatePlan = () => {
    setIsActivateDialogOpen(true)
    setActivationCode("")
  }

  const handleConfirmActivation = () => {
    if (!activationCode.trim()) {
      toast({
        title: t("激活失败", "Activation Failed"),
        description: t("请输入激活码", "Please enter an activation code"),
        variant: "destructive",
      })
      return
    }

    // Simulate activation logic
    // In a real app, this would call an API to validate and activate the code
    toast({
      title: t("激活成功", "Activation Successful"),
      description: t("您的套餐已成功激活", "Your plan has been successfully activated"),
    })
    setIsActivateDialogOpen(false)
    setActivationCode("")
    // 重新获取数据
    if (userId) {
      fetchDashboardData(userId)
    }
  }

  const handleGetNewPlan = () => {
    router.push("/pricing")
  }

  const handleLogout = async () => {
    try {
      // 调用后端logout接口清除Sa-Token session
      await authApi.logout()
    } catch (error) {
      console.error("后端登出失败:", error)
      // 即使后端登出失败,也继续清除前端数据
    } finally {
      // 清除localStorage
      localStorage.clear()
      toast({
        title: t("已退出登录", "Logged Out"),
        description: t("您已成功退出登录", "You have been successfully logged out"),
      })
      router.push("/")
    }
  }

  const handleShowEmail = () => {
    setIsEmailDialogOpen(true)
  }

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(userEmail)
      toast({
        title: t("复制成功", "Copied Successfully"),
        description: t("邮箱已复制到剪贴板", "Email has been copied to clipboard"),
      })
    } catch (error) {
      toast({
        title: t("复制失败", "Copy Failed"),
        description: t("无法复制到剪贴板", "Failed to copy to clipboard"),
        variant: "destructive",
      })
    }
  }

  const handleEmailSupport = () => {
    setIsSupportDialogOpen(true)
  }

  const handleSendEmail = () => {
    const supportEmail = "1429703318@qq.com"
    const subject = encodeURIComponent("AiClaude 技术支持")
    const body = encodeURIComponent(`
您好，

我需要技术支持。

用户邮箱: ${userEmail}
问题描述: [请在此描述您的问题]

感谢！
`)
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`
    setIsSupportDialogOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-12 py-8 page-transition">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            {t("欢迎回来", "Welcome back")}, {userEmail}
          </h1>
          <p className="text-gray-600 text-lg">
            {t(
              "管理您的API密钥、查看使用统计和配置设置",
              "Manage your API keys, view usage statistics and configure settings",
            )}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200/50 p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:border-cyan-200 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-medium text-gray-600 group-hover:text-cyan-600 transition-colors">{stat.title}</span>
                <div className="p-3 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl group-hover:from-cyan-100 group-hover:to-blue-100 transition-colors">
                  <stat.icon className="w-5 h-5 text-cyan-600" />
                </div>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              {stat.subtitle && <div className="text-sm text-gray-500">{stat.subtitle}</div>}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* API Key Management */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200/50 p-8 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg">
                  <Key className="w-5 h-5 text-cyan-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{t("API密钥管理", "API Key Management")}</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                {t("管理您的API密钥和配置", "Manage your API keys and configuration")}
              </p>

              {apiKey ? (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-900 font-medium break-all">
                      {apiKey.substring(0, 9)}...{apiKey.substring(apiKey.length - 4)}
                    </code>
                    <button
                      onClick={handleCopyKey}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-600 hover:text-cyan-700 hover:bg-white rounded-lg transition-all font-medium"
                    >
                      <Copy className="w-4 h-4" />
                      {t("复制", "Copy")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
                  <div className="text-center text-gray-500 text-sm">
                    {t("暂无API密钥", "No API key available")}
                  </div>
                </div>
              )}

              <button
                onClick={handleManageKeys}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 transition-all"
              >
                <Settings className="w-4 h-4" />
                {t("管理密钥", "Manage Keys")}
              </button>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200/50 p-8 hover:shadow-lg transition-all">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t("快速导航", "Quick Navigation")}</h2>
              <p className="text-sm text-gray-600 mb-6">{t("常用功能入口", "Common Features")}</p>

              <div className="space-y-2">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="flex items-center gap-3 px-5 py-4 rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all group border border-transparent hover:border-cyan-100"
                  >
                    <div className="p-2 bg-gray-100 group-hover:bg-white rounded-lg transition-colors">
                      <link.icon className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-cyan-600 transition-colors">{link.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Account Information and Plan Management sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Account Information */}
          <div className="bg-white rounded-2xl border border-gray-200/50 p-8 hover:shadow-lg transition-all">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t("账户信息", "Account Information")}</h2>
            <p className="text-sm text-gray-600 mb-6">
              {t("您的账户详情和使用情况", "Your account details and usage")}
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <span className="text-sm text-gray-600">{t("邮箱", "Email")}</span>
                <button
                  onClick={handleShowEmail}
                  className="text-sm font-medium text-cyan-600 hover:text-cyan-700 transition-colors flex items-center gap-2"
                >
                  {userEmail}
                  <Mail className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <span className="text-sm text-gray-600">{t("注册时间", "Registration Time")}</span>
                <span className="text-sm font-medium text-gray-900">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <span className="text-sm text-gray-600">{t("日度预算", "Daily Budget")}</span>
                <span className="text-sm font-medium text-gray-900">
                  {loading
                    ? "..."
                    : currentMembership && currentMembership.dailyUsage !== undefined
                      ? `$${currentMembership.dailyUsage.toFixed(2)}`
                      : remainingQuota && remainingQuota.dailyLimit !== undefined
                        ? `$${remainingQuota.dailyLimit.toFixed(2)}`
                        : "$0.00"}
                </span>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <span className="text-sm text-gray-600">{t("今日已用", "Today's Usage")}</span>
                <span className="text-sm font-medium text-cyan-600">
                  {loading ? "..." : (remainingQuota && remainingQuota.todayCost !== undefined) ? `$${remainingQuota.todayCost.toFixed(4)}` : "$0.00"}
                </span>
              </div>
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-gray-600">{t("本月已用", "This Month Used")}</span>
                <span className="text-sm font-medium text-cyan-600">
                  {loading ? "..." : `$${monthTotalCost.toFixed(4)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Plan Management */}
          <div className="bg-white rounded-2xl border border-gray-200/50 p-8 hover:shadow-lg transition-all">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t("套餐管理", "Plan Management")}</h2>
            <p className="text-sm text-gray-600 mb-6">
              {t("管理您的订阅和激活码", "Manage your subscriptions and activation codes")}
            </p>

            <button
              onClick={handleActivatePlan}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-4 rounded-xl mb-6 transition-all shadow-lg shadow-cyan-500/20 hover:shadow-xl hover:shadow-cyan-500/30"
            >
              {t("激活套餐", "Activate Plan")}
            </button>

            <div className="space-y-4">
              {!loading && currentMembership ? (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{currentMembership.levelName || currentMembership.membershipName}</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                        {t("活跃", "Active")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{t("周期开始", "Cycle Start")}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(currentMembership.startTime).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{t("周期结束", "Cycle End")}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(currentMembership.expireTime).toLocaleDateString()}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">{t("目前暂无套餐", "No active plan")}</p>
                      <p className="text-xs text-gray-400">{t("请激活套餐以使用服务", "Please activate a plan to use the service")}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{t("周期开始", "Cycle Start")}</span>
                    <span className="text-sm font-medium text-gray-900">—</span>
                  </div>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{t("周期结束", "Cycle End")}</span>
                    <span className="text-sm font-medium text-gray-900">—</span>
                  </div>
                </>
              )}

              <button
                onClick={handleGetNewPlan}
                className="w-full text-center text-sm text-cyan-600 hover:text-cyan-700 font-medium py-3 rounded-xl hover:bg-cyan-50 transition-all"
              >
                {t("获取新套餐", "Get New Plan")}
              </button>
            </div>
          </div>
        </div>

        {/* Support and Help section */}
        <div className="bg-white rounded-2xl border border-gray-200/50 p-8 mt-8 hover:shadow-lg transition-all">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("支持和帮助", "Support and Help")}</h2>
          <p className="text-sm text-gray-600 mb-6">
            {t("获取帮助和联系支持团队", "Get help and contact support team")}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/docs"
              className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 transition-all"
            >
              {t("使用文档", "Documentation")}
            </Link>
            <button
              onClick={handleEmailSupport}
              className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 transition-all"
            >
              {t("邮件支持", "Email Support")}
            </button>
            <button
              onClick={() => window.open('https://qm.qq.com/q/W5Mv4jBfkO', '_blank')}
              className="flex items-center justify-center px-6 py-4 border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-gray-300 transition-all"
            >
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
            <DialogDescription>
              {t("请输入您的激活码以激活套餐", "Please enter your activation code to activate the plan")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="activation-code" className="block text-sm font-medium text-gray-700 mb-2">
              {t("激活码", "Activation Code")}
            </label>
            <input
              id="activation-code"
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmActivation()
                }
              }}
              placeholder={t("例如：PACK-XXXX-XXXX-XXXX", "e.g., PACK-XXXX-XXXX-XXXX")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
          <DialogFooter>
            <button
              onClick={handleConfirmActivation}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20"
            >
              {t("激活", "Activate")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-600" />
              {t("邮箱地址", "Email Address")}
            </DialogTitle>
            <DialogDescription>
              {t("您的注册邮箱地址", "Your registered email address")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <p className="text-center text-lg font-mono font-medium text-gray-900">{userEmail}</p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <button
              onClick={handleCopyEmail}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              {t("复制邮箱", "Copy Email")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Support Dialog */}
      <Dialog open={isSupportDialogOpen} onOpenChange={setIsSupportDialogOpen}>
        <DialogContent className="sm:max-w-lg" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-cyan-600" />
              {t("邮件支持", "Email Support")}
            </DialogTitle>
            <DialogDescription>
              {t("联系我们的技术支持团队", "Contact our technical support team")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <Mail className="w-6 h-6 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {t("技术支持邮箱", "Support Email")}
                  </h3>
                  <p className="text-lg font-mono font-semibold text-cyan-600 mb-3">1429703318@qq.com</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-xs text-gray-500 mb-2">{t("请使用您的这个邮箱发送", "Please send using your email")}:</p>
              <p className="text-sm font-medium text-gray-900">{userEmail}</p>
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsSupportDialogOpen(false)}
              className="w-full px-6 py-3 border-2 border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all"
            >
              {t("取消", "Cancel")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
