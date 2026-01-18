"use client"

import { useLanguage } from "@/lib/language-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface BackupPoolVO {
  id: number
  name: string
  supplierWeb: string
  account: string
  accountUrl: string
  accountPoolKey: string
  accountDailyUsage: number
  accountDailyRemainingUsage: number
  accountCost: number
  priority: number
  status: number
  startTime: string
  expireTime: string
  createdAt: string
  updatedAt: string
}

interface ViewBackupPoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pool: BackupPoolVO | null
}

export function ViewBackupPoolDialog({ open, onOpenChange, pool }: ViewBackupPoolDialogProps) {
  const { t } = useLanguage()

  if (!pool) return null

  const usageRate = pool.accountDailyUsage > 0
    ? ((pool.accountDailyUsage - pool.accountDailyRemainingUsage) / pool.accountDailyUsage) * 100
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("备用号池详情", "Backup Pool Details")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("ID", "ID")}</div>
              <div className="font-medium">{pool.id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("名称", "Name")}</div>
              <div className="font-medium">{pool.name}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("供应商", "Supplier")}</div>
              <div className="font-medium">{pool.supplierWeb}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("账号", "Account")}</div>
              <div className="font-mono text-sm">{pool.account}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">{t("号池URL", "Pool URL")}</div>
            <div className="font-mono text-sm break-all">{pool.accountUrl}</div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground">{t("号池密钥", "Pool Key")}</div>
            <div className="font-mono text-sm">{"*".repeat(20)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("每日额度", "Daily Quota")}</div>
              <div className="font-medium">${pool.accountDailyUsage.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("剩余额度", "Remaining")}</div>
              <div className="font-medium">${pool.accountDailyRemainingUsage.toFixed(2)}</div>
            </div>
          </div>

          <div>
            <div className="text-sm text-muted-foreground mb-2">{t("使用率", "Usage Rate")}</div>
            <div className="flex items-center gap-2">
              <Progress value={usageRate} className="flex-1" />
              <span className="text-sm font-medium">{usageRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("月成本", "Monthly Cost")}</div>
              <div className="font-medium">${pool.accountCost.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("优先级", "Priority")}</div>
              <Badge variant={pool.priority <= 3 ? "default" : "secondary"}>{pool.priority}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("状态", "Status")}</div>
              <Badge variant={pool.status === 1 ? "default" : "secondary"}>
                {pool.status === 1 ? t("启用", "Enabled") : t("禁用", "Disabled")}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("开始时间", "Start Time")}</div>
              <div className="text-sm">{new Date(pool.startTime).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("过期时间", "Expire Time")}</div>
              <div className="text-sm">{new Date(pool.expireTime).toLocaleString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">{t("创建时间", "Created At")}</div>
              <div className="text-sm">{new Date(pool.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">{t("更新时间", "Updated At")}</div>
              <div className="text-sm">{new Date(pool.updatedAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
