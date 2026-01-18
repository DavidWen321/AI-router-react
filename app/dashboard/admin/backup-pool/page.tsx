"use client"

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Database, Search, Plus, Edit, Trash2, Eye, Shield, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
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
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "enabled" && pool.status === 1) ||
        (statusFilter === "disabled" && pool.status === 0)

      return matchName && matchSupplier && matchStatus
    })
  }, [backupPools, nameSearch, supplierSearch, statusFilter])

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
    <div className="space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
            <Shield className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("备用号池管理", "Backup Pool Management")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("管理备用号池，当主池不可用时自动降级", "Manage backup pools for automatic failover")}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("添加备用池", "Add Backup Pool")}
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("搜索名称...", "Search name...")}
              value={nameSearch}
              onChange={(e) => setNameSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("搜索供应商...", "Search supplier...")}
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
              className="pl-9"
            />
          </div>
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
      </div>

      {/* 备用号池列表 */}
      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("名称", "Name")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("供应商", "Supplier")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("账号", "Account")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("每日额度", "Daily Quota")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("使用率", "Usage Rate")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("优先级", "Priority")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("状态", "Status")}</th>
                <th className="px-4 py-3 text-left text-sm font-medium">{t("过期时间", "Expire Time")}</th>
                <th className="px-4 py-3 text-right text-sm font-medium">{t("操作", "Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("加载中...", "Loading...")}
                  </td>
                </tr>
              ) : filteredPools.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t("暂无数据", "No data")}
                  </td>
                </tr>
              ) : (
                filteredPools.map((pool) => {
                  const usageRate = calculateUsageRate(pool.accountDailyUsage, pool.accountDailyRemainingUsage)
                  const isExpiringSoon = new Date(pool.expireTime) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

                  return (
                    <tr key={pool.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">{pool.id}</td>
                      <td className="px-4 py-3 text-sm font-medium">{pool.name}</td>
                      <td className="px-4 py-3 text-sm">{pool.supplierWeb}</td>
                      <td className="px-4 py-3 text-sm font-mono text-xs">{pool.account}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            ${pool.accountDailyRemainingUsage.toFixed(2)} / ${pool.accountDailyUsage.toFixed(2)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Progress value={usageRate} className="h-2 w-20" />
                            <span className="text-xs text-muted-foreground">{usageRate.toFixed(1)}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Badge variant={pool.priority <= 3 ? "default" : "secondary"}>
                          {pool.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={pool.status === 1 ? "default" : "secondary"}>
                          {pool.status === 1 ? t("启用", "Enabled") : t("禁用", "Disabled")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className={cn("text-xs", isExpiringSoon && "text-orange-500")}>
                          {new Date(pool.expireTime).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
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
