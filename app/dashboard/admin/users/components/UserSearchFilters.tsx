/**
 * 用户搜索过滤组件
 */

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"
import type { SearchFilters } from "../types"

interface UserSearchFiltersProps {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
  onClearFilters: () => void
  resultCount: number
}

export function UserSearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  resultCount,
}: UserSearchFiltersProps) {
  const { t } = useLanguage()

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("搜索筛选", "Search & Filter")}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("用户邮箱", "User Email")}
          </Label>
          <Input
            placeholder={t("输入邮箱搜索...", "Search by email...")}
            value={filters.email}
            onChange={(e) => onFiltersChange({ ...filters, email: e.target.value })}
            className="w-full transition-all hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        <div className="md:w-[200px]">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("套餐类型", "Plan Type")}
          </Label>
          <Select value={filters.planType} onValueChange={(value) => onFiltersChange({ ...filters, planType: value })}>
            <SelectTrigger className="transition-all hover:border-cyan-400">
              <SelectValue placeholder={t("全部套餐", "All Plans")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("全部套餐", "All Plans")}</SelectItem>
              <SelectItem value="标准套餐">{t("标准套餐", "Standard Plan")}</SelectItem>
              <SelectItem value="专业套餐">{t("专业套餐", "Professional Plan")}</SelectItem>
              <SelectItem value="企业套餐">{t("企业套餐", "Enterprise Plan")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:w-[240px]">
          <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("密钥/用户ID", "API Key / User ID")}
          </Label>
          <Input
            placeholder={t("输入密钥或ID搜索...", "Search by key or ID...")}
            value={filters.apiKey}
            onChange={(e) => onFiltersChange({ ...filters, apiKey: e.target.value })}
            className="w-full transition-all hover:border-cyan-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t(`找到 ${resultCount} 个用户`, `Found ${resultCount} user(s)`)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-transparent transition-colors"
        >
          <X className="w-4 h-4" />
          {t("清除筛选", "Clear Filters")}
        </Button>
      </div>
    </div>
  )
}
