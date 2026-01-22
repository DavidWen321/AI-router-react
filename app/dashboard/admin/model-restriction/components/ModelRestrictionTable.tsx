/**
 * 模型限制数据表格组件（响应式设计 + 勾选框）
 * 移动端：卡片视图
 * 桌面端：表格视图
 */

"use client"

import type React from "react"
import { useLanguage } from "@/lib/language-context"
import type { ModelPricingData } from "@/lib/api"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface ModelRestrictionTableProps {
  models: ModelPricingData[]
  allowedModelKeys: Set<string>
  loading: boolean
  onToggleModel: (modelKey: string) => void
}

export function ModelRestrictionTable({
  models,
  allowedModelKeys,
  loading,
  onToggleModel,
}: ModelRestrictionTableProps) {
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

  if (models.length === 0) {
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
        {models.map((model) => {
          const isAllowed = allowedModelKeys.has(model.modelKey)
          return (
            <div
              key={model.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="space-y-3">
                {/* 勾选框和模型信息 */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isAllowed}
                    onCheckedChange={() => onToggleModel(model.modelKey)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {model.modelKey}
                      </span>
                      <Badge variant={model.isActive ? "default" : "secondary"}>
                        {model.isActive ? t("启用", "Active") : t("禁用", "Inactive")}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {model.modelName}
                    </div>
                  </div>
                </div>

                {/* 状态标签 */}
                <div className="flex gap-2 pl-8">
                  <Badge variant={isAllowed ? "default" : "destructive"}>
                    {isAllowed ? t("允许使用", "Allowed") : t("禁止使用", "Denied")}
                  </Badge>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 桌面端表格视图 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                {t("选择", "Select")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("模型标识符", "Model Key")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("模型名称", "Model Name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("启用状态", "Active Status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t("允许状态", "Allowed Status")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {models.map((model) => {
              const isAllowed = allowedModelKeys.has(model.modelKey)
              return (
                <tr
                  key={model.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Checkbox
                      checked={isAllowed}
                      onCheckedChange={() => onToggleModel(model.modelKey)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {model.modelKey}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                      {model.modelName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={model.isActive ? "default" : "secondary"}>
                      {model.isActive ? t("启用", "Active") : t("禁用", "Inactive")}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={isAllowed ? "default" : "destructive"}>
                      {isAllowed ? t("允许使用", "Allowed") : t("禁止使用", "Denied")}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
