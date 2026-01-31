/**
 * 代理商套餐兑换页面
 * 展示所有代理价格套餐，点击兑换弹出兑换对话框
 */

"use client"

import { useState, useEffect } from "react"
import { Gift, Wallet, Package, DollarSign, Zap, Star, Crown, ChevronRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { agentApi, type AgentPricingVO, type AgentInfoVO } from "@/lib/api"
import { toast } from "sonner"
import { RedeemDialog } from "./components/RedeemDialog"

export default function AgentRedeemPage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [agentInfo, setAgentInfo] = useState<AgentInfoVO | null>(null)
  const [pricingList, setPricingList] = useState<AgentPricingVO[]>([])
  const [selectedPricing, setSelectedPricing] = useState<AgentPricingVO | null>(null)
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false)

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [info, pricing] = await Promise.all([
          agentApi.getInfo(),
          agentApi.getPricingList(),
        ])
        setAgentInfo(info)
        setPricingList(pricing)
      } catch (error) {
        console.error("加载数据失败:", error)
        toast.error(t("加载数据失败", "Failed to load data"))
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [t])

  // 刷新代理商信息
  const refreshAgentInfo = async () => {
    try {
      const info = await agentApi.getInfo()
      setAgentInfo(info)
    } catch (error) {
      console.error("刷新代理商信息失败:", error)
    }
  }

  // 点击兑换
  const handleRedeem = (pricing: AgentPricingVO) => {
    setSelectedPricing(pricing)
    setRedeemDialogOpen(true)
  }

  // 兑换成功回调
  const handleRedeemSuccess = () => {
    refreshAgentInfo()
  }

  // 获取套餐图标
  const getPlanIcon = (levelCode: string) => {
    if (levelCode?.includes("ultra") || levelCode?.includes("max")) return Crown
    if (levelCode?.includes("pro") || levelCode?.includes("standard")) return Star
    return Zap
  }

  // 获取套餐颜色
  const getPlanColor = (levelCode: string) => {
    if (levelCode?.includes("ultra")) return "from-amber-500 to-orange-600"
    if (levelCode?.includes("max")) return "from-purple-500 to-indigo-600"
    if (levelCode?.includes("pro")) return "from-emerald-500 to-teal-600"
    if (levelCode?.includes("standard")) return "from-blue-500 to-cyan-600"
    if (levelCode?.includes("light")) return "from-sky-400 to-blue-500"
    return "from-gray-400 to-gray-500"
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
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-8 h-8 text-amber-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("套餐兑换", "Package Redemption")}
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t("选择套餐为用户开通会员，积分从您的账户余额中扣除", "Select a package to activate membership for users. Credits will be deducted from your balance.")}
        </p>
      </div>

      {/* 账户余额卡片 */}
      <div className="mb-8">
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium mb-1">
                  {t("当前余额", "Current Balance")}
                </p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                  {agentInfo?.balance?.toFixed(2) || "0.00"} <span className="text-lg font-normal text-amber-600 dark:text-amber-400">{t("积分", "Credits")}</span>
                </p>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1 text-sm text-amber-700 dark:text-amber-400">
              <span>{t("累计充值", "Total Recharged")}: {agentInfo?.totalRecharged?.toFixed(2) || "0.00"}</span>
              <span>{t("累计消费", "Total Consumed")}: {agentInfo?.totalConsumed?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 套餐列表 */}
      <div className="mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {t("可兑换套餐", "Available Packages")}
        </h2>
      </div>

      {pricingList.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {t("暂无可兑换套餐", "No packages available")}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
          {/* 移动端卡片视图 */}
          <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {pricingList.map((pricing) => {
              const Icon = getPlanIcon(pricing.levelCode || "")
              const gradientColor = getPlanColor(pricing.levelCode || "")
              const canAfford = (agentInfo?.balance || 0) >= pricing.agentPrice

              return (
                <div key={pricing.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${gradientColor} rounded-lg flex items-center justify-center shadow-md`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {pricing.levelName || pricing.membershipName}
                        </h3>
                        {pricing.dailyUsage && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ${pricing.dailyUsage}/{t("日", "day")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">{t("代理价", "Agent Price")}</span>
                        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {pricing.agentPrice} <span className="text-xs font-normal">{t("积分/月", "credits/mo")}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 block">{t("原价", "Original")}</span>
                        <span className="text-sm text-gray-400 line-through">
                          ¥{pricing.originalPrice}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedeem(pricing)}
                      disabled={!canAfford}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        canAfford
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {t("兑换", "Redeem")}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 桌面端表格视图 */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t("套餐名称", "Package Name")}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t("每日额度", "Daily Quota")}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t("代理价格", "Agent Price")}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t("原价", "Original Price")}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t("节省", "Savings")}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t("操作", "Action")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pricingList.map((pricing) => {
                  const Icon = getPlanIcon(pricing.levelCode || "")
                  const gradientColor = getPlanColor(pricing.levelCode || "")
                  const canAfford = (agentInfo?.balance || 0) >= pricing.agentPrice
                  const savings = pricing.originalPrice - pricing.agentPrice
                  const savingsPercent = ((savings / pricing.originalPrice) * 100).toFixed(0)

                  return (
                    <tr key={pricing.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${gradientColor} rounded-lg flex items-center justify-center shadow-md`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {pricing.levelName || pricing.membershipName}
                            </h3>
                            {pricing.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {pricing.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {pricing.dailyUsage || "-"}
                          </span>
                          <span className="text-xs text-gray-500">/{t("日", "day")}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          {pricing.agentPrice}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">{t("积分/月", "credits/mo")}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-400 line-through">
                          ¥{pricing.originalPrice}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          {t("省", "Save")} {savingsPercent}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleRedeem(pricing)}
                          disabled={!canAfford}
                          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            canAfford
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg hover:scale-105"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <Gift className="w-4 h-4" />
                          {canAfford ? t("立即兑换", "Redeem Now") : t("余额不足", "Insufficient")}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 兑换对话框 */}
      <RedeemDialog
        open={redeemDialogOpen}
        onOpenChange={setRedeemDialogOpen}
        pricing={selectedPricing}
        balance={agentInfo?.balance || 0}
        onSuccess={handleRedeemSuccess}
      />
    </div>
  )
}
