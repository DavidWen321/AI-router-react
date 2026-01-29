"use client"

import { useState, useEffect, useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import { Link2, Search, X, RefreshCw, Users, Server, Layers, Activity, Settings, Unlink, Plus, AlertCircle, Zap, ArrowRightLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  proxyConfigApi,
  type ProxyBindingOverviewVO,
  type ProxyBindingStatsVO,
  type AccountProxyBindingVO,
  type ProxyConfigVO,
  type AutoDistributeResult,
  type FailoverResult,
  ApiError
} from "@/lib/api"

// Helper function to get load status based on usage rate
function getLoadStatus(usageRate: number, t: (zh: string, en: string) => string) {
  if (usageRate === 0) {
    return { label: t("空闲", "Idle"), color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" }
  } else if (usageRate <= 50) {
    return { label: t("正常", "Normal"), color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" }
  } else if (usageRate <= 80) {
    return { label: t("较忙", "Busy"), color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" }
  } else if (usageRate < 100) {
    return { label: t("繁忙", "Heavy"), color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
  } else {
    return { label: t("已满", "Full"), color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
  }
}

// Helper function to get progress bar color class
function getProgressColor(usageRate: number) {
  if (usageRate === 0) return "[&>div]:bg-gray-400"
  if (usageRate <= 50) return "[&>div]:bg-green-500"
  if (usageRate <= 80) return "[&>div]:bg-orange-500"
  return "[&>div]:bg-red-500"
}

export default function ProxyBindingPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  // Data states
  const [proxyOverview, setProxyOverview] = useState<ProxyBindingOverviewVO[]>([])
  const [proxyConfigs, setProxyConfigs] = useState<ProxyConfigVO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<"all" | "enabled" | "disabled">("all")
  const [loadFilter, setLoadFilter] = useState<"all" | "idle" | "normal" | "busy" | "full">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog states
  const [isBindingDetailOpen, setIsBindingDetailOpen] = useState(false)
  const [isAddBindingOpen, setIsAddBindingOpen] = useState(false)
  const [isBatchBindOpen, setIsBatchBindOpen] = useState(false)
  const [selectedProxyId, setSelectedProxyId] = useState<number | null>(null)
  const [selectedProxyStats, setSelectedProxyStats] = useState<ProxyBindingStatsVO | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)

  // Add binding form states
  const [addBindingPoolType, setAddBindingPoolType] = useState<"main" | "backup">("main")
  const [addBindingAccountId, setAddBindingAccountId] = useState("")
  const [isAddingBinding, setIsAddingBinding] = useState(false)

  // Batch bind form states
  const [batchBindProxyId, setBatchBindProxyId] = useState<string>("")
  const [batchBindPoolType, setBatchBindPoolType] = useState<"main" | "backup">("main")
  const [batchBindAccountIds, setBatchBindAccountIds] = useState("")
  const [isBatchBinding, setIsBatchBinding] = useState(false)

  // Auto distribute states
  const [isAutoDistributeOpen, setIsAutoDistributeOpen] = useState(false)
  const [isAutoDistributing, setIsAutoDistributing] = useState(false)

  // Failover states
  const [isFailoverOpen, setIsFailoverOpen] = useState(false)
  const [failoverProxyId, setFailoverProxyId] = useState<number | null>(null)
  const [failoverProxyName, setFailoverProxyName] = useState<string>("")
  const [isFailovering, setIsFailovering] = useState(false)

  // Fetch proxy overview data
  const fetchProxyOverview = async () => {
    setIsLoading(true)
    try {
      const data = await proxyConfigApi.getBindingOverview()
      setProxyOverview(data)
    } catch (error) {
      console.error("Failed to fetch proxy overview:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError ? error.message : t("无法加载代理绑定概览", "Failed to load proxy binding overview"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch all proxy configs for batch bind dialog
  const fetchProxyConfigs = async () => {
    try {
      const data = await proxyConfigApi.listAll()
      setProxyConfigs(data)
    } catch (error) {
      console.error("Failed to fetch proxy configs:", error)
    }
  }

  // Fetch binding stats for a specific proxy
  const fetchBindingStats = async (proxyId: number) => {
    setIsLoadingStats(true)
    try {
      const stats = await proxyConfigApi.getBindingStats(proxyId)
      setSelectedProxyStats(stats)
    } catch (error) {
      console.error("Failed to fetch binding stats:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError ? error.message : t("无法加载绑定详情", "Failed to load binding details"),
        variant: "destructive",
      })
    } finally {
      setIsLoadingStats(false)
    }
  }

  // Handle refresh data
  const handleRefreshData = async () => {
    setIsRefreshing(true)
    try {
      await fetchProxyOverview()
      toast({
        title: t("刷新成功", "Refresh Successful"),
        description: t("数据已更新", "Data has been updated"),
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle sync binding counts
  const handleSyncCounts = async () => {
    setIsSyncing(true)
    try {
      await proxyConfigApi.syncBindingCounts()
      await fetchProxyOverview()
      toast({
        title: t("同步成功", "Sync Successful"),
        description: t("绑定计数已同步", "Binding counts have been synchronized"),
      })
    } catch (error) {
      console.error("Failed to sync binding counts:", error)
      toast({
        title: t("同步失败", "Sync Failed"),
        description: error instanceof ApiError ? error.message : t("无法同步绑定计数", "Failed to sync binding counts"),
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  // Handle manage button click
  const handleManageClick = async (proxyId: number) => {
    setSelectedProxyId(proxyId)
    setIsBindingDetailOpen(true)
    await fetchBindingStats(proxyId)
  }

  // Handle add binding
  const handleAddBinding = async () => {
    if (!selectedProxyId || !addBindingAccountId.trim()) {
      toast({
        title: t("输入错误", "Input Error"),
        description: t("请输入账号ID", "Please enter account ID"),
        variant: "destructive",
      })
      return
    }

    const accountId = parseInt(addBindingAccountId.trim())
    if (isNaN(accountId)) {
      toast({
        title: t("输入错误", "Input Error"),
        description: t("账号ID必须是数字", "Account ID must be a number"),
        variant: "destructive",
      })
      return
    }

    setIsAddingBinding(true)
    try {
      await proxyConfigApi.bindAccount(accountId, addBindingPoolType, selectedProxyId)
      toast({
        title: t("绑定成功", "Binding Successful"),
        description: t("账号已绑定到代理", "Account has been bound to proxy"),
      })
      setAddBindingAccountId("")
      setIsAddBindingOpen(false)
      // Refresh binding stats
      await fetchBindingStats(selectedProxyId)
      await fetchProxyOverview()
    } catch (error) {
      console.error("Failed to bind account:", error)
      toast({
        title: t("绑定失败", "Binding Failed"),
        description: error instanceof ApiError ? error.message : t("无法绑定账号到代理", "Failed to bind account to proxy"),
        variant: "destructive",
      })
    } finally {
      setIsAddingBinding(false)
    }
  }

  // Handle unbind account
  const handleUnbindAccount = async (accountId: number, poolType: string) => {
    try {
      await proxyConfigApi.unbindAccount(accountId, poolType)
      toast({
        title: t("解绑成功", "Unbind Successful"),
        description: t("账号已从代理解绑", "Account has been unbound from proxy"),
      })
      // Refresh binding stats
      if (selectedProxyId) {
        await fetchBindingStats(selectedProxyId)
      }
      await fetchProxyOverview()
    } catch (error) {
      console.error("Failed to unbind account:", error)
      toast({
        title: t("解绑失败", "Unbind Failed"),
        description: error instanceof ApiError ? error.message : t("无法解绑账号", "Failed to unbind account"),
        variant: "destructive",
      })
    }
  }

  // Handle batch bind
  const handleBatchBind = async () => {
    if (!batchBindProxyId || !batchBindAccountIds.trim()) {
      toast({
        title: t("输入错误", "Input Error"),
        description: t("请选择代理并输入账号ID", "Please select proxy and enter account IDs"),
        variant: "destructive",
      })
      return
    }

    const accountIdStrings = batchBindAccountIds.split(",").map(s => s.trim()).filter(s => s)
    const accountIds = accountIdStrings.map(s => parseInt(s)).filter(n => !isNaN(n))

    if (accountIds.length === 0) {
      toast({
        title: t("输入错误", "Input Error"),
        description: t("没有有效的账号ID", "No valid account IDs"),
        variant: "destructive",
      })
      return
    }

    setIsBatchBinding(true)
    try {
      const result = await proxyConfigApi.batchBind({
        accountIds,
        poolType: batchBindPoolType,
        proxyConfigId: parseInt(batchBindProxyId),
      })

      if (result.failed > 0) {
        toast({
          title: t("部分绑定成功", "Partial Success"),
          description: t(
            `成功: ${result.success}, 失败: ${result.failed}`,
            `Success: ${result.success}, Failed: ${result.failed}`
          ),
          variant: "destructive",
        })
      } else {
        toast({
          title: t("批量绑定成功", "Batch Binding Successful"),
          description: t(`成功绑定 ${result.success} 个账号`, `Successfully bound ${result.success} accounts`),
        })
      }

      setBatchBindAccountIds("")
      setIsBatchBindOpen(false)
      await fetchProxyOverview()
    } catch (error) {
      console.error("Failed to batch bind:", error)
      toast({
        title: t("批量绑定失败", "Batch Binding Failed"),
        description: error instanceof ApiError ? error.message : t("无法批量绑定账号", "Failed to batch bind accounts"),
        variant: "destructive",
      })
    } finally {
      setIsBatchBinding(false)
    }
  }

  // Handle auto distribute
  const handleAutoDistribute = async () => {
    setIsAutoDistributing(true)
    try {
      const result = await proxyConfigApi.autoDistribute()
      toast({
        title: t("分配成功", "Distribution Successful"),
        description: t(
          `主池 ${result.mainBound} 个 + 备用池 ${result.backupBound} 个，分配到 ${result.proxyCount} 个代理`,
          `Main pool ${result.mainBound} + Backup pool ${result.backupBound}, distributed to ${result.proxyCount} proxies`
        ),
      })
      setIsAutoDistributeOpen(false)
      await fetchProxyOverview()
    } catch (error) {
      console.error("Failed to auto distribute:", error)
      toast({
        title: t("分配失败", "Distribution Failed"),
        description: error instanceof ApiError ? error.message : t("无法自动分配账号", "Failed to auto distribute accounts"),
        variant: "destructive",
      })
    } finally {
      setIsAutoDistributing(false)
    }
  }

  // Handle failover
  const handleFailover = async () => {
    if (!failoverProxyId) return

    setIsFailovering(true)
    try {
      const result = await proxyConfigApi.failoverProxy(failoverProxyId)
      toast({
        title: t("转移成功", "Failover Successful"),
        description: t(
          `已转移 ${result.transferred} 个账号到 ${result.targetProxyCount} 个代理`,
          `Transferred ${result.transferred} accounts to ${result.targetProxyCount} proxies`
        ),
      })
      setIsFailoverOpen(false)
      setFailoverProxyId(null)
      setFailoverProxyName("")
      await fetchProxyOverview()
    } catch (error) {
      console.error("Failed to failover:", error)
      toast({
        title: t("转移失败", "Failover Failed"),
        description: error instanceof ApiError ? error.message : t("无法执行故障转移", "Failed to execute failover"),
        variant: "destructive",
      })
    } finally {
      setIsFailovering(false)
    }
  }

  // Open failover dialog
  const openFailoverDialog = (proxyId: number, proxyName: string) => {
    setFailoverProxyId(proxyId)
    setFailoverProxyName(proxyName)
    setIsFailoverOpen(true)
  }

  // Clear filters
  const clearFilters = () => {
    setStatusFilter("all")
    setLoadFilter("all")
    setSearchQuery("")
  }

  // Check if any filter is active
  const hasActiveFilters = statusFilter !== "all" || loadFilter !== "all" || searchQuery !== ""

  // Filter data
  const filteredData = useMemo(() => {
    return proxyOverview.filter((proxy) => {
      // Status filter
      if (statusFilter === "enabled" && proxy.status !== 1) return false
      if (statusFilter === "disabled" && proxy.status !== 0) return false

      // Load filter
      const rate = proxy.usageRate
      if (loadFilter === "idle" && rate !== 0) return false
      if (loadFilter === "normal" && (rate === 0 || rate > 50)) return false
      if (loadFilter === "busy" && (rate <= 50 || rate >= 100)) return false
      if (loadFilter === "full" && rate < 100) return false

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchName = proxy.name.toLowerCase().includes(query)
        const matchAddress = `${proxy.host}:${proxy.port}`.toLowerCase().includes(query)
        if (!matchName && !matchAddress) return false
      }

      return true
    })
  }, [proxyOverview, statusFilter, loadFilter, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const totalProxies = proxyOverview.length
    const totalBindings = proxyOverview.reduce((sum, p) => sum + p.currentBindings, 0)
    const totalSlots = proxyOverview.reduce((sum, p) => sum + p.maxAccounts, 0)
    const availableSlots = proxyOverview.reduce((sum, p) => sum + p.availableSlots, 0)
    const avgLoadRate = totalSlots > 0
      ? (totalBindings / totalSlots * 100).toFixed(1)
      : "0.0"

    return { totalProxies, totalBindings, availableSlots, avgLoadRate }
  }, [proxyOverview])

  // Initial load
  useEffect(() => {
    fetchProxyOverview()
    fetchProxyConfigs()
  }, [])

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("代理绑定管理", "Proxy Binding")}
            </h1>
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {t(
            "管理IP代理与账号的绑定关系，每个代理最多绑定6个账号",
            "Manage IP proxy and account bindings, each proxy can bind up to 6 accounts"
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-purple-400 dark:hover:border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("代理总数", "Total Proxies")}</p>
            <Server className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalProxies}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-blue-400 dark:hover:border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("总绑定数", "Total Bindings")}</p>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalBindings}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-green-400 dark:hover:border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("可用位置", "Available Slots")}</p>
            <Layers className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.availableSlots}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-orange-400 dark:hover:border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("平均负载率", "Avg Load Rate")}</p>
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.avgLoadRate}%</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {t("搜索筛选", "Search & Filter")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("状态", "Status")}
            </label>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "enabled" | "disabled")}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("全部", "All")}</SelectItem>
                <SelectItem value="enabled">{t("启用", "Enabled")}</SelectItem>
                <SelectItem value="disabled">{t("禁用", "Disabled")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Load Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("负载状态", "Load Status")}
            </label>
            <Select value={loadFilter} onValueChange={(v) => setLoadFilter(v as "all" | "idle" | "normal" | "busy" | "full")}>
              <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("全部", "All")}</SelectItem>
                <SelectItem value="idle">{t("空闲", "Idle")}</SelectItem>
                <SelectItem value="normal">{t("正常", "Normal")}</SelectItem>
                <SelectItem value="busy">{t("较忙", "Busy")}</SelectItem>
                <SelectItem value="full">{t("已满", "Full")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("搜索", "Search")}
            </label>
            <Input
              placeholder={t("名称或地址...", "Name or address...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <X className="w-4 h-4 mr-1" />
                {t("清除筛选", "Clear Filters")}
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {t("找到", "Found")} {filteredData.length} {t("个代理", "proxies")}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 mb-4">
        <Button
          onClick={() => setIsAutoDistributeOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md"
        >
          <Zap className="w-4 h-4" />
          {t("一键分配", "Auto Distribute")}
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsBatchBindOpen(true)}
          className="flex items-center gap-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Users className="w-4 h-4" />
          {t("批量绑定", "Batch Bind")}
        </Button>
        <Button
          variant="outline"
          onClick={handleSyncCounts}
          disabled={isSyncing}
          className="flex items-center gap-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
          {t("同步计数", "Sync Counts")}
        </Button>
        <Button
          onClick={handleRefreshData}
          disabled={isRefreshing}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          {t("刷新数据", "Refresh Data")}
        </Button>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow hover:shadow-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">{t("加载中...", "Loading...")}</div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Link2 className="w-12 h-12 mb-4 text-gray-300" />
            <p>{t("暂无代理数据", "No proxy data available")}</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredData.map((proxy) => {
                  const loadStatus = getLoadStatus(proxy.usageRate, t)
                  return (
                    <div
                      key={proxy.id}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      {/* Top: Name + Status */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Server className="w-4 h-4 text-purple-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {proxy.name}
                          </span>
                        </div>
                        <Badge className={cn("flex-shrink-0", proxy.status === 1
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          {proxy.status === 1 ? t("启用", "Enabled") : t("禁用", "Disabled")}
                        </Badge>
                      </div>

                      {/* Address */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                        ID: {proxy.id} | {proxy.host}:{proxy.port}
                      </div>

                      {/* Bindings Info */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("绑定数", "Bindings")}</span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-white">
                            {proxy.currentBindings}/{proxy.maxAccounts}
                          </span>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("负载", "Load")}</span>
                          <span className={cn("text-xs font-semibold", loadStatus.color)}>
                            {loadStatus.label}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <Progress
                          value={proxy.usageRate}
                          className={cn("h-2", getProgressColor(proxy.usageRate))}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageClick(proxy.id)}
                          className="flex items-center gap-1"
                        >
                          <Settings className="w-3 h-3" />
                          {t("管理", "Manage")}
                        </Button>
                        {proxy.status === 1 && proxy.currentBindings > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openFailoverDialog(proxy.id, proxy.name)}
                            className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            {t("转移", "Failover")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100 w-[8%]">
                      {t("ID", "ID")}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100 w-[15%]">
                      {t("名称", "Name")}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100 w-[18%]">
                      {t("地址", "Address")}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100 w-[22%]">
                      {t("绑定数", "Bindings")}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100 w-[12%]">
                      {t("负载状态", "Load Status")}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100 w-[10%]">
                      {t("状态", "Status")}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-gray-100 w-[15%]">
                      {t("操作", "Actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredData.map((proxy) => {
                    const loadStatus = getLoadStatus(proxy.usageRate, t)
                    return (
                      <tr
                        key={proxy.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all hover:shadow-sm"
                      >
                        <td className="px-4 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                          {proxy.id}
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-center justify-center gap-2">
                            <Server className="w-4 h-4 text-purple-500" />
                            <span className="truncate">{proxy.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center text-sm font-mono text-gray-600 dark:text-gray-400">
                          {proxy.host}:{proxy.port}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                              {proxy.currentBindings}/{proxy.maxAccounts}
                            </span>
                            <Progress
                              value={proxy.usageRate}
                              className={cn("flex-1 h-2", getProgressColor(proxy.usageRate))}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                              {proxy.usageRate.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge className={loadStatus.color}>
                            {loadStatus.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge className={cn(
                            proxy.status === 1
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                          )}>
                            {proxy.status === 1 ? t("启用", "Enabled") : t("禁用", "Disabled")}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleManageClick(proxy.id)}
                              className="flex items-center gap-1 hover:border-purple-400 hover:text-purple-600"
                            >
                              <Settings className="w-4 h-4" />
                              {t("管理", "Manage")}
                            </Button>
                            {proxy.status === 1 && proxy.currentBindings > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openFailoverDialog(proxy.id, proxy.name)}
                                className="flex items-center gap-1 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                                {t("转移", "Failover")}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Binding Detail Dialog */}
      <Dialog open={isBindingDetailOpen} onOpenChange={setIsBindingDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-purple-500" />
              {t("绑定详情", "Binding Details")}
            </DialogTitle>
            <DialogDescription>
              {t("查看和管理此代理的账号绑定", "View and manage account bindings for this proxy")}
            </DialogDescription>
          </DialogHeader>

          {isLoadingStats ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">{t("加载中...", "Loading...")}</div>
            </div>
          ) : selectedProxyStats ? (
            <div className="space-y-6">
              {/* Proxy Info Header */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedProxyStats.proxyName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedProxyStats.host}:{selectedProxyStats.port}
                    </p>
                  </div>
                  <Badge className={getLoadStatus(selectedProxyStats.usageRate, t).color}>
                    {getLoadStatus(selectedProxyStats.usageRate, t).label}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedProxyStats.currentBindings}/{selectedProxyStats.maxAccounts} {t("已绑定", "bound")}
                  </span>
                  <Progress
                    value={selectedProxyStats.usageRate}
                    className={cn("flex-1 h-2", getProgressColor(selectedProxyStats.usageRate))}
                  />
                  <span className="text-xs text-gray-500">{selectedProxyStats.usageRate.toFixed(0)}%</span>
                </div>
              </div>

              {/* Bound Accounts List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {t("已绑定账号", "Bound Accounts")}
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => setIsAddBindingOpen(true)}
                    disabled={selectedProxyStats.availableSlots === 0}
                    className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-4 h-4" />
                    {t("添加绑定", "Add Binding")}
                  </Button>
                </div>

                {selectedProxyStats.bindings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>{t("暂无绑定账号", "No bound accounts")}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedProxyStats.bindings.map((binding) => (
                      <div
                        key={binding.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {t("账号", "Account")} #{binding.accountId}
                          </span>
                          <Badge className={cn(
                            binding.poolType === "main"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          )}>
                            {binding.poolType === "main" ? t("主池", "Main") : t("备用", "Backup")}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnbindAccount(binding.accountId, binding.poolType)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Unlink className="w-4 h-4 mr-1" />
                          {t("解绑", "Unbind")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("无数据", "No data")}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Binding Dialog */}
      <Dialog open={isAddBindingOpen} onOpenChange={setIsAddBindingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-500" />
              {t("添加绑定", "Add Binding")}
            </DialogTitle>
            <DialogDescription>
              {t("将账号绑定到当前代理", "Bind an account to the current proxy")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="poolType">{t("号池类型", "Pool Type")}</Label>
              <Select value={addBindingPoolType} onValueChange={(v) => setAddBindingPoolType(v as "main" | "backup")}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">{t("主池", "Main Pool")}</SelectItem>
                  <SelectItem value="backup">{t("备用池", "Backup Pool")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accountId">{t("账号ID", "Account ID")}</Label>
              <Input
                id="accountId"
                type="number"
                placeholder={t("输入账号ID", "Enter account ID")}
                value={addBindingAccountId}
                onChange={(e) => setAddBindingAccountId(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBindingOpen(false)}>
              {t("取消", "Cancel")}
            </Button>
            <Button
              onClick={handleAddBinding}
              disabled={isAddingBinding || !addBindingAccountId.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isAddingBinding ? t("绑定中...", "Binding...") : t("确认绑定", "Confirm Binding")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Bind Dialog */}
      <Dialog open={isBatchBindOpen} onOpenChange={setIsBatchBindOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              {t("批量绑定", "Batch Bind")}
            </DialogTitle>
            <DialogDescription>
              {t("将多个账号批量绑定到指定代理", "Batch bind multiple accounts to a specified proxy")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="targetProxy">{t("目标代理", "Target Proxy")}</Label>
              <Select value={batchBindProxyId} onValueChange={setBatchBindProxyId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t("选择代理", "Select proxy")} />
                </SelectTrigger>
                <SelectContent>
                  {proxyConfigs
                    .filter((p) => p.id !== undefined)
                    .map((proxy) => (
                      <SelectItem key={proxy.id} value={String(proxy.id)}>
                        {proxy.name} ({proxy.host}:{proxy.port})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="batchPoolType">{t("号池类型", "Pool Type")}</Label>
              <Select value={batchBindPoolType} onValueChange={(v) => setBatchBindPoolType(v as "main" | "backup")}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">{t("主池", "Main Pool")}</SelectItem>
                  <SelectItem value="backup">{t("备用池", "Backup Pool")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="batchAccountIds">{t("账号ID列表", "Account ID List")}</Label>
              <Textarea
                id="batchAccountIds"
                placeholder={t("输入账号ID，用逗号分隔\n例如: 1, 2, 3, 4", "Enter account IDs, separated by commas\ne.g.: 1, 2, 3, 4")}
                value={batchBindAccountIds}
                onChange={(e) => setBatchBindAccountIds(e.target.value)}
                className="mt-1.5 min-h-[100px]"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t("多个账号ID用逗号分隔", "Separate multiple account IDs with commas")}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchBindOpen(false)}>
              {t("取消", "Cancel")}
            </Button>
            <Button
              onClick={handleBatchBind}
              disabled={isBatchBinding || !batchBindProxyId || !batchBindAccountIds.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isBatchBinding ? t("绑定中...", "Binding...") : t("确认批量绑定", "Confirm Batch Bind")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Auto Distribute Confirmation Dialog */}
      <Dialog open={isAutoDistributeOpen} onOpenChange={setIsAutoDistributeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-500" />
              {t("一键自动分配", "Auto Distribute")}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t(
                "此操作将清空所有现有绑定，并把所有号池账号平均分配到启用的代理。",
                "This will clear all existing bindings and evenly distribute all accounts to enabled proxies."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800 dark:text-amber-200">
                  <p className="font-medium mb-1">{t("注意", "Note")}:</p>
                  <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300">
                    <li>{t("将清空所有现有绑定关系", "All existing bindings will be cleared")}</li>
                    <li>{t("主池和备用池账号将被平均分配", "Main and backup pool accounts will be evenly distributed")}</li>
                    <li>{t("如果代理数量不足，将强制平均分配（超过限制）", "If proxies are insufficient, forced even distribution will apply")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAutoDistributeOpen(false)}>
              {t("取消", "Cancel")}
            </Button>
            <Button
              onClick={handleAutoDistribute}
              disabled={isAutoDistributing}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isAutoDistributing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t("分配中...", "Distributing...")}
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  {t("确认分配", "Confirm Distribute")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Failover Confirmation Dialog */}
      <Dialog open={isFailoverOpen} onOpenChange={setIsFailoverOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-orange-500" />
              {t("故障转移", "Failover")}
            </DialogTitle>
            <DialogDescription className="text-base">
              {t(
                `确定要将代理 "${failoverProxyName}" 的所有账号转移到其他代理吗？`,
                `Transfer all accounts from proxy "${failoverProxyName}" to other proxies?`
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800 dark:text-orange-200">
                  <p className="font-medium mb-1">{t("转移说明", "Transfer Info")}:</p>
                  <ul className="list-disc list-inside space-y-1 text-orange-700 dark:text-orange-300">
                    <li>{t("该代理的所有绑定将被清除", "All bindings of this proxy will be removed")}</li>
                    <li>{t("账号将被平均分配到其他启用的代理", "Accounts will be evenly distributed to other enabled proxies")}</li>
                    <li>{t("适用于代理IP故障或维护场景", "Suitable for proxy IP failure or maintenance")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFailoverOpen(false)}>
              {t("取消", "Cancel")}
            </Button>
            <Button
              onClick={handleFailover}
              disabled={isFailovering}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isFailovering ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t("转移中...", "Transferring...")}
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  {t("确认转移", "Confirm Transfer")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
