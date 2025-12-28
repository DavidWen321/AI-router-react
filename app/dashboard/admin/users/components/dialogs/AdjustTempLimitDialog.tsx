/**
 * 临时调整额度对话框
 * 管理员可为有活跃会员的用户临时调整当天额度
 * 临时额度在北京时间 23:59:59 自动过期
 */

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { usageApi } from "@/lib/api"
import { Clock, DollarSign, Info, AlertCircle, Zap } from "lucide-react"
import type { UserData } from "../../types"

interface AdjustTempLimitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserData | null
  onSuccess: () => void
}

export function AdjustTempLimitDialog({ open, onOpenChange, user, onSuccess }: AdjustTempLimitDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [limitDetail, setLimitDetail] = useState<any>(null)
  const [tempLimit, setTempLimit] = useState("")
  const [remark, setRemark] = useState("")

  // 加载用户额度详情
  useEffect(() => {
    if (open && user) {
      loadLimitDetail()
      // 清空表单
      setTempLimit("")
      setRemark("")
    }
  }, [open, user])

  const loadLimitDetail = async () => {
    if (!user) return

    try {
      const detail = await usageApi.getUserLimitDetail(user.id)
      setLimitDetail(detail)

      // 如果已有临时额度，填充到输入框
      if (detail.hasTempLimit && detail.tempLimit) {
        setTempLimit(detail.tempLimit.toString())
      }
    } catch (error: any) {
      toast({
        title: t("加载失败", "Load Failed"),
        description: error.message || t("无法加载用户额度详情", "Failed to load user limit detail"),
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    // 验证输入
    const limit = parseFloat(tempLimit)
    if (isNaN(limit) || limit <= 0) {
      toast({
        title: t("输入错误", "Invalid Input"),
        description: t("请输入有效的临时额度（大于0）", "Please enter a valid temporary limit (greater than 0)"),
        variant: "destructive",
      })
      return
    }

    // 警告：临时额度远超套餐限额
    if (limitDetail && limit > limitDetail.membershipLimit * 3) {
      const confirmMsg = t(
        `临时额度 $${limit} 远超套餐限额 $${limitDetail.membershipLimit}，确定要设置吗？`,
        `Temporary limit $${limit} is far higher than membership limit $${limitDetail.membershipLimit}. Are you sure?`
      )
      if (!confirm(confirmMsg)) {
        return
      }
    }

    setLoading(true)
    try {
      await usageApi.setTempDailyLimit(user.id, limit, remark || undefined)

      toast({
        title: t("设置成功", "Success"),
        description: t(
          `已为用户 ${user.email} 设置临时额度 $${limit}，将于今日 23:59:59 自动过期`,
          `Temporary limit $${limit} has been set for ${user.email}, will expire at 23:59:59 today`
        ),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: t("设置失败", "Failed"),
        description: error.message || t("设置临时额度失败", "Failed to set temporary limit"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!user || !limitDetail?.hasTempLimit) return

    const confirmMsg = t(
      "确定要取消该用户的临时额度吗？取消后将立即恢复为套餐限额。",
      "Are you sure you want to cancel the temporary limit? It will be restored to membership limit immediately."
    )
    if (!confirm(confirmMsg)) {
      return
    }

    setLoading(true)
    try {
      await usageApi.cancelTempDailyLimit(user.id)

      toast({
        title: t("取消成功", "Cancelled"),
        description: t(
          `已取消用户 ${user.email} 的临时额度`,
          `Temporary limit for ${user.email} has been cancelled`
        ),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: t("取消失败", "Failed"),
        description: error.message || t("取消临时额度失败", "Failed to cancel temporary limit"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 判断用户是否是非会员（用于显示不同的标题）
  const isNonMember = !user?.planStatus || user?.planStatus !== "活跃"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className={`-mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 rounded-t-xl sm:rounded-t-2xl ${
          isNonMember
            ? "bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-teal-900/20"
            : "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20"
        }`}>
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            {isNonMember ? (
              <>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                {t("开通临时体验", "Grant Temporary Trial")}
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                {t("临时调整额度", "Adjust Temporary Limit")}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {isNonMember
              ? t("为非会员用户开通当天临时体验额度", "Grant temporary trial quota for non-member user")
              : t("为用户临时调整当天的每日限额，仅当天有效", "Temporarily adjust daily limit for the user")
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          {/* 用户信息 */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 dark:border-blue-700">
            <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 flex-shrink-0">{t("用户邮箱", "User Email")}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{user?.email}</span>
              </div>
              {limitDetail && (
                <>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">{t("套餐限额", "Membership Limit")}:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ${limitDetail.membershipLimit?.toFixed(2)}
                    </span>
                  </div>
                  {limitDetail.hasTempLimit && (
                    <div className="flex justify-between items-center gap-2 text-orange-600 dark:text-orange-400">
                      <span>{t("当前临时额度", "Current Temp Limit")}:</span>
                      <span className="font-bold">${limitDetail.tempLimit?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">{t("实际生效限额", "Effective Limit")}:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      ${limitDetail.effectiveLimit?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">{t("今日已用", "Today's Usage")}:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      ${limitDetail.todayCost?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400">{t("今日剩余", "Today's Remaining")}:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      ${limitDetail.remainingLimit?.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 临时额度输入 */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("临时额度（美元）", "Temporary Limit (USD)")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={tempLimit}
                onChange={(e) => setTempLimit(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-gray-100"
                placeholder={t("输入临时额度", "Enter temporary limit")}
              />
            </div>
          </div>

          {/* 备注说明 */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("备注说明", "Remark")} <span className="text-gray-400 text-[10px] sm:text-xs">{t("(可选)", "(Optional)")}</span>
            </label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-gray-100 resize-none"
              placeholder={t("例如：活动期间临时提额", "e.g., Temporary increase during promotion")}
              rows={2}
            />
          </div>

          {/* 重要提示 */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
            <div className="flex gap-2 sm:gap-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-amber-800 dark:text-amber-300">
                <p className="font-medium text-xs sm:text-sm">{t("自动过期说明：", "Auto Expiration:")}</p>
                <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-400">
                  <li>{t("临时额度仅当天有效", "Temporary limit is valid only for today")}</li>
                  <li>{t("北京时间 23:59:59 自动过期", "Auto expires at 23:59:59 Beijing Time")}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 优先级说明 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
            <div className="flex gap-2 sm:gap-3">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-[10px] sm:text-xs text-blue-800 dark:text-blue-300">
                <p className="font-medium text-xs sm:text-sm">{t("优先级规则：", "Priority Rules:")}</p>
                <p className="text-blue-700 dark:text-blue-400 mt-0.5">
                  {t(
                    "临时额度 > 套餐限额",
                    "Temporary limit > Membership limit"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-900 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl sticky bottom-0 z-10">
          {/* 取消临时额度按钮 */}
          {limitDetail?.hasTempLimit && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {loading ? t("处理中...", "Processing...") : t("取消临时", "Cancel Temp")}
            </button>
          )}

          {/* 关闭按钮 */}
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {t("关闭", "Close")}
          </button>

          {/* 提交按钮 */}
          <button
            onClick={handleSubmit}
            disabled={loading || !tempLimit}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg sm:rounded-xl hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? t("设置中...", "Setting...") : t("确认", "Confirm")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
