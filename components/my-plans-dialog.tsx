/**
 * 我的套餐弹窗
 * Apple风格设计 - 响应式布局
 */

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { membershipApi, type UserMembershipData } from "@/lib/api"
import { Package, Calendar, Clock, Sparkles, ChevronRight } from "lucide-react"

interface MyPlansDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string | null
}

export function MyPlansDialog({ open, onOpenChange, userId }: MyPlansDialogProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<UserMembershipData[]>([])

  useEffect(() => {
    if (open && userId) {
      loadPlans()
    }
  }, [open, userId])

  const loadPlans = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const data = await membershipApi.getAllActivePlans(userId)
      setPlans(data || [])
    } catch (error) {
      console.error("Failed to load plans:", error)
      setPlans([])
    } finally {
      setLoading(false)
    }
  }

  // 判断套餐是否为当前生效
  const isCurrentPlan = (plan: UserMembershipData): boolean => {
    const now = new Date()
    const startTime = new Date(plan.startTime)
    const expireTime = new Date(plan.expireTime)
    return startTime <= now && now < expireTime && plan.status === 1
  }

  // 判断套餐是否为未来待生效
  const isFuturePlan = (plan: UserMembershipData): boolean => {
    const now = new Date()
    const startTime = new Date(plan.startTime)
    return startTime > now
  }

  // 格式化日期时间
  const formatDateTime = (dateStr: string): string => {
    if (!dateStr) return "-"
    try {
      const date = new Date(dateStr)
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  // 计算剩余天数
  const getRemainingDays = (expireTime: string): number => {
    const now = new Date()
    const expire = new Date(expireTime)
    const diff = expire.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  // 当前套餐
  const currentPlan = plans.find(isCurrentPlan)
  // 未来套餐
  const futurePlans = plans.filter(isFuturePlan)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 rounded-t-xl sm:rounded-t-2xl">
          <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400" />
            {t("我的套餐", "My Plans")}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {t("查看您的当前套餐和续费计划", "View your current plan and renewal schedule")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
            </div>
          ) : (
            <>
              {/* 当前套餐 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                    {t("当前套餐", "Current Plan")}
                  </h3>
                </div>

                {currentPlan ? (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-cyan-200 dark:border-cyan-700 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                            {currentPlan.levelName || currentPlan.membershipName}
                          </span>
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-[10px] sm:text-xs font-medium rounded-full">
                            {t("生效中", "Active")}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                          ${currentPlan.dailyUsage}/{t("天", "day")}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl sm:text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                          {getRemainingDays(currentPlan.expireTime)}
                        </div>
                        <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                          {t("天剩余", "days left")}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{t("开始", "Start")}: {formatDateTime(currentPlan.startTime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{t("到期", "Expire")}: {formatDateTime(currentPlan.expireTime)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700">
                    <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                      {t("暂无生效中的套餐", "No active plan")}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
                      {t("请前往定价页面购买套餐", "Please visit pricing page to purchase a plan")}
                    </p>
                  </div>
                )}
              </div>

              {/* 未来续费套餐 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                    {t("续费计划", "Renewal Plans")}
                  </h3>
                  {futurePlans.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px] sm:text-xs font-medium rounded-full">
                      {futurePlans.length}
                    </span>
                  )}
                </div>

                {futurePlans.length > 0 ? (
                  <div className="space-y-2 sm:space-y-3">
                    {futurePlans.map((plan, index) => (
                      <div
                        key={plan.id || index}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-purple-200 dark:border-purple-700"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                                {plan.levelName || plan.membershipName}
                              </span>
                              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] sm:text-xs font-medium rounded-full">
                                {t("待生效", "Pending")}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                              ${plan.dailyUsage}/{t("天", "day")}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{t("开始", "Start")}: {formatDateTime(plan.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{t("到期", "Expire")}: {formatDateTime(plan.expireTime)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {t("暂无续费计划", "No renewal plans")}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-900 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl sticky bottom-0 z-10">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2.5 sm:py-3 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            {t("关闭", "Close")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
