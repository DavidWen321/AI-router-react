/**
 * 用户表格组件
 * 响应式设计：移动端卡片视图 + 桌面端表格视图
 * 智能 Tooltip：鼠标悬停显示完整内容
 */

import { Eye, Trash2, BarChart3, UserPlus, TrendingUp, RefreshCw, DollarSign, Zap, Mail, Calendar, CreditCard } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
      {/* 移动端卡片视图 */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {t("暂无用户数据", "No user data")}
            </div>
          ) : (
            users.map((user) => {
              const actualDailyBudget = (user.planStatus === "活跃" || user.planStatus === "临时") ? user.dailyBudget : 0
              const remaining = actualDailyBudget - user.todayUsage
              const usageRate = actualDailyBudget > 0 ? (user.todayUsage / actualDailyBudget) * 100 : 0

              return (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {/* 顶部：邮箱 + 状态 */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {user.email}
                      </span>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${getStatusColor(user.planStatus)}`}>
                      {translateStatus(user.planStatus, t)}
                    </span>
                  </div>

                  {/* 套餐信息 */}
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {translatePlanType(user.planType, t)}
                    </span>
                    {user.planExpiry && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          {t("到期", "Expires")}: {user.planExpiry}
                        </span>
                      </>
                    )}
                  </div>

                  {/* 额度信息网格 */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("每日限额", "Daily Limit")}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${actualDailyBudget.toFixed(2)}
                        {user.hasTempLimit && (
                          <span className="text-[9px] text-blue-600 dark:text-blue-400 font-medium ml-0.5">({t("临时", "Temp")})</span>
                        )}
                      </span>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("今日剩余", "Remaining")}</span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${remaining.toFixed(2)}
                      </span>
                    </div>
                    <div
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                      onClick={() => onUsageRateClick(user)}
                    >
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("使用率", "Usage")}</span>
                      <div className="flex items-center gap-1">
                        <span className={`text-sm font-semibold ${getUsageRateColor(usageRate)}`}>
                          {usageRate.toFixed(1)}%
                        </span>
                        <BarChart3 className="w-3 h-3 text-cyan-500" />
                      </div>
                    </div>
                  </div>

                  {/* 使用率进度条 */}
                  <div
                    className="mb-3 cursor-pointer"
                    onClick={() => onUsageRateClick(user)}
                  >
                    <div className="relative h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getUsageRateBarColor(usageRate)}`}
                        style={{ width: `${Math.min(usageRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400">
                      {user.lastActive && `${t("活跃", "Active")}: ${user.lastActive}`}
                    </span>
                    <div className="flex items-center gap-1">
                      {/* 查看详情 */}
                      <button
                        onClick={() => onViewUser(user)}
                        className="p-1.5 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                        title={t("查看详情", "View Details")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* 开通会员 */}
                      {user.planStatus !== "活跃" && (
                        <button
                          onClick={() => onActivateMembership(user)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={t("开通会员", "Activate")}
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      )}

                      {/* 会员升级 */}
                      {user.planStatus === "活跃" && (
                        <button
                          onClick={() => onUpgradeMembership(user)}
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          title={t("升级", "Upgrade")}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                      )}

                      {/* 会员续费 */}
                      {user.planStatus === "活跃" && (
                        <button
                          onClick={() => onRenewMembership(user)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                          title={t("续费", "Renew")}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                      {/* 调整额度 */}
                      <button
                        onClick={() => onAdjustTempLimit(user)}
                        className={`p-1.5 text-gray-500 rounded-lg transition-colors ${
                          user.planStatus === "活跃"
                            ? "hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            : "hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        }`}
                        title={user.planStatus === "活跃" ? t("调整额度", "Adjust") : t("临时体验", "Trial")}
                      >
                        {user.planStatus === "活跃" ? <DollarSign className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                      </button>

                      {/* 删除用户 */}
                      <button
                        onClick={() => onDeleteUser(user)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title={t("删除", "Delete")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 桌面端表格视图 - 智能响应式设计，无滚动条 */}
      <div className="hidden lg:block">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {/* 用户邮箱 - 始终显示，自适应宽度 */}
              <th className="px-2 xl:px-3 2xl:px-4 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[18%] 2xl:w-[15%]">
                {t("用户邮箱", "Email")}
              </th>
              {/* 注册时间 - xl以上显示 */}
              <th className="hidden xl:table-cell px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[10%]">
                {t("注册时间", "Registered")}
              </th>
              {/* 套餐类型 - 始终显示 */}
              <th className="px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[10%] lg:w-[12%]">
                {t("套餐", "Plan")}
              </th>
              {/* 状态 - 始终显示 */}
              <th className="px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[8%]">
                {t("状态", "Status")}
              </th>
              {/* 套餐开始时间 - 2xl以上显示 */}
              <th className="hidden 2xl:table-cell px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[9%]">
                {t("开始时间", "Start")}
              </th>
              {/* 套餐结束时间 - xl以上显示 */}
              <th className="hidden xl:table-cell px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[9%]">
                {t("结束时间", "End")}
              </th>
              {/* 每日限额 - 始终显示 */}
              <th className="px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[10%] lg:w-[11%]">
                {t("限额", "Limit")}
              </th>
              {/* 今日剩余 - 始终显示 */}
              <th className="px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[10%] lg:w-[11%]">
                {t("剩余", "Left")}
              </th>
              {/* 使用率 - 始终显示 */}
              <th className="px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[14%] lg:w-[16%]">
                {t("使用率", "Usage")}
              </th>
              {/* 最后活跃 - 2xl以上显示 */}
              <th className="hidden 2xl:table-cell px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[9%]">
                {t("活跃", "Active")}
              </th>
              {/* 操作 - 始终显示 */}
              <th className="px-2 xl:px-3 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[20%] lg:w-[21%] xl:w-[14%]">
                {t("操作", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => {
              const actualDailyBudget = (user.planStatus === "活跃" || user.planStatus === "临时") ? user.dailyBudget : 0
              const remaining = actualDailyBudget - user.todayUsage
              const usageRate = actualDailyBudget > 0 ? (user.todayUsage / actualDailyBudget) * 100 : 0

              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  {/* 用户邮箱 - 可截断 + Tooltip */}
                  <td className="px-2 xl:px-3 2xl:px-4 py-3 text-center text-xs xl:text-sm text-gray-900 dark:text-gray-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate cursor-default">{user.email}</span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={4}
                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm font-medium max-w-[300px] break-all"
                      >
                        {user.email}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  {/* 注册时间 - xl以上显示 + Tooltip */}
                  <td className="hidden xl:table-cell px-2 xl:px-3 py-3 text-center text-xs xl:text-sm text-gray-600 dark:text-gray-400">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate cursor-default">{user.registrationDate}</span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={4}
                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm font-medium"
                      >
                        {t("注册时间", "Registered")}: {user.registrationDate}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  {/* 套餐类型 + Tooltip */}
                  <td className="px-2 xl:px-3 py-3 text-center text-xs xl:text-sm text-gray-900 dark:text-gray-100">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate cursor-default">
                          {translatePlanType(user.planType, t)}
                          {user.hasTempLimit && user.planStatus === "活跃" && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400"> ({t("临时额度", "Temp")})</span>
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={4}
                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm font-medium"
                      >
                        {t("套餐类型", "Plan Type")}: {translatePlanType(user.planType, t)}
                        {user.hasTempLimit && ` (${t("临时额度生效中", "Temporary quota active")})`}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  {/* 状态 */}
                  <td className="px-2 xl:px-3 py-3 text-center">
                    <span className={`inline-flex px-1.5 xl:px-2 py-0.5 text-[10px] xl:text-xs font-medium rounded ${getStatusColor(user.planStatus)}`}>
                      {translateStatus(user.planStatus, t)}
                    </span>
                  </td>
                  {/* 套餐开始时间 - 2xl以上显示 + Tooltip */}
                  <td className="hidden 2xl:table-cell px-2 xl:px-3 py-3 text-center text-xs xl:text-sm text-gray-600 dark:text-gray-400">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate cursor-default">{user.planStartTime || "-"}</span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={4}
                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm font-medium"
                      >
                        {t("开始时间", "Start Time")}: {user.planStartTime || "-"}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  {/* 套餐结束时间 - xl以上显示 + Tooltip */}
                  <td className="hidden xl:table-cell px-2 xl:px-3 py-3 text-center text-xs xl:text-sm text-gray-600 dark:text-gray-400">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate cursor-default">{user.planExpiry || "-"}</span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={4}
                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm font-medium"
                      >
                        {t("结束时间", "End Time")}: {user.planExpiry || "-"}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  {/* 每日限额 */}
                  <td className="px-2 xl:px-3 py-3 text-center text-xs xl:text-sm text-gray-900 dark:text-gray-100">
                    <span>${actualDailyBudget.toFixed(2)}</span>
                    {user.hasTempLimit && (
                      <span className="ml-1 text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                        ({t("临时", "Temp")})
                      </span>
                    )}
                  </td>
                  {/* 今日剩余 */}
                  <td className="px-2 xl:px-3 py-3 text-center text-xs xl:text-sm text-green-600 dark:text-green-400 font-medium">
                    ${remaining.toFixed(2)}
                  </td>
                  {/* 使用率 - 响应式进度条 */}
                  <td className="px-2 xl:px-3 py-3">
                    <div
                      className="flex items-center justify-center gap-1 xl:gap-2 cursor-pointer group"
                      onClick={() => onUsageRateClick(user)}
                      title={t("点击查看详细统计", "Click to view detailed statistics")}
                    >
                      <div className="relative flex-1 h-1.5 xl:h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden group-hover:h-2 xl:group-hover:h-2.5 transition-all">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${getUsageRateBarColor(usageRate)}`}
                          style={{ width: `${Math.min(usageRate, 100)}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] xl:text-xs font-semibold group-hover:scale-110 transition-transform ${getUsageRateColor(usageRate)}`}
                      >
                        {usageRate.toFixed(0)}%
                      </span>
                      <BarChart3 className="hidden xl:block w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 opacity-60 group-hover:opacity-100 transition-all" />
                    </div>
                  </td>
                  {/* 最后活跃 - 2xl以上显示 + Tooltip */}
                  <td className="hidden 2xl:table-cell px-2 xl:px-3 py-3 text-center text-xs xl:text-sm text-gray-600 dark:text-gray-400">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block truncate cursor-default">{user.lastActive}</span>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        sideOffset={4}
                        className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm font-medium"
                      >
                        {t("最后活跃", "Last Active")}: {user.lastActive}
                      </TooltipContent>
                    </Tooltip>
                  </td>
                  {/* 操作按钮 - 响应式间距 */}
                  <td className="px-2 xl:px-3 py-3">
                    <div className="flex items-center justify-center gap-0.5 xl:gap-1">
                      {/* 查看详情 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onViewUser(user)
                        }}
                        className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title={t("查看详情", "View Details")}
                      >
                        <Eye className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                      </button>

                      {/* 开通会员 - 仅当用户无活跃会员时显示 */}
                      {user.planStatus !== "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onActivateMembership(user)
                          }}
                          className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("开通会员", "Activate Membership")}
                        >
                          <UserPlus className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                      )}

                      {/* 会员升级 - 仅当用户有活跃会员时显示 */}
                      {user.planStatus === "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpgradeMembership(user)
                          }}
                          className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("会员升级", "Upgrade Membership")}
                        >
                          <TrendingUp className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                      )}

                      {/* 会员续费 - 仅当用户有活跃会员时显示 */}
                      {user.planStatus === "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRenewMembership(user)
                          }}
                          className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("会员续费", "Renew Membership")}
                        >
                          <RefreshCw className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                      )}

                      {/* 临时调整额度 - 仅当用户有活跃会员时显示 */}
                      {user.planStatus === "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onAdjustTempLimit(user)
                          }}
                          className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("临时调整额度", "Adjust Temporary Limit")}
                        >
                          <DollarSign className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                      )}

                      {/* 临时体验 - 仅当用户无活跃会员时显示 */}
                      {user.planStatus !== "活跃" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onAdjustTempLimit(user)
                          }}
                          className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("临时体验", "Temporary Trial")}
                        >
                          <Zap className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                      )}

                      {/* 删除用户 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteUser(user)
                        }}
                        className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title={t("删除用户", "Delete User")}
                      >
                        <Trash2 className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
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
