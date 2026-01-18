/**
 * 图表统计卡片组件
 */

import { Users, Activity, TrendingUp, BarChart3 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { ChartStats } from "../../types"

interface ChartStatsCardsProps {
  stats: ChartStats
}

export function ChartStatsCards({ stats }: ChartStatsCardsProps) {
  const { t } = useLanguage()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {/* Highest usage user card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-700 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-sm font-medium text-purple-900 dark:text-purple-300">
            {t("使用量最高用户", "Highest Usage User")}
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400 truncate">
          {stats.highestUsageUser.email}
        </div>
        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
          ${stats.highestUsageUser.todayUsage.toFixed(2)}
        </div>
      </div>

      {/* Highest usage rate card */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-4 sm:p-6 border border-red-200 dark:border-red-700 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
            <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-sm font-medium text-red-900 dark:text-red-300">
            {t("最高使用率", "Highest Usage Rate")}
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{stats.maxRate.toFixed(1)}%</div>
      </div>

      {/* Lowest usage rate card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-700 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-sm font-medium text-green-900 dark:text-green-300">
            {t("最低使用率", "Lowest Usage Rate")}
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
          {stats.minRate.toFixed(1)}%
        </div>
      </div>

      {/* Current usage rate card */}
      <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl p-4 sm:p-6 border border-cyan-200 dark:border-cyan-700 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
            <BarChart3 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-sm font-medium text-cyan-900 dark:text-cyan-300">
            {t("当前使用率", "Current Usage Rate")}
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
          {stats.currentRate.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}
