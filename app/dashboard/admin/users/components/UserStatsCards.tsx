/**
 * 用户统计卡片组件
 */

import { useLanguage } from "@/lib/language-context"
import type { UserData } from "../types"

interface UserStatsCardsProps {
  users: UserData[]
  totalRevenue: number
  totalConsumption: number
}

export function UserStatsCards({ users, totalRevenue, totalConsumption }: UserStatsCardsProps) {
  const { t } = useLanguage()

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.planStatus === "活跃").length
  const todayUsage = users.reduce((sum, u) => sum + u.todayUsage, 0)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 min-h-[96px] sm:min-h-[108px] shadow-sm">
        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">{t("总用户数", "Total Users")}</div>
        <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{totalUsers}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 min-h-[96px] sm:min-h-[108px] shadow-sm">
        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">{t("活跃会员", "Active Members")}</div>
        <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{activeUsers}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 min-h-[96px] sm:min-h-[108px] shadow-sm">
        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">{t("今日总使用", "Today's Usage")}</div>
        <div className="text-lg sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">${todayUsage.toFixed(2)}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 min-h-[96px] sm:min-h-[108px] shadow-sm">
        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">{t("总收入", "Total Revenue")}</div>
        <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">${totalRevenue.toFixed(2)}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 min-h-[96px] sm:min-h-[108px] shadow-sm">
        <div className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1">{t("额度总消耗", "Total Consumption")}</div>
        <div className="text-lg sm:text-2xl font-bold text-orange-600 dark:text-orange-400">${totalConsumption.toFixed(2)}</div>
      </div>
    </div>
  )
}
