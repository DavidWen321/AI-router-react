/**
 * 开通会员对话框
 * Apple风格设计
 */

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { membershipApi, adminApi } from "@/lib/api"
import { Calendar } from "lucide-react"
import type { UserData } from "../../types"

interface ActivateMembershipDialogProps {
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

export function ActivateMembershipDialog({ open, onOpenChange, user, onSuccess }: ActivateMembershipDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [memberships, setMemberships] = useState<MembershipData[]>([])
  const [selectedMembership, setSelectedMembership] = useState<number | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [months, setMonths] = useState(1)
  const [overlapError, setOverlapError] = useState("")

  // 加载套餐列表
  useEffect(() => {
    if (open && user) {
      loadMemberships()
      loadDefaultDates()
    }
  }, [open, user])

  const loadMemberships = async () => {
    try {
      const data = await membershipApi.getActiveMemberships()
      setMemberships(data)
      if (data.length > 0) {
        setSelectedMembership(data[0].id)
      }
    } catch (error: any) {
      toast({
        title: t("加载失败", "Load Failed"),
        description: error.message || t("无法加载套餐列表", "Failed to load membership list"),
        variant: "destructive",
      })
    }
  }

  const loadDefaultDates = async () => {
    if (!user) return

    try {
      // 获取用户当前会员
      const current = await membershipApi.getCurrentMembership(user.id)
      if (current) {
        // 默认从当前会员结束时间开始
        const start = new Date(current.expireTime)
        setStartDate(start.toISOString().slice(0, 10))
        calculateEndDate(start, months)
      } else {
        // 无会员，从今天开始
        const today = new Date()
        setStartDate(today.toISOString().slice(0, 10))
        calculateEndDate(today, months)
      }
    } catch (error) {
      // 无会员，从今天开始
      const today = new Date()
      setStartDate(today.toISOString().slice(0, 10))
      calculateEndDate(today, months)
    }
  }

  const calculateEndDate = (start: Date, monthCount: number) => {
    const end = new Date(start)
    end.setMonth(end.getMonth() + monthCount)
    end.setHours(23, 59, 59)
    setEndDate(end.toISOString().slice(0, 10))
  }

  const handleStartDateChange = (value: string) => {
    setStartDate(value)
    const start = new Date(value)
    calculateEndDate(start, months)
    checkOverlap(value, endDate)
  }

  const handleMonthsChange = (newMonths: number) => {
    setMonths(newMonths)
    if (startDate) {
      calculateEndDate(new Date(startDate), newMonths)
    }
  }

  const checkOverlap = async (start: string, end: string) => {
    if (!user || !start || !end) return

    try {
      const history = await membershipApi.getMembershipHistory(user.id)
      const newStart = new Date(start)
      const newEnd = new Date(end)

      for (const membership of history) {
        const existStart = new Date(membership.startTime)
        const existEnd = new Date(membership.expireTime)

        // 检查重叠
        if (newStart < existEnd && newEnd > existStart) {
          setOverlapError(
            t(
              `时间重叠：该用户已有 ${membership.levelName} 会员 (${membership.startTime.slice(
                0,
                10
              )} ~ ${membership.expireTime.slice(0, 10)})`,
              `Time overlap: User already has ${membership.levelName} membership (${membership.startTime.slice(
                0,
                10
              )} ~ ${membership.expireTime.slice(0, 10)})`
            )
          )
          return
        }
      }

      setOverlapError("")
    } catch (error) {
      // 忽略错误，允许继续
    }
  }

  const handleSubmit = async () => {
    if (!user || !selectedMembership || !startDate || !endDate) {
      toast({
        title: t("请填写完整信息", "Please fill in all fields"),
        variant: "destructive",
      })
      return
    }

    if (overlapError) {
      toast({
        title: t("时间冲突", "Time Conflict"),
        description: overlapError,
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const expireTime = new Date(endDate)
      expireTime.setHours(23, 59, 59)

      await adminApi.updateUserMembership({
        userId: user.id.toString(),
        membershipId: selectedMembership,
        expireTime: expireTime.toISOString().slice(0, 19),
      })

      toast({
        title: t("开通成功", "Activated Successfully"),
        description: t(`已为用户 ${user.email} 开通会员`, `Membership activated for ${user.email}`),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: t("开通失败", "Activation Failed"),
        description: error.message || t("无法开通会员", "Failed to activate membership"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedMembershipData = memberships.find((m) => m.id === selectedMembership)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-xl">
          <DialogTitle className="text-xl font-semibold">{t("开通会员", "Activate Membership")}</DialogTitle>
          <DialogDescription>{t("为用户开通新的会员套餐", "Activate new membership for user")}</DialogDescription>
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

          {/* 会员套餐选择 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("会员套餐", "Membership Plan")}
            </label>
            <select
              value={selectedMembership || ""}
              onChange={(e) => setSelectedMembership(Number(e.target.value))}
              className="mt-1 w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("购买月数", "Months")}</label>
            <div className="mt-1 flex gap-2">
              {[1, 3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => handleMonthsChange(m)}
                  className={`flex-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                    months === m
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {m} {t("个月", "month(s)")}
                </button>
              ))}
            </div>
          </div>

          {/* 开始时间 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("开始时间", "Start Date")}
            </label>
            <div className="relative mt-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 结束时间 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("结束时间", "End Date")}
            </label>
            <div className="relative mt-1">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  checkOverlap(startDate, e.target.value)
                }}
                className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* 重叠错误提示 */}
          {overlapError && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
              {overlapError}
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
            disabled={loading || !!overlapError}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-sm hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("开通中...", "Activating...") : t("确认开通", "Confirm")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
