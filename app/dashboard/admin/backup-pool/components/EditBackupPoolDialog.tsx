"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { backupPoolApi, type BackupPoolVO, type BackupPoolDTO, ApiError } from "@/lib/api"

interface EditBackupPoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pool: BackupPoolVO | null
  onSuccess: () => void
}

export function EditBackupPoolDialog({ open, onOpenChange, pool, onSuccess }: EditBackupPoolDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    supplierWeb: "",
    account: "",
    accountUrl: "",
    accountPoolKey: "",
    accountDailyUsage: "",
    accountCost: "",
    priority: "",
    status: "",
    startTime: "",
    expireTime: "",
  })

  // 当 pool 变化时更新表单数据
  useEffect(() => {
    if (pool) {
      setFormData({
        name: pool.name,
        supplierWeb: pool.supplierWeb,
        account: pool.account,
        accountUrl: pool.accountUrl,
        accountPoolKey: pool.accountPoolKey,
        accountDailyUsage: pool.accountDailyUsage.toString(),
        accountCost: pool.accountCost.toString(),
        priority: pool.priority.toString(),
        status: pool.status.toString(),
        startTime: pool.startTime.substring(0, 16), // 格式化为 datetime-local
        expireTime: pool.expireTime.substring(0, 16),
      })
    }
  }, [pool])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pool) return

    setIsSubmitting(true)

    try {
      const data: BackupPoolDTO = {
        name: formData.name,
        supplierWeb: formData.supplierWeb,
        account: formData.account,
        accountUrl: formData.accountUrl,
        accountPoolKey: formData.accountPoolKey,
        accountDailyUsage: parseFloat(formData.accountDailyUsage),
        accountCost: parseFloat(formData.accountCost),
        priority: parseInt(formData.priority),
        status: parseInt(formData.status),
        startTime: formData.startTime,
        expireTime: formData.expireTime,
      }

      await backupPoolApi.update(pool.id, data)

      toast({
        title: t("更新成功", "Updated Successfully"),
        description: t("备用号池已更新", "Backup pool updated successfully"),
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("更新备用号池失败:", error)
      toast({
        title: t("更新失败", "Update Failed"),
        description: error instanceof ApiError ? error.message : t("无法更新备用号池", "Failed to update backup pool"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("编辑备用号池", "Edit Backup Pool")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("名称", "Name")} *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-supplierWeb">{t("供应商网址", "Supplier Web")} *</Label>
              <Input
                id="edit-supplierWeb"
                value={formData.supplierWeb}
                onChange={(e) => setFormData({ ...formData, supplierWeb: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-account">{t("账号", "Account")} *</Label>
            <Input
              id="edit-account"
              value={formData.account}
              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-accountUrl">{t("号池URL", "Account URL")} *</Label>
            <Input
              id="edit-accountUrl"
              value={formData.accountUrl}
              onChange={(e) => setFormData({ ...formData, accountUrl: e.target.value })}
              placeholder="https://api.example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-accountPoolKey">{t("号池密钥", "Pool Key")} *</Label>
            <Input
              id="edit-accountPoolKey"
              type="password"
              value={formData.accountPoolKey}
              onChange={(e) => setFormData({ ...formData, accountPoolKey: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-accountDailyUsage">{t("每日额度($)", "Daily Quota($)")} *</Label>
              <Input
                id="edit-accountDailyUsage"
                type="number"
                step="0.01"
                value={formData.accountDailyUsage}
                onChange={(e) => setFormData({ ...formData, accountDailyUsage: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-accountCost">{t("月成本($)", "Monthly Cost($)")} *</Label>
              <Input
                id="edit-accountCost"
                type="number"
                step="0.01"
                value={formData.accountCost}
                onChange={(e) => setFormData({ ...formData, accountCost: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-priority">{t("优先级", "Priority")} *</Label>
              <Input
                id="edit-priority"
                type="number"
                min="1"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">{t("数字越小优先级越高", "Lower number = higher priority")}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">{t("状态", "Status")} *</Label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="1">{t("启用", "Enabled")}</option>
                <option value="0">{t("禁用", "Disabled")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startTime">{t("开始时间", "Start Time")} *</Label>
              <Input
                id="edit-startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expireTime">{t("过期时间", "Expire Time")} *</Label>
              <Input
                id="edit-expireTime"
                type="datetime-local"
                value={formData.expireTime}
                onChange={(e) => setFormData({ ...formData, expireTime: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t("取消", "Cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("保存", "Save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
