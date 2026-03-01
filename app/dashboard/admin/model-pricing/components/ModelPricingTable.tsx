/**
 * 模型定价数据表格组件（响应式设计）
 * 移动端：卡片视图
 * 桌面端：表格视图
 */

"use client"

import type React from "react"
import { useLanguage } from "@/lib/language-context"
import type { ModelPricingData } from "../types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Eye } from "lucide-react"
import { formatPrice, formatDateTime } from "../utils/pricingHelpers"

interface ModelPricingTableProps {
  pricings: ModelPricingData[]
  loading: boolean
  onEdit: (pricing: ModelPricingData) => void
  onDelete: (pricing: ModelPricingData) => void
  onView: (pricing: ModelPricingData) => void
}

export function ModelPricingTable({
  pricings,
  loading,
  onEdit,
  onDelete,
  onView,
}: ModelPricingTableProps) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            {t("加载中...", "Loading...")}
          </span>
        </div>
      </div>
    )
  }

  if (pricings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          {t("暂无数据", "No data available")}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* 移动端卡片视图 */}
      <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {pricings.map((pricing) => (
          <div
            key={pricing.id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="space-y-3">
              {/* 模型信息 */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {pricing.modelKey}
                  </span>
                  <Badge variant={pricing.isActive ? "default" : "secondary"}>
                    {pricing.isActive ? t("启用", "Active") : t("禁用", "Inactive")}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{pricing.modelName}</div>
              </div>

              {/* 价格信息 */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("输入", "Input")}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {formatPrice(pricing.inputPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("输出", "Output")}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {formatPrice(pricing.outputPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("缓存写", "Cache W")}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {formatPrice(pricing.cacheWritePrice)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("缓存读", "Cache R")}:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {formatPrice(pricing.cacheReadPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {t("倍率", "Multiplier")}:
                  </span>
                  <span className={`ml-1 font-medium ${pricing.priceMultiplier !== 1 ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-white"}`}>
                    x{pricing.priceMultiplier ?? 1}
                  </span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => onView(pricing)} className="flex-1">
                  <Eye className="w-4 h-4 mr-1" />
                  {t("查看", "View")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEdit(pricing)} className="flex-1">
                  <Edit className="w-4 h-4 mr-1" />
                  {t("编辑", "Edit")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(pricing)}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {t("删除", "Delete")}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 桌面端表格视图 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("模型标识符", "Model Key")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("模型名称", "Model Name")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("输入价格", "Input Price")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("输出价格", "Output Price")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("缓存写入", "Cache Write")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("缓存读取", "Cache Read")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("倍率", "Multiplier")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("状态", "Status")}
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("操作", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pricings.map((pricing) => (
              <tr
                key={pricing.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {pricing.modelKey}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {pricing.modelName}
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatPrice(pricing.inputPrice)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatPrice(pricing.outputPrice)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatPrice(pricing.cacheWritePrice)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formatPrice(pricing.cacheReadPrice)}
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <div className={`text-sm font-medium ${pricing.priceMultiplier !== 1 ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-white"}`}>
                    x{pricing.priceMultiplier ?? 1}
                  </div>
                </td>
                <td className="px-6 py-4 text-center whitespace-nowrap">
                  <Badge variant={pricing.isActive ? "default" : "secondary"}>
                    {pricing.isActive ? t("启用", "Active") : t("禁用", "Inactive")}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" variant="ghost" onClick={() => onView(pricing)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(pricing)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(pricing)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
