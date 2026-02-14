/**
 * 模型限制管理主页面
 */

"use client"

import { useLanguage } from "@/lib/language-context"
import { useModelRestrictionData } from "./hooks/useModelRestrictionData"
import { useModelRestrictionFilters } from "./hooks/useModelRestrictionFilters"

// 组件导入
import { ModelRestrictionStatsCards } from "./components/ModelRestrictionStatsCards"
import { ModelRestrictionSearchFilters } from "./components/ModelRestrictionSearchFilters"
import { ModelRestrictionTable } from "./components/ModelRestrictionTable"

export default function ModelRestrictionPage() {
  const { t } = useLanguage()

  // 数据管理
  const {
    models,
    allowedModelKeys,
    loading,
    hasChanges,
    toggleModel,
    selectAll,
    selectNone,
    invertSelection,
    saveChanges,
    refreshCache,
  } = useModelRestrictionData()

  const { searchFilters, setSearchFilters, filteredModels, clearFilters } =
    useModelRestrictionFilters(models, allowedModelKeys)

  return (
    <div className="dash-page-stagger max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("模型限制管理", "Model Restriction Management")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t("管理允许用户使用的模型白名单", "Manage allowed models whitelist for users")}
        </p>
      </div>

      {/* 统计卡片 */}
      <ModelRestrictionStatsCards models={models} allowedModelKeys={allowedModelKeys} />

      {/* 搜索过滤器 */}
      <ModelRestrictionSearchFilters
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        onClearFilters={clearFilters}
        onSelectAll={selectAll}
        onSelectNone={selectNone}
        onInvertSelection={invertSelection}
        onSaveChanges={saveChanges}
        onRefreshCache={refreshCache}
        hasChanges={hasChanges}
      />

      {/* 数据表格 */}
      <ModelRestrictionTable
        models={filteredModels}
        allowedModelKeys={allowedModelKeys}
        loading={loading}
        onToggleModel={toggleModel}
      />
    </div>
  )
}
