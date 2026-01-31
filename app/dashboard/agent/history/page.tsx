/**
 * 代理商兑换/充值记录页面
 * 展示兑换记录和充值记录的统一列表
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { History, Gift, Wallet, User, Calendar, ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { agentApi, type AgentRedemptionLogVO, type AgentRechargeLogVO } from "@/lib/api"
import { toast } from "sonner"

// 合并的记录类型
interface CombinedRecord {
  id: string
  type: "redemption" | "recharge"
  createdAt: string
  // 兑换记录字段
  targetUserEmail?: string
  membershipName?: string
  months?: number
  totalPrice?: number
  balanceAfter?: number
  // 充值记录字段
  amount?: number
  balanceBefore?: number
  remark?: string
}

export default function AgentHistoryPage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [redemptionList, setRedemptionList] = useState<AgentRedemptionLogVO[]>([])
  const [rechargeList, setRechargeList] = useState<AgentRechargeLogVO[]>([])
  const [combinedList, setCombinedList] = useState<CombinedRecord[]>([])
  const [activeTab, setActiveTab] = useState<"all" | "redemption" | "recharge">("all")

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 20

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [redemptionRes, rechargeRes] = await Promise.all([
        agentApi.getRedemptionList(1, 100),
        agentApi.getRechargeList(1, 100),
      ])
      setRedemptionList(redemptionRes.list || [])
      setRechargeList(rechargeRes.list || [])
    } catch (error) {
      console.error("加载记录失败:", error)
      toast.error(t("加载记录失败", "Failed to load records"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadData()
  }, [loadData])

  // 合并并排序记录
  useEffect(() => {
    const combined: CombinedRecord[] = [
      ...redemptionList.map((r) => ({
        id: `redemption-${r.id}`,
        type: "redemption" as const,
        createdAt: r.createdAt,
        targetUserEmail: r.targetUserEmail,
        membershipName: r.membershipName,
        months: r.months,
        totalPrice: r.totalPrice,
        balanceAfter: r.balanceAfter,
      })),
      ...rechargeList.map((r) => ({
        id: `recharge-${r.id}`,
        type: "recharge" as const,
        createdAt: r.createdAt,
        amount: r.amount,
        balanceBefore: r.balanceBefore,
        balanceAfter: r.balanceAfter,
        remark: r.remark,
      })),
    ]

    // 按时间倒序排序
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setCombinedList(combined)
    setCurrentPage(1)
  }, [redemptionList, rechargeList])

  // 根据标签过滤
  const filteredList = combinedList.filter((record) => {
    if (activeTab === "all") return true
    return record.type === activeTab
  })

  // 分页数据
  const totalPages = Math.ceil(filteredList.length / pageSize)
  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // 格式化时间
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 刷新数据
  const handleRefresh = () => {
    loadData()
  }

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-600 dark:text-gray-400">
            {t("加载中...", "Loading...")}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <History className="w-8 h-8 text-teal-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("兑换记录", "Transaction History")}
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t("刷新", "Refresh")}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t("查看您的充值和兑换记录", "View your recharge and redemption history")}
        </p>
      </div>

      {/* 标签切换 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => { setActiveTab("all"); setCurrentPage(1) }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === "all"
              ? "bg-teal-500 text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          {t("全部", "All")} ({combinedList.length})
        </button>
        <button
          onClick={() => { setActiveTab("redemption"); setCurrentPage(1) }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1.5 ${
            activeTab === "redemption"
              ? "bg-orange-500 text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <ArrowUpCircle className="w-4 h-4" />
          {t("兑换", "Redemptions")} ({redemptionList.length})
        </button>
        <button
          onClick={() => { setActiveTab("recharge"); setCurrentPage(1) }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-1.5 ${
            activeTab === "recharge"
              ? "bg-emerald-500 text-white shadow-md"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <ArrowDownCircle className="w-4 h-4" />
          {t("充值", "Recharges")} ({rechargeList.length})
        </button>
      </div>

      {/* 记录列表 */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {t("暂无记录", "No records")}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* 列表内容 */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedList.map((record) => (
              <div
                key={record.id}
                className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {record.type === "redemption" ? (
                  // 兑换记录
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* 图标 */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-md">
                        <Gift className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* 主要信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                          {t("兑换", "Redemption")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {record.membershipName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          × {record.months} {t("月", "mo")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {record.targetUserEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* 金额信息 */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        -{record.totalPrice} <span className="text-xs font-normal text-gray-500">{t("积分", "credits")}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {t("余额", "Balance")}: {record.balanceAfter?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ) : (
                  // 充值记录
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    {/* 图标 */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                        <Wallet className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* 主要信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          {t("充值", "Recharge")}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {t("管理员充值", "Admin Recharge")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        {record.remark && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {record.remark}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(record.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* 金额信息 */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        +{record.amount} <span className="text-xs font-normal text-gray-500">{t("积分", "credits")}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {record.balanceBefore?.toFixed(2)} → {record.balanceAfter?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t("共", "Total")} {filteredList.length} {t("条记录", "records")}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300 px-3">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
