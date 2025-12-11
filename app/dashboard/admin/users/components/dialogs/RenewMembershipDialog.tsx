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
  const [selectedMembership, setSelectedMembership] = useState<number | null>(null)
  const [months, setMonths] = useState(1)
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")  // 精确到时分秒
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("23:59:59")

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

      // 加载当前会员
      const current = await membershipApi.getCurrentMembership(user!.id)
      if (current) {
        setCurrentMembership(current)

        // 默认选择当前相同的套餐
        setSelectedMembership(current.membershipId)

        // 默认起始时间 = 当前会员结束时间（精确到时分秒）
        const expireDateTime = new Date(current.expireTime)
        setStartDate(current.expireTime.slice(0, 10))  // 日期部分
        setStartTime(current.expireTime.slice(11, 19))  // 时分秒部分

        // 计算结束时间（从当前会员结束时间开始计算）
        calculateEndDate(expireDateTime, 1)
      } else {
        toast({
          title: t("无法续费", "Cannot Renew"),
          description: t("用户暂无会员，请先开通会员", "User has no membership, please activate first"),
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

    // 验证起始时间必须 >= 当前会员结束时间
    if (currentMembership) {
      const currentEndDateTime = new Date(currentMembership.expireTime)
      const renewStartDateTime = new Date(`${startDate}T${startTime}`)

      if (renewStartDateTime < currentEndDateTime) {
        toast({
          title: t("日期错误", "Invalid Date"),
          description: t(
            "续费开始时间不能早于当前会员结束时间",
            "Renewal start date cannot be earlier than current membership end date"
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
  const minStartDate = currentMembership ? currentMembership.expireTime.slice(0, 10) : ""

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-rose-900/20 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-xl">
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-purple-600" />
            {t("会员续费", "Renew Membership")}
          </DialogTitle>
          <DialogDescription>{t("为用户续费会员套餐", "Renew membership for user")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 用户邮箱 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("用户邮箱", "User Email")}
            </label>
            <div className="mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
              {user?.email}
            </div>
          </div>

          {/* 当前会员信息 */}
          {currentMembership && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                {t("当前会员", "Current Membership")}
              </div>
              <div className="text-gray-900 dark:text-gray-100">
                <div className="font-semibold">{currentMembership.levelName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  ${currentMembership.dailyUsage}/天
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t("结束时间", "End Time")}: {currentMembership.expireTime.slice(0, 19).replace("T", " ")}
                </div>
              </div>
            </div>
          )}

          {/* 续费套餐选择 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("续费套餐", "Renewal Plan")}
            </label>
            <select
              value={selectedMembership || ""}
              onChange={(e) => setSelectedMembership(Number(e.target.value))}
              className="mt-1 w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("续费月数", "Months")}</label>
            <div className="mt-1 flex gap-2">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => handleMonthsChange(m)}
                  className={`flex-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                    months === m
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {m} {t("个月", "month(s)")}
                </button>
              ))}
            </div>
          </div>

          {/* 续费开始时间 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("续费开始时间", "Renewal Start Date & Time")}
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  min={minStartDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <input
                type="time"
                step="1"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("默认从当前会员结束时间开始（精确到秒）", "Default: starts from current membership end time (precise to second)")}
            </p>
          </div>

          {/* 续费结束时间 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("续费结束时间", "Renewal End Date & Time")}
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <input
                type="time"
                step="1"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          {/* 续费预览 */}
          {selectedPlan && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
                {t("续费预览", "Renewal Preview")}
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <div>
                  {t("套餐", "Plan")}: <span className="font-semibold">{selectedPlan.levelName}</span>
                </div>
                <div className="mt-1">
                  {t("开始", "Start")}: {startDate} {startTime}
                </div>
                <div className="mt-1">
                  {t("结束", "End")}: {endDate} {endTime}
                </div>
                <div className="mt-1">
                  {t("续费时长", "Duration")}: {months} {t("个月", "month(s)")}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 bg-gray-50 dark:bg-gray-900 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
          >
            {t("取消", "Cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-sm hover:shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("续费中...", "Renewing...") : t("确认续费", "Confirm")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
