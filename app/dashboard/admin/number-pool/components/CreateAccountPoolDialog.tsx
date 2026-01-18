"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { accountPoolApi, type AccountPoolDTO, ApiError } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface CreateAccountPoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateAccountPoolDialog({ open, onOpenChange, onSuccess }: CreateAccountPoolDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<AccountPoolDTO>({
    supplierWeb: "",
    account: "",
    accountUrl: "",
    accountPoolKey: "",
    accountDailyUsage: 0,
    accountDailyRemainingUsage: 0,
    accountCost: 0,
    startTime: "",
    expireTime: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 验证必填字段
      if (!formData.supplierWeb || !formData.accountUrl || !formData.accountPoolKey) {
        toast({
          title: t("验证失败", "Validation Failed"),
          description: t("请填写所有必填字段", "Please fill in all required fields"),
          variant: "destructive",
        })
        return
      }

      if (!formData.startTime || !formData.expireTime) {
        toast({
          title: t("验证失败", "Validation Failed"),
          description: t("请选择开始时间和过期时间", "Please select start time and expiration time"),
          variant: "destructive",
        })
        return
      }

      // 验证开始时间必须早于过期时间
      const startTime = new Date(formData.startTime)
      const expireTime = new Date(formData.expireTime)
      if (startTime >= expireTime) {
        toast({
          title: t("验证失败", "Validation Failed"),
          description: t("开始时间必须早于过期时间", "Start time must be before expiration time"),
          variant: "destructive",
        })
        return
      }

      if (formData.accountDailyUsage < 0) {
        toast({
          title: t("验证失败", "Validation Failed"),
          description: t("每日额度不能为负数", "Daily usage cannot be negative"),
          variant: "destructive",
        })
        return
      }

      // 调用后端API创建号池
      await accountPoolApi.create(formData)

      toast({
        title: t("创建成功", "Created Successfully"),
        description: t("号池已创建", "Account pool has been created"),
      })

      // 重置表单
      setFormData({
        supplierWeb: "",
        account: "",
        accountUrl: "",
        accountPoolKey: "",
        accountDailyUsage: 0,
        accountDailyRemainingUsage: 0,
        accountCost: 0,
        startTime: "",
        expireTime: "",
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("创建号池失败:", error)
      toast({
        title: t("创建失败", "Creation Failed"),
        description: error instanceof ApiError ? error.message : t("无法创建号池", "Failed to create account pool"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("创建号池", "Create Account Pool")}</DialogTitle>
          <DialogDescription>
            {t("填写以下信息创建新的号池", "Fill in the information below to create a new account pool")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* 供应商网址 */}
          <div className="space-y-2">
            <label htmlFor="supplierWeb" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("供应商网址", "Supplier Website")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="supplierWeb"
              placeholder={t("例如: https://supplier.com", "e.g., https://supplier.com")}
              value={formData.supplierWeb}
              onChange={(e) => setFormData({ ...formData, supplierWeb: e.target.value })}
              className="dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* 账号 */}
          <div className="space-y-2">
            <label htmlFor="account" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("账号", "Account")}
            </label>
            <Input
              id="account"
              placeholder={t("例如: admin@company.com", "e.g., admin@company.com")}
              value={formData.account}
              onChange={(e) => setFormData({ ...formData, account: e.target.value })}
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* 号池URL */}
          <div className="space-y-2">
            <label htmlFor="accountUrl" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("号池URL", "Pool URL")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="accountUrl"
              placeholder={t("例如: https://api.provider.com/v1", "e.g., https://api.provider.com/v1")}
              value={formData.accountUrl}
              onChange={(e) => setFormData({ ...formData, accountUrl: e.target.value })}
              className="dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* 号池密钥 */}
          <div className="space-y-2">
            <label htmlFor="accountPoolKey" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("号池密钥", "Pool Key")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="accountPoolKey"
              type="password"
              placeholder={t("例如: sk-...", "e.g., sk-...")}
              value={formData.accountPoolKey}
              onChange={(e) => setFormData({ ...formData, accountPoolKey: e.target.value })}
              className="dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* 每日额度和剩余 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="accountDailyUsage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("每日额度 (USD)", "Daily Quota (USD)")} <span className="text-red-500">*</span>
              </label>
              <Input
                id="accountDailyUsage"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.accountDailyUsage}
                onChange={(e) => setFormData({ ...formData, accountDailyUsage: Number.parseFloat(e.target.value) || 0 })}
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="accountDailyRemainingUsage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("每日剩余 (USD)", "Daily Remaining (USD)")}
              </label>
              <Input
                id="accountDailyRemainingUsage"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.accountDailyRemainingUsage}
                onChange={(e) => setFormData({ ...formData, accountDailyRemainingUsage: Number.parseFloat(e.target.value) || 0 })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* 月成本 */}
          <div className="space-y-2">
            <label htmlFor="accountCost" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("月成本 (USD)", "Monthly Cost (USD)")}
            </label>
            <Input
              id="accountCost"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.accountCost}
              onChange={(e) => setFormData({ ...formData, accountCost: Number.parseFloat(e.target.value) || 0 })}
              className="dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* 开始时间和过期时间 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("开始时间", "Start Time")} <span className="text-red-500">*</span>
              </label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="expireTime" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("过期时间", "Expiration Time")} <span className="text-red-500">*</span>
              </label>
              <Input
                id="expireTime"
                type="datetime-local"
                value={formData.expireTime}
                onChange={(e) => setFormData({ ...formData, expireTime: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("取消", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isSubmitting ? t("创建中...", "Creating...") : t("创建", "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
