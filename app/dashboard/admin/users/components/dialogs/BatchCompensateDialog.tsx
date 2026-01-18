/**
 * 一键批量补偿对话框
 * Apple风格设计
 */

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { membershipApi } from "@/lib/api"
import { AlertTriangle, Users, Calendar } from "lucide-react"

interface BatchCompensateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function BatchCompensateDialog({ open, onOpenChange, onSuccess }: BatchCompensateDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState(5)
  const [reason, setReason] = useState("")
  const [activeCount, setActiveCount] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (open) {
      loadActiveCount()
    }
  }, [open])

  const loadActiveCount = async () => {
    try {
      const stats = await membershipApi.getMembershipStatistics()
      setActiveCount(stats.activeMembers || 0)
    } catch (error) {
      // 忽略错误
    }
  }

  const handleSubmit = () => {
    if (!reason.trim()) {
      toast({
        title: t("请填写补偿原因", "Please enter reason"),
        variant: "destructive",
      })
      return
    }

    if (days < 1 || days > 365) {
      toast({
        title: t("补偿天数无效", "Invalid days"),
        description: t("补偿天数必须在1-365天之间", "Days must be between 1-365"),
        variant: "destructive",
      })
      return
    }

    setShowConfirm(true)
  }

  const confirmCompensate = async () => {
    setLoading(true)
    setShowConfirm(false)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/membership/business/compensate-batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ days, reason }),
      })

      const result = await response.json()

      if (result.code === 200) {
        toast({
          title: t("补偿成功", "Compensated Successfully"),
          description: result.message || t(`已成功补偿 ${activeCount} 位用户`, `Successfully compensated ${activeCount} users`),
        })

        onSuccess()
        onOpenChange(false)
        setDays(5)
        setReason("")
      } else {
        throw new Error(result.message || "Compensation failed")
      }
    } catch (error: any) {
      toast({
        title: t("补偿失败", "Compensation Failed"),
        description: error.message || t("无法执行批量补偿", "Failed to execute batch compensation"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open && !showConfirm} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-amber-900/20 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 rounded-t-xl sm:rounded-t-2xl">
            <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              {t("一键会员补偿", "Batch Compensation")}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t("为所有当前生效的会员延期指定天数", "Extend all active memberships by specified days")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
            {/* 影响范围提示 */}
            <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">{t("影响范围", "Affected Users")}</span>
              </div>
              <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{activeCount}</div>
              <div className="text-[10px] sm:text-xs text-blue-700 dark:text-blue-400 mt-0.5 sm:mt-1">
                {t("位用户的当前会员将被延期", "active memberships will be extended")}
              </div>
            </div>

            {/* 补偿天数 */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {t("补偿天数", "Days to Compensate")}
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(365, Number(e.target.value))))}
                min={1}
                max={365}
                className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder={t("请输入补偿天数 (1-365)", "Enter days (1-365)")}
              />
              <p className="mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                {t("所有会员的结束时间将延后 ", "All memberships will be extended by ")}{days}
                {t(" 天", " days")}
              </p>
            </div>

            {/* 补偿原因 */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("补偿原因", "Reason")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                placeholder={t("例如：系统故障补偿", "e.g., System outage compensation")}
              />
            </div>

            {/* 警告提示 */}
            <div className="p-2.5 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg sm:rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2 text-red-700 dark:text-red-400 text-xs sm:text-sm">
                <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{t("注意：此操作不可撤销", "Warning: This action is irreversible")}</div>
                  <div className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                    {t(
                      "将影响所有活跃会员及其续费记录，请谨慎操作",
                      "Will affect all active memberships and renewals"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-900 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl sticky bottom-0 z-10">
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
            >
              {t("取消", "Cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !reason.trim()}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("下一步", "Next")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 二次确认对话框 */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 rounded-t-xl sm:rounded-t-2xl">
            <DialogTitle className="flex items-center gap-2 text-red-600 text-lg sm:text-xl">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              {t("确认补偿", "Confirm Compensation")}
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 sm:py-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 sm:mb-4">
              {t("确定为所有用户补偿", "Confirm to compensate all users by")}{" "}
              <span className="font-bold text-orange-600">{days}</span> {t("天吗？", "days?")}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {t("此操作将影响", "This will affect")} <span className="font-semibold">{activeCount}</span>{" "}
              {t("位用户，且不可撤销。", "users and is irreversible.")}
            </p>
          </div>

          {/* 底部按钮 */}
          <div className="flex gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-900 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl sticky bottom-0 z-10">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-3 sm:px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              {t("再想想", "Cancel")}
            </button>
            <button
              onClick={confirmCompensate}
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50"
            >
              {loading ? t("处理中...", "Processing...") : t("确认", "Confirm")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
