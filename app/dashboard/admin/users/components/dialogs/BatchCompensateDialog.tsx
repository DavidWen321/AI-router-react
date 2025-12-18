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
        <DialogContent className="max-w-md">
          <DialogHeader className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-red-900/20 dark:via-orange-900/20 dark:to-amber-900/20 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-xl">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              {t("一键会员补偿", "Batch Compensation")}
            </DialogTitle>
            <DialogDescription>
              {t("为所有当前生效的会员延期指定天数", "Extend all active memberships by specified days")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 影响范围提示 */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{t("影响范围", "Affected Users")}</span>
              </div>
              <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">{activeCount}</div>
              <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                {t("位用户的当前会员将被延期", "active memberships will be extended")}
              </div>
            </div>

            {/* 补偿天数 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t("补偿天数", "Days to Compensate")}
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(365, Number(e.target.value))))}
                min={1}
                max={365}
                className="mt-1 w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                placeholder={t("请输入补偿天数 (1-365)", "Enter days (1-365)")}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t("所有会员的结束时间将延后 ", "All memberships will be extended by ")}{days}
                {t(" 天", " days")}
              </p>
            </div>

            {/* 补偿原因 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("补偿原因", "Reason")}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
                placeholder={t("例如：系统故障补偿、活动赠送等", "e.g., System outage compensation, promotion gift, etc.")}
              />
            </div>

            {/* 补偿示例 */}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-xs">
              <div className="font-medium text-amber-900 dark:text-amber-300 mb-1">
                {t("补偿示例", "Example")}
              </div>
              <div className="text-amber-800 dark:text-amber-400">
                {t("会员", "Membership")}: 2025-10-20 ~ 2025-11-20
                <br />
                {t("续费", "Renewal")}: 2025-11-20 ~ 2025-12-20
                <br />
                <span className="font-semibold">
                  {t("补偿", "After")} {days} {t("天后", " days")}:
                </span>
                <br />
                {t("会员", "Membership")}: 2025-10-20 ~{" "}
                {new Date(new Date("2025-11-20").getTime() + days * 86400000).toISOString().slice(0, 10)}
                <br />
                {t("续费", "Renewal")}:{" "}
                {new Date(new Date("2025-11-20").getTime() + days * 86400000).toISOString().slice(0, 10)} ~{" "}
                {new Date(new Date("2025-12-20").getTime() + days * 86400000).toISOString().slice(0, 10)}
              </div>
            </div>

            {/* 警告提示 */}
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2 text-red-700 dark:text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{t("注意：此操作不可撤销", "Warning: This action is irreversible")}</div>
                  <div className="text-xs mt-1">
                    {t(
                      "将影响所有活跃会员及其续费记录，请谨慎操作",
                      "Will affect all active memberships and renewals, proceed with caution"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 bg-gray-50 dark:bg-gray-900 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
            >
              {t("取消", "Cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !reason.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-sm hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("下一步", "Next")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 二次确认对话框 */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              {t("确认补偿", "Confirm Compensation")}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {t("确定为所有用户补偿", "Confirm to compensate all users by")}{" "}
              <span className="font-bold text-orange-600">{days}</span> {t("天吗？", "days?")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("此操作将影响", "This will affect")} <span className="font-semibold">{activeCount}</span>{" "}
              {t("位用户，且不可撤销。", "users and is irreversible.")}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              {t("再想想", "Cancel")}
            </button>
            <button
              onClick={confirmCompensate}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50"
            >
              {loading ? t("处理中...", "Processing...") : t("确认补偿", "Confirm")}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
