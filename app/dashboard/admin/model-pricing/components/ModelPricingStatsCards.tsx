/**
 * 模型定价统计卡片组件
 */

"use client"

import type React from "react"
import { useLanguage } from "@/lib/language-context"
import type { ModelPricingData } from "../types"
import { Package, CheckCircle, XCircle, DollarSign } from "lucide-react"

interface ModelPricingStatsCardsProps {
  pricings: ModelPricingData[]
}

export function ModelPricingStatsCards({ pricings }: ModelPricingStatsCardsProps) {
  const { t } = useLanguage()

  // 计算统计数据
  const totalModels = pricings.length
  const activeModels = pricings.filter((p) => p.isActive).length
  const allowedModels = pricings.filter((p) => p.isAllowed).length
  const avgInputPrice =
    pricings.length > 0
      ? pricings.reduce((sum, p) => sum + p.inputPrice, 0) / pricings.length
      : 0

  const stats = [
    {
      title: t("总模型数", "Total Models"),
      value: totalModels,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      title: t("启用模型", "Active Models"),
      value: activeModels,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      title: t("允许使用", "Allowed Models"),
      value: allowedModels,
      icon: CheckCircle,
      color: "bg-emerald-500",
    },
    {
      title: t("平均输入价格", "Avg Input Price"),
      value: `$${avgInputPrice.toFixed(2)}`,
      icon: DollarSign,
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
