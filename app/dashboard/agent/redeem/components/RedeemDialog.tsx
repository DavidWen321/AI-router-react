/**
 * 兑换对话框组件
 * 从页面正中心淡入淡出
 * 包含套餐信息、余额显示、邮箱输入、月数选择
 */

"use client"

import { useState, useEffect } from "react"
import { Gift, Mail, Calendar, Wallet, AlertCircle, CheckCircle2, Minus, Plus } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { agentApi, type AgentPricingVO } from "@/lib/api"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RedeemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pricing: AgentPricingVO | null
  balance: number
  onSuccess: () => void
}

export function RedeemDialog({ open, onOpenChange, pricing, balance, onSuccess }: RedeemDialogProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [months, setMonths] = useState(1)
  const [customMonths, setCustomMonths] = useState(false)
  const [loading, setLoading] = useState(false)
  const [emailError, setEmailError] = useState("")

  // 重置表单
  useEffect(() => {
    if (open) {
      setEmail("")
      setMonths(1)
      setCustomMonths(false)
      setEmailError("")
    }
  }, [open])

  if (!pricing) return null

  // 计算总价和剩余余额
  const totalPrice = pricing.agentPrice * months
  const balanceAfter = balance - totalPrice
  const canAfford = balanceAfter >= 0

  // 验证邮箱
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 处理邮箱变化
  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError(t("请输入有效的邮箱地址", "Please enter a valid email address"))
    } else {
      setEmailError("")
    }
  }

  // 处理月数选择
  const handleMonthSelect = (value: number) => {
    setMonths(value)
    setCustomMonths(false)
  }

  // 处理自定义月数
  const handleCustomMonths = (value: number) => {
    const clampedValue = Math.min(Math.max(value, 1), 12)
    setMonths(clampedValue)
  }

  // 提交兑换
  const handleSubmit = async () => {
    // 验证
    if (!email.trim()) {
      setEmailError(t("请输入用户邮箱", "Please enter user email"))
      return
    }
    if (!validateEmail(email)) {
      setEmailError(t("请输入有效的邮箱地址", "Please enter a valid email address"))
      return
    }
    if (!canAfford) {
      toast.error(t("余额不足", "Insufficient balance"))
      return
    }

    setLoading(true)
    try {
      const result = await agentApi.redeem({
        membershipId: pricing.membershipId,
        months,
        userEmail: email.trim(),
      })

      toast.success(
        t(
          `成功为 ${result.targetUserEmail} 开通 ${result.months} 个月会员`,
          `Successfully activated ${result.months} month(s) membership for ${result.targetUserEmail}`
        )
      )

      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("兑换失败:", error)
      toast.error(error.message || t("兑换失败，请重试", "Redemption failed, please try again"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden" animation="fade">
        {/* 头部 */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t("兑换会员", "Redeem Membership")}
              </DialogTitle>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                {pricing.levelName || pricing.membershipName}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* 内容 */}
        <div className="px-6 py-5 space-y-5">
          {/* 价格信息卡片 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4">
              {/* 套餐单价 */}
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  {t("套餐单价", "Unit Price")}
                </span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {pricing.agentPrice} <span className="text-xs font-normal text-gray-500">{t("积分/月", "credits/mo")}</span>
                </span>
              </div>
              {/* 总价 */}
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  {t("总价", "Total")} ({months} {t("月", "mo")})
                </span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {totalPrice} <span className="text-xs font-normal text-gray-500">{t("积分", "credits")}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 余额显示 */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {t("额度变化", "Balance Change")}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-lg">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{balance.toFixed(2)}</span>
              <span className="text-gray-400">-</span>
              <span className="font-semibold text-orange-600 dark:text-orange-400">{totalPrice}</span>
              <span className="text-gray-400">=</span>
              <span className={`font-bold ${canAfford ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                {balanceAfter.toFixed(2)}
              </span>
              <span className="text-xs text-gray-500">{t("积分", "credits")}</span>
            </div>
            {!canAfford && (
              <div className="mt-2 flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{t("余额不足", "Insufficient balance")}</span>
              </div>
            )}
          </div>

          {/* 邮箱输入 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4" />
              {t("目标用户邮箱", "Target User Email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder={t("请输入要开通会员的用户邮箱", "Enter the email of the user to activate membership for")}
              className={`w-full px-4 py-3 rounded-xl border ${
                emailError
                  ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                  : "border-gray-200 dark:border-gray-700 focus:ring-amber-500"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all`}
            />
            {emailError && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {emailError}
              </p>
            )}
          </div>

          {/* 月数选择 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              {t("开通时长", "Duration")}
            </label>
            <div className="flex flex-wrap gap-2">
              {/* 快捷选择 */}
              {[1, 2, 3].map((m) => (
                <button
                  key={m}
                  onClick={() => handleMonthSelect(m)}
                  className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    months === m && !customMonths
                      ? "bg-amber-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {m} {t("月", "mo")}
                </button>
              ))}
              {/* 自定义按钮 */}
              <button
                onClick={() => setCustomMonths(true)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  customMonths
                    ? "bg-amber-500 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {t("自定义", "Custom")}
              </button>
            </div>

            {/* 自定义月数输入 */}
            {customMonths && (
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => handleCustomMonths(months - 1)}
                  disabled={months <= 1}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={months}
                  onChange={(e) => handleCustomMonths(parseInt(e.target.value) || 1)}
                  min={1}
                  max={12}
                  className="w-20 px-3 py-2 text-center rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={() => handleCustomMonths(months + 1)}
                  disabled={months >= 12}
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-500">
                  {t("月（最多12月）", "mo (max 12)")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {t("取消", "Cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !canAfford || !email.trim() || !!emailError}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("处理中...", "Processing...")}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t("确认兑换", "Confirm Redemption")}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
