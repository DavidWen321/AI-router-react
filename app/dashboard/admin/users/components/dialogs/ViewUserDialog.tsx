/**
 * 查看用户详情对话框组件
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Mail, CreditCard, TrendingUp, Activity, WalletCards } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { getStatusColor, translatePlanType, translateStatus } from "../../utils/userHelpers"
import type { UserData } from "../../types"

interface ViewUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserData | null
}

export function ViewUserDialog({ open, onOpenChange, user }: ViewUserDialogProps) {
  const { t } = useLanguage()

  if (!user) return null

  const isPaygUser = user.billingMode === "PAYG" || user.planType === "按量充值"
  const consumed = Math.max(0, user.todayUsage)
  const totalConsumed = Math.max(0, user.walletTotalConsumed ?? 0)
  const remaining = isPaygUser
    ? Math.max(0, user.walletBalance ?? 0)
    : Math.max(0, user.dailyBudget - user.todayUsage)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 rounded-t-xl sm:rounded-t-2xl">
          <DialogTitle className="text-lg sm:text-xl font-semibold">{t("用户详情", "User Details")}</DialogTitle>
          <DialogDescription className="text-sm">
            {t("查看用户的完整信息和使用统计", "View complete user information and usage statistics")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-5 py-2 sm:py-4">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
              {t("基本信息", "Basic Information")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{t("用户邮箱", "Email")}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.email}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">{t("注册时间", "Registration Date")}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{user.registrationDate}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
              {isPaygUser ? (
                <WalletCards className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
              )}
              {isPaygUser ? t("按量信息", "PAYG Profile") : t("套餐详情", "Plan Details")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("计费类型", "Billing Type")}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                  {translatePlanType(user.planType, t)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("状态", "Status")}</span>
                <span className={`text-xs sm:text-sm font-medium px-1.5 sm:px-2 py-0.5 rounded ${getStatusColor(user.planStatus)}`}>
                  {translateStatus(user.planStatus, t)}
                </span>
              </div>

              {isPaygUser ? (
                <>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("按量开关", "PAYG Status")}</span>
                    <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">{t("已启用", "Enabled")}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("并发策略", "Concurrency")}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user.unlimitedConcurrency ? t("无限并发", "Unlimited") : t("默认并发", "Default")}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("开始时间", "Start Time")}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{user.planStartTime || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("结束时间", "End Time")}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{user.planExpiry || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("每日限额", "Daily Limit")}</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                      ${user.dailyBudget.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
              {t("使用统计", "Usage Statistics")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {isPaygUser ? t("消费额度", "Consumed") : t("今日使用", "Today's Usage")}
                </span>
                <span className="text-xs sm:text-sm font-medium text-cyan-600 dark:text-cyan-400">
                  ${consumed.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {isPaygUser ? t("剩余额度", "Remaining") : t("今日剩余", "Today's Remaining")}
                </span>
                <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                  ${remaining.toFixed(2)}
                </span>
              </div>
              {isPaygUser && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {t("累计消费", "Total Consumed")}
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-orange-600 dark:text-orange-400">
                    ${totalConsumed.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
              {t("活动信息", "Activity")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("最后活跃", "Last Active")}</span>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">{user.lastActive}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
