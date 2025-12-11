"use client"

import type React from "react"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { apiKeyApi, userApi, type ApiKeyData, type ApiKeyUsageStats, ApiError } from "@/lib/api"
import {
  Key,
  TrendingUp,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface APIKey {
  id: number
  key: string
  fullKey: string
  created: string
  lastUsed: string
  expires: string
}

export default function APIManagementPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [isCreatingKey, setIsCreatingKey] = useState(false)
  const [newCreatedKey, setNewCreatedKey] = useState<ApiKeyData | null>(null)
  const [isKeyDisplayModalOpen, setIsKeyDisplayModalOpen] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState("7")
  const [isTimeRangeDropdownOpen, setIsTimeRangeDropdownOpen] = useState(false)
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false)

  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

  const [apiKeys, setApiKeys] = useState<APIKey[]>([])
  const [isLoadingKeys, setIsLoadingKeys] = useState(true)
  const [usageStatsData, setUsageStatsData] = useState<ApiKeyUsageStats[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  // Helper function to convert backend API key data to frontend format
  const convertApiKeyData = (backendKey: ApiKeyData): APIKey => {
    const keyPreview = backendKey.apiKey
      ? `${backendKey.apiKey.substring(0, 9)}...${backendKey.apiKey.substring(backendKey.apiKey.length - 3)}`
      : ""

    return {
      id: backendKey.id,
      key: keyPreview,
      fullKey: backendKey.apiKey,
      created: backendKey.createdAt ? new Date(backendKey.createdAt).toLocaleString() : "",
      lastUsed: backendKey.lastUsedTime ? new Date(backendKey.lastUsedTime).toLocaleString() : t("从未使用", "Never used"),
      expires: backendKey.expirationTime ? new Date(backendKey.expirationTime).toLocaleString() : t("永不过期", "Never expires"),
    }
  }

  // Fetch API keys from backend
  const fetchApiKeys = async () => {
    if (!userId) {
      console.log("fetchApiKeys: userId is empty, skipping")
      return
    }

    console.log("fetchApiKeys: fetching keys for userId:", userId)
    setIsLoadingKeys(true)
    try {
      const keys = await apiKeyApi.getUserApiKeys(userId)
      console.log("fetchApiKeys: received keys from backend:", keys)
      const convertedKeys = keys.map(convertApiKeyData)
      console.log("fetchApiKeys: converted keys:", convertedKeys)
      setApiKeys(convertedKeys)
    } catch (error) {
      console.error("Failed to fetch API keys:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError
          ? error.message
          : t("无法加载API密钥列表", "Failed to load API key list"),
        variant: "destructive",
      })
    } finally {
      setIsLoadingKeys(false)
    }
  }

  // Fetch usage statistics from backend
  const fetchUsageStats = async () => {
    if (!userId) return

    setIsLoadingStats(true)
    try {
      const days = Number.parseInt(selectedTimeRange)
      const stats = await apiKeyApi.getUserApiKeyUsageStats(userId, days)
      setUsageStatsData(stats)
    } catch (error) {
      console.error("Failed to fetch usage stats:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError
          ? error.message
          : t("无法加载使用统计", "Failed to load usage statistics"),
        variant: "destructive",
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  const timeRangeOptions = [
    { value: "1", label: t("今天", "Today") },
    { value: "3", label: t("最近 3 天", "Last 3 days") },
    { value: "7", label: t("最近 7 天", "Last 7 days") },
    { value: "14", label: t("最近 14 天", "Last 14 days") },
    { value: "30", label: t("最近 30 天", "Last 30 days") },
    { value: "60", label: t("最近 60 天", "Last 60 days") },
    { value: "90", label: t("最近 90 天", "Last 90 days") },
    { value: "180", label: t("最近 6 个月", "Last 6 months") },
    { value: "365", label: t("最近 1 年", "Last 1 year") },
  ]

  // Simplified create key function - directly calls backend, no modal
  const handleCreateKey = async () => {
    if (!userId) {
      toast({
        title: t("创建失败", "Creation Failed"),
        description: t("用户信息缺失", "User information is missing"),
        variant: "destructive",
      })
      return
    }

    setIsCreatingKey(true)
    try {
      // Call backend API to create key (no name needed)
      await apiKeyApi.createApiKey(userId)

      // Show success toast
      toast({
        title: t("创建成功", "Created Successfully"),
        description: t("密钥已创建,请在列表中查看", "API key created successfully, check the list below"),
      })

      // Refresh the lists
      await fetchApiKeys()
      await fetchUsageStats()
    } catch (error) {
      console.error("Failed to create API key:", error)
      toast({
        title: t("创建失败", "Creation Failed"),
        description: error instanceof ApiError
          ? error.message
          : t("无法创建API密钥", "Failed to create API key"),
        variant: "destructive",
      })
    } finally {
      setIsCreatingKey(false)
    }
  }

  // Handle copying the newly created key
  const handleCopyNewKey = async () => {
    if (!newCreatedKey) return

    try {
      await navigator.clipboard.writeText(newCreatedKey.apiKey)
      toast({
        title: t("复制成功", "Copied Successfully"),
        description: t("密钥已复制到剪贴板", "API key copied to clipboard"),
      })
    } catch (error) {
      toast({
        title: t("复制失败", "Copy Failed"),
        description: t("无法复制到剪贴板", "Failed to copy to clipboard"),
        variant: "destructive",
      })
    }
  }

  // Close the key display modal
  const handleCloseKeyDisplayModal = () => {
    setIsKeyDisplayModalOpen(false)
    setNewCreatedKey(null)
  }

  const handleTimeRangeSelect = (value: string) => {
    setSelectedTimeRange(value)
    setIsTimeRangeDropdownOpen(false)
  }

  const currentTimeRangeLabel =
    timeRangeOptions.find((option) => option.value === selectedTimeRange)?.label || t("最近 7 天", "Last 7 days")

  const usageStats = useMemo(() => {
    return usageStatsData.map((stat) => {
      // Mask the API key for display
      const maskedKey = stat.apiKey
        ? `${stat.apiKey.substring(0, 9)}...${stat.apiKey.substring(stat.apiKey.length - 3)}`
        : t("未命名", "Unnamed")

      return {
        maskedKey,
        fullKey: stat.apiKey || "",
        tokens: (stat.totalTokens ?? 0).toLocaleString(),
        cost: `$${(stat.totalCost ?? 0).toFixed(6)}`,
        firstUsed: stat.firstUsed || t("未使用", "Not used"),
        lastUsed: stat.lastUsed || t("未使用", "Not used"),
      }
    })
  }, [usageStatsData, t])

  const totals = useMemo(() => {
    const totalTokens = usageStatsData.reduce((sum, stat) => sum + (stat.totalTokens ?? 0), 0)
    const totalCost = usageStatsData.reduce((sum, stat) => sum + (stat.totalCost ?? 0), 0)

    // Calculate first and last used times across all keys
    const allFirstUsed = usageStatsData.filter(s => s.firstUsed).map(s => new Date(s.firstUsed!).getTime())
    const allLastUsed = usageStatsData.filter(s => s.lastUsed).map(s => new Date(s.lastUsed!).getTime())
    const firstUsedTime = allFirstUsed.length > 0 ? new Date(Math.min(...allFirstUsed)).toLocaleString() : t("未使用", "Not used")
    const lastUsedTime = allLastUsed.length > 0 ? new Date(Math.max(...allLastUsed)).toLocaleString() : t("未使用", "Not used")

    return {
      tokens: totalTokens.toLocaleString(),
      cost: `$${totalCost.toFixed(6)}`,
      firstUsed: firstUsedTime,
      lastUsed: lastUsedTime,
    }
  }, [usageStatsData, t])

  useEffect(() => {
    setMounted(true)
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    const email = localStorage.getItem("userEmail")

    if (!isLoggedIn) {
      router.push("/")
      return
    }

    if (email) {
      setUserEmail(email)
      // Fetch user ID from backend using email
      userApi.getUserByEmail(email).then((user) => {
        setUserId(user.id)
      }).catch((error) => {
        console.error("Failed to fetch user info:", error)
        toast({
          title: t("加载失败", "Loading Failed"),
          description: t("无法获取用户信息", "Failed to get user information"),
          variant: "destructive",
        })
      })
    }
  }, [router, toast, t])

  // Fetch API keys when userId is available
  useEffect(() => {
    if (userId) {
      fetchApiKeys()
    }
  }, [userId])

  // Fetch usage stats when userId or time range changes
  useEffect(() => {
    if (userId) {
      fetchUsageStats()
    }
  }, [userId, selectedTimeRange])

  const handleViewKey = (key: APIKey) => {
    setSelectedKey(key)
    setIsViewDialogOpen(true)
  }

  const handleCopyKey = async (key: APIKey) => {
    try {
      await navigator.clipboard.writeText(key.fullKey)
      toast({
        title: t("复制成功", "Copied Successfully"),
        description: t("密钥已复制到剪贴板", "API key copied to clipboard"),
      })
    } catch (error) {
      toast({
        title: t("复制失败", "Copy Failed"),
        description: t("无法复制到剪贴板", "Failed to copy to clipboard"),
        variant: "destructive",
      })
    }
  }

  const handleDeleteKey = (key: APIKey) => {
    setSelectedKey(key)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteKey = async () => {
    if (!selectedKey) return

    try {
      // Call backend API to delete key
      await apiKeyApi.deleteApiKey(selectedKey.fullKey)

      // Remove from local state
      setApiKeys((prevKeys) => prevKeys.filter((key) => key.id !== selectedKey.id))

      toast({
        title: t("删除成功", "Deleted Successfully"),
        description: t("密钥已被删除", "API key has been deleted"),
      })

      // Refresh the list from backend
      await fetchApiKeys()
      await fetchUsageStats()
    } catch (error) {
      console.error("Failed to delete API key:", error)
      toast({
        title: t("删除失败", "Deletion Failed"),
        description: error instanceof ApiError
          ? error.message
          : t("无法删除API密钥", "Failed to delete API key"),
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedKey(null)
    }
  }

  const toggleKeyVisibility = (keyName: string) => {
    setRevealedKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(keyName)) {
        newSet.delete(keyName)
      } else {
        newSet.add(keyName)
      }
      return newSet
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userEmail")
    toast({
      title: t("已退出登录", "Logged Out"),
      description: t("您已成功退出登录", "You have been successfully logged out"),
    })
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <DashboardHeader userEmail={userEmail} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-12 py-8 page-transition">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("API管理", "API Management")}</h1>
          <p className="text-gray-600">
            {t("管理您的API密钥、权限设置和访问控制", "Manage your API keys, permission settings and access control")}
          </p>
        </div>

        {/* API Key Usage Statistics */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">{t("API Key 使用统计", "API Key Usage Statistics")}</h2>
              </div>
              <p className="text-sm text-gray-600">
                {t("查看各个 API Key 的使用情况和费用", "View usage and costs for each API Key")}
              </p>
            </div>

            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setIsTimeRangeDropdownOpen(!isTimeRangeDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Calendar className="w-4 h-4" />
                {currentTimeRangeLabel}
              </button>
              <button
                onClick={() => setIsTimeRangeDropdownOpen(!isTimeRangeDropdownOpen)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ChevronDown className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {isStatsCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-gray-700" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-gray-700" />
                )}
              </button>

              {isTimeRangeDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {timeRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleTimeRangeSelect(option.value)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        selectedTimeRange === option.value ? "bg-cyan-50 text-cyan-700 font-medium" : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isStatsCollapsed && (
            <div className="overflow-x-auto">
              {isLoadingStats ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-gray-500">{t("加载中...", "Loading...")}</div>
                </div>
              ) : usageStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <TrendingUp className="w-12 h-12 mb-4 text-gray-300" />
                  <p>{t("暂无使用统计数据", "No usage statistics available")}</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-1">
                          <Key className="w-4 h-4" />
                          {t("密钥", "API Key")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-1">
                          <span></span>
                          {t("总 Tokens", "Total Tokens")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-1">
                          <span>💰</span>
                          {t("总费用", "Total Cost")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        {t("首次使用", "First Used")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        {t("最后使用", "Last Used")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usageStats.map((stat, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <code className="text-sm font-mono text-gray-700">{stat.maskedKey}</code>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-700">{stat.tokens}</td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-900">{stat.cost}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{stat.firstUsed}</td>
                        <td className="py-4 px-4 text-sm text-gray-600">{stat.lastUsed}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="py-4 px-4 text-sm text-gray-900">{t("总计", "Total")}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{totals.tokens}</td>
                      <td className="py-4 px-4 text-sm text-gray-900">{totals.cost}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{totals.firstUsed}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{totals.lastUsed}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* API Key List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{t("API密钥列表", "API Key List")}</h2>
              <p className="text-sm text-gray-600">
                {t(`当前共有 ${apiKeys.length} 个活跃的API密钥`, `Currently ${apiKeys.length} active API keys`)}
              </p>
            </div>

            <button
              onClick={handleCreateKey}
              disabled={isCreatingKey}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreatingKey ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {t("创建中...", "Creating...")}
                </>
              ) : (
                <>
                  <span className="text-lg">+</span>
                  {t("创建新密钥", "Create New Key")}
                </>
              )}
            </button>
          </div>

          {/* API Key List Table */}
          <div className="overflow-x-auto">
            {isLoadingKeys ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">{t("加载中...", "Loading...")}</div>
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Key className="w-12 h-12 mb-4 text-gray-300" />
                <p>{t("暂无API密钥", "No API keys available")}</p>
                <p className="text-sm mt-2">{t("点击上方按钮创建新密钥", "Click the button above to create a new key")}</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      {t("密钥预览", "Key Preview")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      {t("创建时间", "Created Time")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      {t("最后使用", "Last Used")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      {t("过期时间", "Expiration Time")}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">{t("操作", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-gray-700">
                            {revealedKeys.has(String(key.id)) ? key.fullKey : key.key}
                          </code>
                          <button onClick={() => toggleKeyVisibility(String(key.id))} className="p-1 hover:bg-gray-100 rounded">
                            {revealedKeys.has(String(key.id)) ? (
                              <EyeOff className="w-4 h-4 text-gray-500" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">{key.created}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{key.lastUsed}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{key.expires}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewKey(key)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            {t("详细", "Details")}
                          </button>
                          <button
                            onClick={() => handleCopyKey(key)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                            {t("复制", "Copy")}
                          </button>
                          <button
                            onClick={() => handleDeleteKey(key)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            {t("删除", "Delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t("密钥详情", "Key Details")}</DialogTitle>
            <DialogDescription className="text-gray-600">
              {t("查看API密钥的详细信息", "View detailed information about the API key")}
            </DialogDescription>
          </DialogHeader>

          {selectedKey && (
            <div className="space-y-6 py-4">
              {/* API Key */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  {t("API密钥", "API Key")}
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sm font-mono text-gray-900 break-all">{selectedKey.fullKey}</code>
                    <button
                      onClick={() => handleCopyKey(selectedKey)}
                      className="p-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t("时间信息", "Time Information")}
                </h3>
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t("创建时间", "Created")}</p>
                    <p className="text-sm font-medium text-gray-900">{selectedKey.created}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t("最后使用", "Last Used")}</p>
                    <p className="text-sm font-medium text-gray-900">{selectedKey.lastUsed}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t("过期时间", "Expires")}</p>
                    <p className="text-sm font-medium text-gray-900">{selectedKey.expires}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              {t("关闭", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Key Display Modal */}
      <Dialog open={isKeyDisplayModalOpen} onOpenChange={setIsKeyDisplayModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">{t("密钥创建成功!", "API Key Created Successfully!")}</DialogTitle>
            <DialogDescription className="text-gray-600 text-center">
              {t("请妥善保存您的API密钥,关闭后将无法再次查看完整密钥", "Please save your API key securely. You won't be able to view the full key again after closing this dialog")}
            </DialogDescription>
          </DialogHeader>

          {newCreatedKey && (
            <div className="space-y-6 py-4">
              {/* API Key Display */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {t("API密钥", "API Key")}
                </h3>
                <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <code className="text-sm font-mono text-gray-900 break-all block mb-3">
                    {newCreatedKey.apiKey}
                  </code>
                  <Button
                    onClick={handleCopyNewKey}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {t("复制密钥", "Copy API Key")}
                  </Button>
                </div>
              </div>

              {/* Key Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {t("密钥信息", "Key Information")}
                </h3>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t("密钥ID", "Key ID")}</p>
                    <p className="text-sm font-medium text-gray-900">{newCreatedKey.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">{t("创建时间", "Created")}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {newCreatedKey.createdAt ? new Date(newCreatedKey.createdAt).toLocaleString() : t("刚刚", "Just now")}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 mb-1">{t("过期时间", "Expiration")}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {newCreatedKey.expirationTime
                        ? new Date(newCreatedKey.expirationTime).toLocaleString()
                        : t("永不过期", "Never expires")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    {t(
                      "请立即复制并保存此密钥。关闭此对话框后,您将无法再次查看完整的密钥内容。",
                      "Please copy and save this key immediately. After closing this dialog, you will not be able to view the complete key again."
                    )}
                  </span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseKeyDisplayModal} className="w-full bg-gray-600 hover:bg-gray-700 text-white">
              {t("我已保存,关闭", "I've Saved It, Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("确认删除密钥", "Confirm Delete Key")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "您确定要删除此密钥吗？此操作无法撤销,使用此密钥的应用将无法继续访问API。",
                "Are you sure you want to delete this key? This action cannot be undone and applications using this key will no longer be able to access the API.",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("取消", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteKey}>{t("确认删除", "Confirm Delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
