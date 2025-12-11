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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("用户详情", "User Details")}</DialogTitle>
          <DialogDescription>
            {t("查看用户的完整信息和使用统计", "View complete user information and usage statistics")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              {t("基本信息", "Basic Information")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("用户邮箱", "Email")}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("注册时间", "Registration Date")}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.registrationDate}</span>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              {t("套餐详情", "Plan Details")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("套餐类型", "Plan Type")}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {translatePlanType(user.planType, t)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("状态", "Status")}</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded ${getStatusColor(user.planStatus)}`}>
                  {translateStatus(user.planStatus, t)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("套餐开始时间", "Plan Start Time")}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.planStartTime || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("套餐结束时间", "Plan End Time")}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.planExpiry || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("每日限额", "Daily Limit")}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  ${user.dailyBudget.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              {t("使用统计", "Usage Statistics")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("今日使用", "Today's Usage")}</span>
                <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400">
                  ${user.todayUsage.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("今日剩余", "Today's Remaining")}</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  ${(user.dailyBudget - user.todayUsage || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              {t("活动信息", "Activity")}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("最后活跃", "Last Active")}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.lastActive}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
