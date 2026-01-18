/**
 * 会员续费对话框
 * Apple风格设计
 */

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { membershipApi, adminApi } from "@/lib/api"
import { Calendar, RefreshCw } from "lucide-react"
import type { UserData } from "../../types"

interface RenewMembershipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserData | null
  onSuccess: () => void
}

interface MembershipData {
  id: number
  levelName: string
  levelCode: string
  dailyUsage: number
  price: number
}

interface CurrentMembership {
  id: number
  membershipId: number
  levelName: string
  dailyUsage: number
  startTime: string
  expireTime: string
}

export function RenewMembershipDialog({ open, onOpenChange, user, onSuccess }: RenewMembershipDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [memberships, setMemberships] = useState<MembershipData[]>([])
  const [currentMembership, setCurrentMembership] = useState<CurrentMembership | null>(null)
  const [isExpiredMembership, setIsExpiredMembership] = useState(false)  // ✅ 标记是否是已过期会员
  const [selectedMembership, setSelectedMembership] = useState<number | null>(null)
  const [months, setMonths] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")  // 精确到时分秒
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("23:59:59")
  const [latestExpireDateTime, setLatestExpireDateTime] = useState("")  // ✅ 存储最晚截止时间，用于验证

  useEffect(() => {
    if (open && user) {
      loadData()
    }
  }, [open, user])

  const loadData = async () => {
    try {
      // 加载套餐列表
      const plans = await membershipApi.getActiveMemberships()
      setMemberships(plans)

      // ✅ 优化：获取用户所有有效套餐（当前生效 + 未来待生效）
      // 这样可以正确处理续费，避免空窗期
      let allActivePlans: CurrentMembership[] = []
      let current: CurrentMembership | null = null
      let isExpired = false
      let latestExpireTime: string | null = null  // 所有套餐中最晚的截止时间

      try {
        // 使用新接口获取所有有效套餐
        allActivePlans = await membershipApi.getAllActivePlans(user!.id) as CurrentMembership[]
        console.log("获取到用户所有有效套餐:", allActivePlans)

        if (allActivePlans && allActivePlans.length > 0) {
          const now = new Date()

          // 找到当前正在生效的套餐（用于显示）
          current = allActivePlans.find(p => {
            const startTime = new Date(p.startTime)
            const expireTime = new Date(p.expireTime)
            return startTime <= now && now < expireTime
          }) || null

          // ✅ 关键逻辑：找到所有套餐中最晚的截止时间
          // 续费应该从最晚的截止时间开始，避免空窗期
          latestExpireTime = allActivePlans.reduce((latest, plan) => {
            if (!latest) return plan.expireTime
            return new Date(plan.expireTime) > new Date(latest) ? plan.expireTime : latest
          }, null as string | null)

          console.log("最晚套餐截止时间:", latestExpireTime)
        }
      } catch (e) {
        console.log("获取用户有效套餐失败，尝试其他方式:", e)
      }

      // ✅ 如果没有有效套餐，尝试从历史记录中找到最近的会员
      if (!current && !latestExpireTime) {
        try {
          const history = await membershipApi.getMembershipHistory(user!.id)
          if (history && history.length > 0) {
            // 按过期时间降序排序，找到最近的会员
            const sortedHistory = history.sort((a, b) =>
              new Date(b.expireTime).getTime() - new Date(a.expireTime).getTime()
            )

            // 取最近30天内过期的会员
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

            const recentExpired = sortedHistory.find(m =>
              new Date(m.expireTime) > thirtyDaysAgo
            )

            if (recentExpired) {
              current = recentExpired as CurrentMembership
              latestExpireTime = recentExpired.expireTime
              isExpired = true
              console.log("找到最近过期的会员:", recentExpired)
            }
          }
        } catch (historyError) {
          console.error("获取会员历史失败:", historyError)
        }
      }

      // 如果有有效套餐或历史记录
      if (current || latestExpireTime) {
        // 显示当前套餐（如果有）
        if (current) {
          setCurrentMembership(current)
          setIsExpiredMembership(isExpired)
          setSelectedMembership(current.membershipId)
        } else if (allActivePlans.length > 0) {
          // 如果没有当前套餐但有未来套餐，显示第一个未来套餐
          const firstFuturePlan = allActivePlans[0]
          setCurrentMembership(firstFuturePlan)
          setIsExpiredMembership(false)
          setSelectedMembership(firstFuturePlan.membershipId)
        }

        // ✅ 关键：续费开始时间 = 所有套餐中最晚的截止时间（精确到秒）
        // 这确保续费无缝衔接，没有空窗期
        const renewStartDateTime = latestExpireTime || current?.expireTime || ""
        if (renewStartDateTime) {
          setStartDate(renewStartDateTime.slice(0, 10))
          setStartTime(renewStartDateTime.slice(11, 19) || "00:00:00")
          setLatestExpireDateTime(renewStartDateTime)  // ✅ 保存用于验证

          // 计算结束时间
          calculateEndDate(new Date(renewStartDateTime), 1)
        }

        // 如果是过期会员，显示提示
        if (isExpired && current) {
          toast({
            title: t("会员已过期", "Membership Expired"),
            description: t(
              "用户会员已于 " + current.expireTime.slice(0, 16).replace("T", " ") + " 过期，您可以为其续费",
              "User membership expired at " + current.expireTime.slice(0, 16).replace("T", " ") + ", you can renew it"
            ),
          })
        }

        // ✅ 如果有多个套餐（包含未来套餐），显示提示
        if (allActivePlans.length > 1) {
          const futurePlansCount = allActivePlans.filter(p => new Date(p.startTime) > new Date()).length
          if (futurePlansCount > 0) {
            toast({
              title: t("检测到待生效套餐", "Pending Plans Detected"),
              description: t(
                `用户有 ${futurePlansCount} 个待生效套餐，续费将从最晚套餐（${latestExpireTime?.slice(0, 16).replace("T", " ")}）之后开始`,
                `User has ${futurePlansCount} pending plan(s), renewal will start after the latest plan (${latestExpireTime?.slice(0, 16).replace("T", " ")})`
              ),
            })
          }
        }
      } else {
        toast({
          title: t("无法续费", "Cannot Renew"),
          description: t("用户没有会员记录或会员已过期超过30天，请使用开通会员功能", "User has no membership record or membership expired over 30 days ago, please use activate membership"),
          variant: "destructive",
        })
        onOpenChange(false)
      }
    } catch (error: any) {
      toast({
        title: t("加载失败", "Load Failed"),
        description: error.message || t("无法加载数据", "Failed to load data"),
        variant: "destructive",
      })
    }
  }

  const calculateEndDate = (start: Date, monthCount: number) => {
    const end = new Date(start)
    end.setMonth(end.getMonth() + monthCount)
    setEndDate(end.toISOString().slice(0, 10))
    setEndTime(end.toISOString().slice(11, 19))
  }

  const handleMonthsChange = (newMonths: number) => {
    setMonths(newMonths)
    if (startDate && startTime) {
      calculateEndDate(new Date(`${startDate}T${startTime}`), newMonths)
    }
  }

  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    if (startTime) {
      calculateEndDate(new Date(`${value}T${startTime}`), months)
    }
  }

  const handleStartTimeChange = (value: string) => {
    setStartTime(value)
    if (startDate) {
      calculateEndDate(new Date(`${startDate}T${value}`), months)
    }
  }

  const handleSubmit = async () => {
    if (!user || !selectedMembership || !startDate || !startTime || !endDate || !endTime) {
      toast({
        title: t("请填写完整信息", "Please fill in all fields"),
        variant: "destructive",
      })
      return
    }

    // ✅ 验证起始时间必须 >= 最晚套餐结束时间（避免空窗期）
    if (latestExpireDateTime) {
      const latestEndDateTime = new Date(latestExpireDateTime)
      const renewStartDateTime = new Date(`${startDate}T${startTime}`)

      if (renewStartDateTime < latestEndDateTime) {
        const expireTimeStr = latestExpireDateTime.slice(0, 19).replace("T", " ")
        const startTimeStr = `${startDate} ${startTime}`
        toast({
          title: t("日期错误", "Invalid Date"),
          description: t(
            `续费开始时间（${startTimeStr}）不能早于最晚套餐结束时间（${expireTimeStr}），以避免会员空窗期`,
            `Renewal start time (${startTimeStr}) cannot be earlier than latest plan end time (${expireTimeStr}) to avoid coverage gaps`
          ),
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)
    try {
      // 构造续费开始时间和结束时间（精确到秒）
      const renewStartDateTime = `${startDate}T${startTime}`
      const renewExpireDateTime = `${endDate}T${endTime}`

      // 调用后端续费接口（插入新的会员记录）
      await adminApi.renewUserMembership({
        userId: user.id.toString(),
        membershipId: selectedMembership,
        startTime: renewStartDateTime,
        expireTime: renewExpireDateTime,
      })

      toast({
        title: t("续费成功", "Renewed Successfully"),
        description: t(`已为用户 ${user.email} 续费`, `Membership renewed for ${user.email}`),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: t("续费失败", "Renewal Failed"),
        description: error.message || t("无法续费会员", "Failed to renew membership"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = memberships.find((m) => m.id === selectedMembership)
  // ✅ 使用最晚截止时间作为最小开始日期
  const minStartDate = latestExpireDateTime ? latestExpireDateTime.slice(0, 10) : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 -mx-4 sm:-mx-6 -mt-4 sm:-mt-6 px-4 sm:px-6 pt-4 sm:pt-6 pb-4 rounded-t-xl sm:rounded-t-2xl">
          <DialogTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            {t("会员续费", "Renew Membership")}
          </DialogTitle>
          <DialogDescription className="text-sm">{t("为用户续费会员套餐", "Renew membership for user")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
          {/* 用户邮箱 */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("用户邮箱", "User Email")}
            </label>
            <div className="mt-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 truncate">
              {user?.email}
            </div>
          </div>

          {/* 当前会员信息 */}
          {currentMembership && (
            <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border ${
              isExpiredMembership
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
            }`}>
              <div className={`text-xs sm:text-sm font-medium mb-2 flex items-center gap-2 ${
                isExpiredMembership
                  ? "text-amber-900 dark:text-amber-300"
                  : "text-blue-900 dark:text-blue-300"
              }`}>
                {isExpiredMembership ? t("已过期会员", "Expired Membership") : t("当前会员", "Current Membership")}
                {isExpiredMembership && (
                  <span className="text-[10px] sm:text-xs bg-amber-200 dark:bg-amber-700 text-amber-800 dark:text-amber-200 px-1 sm:px-1.5 py-0.5 rounded">
                    {t("已过期", "EXPIRED")}
                  </span>
                )}
              </div>
              <div className="text-gray-900 dark:text-gray-100">
                <div className="font-semibold text-sm sm:text-base">{currentMembership.levelName}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                  ${currentMembership.dailyUsage}/天
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {t("结束时间", "End Time")}: {currentMembership.expireTime.slice(0, 19).replace("T", " ")}
                </div>
              </div>
            </div>
          )}

          {/* 续费套餐选择 */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("续费套餐", "Renewal Plan")}
            </label>
            <select
              value={selectedMembership || ""}
              onChange={(e) => setSelectedMembership(Number(e.target.value))}
              className="mt-1 w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              {memberships.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.levelName} (${m.dailyUsage}/天)
                </option>
              ))}
            </select>
          </div>

          {/* 月数选择 */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{t("续费月数", "Months")}</label>
            <div className="mt-1 grid grid-cols-4 gap-1.5 sm:gap-2">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => handleMonthsChange(m)}
                  className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg sm:rounded-xl transition-all duration-300 ${
                    months === m
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {m}{t("月", "mo")}
                </button>
              ))}
            </div>
          </div>

          {/* 续费开始时间 */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("续费开始时间", "Start Date & Time")}
            </label>
            <div className="mt-1 grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  min={minStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-8 sm:pl-10 text-sm bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <Calendar className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              </div>
              <input
                type="time"
                step="1"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-2 sm:px-4 py-2 sm:py-2.5 text-sm bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <p className="mt-1 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
              {t("默认从当前会员结束时间开始", "Default: from membership end time")}
            </p>
          </div>

          {/* 续费结束时间 */}
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("续费结束时间", "End Date & Time")}
            </label>
            <div className="mt-1 grid grid-cols-2 gap-1.5 sm:gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-8 sm:pl-10 text-sm bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <Calendar className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
              </div>
              <input
                type="time"
                step="1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2 sm:px-4 py-2 sm:py-2.5 text-sm bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* 续费预览 */}
          {selectedPlan && (
            <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="text-xs sm:text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                {t("续费预览", "Renewal Preview")}
              </div>
              <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <div>
                  {t("套餐", "Plan")}: <span className="font-semibold">{selectedPlan.levelName}</span>
                </div>
                <div className="truncate">
                  {t("开始", "Start")}: {startDate} {startTime}
                </div>
                <div className="truncate">
                  {t("结束", "End")}: {endDate} {endTime}
                </div>
                <div>
                  {t("时长", "Duration")}: {months}{t("月", "mo")}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-900 -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 px-4 sm:px-6 py-3 sm:py-4 rounded-b-xl sm:rounded-b-2xl sticky bottom-0 z-10">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
          >
            {t("取消", "Cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("续费中...", "Renewing...") : t("确认", "Confirm")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
