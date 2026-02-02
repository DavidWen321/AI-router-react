/**
 * 代理商详情视图组件
 * 显示代理商基本信息、充值记录和兑换记录
 */

"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Wallet, TrendingUp, Gift, Calendar, Mail, User } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { agentAdminApi, type AgentInfoVO, type AgentRechargeLogVO, type AgentRedemptionLogVO } from "@/lib/api"
import { toast } from "sonner"

interface AgentDetailViewProps {
  agent: AgentInfoVO
  onBack: () => void
}

type TabType = "recharge" | "redemption"

export function AgentDetailView({ agent, onBack }: AgentDetailViewProps) {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>("recharge")
  const [rechargeList, setRechargeList] = useState<AgentRechargeLogVO[]>([])
  const [redemptionList, setRedemptionList] = useState<AgentRedemptionLogVO[]>([])
  const [rechargeTotal, setRechargeTotal] = useState(0)
  const [redemptionTotal, setRedemptionTotal] = useState(0)
  const [rechargePage, setRechargePage] = useState(1)
  const [redemptionPage, setRedemptionPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const pageSize = 10

  // 加载充值记录
  const loadRechargeList = async () => {
    setLoading(true)
    try {
      const res = await agentAdminApi.getRechargeList(agent.userId.toString(), rechargePage, pageSize)
      setRechargeList(res.list || [])
      setRechargeTotal(res.total || 0)
    } catch (error) {
      console.error("加载充值记录失败:", error)
      toast.error(t("加载充值记录失败", "Failed to load recharge records"))
    } finally {
      setLoading(false)
    }
  }

  // 加载兑换记录
  const loadRedemptionList = async () => {
    setLoading(true)
    try {
      const res = await agentAdminApi.getRedemptionList(agent.userId.toString(), redemptionPage, pageSize)
      setRedemptionList(res.list || [])
      setRedemptionTotal(res.total || 0)
    } catch (error) {
      console.error("加载兑换记录失败:", error)
      toast.error(t("加载兑换记录失败", "Failed to load redemption records"))
    } finally {
      setLoading(false)
    }
  }

  // 当Tab切换时加载对应数据
  useEffect(() => {
    if (activeTab === "recharge") {
      loadRechargeList()
    } else {
      loadRedemptionList()
    }
  }, [activeTab, rechargePage, redemptionPage])

  // 格式化时间
  const formatDateTime = (dateStr: string) => {
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
    <div className="space-y-4 sm:space-y-6">
      {/* 返回按钮 - 优化版 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("返回列表", "Back to List")}</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">{t("代理商详情", "Agent Details")}</span>
        </div>
      </div>

      {/* 代理商基本信息卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t("代理商信息", "Agent Information")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 邮箱 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("邮箱", "Email")}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.email}</p>
            </div>
          </div>

          {/* 用户ID */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("用户ID", "User ID")}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{agent.userId}</p>
            </div>
          </div>

          {/* 余额 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("当前余额", "Current Balance")}</p>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                ${agent.balance?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* 总充值 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("总充值", "Total Recharged")}</p>
              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                ${agent.totalRecharged?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* 总消费 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("总消费", "Total Consumed")}</p>
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                ${agent.totalConsumed?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* 创建时间 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("创建时间", "Created At")}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDateTime(agent.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* 备注 */}
        {agent.remark && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("备注", "Remark")}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{agent.remark}</p>
          </div>
        )}
      </div>

      {/* Tab切换按钮 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("recharge")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "recharge"
                ? "bg-amber-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Wallet className="w-4 h-4" />
            {t("充值记录", "Recharge Records")}
          </button>
          <button
            onClick={() => setActiveTab("redemption")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "redemption"
                ? "bg-purple-500 text-white shadow-md"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            <Gift className="w-4 h-4" />
            {t("兑换记录", "Redemption Records")}
          </button>
        </div>
      </div>

      {/* 记录表格区域 - 下一步实现 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600 dark:text-gray-400">
              {t("加载中...", "Loading...")}
            </div>
          </div>
        ) : activeTab === "recharge" ? (
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("充值记录", "Recharge Records")} ({rechargeTotal})
            </h3>

            {rechargeList.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t("暂无充值记录", "No recharge records")}
                </p>
              </div>
            ) : (
              <>
                {/* 桌面端表格 - 优化版 */}
                <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("充值金额", "Amount")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("充值前余额", "Balance Before")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("充值后余额", "Balance After")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("备注", "Remark")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("充值时间", "Time")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {rechargeList.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                              +${record.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                            ${record.balanceBefore.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              ${record.balanceAfter.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                            {record.remark || "-"}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                            {formatDateTime(record.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 移动端卡片 - 优化版 */}
                <div className="lg:hidden space-y-3">
                  {rechargeList.map((record) => (
                    <div key={record.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                      {/* 顶部：充值金额 + 时间 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            +${record.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(record.createdAt)}
                        </div>
                      </div>

                      {/* 余额信息网格 */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("充值前", "Before")}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            ${record.balanceBefore.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("充值后", "After")}</span>
                          <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            ${record.balanceAfter.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* 备注 */}
                      {record.remark && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{t("备注", "Remark")}: </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300">{record.remark}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 分页 - 优化版 */}
                {rechargeTotal > pageSize && (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {t("共", "Total")} {rechargeTotal} {t("条", "records")}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRechargePage(Math.max(1, rechargePage - 1))}
                        disabled={rechargePage === 1}
                        className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {t("上一页", "Prev")}
                      </button>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 px-2">
                        {rechargePage} / {Math.ceil(rechargeTotal / pageSize)}
                      </span>
                      <button
                        onClick={() => setRechargePage(Math.min(Math.ceil(rechargeTotal / pageSize), rechargePage + 1))}
                        disabled={rechargePage >= Math.ceil(rechargeTotal / pageSize)}
                        className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {t("下一页", "Next")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("兑换记录", "Redemption Records")} ({redemptionTotal})
            </h3>

            {redemptionList.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  {t("暂无兑换记录", "No redemption records")}
                </p>
              </div>
            ) : (
              <>
                {/* 桌面端表格 - 优化版 */}
                <div className="hidden lg:block overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("套餐", "Package")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("目标用户", "Target User")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("月数", "Months")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("单价", "Unit Price")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("总价", "Total")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("兑换后余额", "Balance After")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-900 dark:text-gray-100 uppercase">
                          {t("兑换时间", "Time")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {redemptionList.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {record.membershipName}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                            {record.targetUserEmail}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                            {record.months} {t("个月", "months")}
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                            ${record.unitPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                              -${record.totalPrice.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              ${record.balanceAfter.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300">
                            {formatDateTime(record.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 移动端卡片 - 优化版 */}
                <div className="lg:hidden space-y-3">
                  {redemptionList.map((record) => (
                    <div key={record.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                      {/* 顶部：套餐名称 + 时间 */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Gift className="w-4 h-4 text-white" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {record.membershipName}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {record.targetUserEmail}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                          <Calendar className="w-3 h-3" />
                          {formatDateTime(record.createdAt)}
                        </div>
                      </div>

                      {/* 兑换信息网格 */}
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("月数", "Months")}</span>
                          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {record.months}
                          </span>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("单价", "Unit")}</span>
                          <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                            ${record.unitPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("总价", "Total")}</span>
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                            ${record.totalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* 兑换后余额 */}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t("兑换后余额", "Balance After")}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ${record.balanceAfter.toFixed(2)}
                        </span>
                      </div>

                      {/* 备注 */}
                      {record.remark && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{t("备注", "Remark")}: </span>
                          <span className="text-xs text-gray-700 dark:text-gray-300">{record.remark}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 分页 - 优化版 */}
                {redemptionTotal > pageSize && (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {t("共", "Total")} {redemptionTotal} {t("条", "records")}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setRedemptionPage(Math.max(1, redemptionPage - 1))}
                        disabled={redemptionPage === 1}
                        className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {t("上一页", "Prev")}
                      </button>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 px-2">
                        {redemptionPage} / {Math.ceil(redemptionTotal / pageSize)}
                      </span>
                      <button
                        onClick={() => setRedemptionPage(Math.min(Math.ceil(redemptionTotal / pageSize), redemptionPage + 1))}
                        disabled={redemptionPage >= Math.ceil(redemptionTotal / pageSize)}
                        className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        {t("下一页", "Next")}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
