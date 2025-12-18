/**
 * 用户表格组件
 */

import { Eye, Trash2, BarChart3, UserPlus, TrendingUp, RefreshCw, DollarSign, Zap } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import {
  getStatusColor,
  translatePlanType,
  translateStatus,
  getUsageRateColor,
  getUsageRateBarColor,
} from "../utils/userHelpers"
import type { UserData } from "../types"

interface UserTableProps {
  users: UserData[]
  onViewUser: (user: UserData) => void
  onActivateMembership: (user: UserData) => void
  onUpgradeMembership: (user: UserData) => void
  onRenewMembership: (user: UserData) => void
  onDeleteUser: (user: UserData) => void
  onUsageRateClick: (user: UserData) => void
  onAdjustTempLimit: (user: UserData) => void
}

export function UserTable({ users, onViewUser, onActivateMembership, onUpgradeMembership, onRenewMembership, onDeleteUser, onUsageRateClick, onAdjustTempLimit }: UserTableProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("用户邮箱", "User Email")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("注册时间", "Registration Date")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("套餐类型", "Plan Type")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("状态", "Status")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("套餐开始时间", "Plan Start Time")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("套餐结束时间", "Plan End Time")}
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("每日限额", "Daily Limit")}
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("今日剩余", "Today's Remaining")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("使用率", "Usage Rate")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("最后活跃", "Last Active")}
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("操作", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => {
              // 如果用户没有活跃会员，每日限额显示为 0
              const actualDailyBudget = user.planStatus === "活跃" ? user.dailyBudget : 0
              const remaining = actualDailyBudget - user.todayUsage
              const usageRate = actualDailyBudget > 0 ? (user.todayUsage / actualDailyBudget) * 100 : 0

              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.registrationDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {translatePlanType(user.planType, t)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(user.planStatus)}`}>
                      {translateStatus(user.planStatus, t)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.planStartTime || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {user.planExpiry || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                    ${actualDailyBudget.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-green-600 dark:text-green-400 font-medium">
                    ${remaining.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="flex items-center gap-2 min-w-[120px] cursor-pointer group"
                      onClick={() => onUsageRateClick(user)}
                      title={t("点击查看详细统计", "Click to view detailed statistics")}
                    >
                      <div className="relative flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden group-hover:h-2.5 transition-all">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getUsageRateBarColor(usageRate)}`}
                          style={{ width: `${Math.min(usageRate, 100)}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold whitespace-nowrap group-hover:scale-110 transition-transform ${getUsageRateColor(usageRate)}`}
                      >
                        {usageRate.toFixed(1)}%
                      </span>
                      <BarChart3 className="w-4 h-4 text-cyan-500 dark:text-cyan-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.lastActive}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* 查看详情 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewUser(user)
                        }}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title={t("查看详情", "View Details")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* 开通会员 - 仅当用户无活跃会员时显示 */}
                      {user.planStatus !== "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onActivateMembership(user)
                          }}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("开通会员", "Activate Membership")}
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}

                      {/* 会员升级 - 仅当用户有活跃会员时显示 */}
                      {user.planStatus === "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpgradeMembership(user)
                          }}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("会员升级", "Upgrade Membership")}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      )}

                      {/* 会员续费 - 仅当用户有活跃会员时显示 */}
                      {user.planStatus === "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRenewMembership(user)
                          }}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("会员续费", "Renew Membership")}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                      {/* 临时调整额度 - 仅当用户有活跃会员时显示 */}
                      {user.planStatus === "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onAdjustTempLimit(user)
                          }}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("临时调整额度", "Adjust Temporary Limit")}
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      )}

                      {/* 临时体验 - 仅当用户无活跃会员时显示 */}
                      {user.planStatus !== "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onAdjustTempLimit(user)
                          }}
                          className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("临时体验", "Temporary Trial")}
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                      )}

                      {/* 删除用户 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteUser(user)
                        }}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title={t("删除用户", "Delete User")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
