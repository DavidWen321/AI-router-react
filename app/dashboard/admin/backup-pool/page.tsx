"use client"

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Database, Search, Plus, Edit, Trash2, Eye, Shield, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { backupPoolApi, type BackupPoolVO, ApiError } from "@/lib/api"
import { CreateBackupPoolDialog } from "./components/CreateBackupPoolDialog"
import { EditBackupPoolDialog } from "./components/EditBackupPoolDialog"
import { DeleteBackupPoolDialog } from "./components/DeleteBackupPoolDialog"
import { ViewBackupPoolDialog } from "./components/ViewBackupPoolDialog"

export default function BackupPoolPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  // 搜索筛选状态
  const [nameSearch, setNameSearch] = useState("")
  const [supplierSearch, setSupplierSearch] = useState("")
  const [accountSearch, setAccountSearch] = useState("")
  const [poolKeySearch, setPoolKeySearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "enabled" | "disabled">("all")

  // 备用号池数据状态
  const [backupPools, setBackupPools] = useState<BackupPoolVO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 对话框状态
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedPool, setSelectedPool] = useState<BackupPoolVO | null>(null)

  // 获取备用号池列表
  const fetchBackupPools = async () => {
    setIsLoading(true)
    try {
      const pools = await backupPoolApi.listAll()
      setBackupPools(pools)
    } catch (error) {
      console.error("获取备用号池列表失败:", error)
      toast({
        title: t("加载失败", "Loading Failed"),
        description: error instanceof ApiError ? error.message : t("无法加载备用号池列表", "Failed to load backup pool list"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 组件加载时获取数据
  useEffect(() => {
    fetchBackupPools()
  }, [])

  // CRUD操作处理器
  const handleCreateSuccess = () => {
    fetchBackupPools()
    setIsCreateDialogOpen(false)
  }

  const handleEditClick = (pool: BackupPoolVO) => {
    setSelectedPool(pool)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    fetchBackupPools()
    setIsEditDialogOpen(false)
  }

  const handleDeleteClick = (pool: BackupPoolVO) => {
    setSelectedPool(pool)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteSuccess = () => {
    fetchBackupPools()
    setIsDeleteDialogOpen(false)
  }

  const handleViewClick = (pool: BackupPoolVO) => {
    setSelectedPool(pool)
    setIsViewDialogOpen(true)
  }

  // 计算使用率
  const calculateUsageRate = (total: number, remaining: number) => {
    if (total === 0) return 0
    return ((total - remaining) / total) * 100
  }

  // 筛选后的数据
  const filteredPools = useMemo(() => {
    return backupPools.filter((pool) => {
      const matchName = pool.name.toLowerCase().includes(nameSearch.toLowerCase())
      const matchSupplier = pool.supplierWeb.toLowerCase().includes(supplierSearch.toLowerCase())
      const matchAccount = pool.account.toLowerCase().includes(accountSearch.toLowerCase())
      const matchPoolKey = pool.accountPoolKey.toLowerCase().includes(poolKeySearch.toLowerCase())
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "enabled" && pool.status === 1) ||
        (statusFilter === "disabled" && pool.status === 0)

      return matchName && matchSupplier && matchAccount && matchPoolKey && matchStatus
    })
  }, [backupPools, nameSearch, supplierSearch, accountSearch, poolKeySearch, statusFilter])

  // 统计数据
  const stats = useMemo(() => {
    const total = backupPools.length
    const enabled = backupPools.filter((p) => p.status === 1).length
    const disabled = backupPools.filter((p) => p.status === 0).length
    const totalQuota = backupPools.reduce((sum, p) => sum + p.accountDailyUsage, 0)
    const totalRemaining = backupPools.reduce((sum, p) => sum + p.accountDailyRemainingUsage, 0)

    return { total, enabled, disabled, totalQuota, totalRemaining }
  }, [backupPools])

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      {/* 页面标题 */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{t("备用号池管理", "Backup Pool Management")}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t("管理备用号池，当主池不可用时自动降级", "Manage backup pools for automatic failover")}
              </p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("添加备用池", "Add Backup Pool")}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-4 w-4" />
            {t("总数", "Total")}
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-green-500" />
            {t("启用", "Enabled")}
          </div>
          <div className="mt-2 text-2xl font-bold text-green-500">{stats.enabled}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            {t("禁用", "Disabled")}
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-500">{stats.disabled}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {t("总额度", "Total Quota")}
          </div>
          <div className="mt-2 text-2xl font-bold">${stats.totalQuota.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {t("剩余额度", "Remaining")}
          </div>
          <div className="mt-2 text-2xl font-bold">${stats.totalRemaining.toFixed(2)}</div>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="rounded-lg border bg-card p-4 sm:p-6 space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 名称搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("搜索名称...", "Search name...")}
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 供应商搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("搜索供应商...", "Search supplier...")}
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 账号搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("搜索账号...", "Search account...")}
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* 号池密钥搜索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("搜索号池密钥...", "Search pool key...")}
              value={poolKeySearch}
              onChange={(e) => setPoolKeySearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* 状态过滤 */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "all" | "enabled" | "disabled")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("状态筛选", "Status Filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("全部状态", "All Status")}</SelectItem>
              <SelectItem value="enabled">{t("已启用", "Enabled")}</SelectItem>
              <SelectItem value="disabled">{t("已禁用", "Disabled")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 备用号池列表 */}
      <div className="rounded-lg border bg-card">
        {/* 移动端卡片视图 */}
        <div className="lg:hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">{t("加载中...", "Loading...")}</div>
            </div>
          ) : filteredPools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Shield className="w-12 h-12 mb-4 text-gray-300" />
              <p>{t("暂无数据", "No data")}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPools.map((pool) => {
                const usageRate = calculateUsageRate(pool.accountDailyUsage, pool.accountDailyRemainingUsage)
                const isExpiringSoon = new Date(pool.expireTime) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                return (
                  <div
                    key={pool.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* 顶部：名称 + 状态 */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Shield className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {pool.name}
                        </span>
                      </div>
                      <Badge variant={pool.status === 1 ? "default" : "secondary"} className="flex-shrink-0">
                        {pool.status === 1 ? t("启用", "Enabled") : t("禁用", "Disabled")}
                      </Badge>
                    </div>

                    {/* ID 和供应商信息 */}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      ID: {pool.id} • {pool.supplierWeb}
                    </div>

                    {/* 账号信息 */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-mono">
                      {t("账号", "Account")}: {pool.account}
                    </div>

                    {/* 额度信息网格 */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("每日额度", "Daily")}</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          ${pool.accountDailyUsage.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("剩余", "Left")}</span>
                        <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                          ${pool.accountDailyRemainingUsage.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("月成本", "Monthly")}</span>
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                          ${pool.accountCost.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* 使用率进度条 */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t("使用率", "Usage Rate")}</span>
                        <span className="text-xs font-medium text-gray-900 dark:text-white">{usageRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={usageRate} className="h-2" />
                    </div>

                    {/* 优先级和过期时间 */}
                    <div className="flex items-center gap-3 mb-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-400">{t("优先级", "Priority")}:</span>
                        <Badge variant={pool.priority <= 3 ? "default" : "secondary"} className="text-xs">
                          {pool.priority}
                        </Badge>
                      </div>
                      <div className={cn("flex items-center gap-1", isExpiringSoon && "text-orange-500")}>
                        <span className="text-gray-500 dark:text-gray-400">{t("过期", "Expires")}:</span>
                        <span>{new Date(pool.expireTime).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewClick(pool)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        {t("查看", "View")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(pool)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        {t("编辑", "Edit")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(pool)}
                        className="flex-1"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        {t("删除", "Delete")}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 桌面端表格视图 */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">ID</th>
                <th className="px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("名称", "Name")}</th>
                <th className="hidden 2xl:table-cell px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("供应商", "Supplier")}</th>
                <th className="px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("账号", "Account")}</th>
                <th className="px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("额度", "Quota")}</th>
                <th className="px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("剩余", "Remaining")}</th>
                <th className="px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("使用率", "Usage Rate")}</th>
                <th className="px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("月成本", "Monthly Cost")}</th>
                <th className="px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("优先级", "Priority")}</th>
                <th className="px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("状态", "Status")}</th>
                <th className="hidden xl:table-cell px-2 xl:px-3 py-3 text-left text-xs xl:text-sm font-medium text-muted-foreground">{t("过期时间", "Expire Time")}</th>
                <th className="px-2 xl:px-3 py-3 text-right text-xs xl:text-sm font-medium text-muted-foreground">{t("操作", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("加载中...", "Loading...")}
                  </td>
                </tr>
              ) : filteredPools.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("暂无数据", "No data")}
                  </td>
                </tr>
              ) : (
                filteredPools.map((pool) => {
                  const usageRate = calculateUsageRate(pool.accountDailyUsage, pool.accountDailyRemainingUsage)
                  const isExpiringSoon = new Date(pool.expireTime) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                  return (
                    <tr key={pool.id} className="border-b transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-2 xl:px-3 py-3 text-xs xl:text-sm">{pool.id}</td>
                      <td className="px-2 xl:px-3 py-3 text-xs xl:text-sm font-medium">{pool.name}</td>
                      <td className="hidden 2xl:table-cell px-2 xl:px-3 py-3 text-xs xl:text-sm">{pool.supplierWeb}</td>
                      <td className="px-2 xl:px-3 py-3 text-xs xl:text-sm font-mono">{pool.account}</td>
                      <td className="px-2 xl:px-3 py-3 text-xs xl:text-sm">${pool.accountDailyUsage.toFixed(2)}</td>
                      <td className="px-2 xl:px-3 py-3 text-xs xl:text-sm text-green-600">${pool.accountDailyRemainingUsage.toFixed(2)}</td>
                      <td className="px-2 xl:px-3 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={usageRate} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">{usageRate.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-2 xl:px-3 py-3 text-xs xl:text-sm">${pool.accountCost.toFixed(2)}</td>
                      <td className="px-2 xl:px-3 py-3 text-xs xl:text-sm">
                        <Badge variant={pool.priority <= 3 ? "default" : "secondary"}>
                          {pool.priority}
                        </Badge>
                      </td>
                      <td className="px-2 xl:px-3 py-3">
                        <Badge variant={pool.status === 1 ? "default" : "secondary"}>
                          {pool.status === 1 ? t("启用", "Enabled") : t("禁用", "Disabled")}
                        </Badge>
                      </td>
                      <td className="hidden xl:table-cell px-2 xl:px-3 py-3 text-xs xl:text-sm">
                        <div className={cn("text-xs", isExpiringSoon && "text-orange-500")}>
                          {new Date(pool.expireTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-2 xl:px-3 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewClick(pool)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(pool)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(pool)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 对话框组件 */}
      <CreateBackupPoolDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <EditBackupPoolDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        pool={selectedPool}
        onSuccess={handleEditSuccess}
      />

      <DeleteBackupPoolDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        pool={selectedPool}
        onSuccess={handleDeleteSuccess}
      />

      <ViewBackupPoolDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        pool={selectedPool}
      />
    </div>
  )
}
