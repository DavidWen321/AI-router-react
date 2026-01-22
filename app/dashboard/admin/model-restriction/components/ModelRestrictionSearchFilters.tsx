/**
 * 模型限制搜索过滤器组件
 */

"use client"

import type React from "react"
import { useLanguage } from "@/lib/language-context"
import type { SearchFilters } from "../types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, X, CheckSquare, Square, RefreshCw, Save } from "lucide-react"

interface ModelRestrictionSearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
  onSelectAll: () => void
  onSelectNone: () => void
  onInvertSelection: () => void
  onSaveChanges: () => void
  onRefreshCache: () => void
  hasChanges: boolean
}

export function ModelRestrictionSearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  onSelectAll,
  onSelectNone,
  onInvertSelection,
  onSaveChanges,
  onRefreshCache,
  hasChanges,
}: ModelRestrictionSearchFiltersProps) {
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

        {/* 允许状态过滤 */}
        <Select
          value={filters.isAllowed === null ? "all" : filters.isAllowed ? "allowed" : "denied"}
          onValueChange={(value) => {
            const isAllowed = value === "all" ? null : value === "allowed"
            onFiltersChange({ ...filters, isAllowed })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("允许状态", "Allowed Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("全部", "All")}</SelectItem>
            <SelectItem value="allowed">{t("已允许", "Allowed")}</SelectItem>
            <SelectItem value="denied">{t("未允许", "Denied")}</SelectItem>
          </SelectContent>
        </Select>

        {/* 清除过滤器按钮 */}
        <Button variant="outline" onClick={onClearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          {t("清除过滤", "Clear Filters")}
        </Button>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onSelectAll} size="sm">
          <CheckSquare className="w-4 h-4 mr-2" />
          {t("全选", "Select All")}
        </Button>
        <Button variant="outline" onClick={onSelectNone} size="sm">
          <Square className="w-4 h-4 mr-2" />
          {t("全不选", "Select None")}
        </Button>
        <Button variant="outline" onClick={onInvertSelection} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("反选", "Invert")}
        </Button>
        <div className="flex-1"></div>
        <Button variant="outline" onClick={onRefreshCache} size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t("刷新缓存", "Refresh Cache")}
        </Button>
        <Button onClick={onSaveChanges} disabled={!hasChanges} size="sm">
          <Save className="w-4 h-4 mr-2" />
          {t("保存更改", "Save Changes")}
        </Button>
      </div>
    </div>
  )
}
