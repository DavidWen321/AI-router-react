"use client"

import { useLanguage } from "@/lib/language-context"
import { type AccountPoolVO } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface ViewAccountPoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pool: AccountPoolVO | null  // 要查看的号池
}

export function ViewAccountPoolDialog({ open, onOpenChange, pool }: ViewAccountPoolDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [showKey, setShowKey] = useState(false)

  const handleCopyKey = async () => {
    if (!pool?.accountPoolKey) return

    try {
      await navigator.clipboard.writeText(pool.accountPoolKey)
      toast({
        title: t("复制成功", "Copied Successfully"),
        description: t("密钥已复制到剪贴板", "Key has been copied to clipboard"),
      })
    } catch (error) {
      toast({
        title: t("复制失败", "Copy Failed"),
        description: t("无法复制到剪贴板", "Failed to copy to clipboard"),
        variant: "destructive",
      })
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const maskKey = (key: string) => {
    if (!key) return ""
    if (key.length <= 10) return key
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("号池详情", "Account Pool Details")}</DialogTitle>
          <DialogDescription>
            {t("查看号池的详细信息", "View detailed information about the account pool")}
          </DialogDescription>
        </DialogHeader>

        {pool && (
          <div className="space-y-6 py-4">
            {/* 基本信息 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("基本信息", "Basic Information")}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("供应商网址", "Supplier Website")}</span>
                  <a
                    href={pool.supplierWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    {pool.supplierWeb}
                  </a>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("账号", "Account")}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{pool.account || "-"}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("号池URL", "Pool URL")}</span>
                  <a
                    href={pool.accountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-cyan-600 dark:text-cyan-400 hover:underline truncate max-w-[300px]"
                  >
                    {pool.accountUrl}
                  </a>
                </div>
              </div>
            </div>

            {/* 号池密钥 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("号池密钥", "Pool Key")}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all flex-1">
                    {showKey ? pool.accountPoolKey : maskKey(pool.accountPoolKey)}
                  </code>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowKey(!showKey)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                    >
                      {showKey ? <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" /> : <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />}
                    </button>
                    <button
                      onClick={handleCopyKey}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors flex-shrink-0"
                    >
                      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 额度信息 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("额度信息", "Quota Information")}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("每日额度", "Daily Quota")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">${pool.accountDailyUsage.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("每日剩余", "Daily Remaining")}</p>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">${pool.accountDailyRemainingUsage.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("月成本", "Monthly Cost")}</p>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">${pool.accountCost.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* 时间信息 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("时间信息", "Time Information")}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("开始时间", "Start Time")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(pool.startTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("过期时间", "Expiration Time")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(pool.expireTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("创建时间", "Created At")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(pool.createdAt || "")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("更新时间", "Updated At")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(pool.updatedAt || "")}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("关闭", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
