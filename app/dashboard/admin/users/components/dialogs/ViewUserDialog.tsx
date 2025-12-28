/**
 * 查看用户详情对话框组件
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Mail, CreditCard, TrendingUp, Activity } from "lucide-react"
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
          {/* Basic Information */}
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

          {/* Plan Details */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
              {t("套餐详情", "Plan Details")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("套餐类型", "Plan Type")}</span>
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
            </div>
          </div>

          {/* Usage Statistics */}
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
              {t("使用统计", "Usage Statistics")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("今日使用", "Today's Usage")}</span>
                <span className="text-xs sm:text-sm font-medium text-cyan-600 dark:text-cyan-400">
                  ${user.todayUsage.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t("今日剩余", "Today's Remaining")}</span>
                <span className="text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                  ${(user.dailyBudget - user.todayUsage || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Activity */}
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
