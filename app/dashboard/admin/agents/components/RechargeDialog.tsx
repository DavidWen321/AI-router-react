/**
 * 充值对话框
 * 管理员给代理商充值
 */

"use client"

import { useState, useEffect } from "react"
import { Wallet, AlertCircle, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { agentAdminApi, type AgentInfoVO } from "@/lib/api"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RechargeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: AgentInfoVO | null
  onSuccess: () => void
}

export function RechargeDialog({ open, onOpenChange, agent, onSuccess }: RechargeDialogProps) {
  const { t } = useLanguage()
  const [amount, setAmount] = useState("")
  const [remark, setRemark] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setAmount("")
      setRemark("")
      setError("")
    }
  }, [open])

  if (!agent) return null

  const handleSubmit = async () => {
    const value = parseFloat(amount)
    if (!amount.trim() || isNaN(value) || value <= 0) {
      setError(t("请输入有效的充值金额", "Please enter a valid amount"))
      return
    }

    setLoading(true)
    try {
      const result = await agentAdminApi.recharge({
        userId: agent.userId,
        amount: value,
        remark: remark.trim() || undefined,
      })
      toast.success(t(
        `成功充值 ${value} 积分，余额: ${result.balanceAfter}`,
        `Successfully recharged ${value} credits, balance: ${result.balanceAfter}`
      ))
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("充值失败:", error)
      toast.error(error.message || t("充值失败", "Recharge failed"))
    } finally {
      setLoading(false)
    }
  }

  // 快捷金额
  const quickAmounts = [100, 500, 1000, 5000]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden" animation="fade">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 border-b border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t("代理商充值", "Agent Recharge")}
              </DialogTitle>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">
                {agent.email}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* 当前余额 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
              {t("当前余额", "Current Balance")}
            </span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {agent.balance?.toFixed(2)} <span className="text-sm font-normal text-gray-500">{t("积分", "credits")}</span>
            </span>
          </div>

          {/* 充值金额 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("充值金额", "Recharge Amount")} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError("") }}
              placeholder={t("请输入充值金额", "Enter amount")}
              min="0.01"
              step="0.01"
              className={`w-full px-4 py-3 rounded-xl border ${
                error
                  ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                  : "border-gray-200 dark:border-gray-700 focus:ring-emerald-500"
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all`}
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}

            {/* 快捷金额按钮 */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickAmounts.map((qa) => (
                <button
                  key={qa}
                  onClick={() => { setAmount(String(qa)); setError("") }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    amount === String(qa)
                      ? "bg-emerald-500 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {qa}
                </button>
              ))}
            </div>
          </div>

          {/* 充值后余额预览 */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-700 dark:text-emerald-400">{t("充值后余额", "Balance After")}</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {(agent.balance + parseFloat(amount)).toFixed(2)} {t("积分", "credits")}
                </span>
              </div>
            </div>
          )}

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("备注（可选）", "Remark (Optional)")}
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={t("如：微信转账、支付宝等", "e.g., WeChat, Alipay, etc.")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 transition-all"
            />
          </div>
        </div>

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
            disabled={loading || !amount.trim()}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("处理中...", "Processing...")}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t("确认充值", "Confirm Recharge")}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
