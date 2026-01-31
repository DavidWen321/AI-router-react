/**
 * 代理商详情对话框
 * 显示代理商信息、充值记录、兑换记录
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { User, Wallet, Gift, History, ArrowDownCircle, ArrowUpCircle, Calendar } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { agentAdminApi, type AgentInfoVO, type AgentRechargeLogVO, type AgentRedemptionLogVO } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AgentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: AgentInfoVO | null
}

type TabType = "info" | "recharge" | "redemption"

export function AgentDetailDialog({ open, onOpenChange, agent }: AgentDetailDialogProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>("info")
  const [rechargeList, setRechargeList] = useState<AgentRechargeLogVO[]>([])
  const [redemptionList, setRedemptionList] = useState<AgentRedemptionLogVO[]>([])
  const [loadingRecharge, setLoadingRecharge] = useState(false)
  const [loadingRedemption, setLoadingRedemption] = useState(false)

  // 加载充值记录
  const loadRechargeHistory = useCallback(async () => {
    if (!agent) return
    setLoadingRecharge(true)
    try {
      const res = await agentAdminApi.getRechargeList(agent.userId, 1, 50)
      setRechargeList(res.list || [])
    } catch (error) {
      console.error("加载充值记录失败:", error)
    } finally {
      setLoadingRecharge(false)
    }
  }, [agent])

  // 加载兑换记录
  const loadRedemptionHistory = useCallback(async () => {
    if (!agent) return
    setLoadingRedemption(true)
    try {
      const res = await agentAdminApi.getRedemptionList(agent.userId, 1, 50)
      setRedemptionList(res.list || [])
    } catch (error) {
      console.error("加载兑换记录失败:", error)
    } finally {
      setLoadingRedemption(false)
    }
  }, [agent])

  useEffect(() => {
    if (open && agent) {
      setActiveTab("info")
      setRechargeList([])
      setRedemptionList([])
    }
  }, [open, agent])

  useEffect(() => {
    if (open && agent && activeTab === "recharge" && rechargeList.length === 0) {
      loadRechargeHistory()
    }
    if (open && agent && activeTab === "redemption" && redemptionList.length === 0) {
      loadRedemptionHistory()
    }
  }, [open, agent, activeTab, rechargeList.length, redemptionList.length, loadRechargeHistory, loadRedemptionHistory])

  if (!agent) return null

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    const date = new Date(dateStr)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden max-h-[90vh]" animation="fade">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t("代理商详情", "Agent Details")}
              </DialogTitle>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-0.5">
                {agent.email}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* 标签切换 */}
        <div className="px-6 pt-4 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "info"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <User className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            {t("基本信息", "Info")}
          </button>
          <button
            onClick={() => setActiveTab("recharge")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "recharge"
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <ArrowDownCircle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            {t("充值记录", "Recharge")}
          </button>
          <button
            onClick={() => setActiveTab("redemption")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === "redemption"
                ? "border-orange-500 text-orange-600 dark:text-orange-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <ArrowUpCircle className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
            {t("兑换记录", "Redemptions")}
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto max-h-[400px]">
          {/* 基本信息 */}
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t("用户ID", "User ID")}</span>
                  <span className="text-lg font-medium text-gray-900 dark:text-gray-100">{agent.userId}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t("状态", "Status")}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    agent.status === 1
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                    {agent.status === 1 ? t("已启用", "Enabled") : t("已禁用", "Disabled")}
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">{t("账户余额", "Account Balance")}</span>
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {agent.balance?.toFixed(2)} <span className="text-sm font-normal text-gray-500">{t("积分", "credits")}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 block mb-1">{t("累计充值", "Total Recharged")}</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{agent.totalRecharged?.toFixed(2)}</span>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                  <span className="text-xs text-orange-600 dark:text-orange-400 block mb-1">{t("累计消费", "Total Consumed")}</span>
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">{agent.totalConsumed?.toFixed(2)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t("创建时间", "Created At")}</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(agent.createdAt)}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t("更新时间", "Updated At")}</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{formatDate(agent.updatedAt)}</span>
                </div>
              </div>

              {agent.remark && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{t("备注", "Remark")}</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{agent.remark}</span>
                </div>
              )}
            </div>
          )}

          {/* 充值记录 */}
          {activeTab === "recharge" && (
            <div>
              {loadingRecharge ? (
                <div className="flex justify-center items-center py-10">
                  <div className="text-gray-600 dark:text-gray-400">{t("加载中...", "Loading...")}</div>
                </div>
              ) : rechargeList.length === 0 ? (
                <div className="text-center py-10">
                  <History className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t("暂无充值记录", "No recharge records")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rechargeList.map((record) => (
                    <div key={record.id} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400">
                          {t("充值", "Recharge")}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            +{record.amount} <span className="text-xs font-normal text-gray-500">{t("积分", "credits")}</span>
                          </span>
                          {record.remark && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{record.remark}</p>
                          )}
                        </div>
                        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                          <div>{record.balanceBefore?.toFixed(2)} → {record.balanceAfter?.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 兑换记录 */}
          {activeTab === "redemption" && (
            <div>
              {loadingRedemption ? (
                <div className="flex justify-center items-center py-10">
                  <div className="text-gray-600 dark:text-gray-400">{t("加载中...", "Loading...")}</div>
                </div>
              ) : redemptionList.length === 0 ? (
                <div className="text-center py-10">
                  <Gift className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">{t("暂无兑换记录", "No redemption records")}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptionList.map((record) => (
                    <div key={record.id} className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400">
                            {t("兑换", "Redemption")}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {record.membershipName}
                          </span>
                          <span className="text-xs text-gray-500">× {record.months} {t("月", "mo")}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <User className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                          {record.targetUserEmail}
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                            -{record.totalPrice} <span className="text-xs font-normal text-gray-500">{t("积分", "credits")}</span>
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t("余额", "Balance")}: {record.balanceAfter?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onOpenChange(false)}
            className="w-full px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            {t("关闭", "Close")}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
