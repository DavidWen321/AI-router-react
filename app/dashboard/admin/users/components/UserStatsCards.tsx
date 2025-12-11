/**
 * 用户统计卡片组件
 */

import { useLanguage } from "@/lib/language-context"
import type { UserData } from "../types"

interface UserStatsCardsProps {
  users: UserData[]
}

export function UserStatsCards({ users }: UserStatsCardsProps) {
  const { t } = useLanguage()

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.planStatus === "活跃").length
  const todayUsage = users.reduce((sum, u) => sum + u.todayUsage, 0)

  // 计算今日平均使用率
  const avgUsageRate = activeUsers > 0
    ? users
        .filter((u) => u.planStatus === "活跃" && u.dailyBudget > 0)
        .reduce((sum, u) => sum + (u.todayUsage / u.dailyBudget) * 100, 0) / activeUsers
    : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("总用户数", "Total Users")}</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalUsers}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-green-400 dark:hover:border-green-500 cursor-pointer">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("活跃会员", "Active Members")}</div>
        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{activeUsers}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-cyan-400 dark:hover:border-cyan-500 cursor-pointer">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("今日总使用", "Today's Usage")}</div>
        <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">${todayUsage.toFixed(2)}</div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-purple-400 dark:hover:border-purple-500 cursor-pointer">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("平均使用率", "Avg Usage Rate")}</div>
        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{avgUsageRate.toFixed(1)}%</div>
      </div>
    </div>
  )
}
