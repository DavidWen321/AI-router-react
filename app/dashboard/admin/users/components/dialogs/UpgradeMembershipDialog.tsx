/**
 * 会员升级对话框
 * Apple风格设计
 */

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import { membershipApi, adminApi } from "@/lib/api"
import { Calendar, ArrowRight } from "lucide-react"
import type { UserData } from "../../types"

interface UpgradeMembershipDialogProps {
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

export function UpgradeMembershipDialog({ open, onOpenChange, user, onSuccess }: UpgradeMembershipDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [memberships, setMemberships] = useState<MembershipData[]>([])
  const [currentMembership, setCurrentMembership] = useState<CurrentMembership | null>(null)
  const [selectedMembership, setSelectedMembership] = useState<number | null>(null)
  const [endDate, setEndDate] = useState("")

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
        setEndDate(current.expireTime.slice(0, 10))

        // 默认选择不同的套餐
        const others = plans.filter((p) => p.id !== current.membershipId)
        if (others.length > 0) {
          setSelectedMembership(others[0].id)
        }
      } else {
        toast({
          title: t("无法升级", "Cannot Upgrade"),
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

  const handleSubmit = async () => {
    if (!user || !selectedMembership || !endDate) {
      toast({
        title: t("请选择新套餐", "Please select new plan"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const expire = new Date(endDate)
      expire.setHours(23, 59, 59)

      await adminApi.updateUserMembership({
        userId: user.id.toString(),
        membershipId: selectedMembership,
        expireTime: expire.toISOString().slice(0, 19),
      })

      toast({
        title: t("升级成功", "Upgraded Successfully"),
        description: t(`已为用户 ${user.email} 升级会员`, `Membership upgraded for ${user.email}`),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: t("升级失败", "Upgrade Failed"),
        description: error.message || t("无法升级会员", "Failed to upgrade membership"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedPlan = memberships.find((m) => m.id === selectedMembership)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-900/20 dark:via-amber-900/20 dark:to-yellow-900/20 -mx-6 -mt-6 px-6 pt-6 pb-4 rounded-t-xl">
          <DialogTitle className="text-xl font-semibold">{t("会员升级", "Upgrade Membership")}</DialogTitle>
          <DialogDescription>{t("升级用户的会员套餐", "Upgrade user's membership plan")}</DialogDescription>
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
                  {currentMembership.startTime.slice(0, 10)} ~ {currentMembership.expireTime.slice(0, 10)}
                </div>
              </div>
            </div>
          )}

          {/* 升级预览 */}
          {currentMembership && selectedPlan && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
                {t("升级预览", "Upgrade Preview")}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">{currentMembership.levelName}</span>
                <ArrowRight className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">{selectedPlan.levelName}</span>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {t(
                  `旧会员将截止到今天，新会员从今天开始至 ${endDate}`,
                  `Old membership ends today, new starts today until ${endDate}`
                )}
              </div>
            </div>
          )}

          {/* 新会员套餐选择 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("升级至套餐", "Upgrade to")}
            </label>
            <select
              value={selectedMembership || ""}
              onChange={(e) => setSelectedMembership(Number(e.target.value))}
              className="mt-1 w-full px-4 py-2.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            >
              {memberships
                .filter((m) => m.id !== currentMembership?.membershipId)
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.levelName} (${m.dailyUsage}/天)
                  </option>
                ))}
            </select>
          </div>

          {/* 结束时间 */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("新会员结束时间", "New End Date")}
            </label>
            <div className="relative mt-1">
              <input
                type="date"
                value={endDate}
                min={today}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("默认保持原结束时间，可修改", "Default: keeps original end date, editable")}
            </p>
          </div>
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
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-sm hover:shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("升级中...", "Upgrading...") : t("确认升级", "Confirm")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
