"use client"

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { motion } from "framer-motion"
import { Globe, Search, Plus, Edit, Trash2, Eye, RefreshCw, Play, CheckCircle, XCircle, Wifi, WifiOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { proxyConfigApi, type ProxyConfigVO, type ProxyStatsVO, ApiError } from "@/lib/api"
import { CreateProxyDialog } from "./components/CreateProxyDialog"
import { EditProxyDialog } from "./components/EditProxyDialog"
import { DeleteProxyDialog } from "./components/DeleteProxyDialog"
import { ViewProxyDialog } from "./components/ViewProxyDialog"

export default function IpManagementPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  // 搜索筛选状态
  const [nameSearch, setNameSearch] = useState("")
  const [hostSearch, setHostSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "enabled" | "disabled">("all")

  // 代理配置数据状态
  const [proxyConfigs, setProxyConfigs] = useState<ProxyConfigVO[]>([])
  const [stats, setStats] = useState<ProxyStatsVO | null>(null)
  const [isTableLoading, setIsTableLoading] = useState(true)
  const [isStatsLoading, setIsStatsLoading] = useState(true)

  // 对话框状态
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedProxy, setSelectedProxy] = useState<ProxyConfigVO | null>(null)

  // 测试状态
  const [testingProxyId, setTestingProxyId] = useState<number | null>(null)

  // 获取代理配置列表
  const fetchProxyList = async () => {
    setIsTableLoading(true)
    try {
      const proxies = await proxyConfigApi.listAll()
      setProxyConfigs(proxies)
    } catch (error) {
      console.error("获取代理配置失败:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError ? error.message : t("无法加载代理配置列表", "Failed to load proxy config list"),
        variant: "destructive",
      })
    } finally {
      setIsTableLoading(false)
    }
  }

  const fetchProxyStats = async () => {
    setIsStatsLoading(true)
    try {
      const statsData = await proxyConfigApi.getStats()
      setStats(statsData)
    } catch (error) {
      console.error("获取代理统计失败:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError ? error.message : t("无法加载代理统计", "Failed to load proxy statistics"),
        variant: "destructive",
      })
    } finally {
      setIsStatsLoading(false)
    }
  }

  const fetchProxyPageData = async () => {
    await Promise.all([fetchProxyList(), fetchProxyStats()])
  }

  // 组件加载时获取数据
  useEffect(() => {
    fetchProxyPageData()
  }, [])

  // CRUD操作处理器
  const handleCreateSuccess = () => {
    fetchProxyPageData()
  }

  const handleEditClick = (proxy: ProxyConfigVO) => {
    setSelectedProxy(proxy)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    fetchProxyPageData()
  }

  const handleDeleteClick = (proxy: ProxyConfigVO) => {
    setSelectedProxy(proxy)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    fetchProxyPageData()
  }

  const handleViewClick = (proxy: ProxyConfigVO) => {
    setSelectedProxy(proxy)
    setIsViewDialogOpen(true)
  }

  // 测试代理连接
  const handleTestProxy = async (proxy: ProxyConfigVO) => {
    if (!proxy.id) return

    setTestingProxyId(proxy.id)
    try {
      const result = await proxyConfigApi.testProxy(proxy.id)
      if (result.success) {
        toast({
          title: t("连接成功", "Connection Successful"),
          description: t(`代理 ${proxy.name} 连接正常，延迟 ${result.duration}ms`, `Proxy ${proxy.name} connected, latency ${result.duration}ms`),
        })
      } else {
        toast({
          title: t("连接失败", "Connection Failed"),
          description: result.error || t("代理连接测试失败", "Proxy connection test failed"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("测试失败", "Test Failed"),
        description: error instanceof ApiError ? error.message : t("测试请求失败", "Test request failed"),
        variant: "destructive",
      })
    } finally {
      setTestingProxyId(null)
    }
  }

  // 刷新缓存
  const handleRefreshCache = async () => {
    try {
      await proxyConfigApi.refreshCache()
      toast({
        title: t("刷新成功", "Refresh Successful"),
        description: t("代理缓存已刷新", "Proxy cache has been refreshed"),
      })
      fetchProxyPageData()
    } catch (error) {
      toast({
        title: t("刷新失败", "Refresh Failed"),
        description: error instanceof ApiError ? error.message : t("缓存刷新失败", "Cache refresh failed"),
        variant: "destructive",
      })
    }
  }

  // 计算成功率
  const calculateSuccessRate = (total: number, success: number) => {
    if (total === 0) return 100
    return (success / total) * 100
  }

  // 筛选数据
  const filteredProxies = useMemo(() => {
    return proxyConfigs.filter((proxy) => {
      const matchesName = proxy.name.toLowerCase().includes(nameSearch.toLowerCase())
      const matchesHost = proxy.host.toLowerCase().includes(hostSearch.toLowerCase())
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "enabled" && proxy.status === 1) ||
        (statusFilter === "disabled" && proxy.status === 0)
      return matchesName && matchesHost && matchesStatus
    })
  }, [proxyConfigs, nameSearch, hostSearch, statusFilter])

  // 清除筛选
  const clearFilters = () => {
    setNameSearch("")
    setHostSearch("")
    setStatusFilter("all")
  }

  const hasActiveFilters = nameSearch || hostSearch || statusFilter !== "all"

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 26,
      },
    },
  }

  const statsSkeletonCards = (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg animate-pulse bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
              <div className="h-6 w-14 rounded animate-pulse bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="w-full">
      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 页面标题 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {t("IP代理管理", "IP Proxy Management")}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("管理住宅IP代理配置", "Manage residential IP proxy configurations")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshCache}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t("刷新缓存", "Refresh Cache")}
            </Button>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("添加代理", "Add Proxy")}
            </Button>
          </div>
        </div>

        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={sectionVariants}>
            {/* 统计卡片 */}
            {isStatsLoading ? (
              statsSkeletonCards
            ) : stats ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("总代理数", "Total Proxies")}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalCount}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("启用中", "Enabled")}</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.enabledCount}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("总请求数", "Total Requests")}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalRequests.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t("成功率", "Success Rate")}</p>
                      <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.successRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              statsSkeletonCards
            )}
          </motion.div>

          <motion.div variants={sectionVariants}>
            {/* 搜索筛选 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t("搜索代理名称...", "Search proxy name...")}
                value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t("搜索代理地址...", "Search proxy address...")}
                value={hostSearch}
                onChange={(e) => setHostSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                {t("全部", "All")}
              </Button>
              <Button
                variant={statusFilter === "enabled" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("enabled")}
              >
                {t("启用", "Enabled")}
              </Button>
              <Button
                variant={statusFilter === "disabled" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("disabled")}
              >
                {t("禁用", "Disabled")}
              </Button>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t("清除筛选", "Clear Filters")}
              </Button>
            )}
          </div>
            </div>

            {/* 代理列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              {isTableLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : filteredProxies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
              <Globe className="w-12 h-12 mb-4 opacity-50" />
              <p>{t("暂无代理配置", "No proxy configurations")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="w-[6%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="w-[12%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("名称", "Name")}</th>
                    <th className="w-[18%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("地址", "Address")}</th>
                    <th className="w-[10%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("状态", "Status")}</th>
                    <th className="w-[10%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("绑定类型", "Binding")}</th>
                    <th className="w-[16%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("成功率", "Success Rate")}</th>
                    <th className="w-[10%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("请求数", "Requests")}</th>
                    <th className="w-[18%] px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t("操作", "Actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredProxies.map((proxy) => {
                    const successRate = calculateSuccessRate(proxy.totalRequests || 0, proxy.successRequests || 0)
                    return (
                      <tr key={proxy.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white font-mono truncate">{proxy.id}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white font-medium truncate">{proxy.name}</td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300 font-mono truncate">
                          {proxy.host}:{proxy.port}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={proxy.status === 1 ? "default" : "secondary"} className={proxy.status === 1 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}>
                            {proxy.status === 1 ? (
                              <><Wifi className="w-3 h-3 mr-1" />{t("启用", "Enabled")}</>
                            ) : (
                              <><WifiOff className="w-3 h-3 mr-1" />{t("禁用", "Disabled")}</>
                            )}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300 truncate">
                          {proxy.bindingType === 1 ? t("哈希绑定", "Hash") : t("手动绑定", "Manual")}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={successRate} className="w-16 h-2 flex-shrink-0" />
                            <span className={cn(
                              "text-sm font-medium whitespace-nowrap",
                              successRate >= 90 ? "text-green-600 dark:text-green-400" :
                              successRate >= 70 ? "text-yellow-600 dark:text-yellow-400" :
                              "text-red-600 dark:text-red-400"
                            )}>
                              {successRate.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300 truncate">
                          {(proxy.totalRequests || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleTestProxy(proxy)}
                                  disabled={testingProxyId === proxy.id}
                                >
                                  {testingProxyId === proxy.id ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Play className="w-4 h-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("测试连接", "Test Connection")}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewClick(proxy)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("查看", "View")}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(proxy)}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("编辑", "Edit")}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handleDeleteClick(proxy)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>{t("删除", "Delete")}</TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 对话框 */}
      <CreateProxyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
      <EditProxyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        proxy={selectedProxy}
        onSuccess={handleEditSuccess}
      />
      <DeleteProxyDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        proxy={selectedProxy}
        onSuccess={handleDeleteSuccess}
      />
      <ViewProxyDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        proxy={selectedProxy}
      />
    </div>
  )
}
