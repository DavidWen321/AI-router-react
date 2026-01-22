/**
 * 模型定价搜索过滤器组件
 */

"use client"

import type React from "react"
import { useLanguage } from "@/lib/language-context"
import type { SearchFilters } from "../types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, Plus, RefreshCw } from "lucide-react"

interface ModelPricingSearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
  onCreateNew: () => void
  onRefreshCache: () => void
}

export function ModelPricingSearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  onCreateNew,
  onRefreshCache,
}: ModelPricingSearchFiltersProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* 模型标识符搜索 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t("搜索模型标识符", "Search Model Key")}
            value={filters.modelKey}
            onChange={(e) => onFiltersChange({ ...filters, modelKey: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* 模型名称搜索 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={t("搜索模型名称", "Search Model Name")}
            value={filters.modelName}
            onChange={(e) => onFiltersChange({ ...filters, modelName: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* 启用状态过滤 */}
        <Select
          value={filters.isActive === null ? "all" : filters.isActive ? "active" : "inactive"}
          onValueChange={(value) => {
            const isActive = value === "all" ? null : value === "active"
            onFiltersChange({ ...filters, isActive })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("启用状态", "Active Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("全部", "All")}</SelectItem>
            <SelectItem value="active">{t("已启用", "Active")}</SelectItem>
            <SelectItem value="inactive">{t("已禁用", "Inactive")}</SelectItem>
          </SelectContent>
        </Select>

        {/* 清除过滤器按钮 */}
        <Button variant="outline" onClick={onClearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          {t("清除过滤", "Clear Filters")}
        </Button>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button onClick={onCreateNew} className="flex-1 sm:flex-none">
          <Plus className="w-4 h-4 mr-2" />
          {t("创建模型定价", "Create Pricing")}
        </Button>
        <Button variant="outline" onClick={onRefreshCache}>
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("刷新缓存", "Refresh Cache")}
        </Button>
      </div>
    </div>
  )
}
