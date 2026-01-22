/**
 * 模型定价管理主页面
 */

"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { useModelPricingData } from "./hooks/useModelPricingData"
import { useModelPricingFilters } from "./hooks/useModelPricingFilters"
import type { ModelPricingData } from "./types"

// 组件导入
import { ModelPricingStatsCards } from "./components/ModelPricingStatsCards"
import { ModelPricingSearchFilters } from "./components/ModelPricingSearchFilters"
import { ModelPricingTable } from "./components/ModelPricingTable"
import { CreatePricingDialog } from "./components/dialogs/CreatePricingDialog"
import { EditPricingDialog } from "./components/dialogs/EditPricingDialog"
import { DeletePricingDialog } from "./components/dialogs/DeletePricingDialog"
import { ViewPricingDialog } from "./components/dialogs/ViewPricingDialog"

export default function ModelPricingPage() {
  const { t } = useLanguage()

  // 数据管理
  const { pricings, loading, createPricing, updatePricing, deletePricing, refreshCache } =
    useModelPricingData()
  const { searchFilters, setSearchFilters, filteredPricings, clearFilters } =
    useModelPricingFilters(pricings)

  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedPricing, setSelectedPricing] = useState<ModelPricingData | null>(null)

  // 处理编辑
  const handleEdit = (pricing: ModelPricingData) => {
    setSelectedPricing(pricing)
    setEditDialogOpen(true)
  }

  // 处理删除
  const handleDelete = (pricing: ModelPricingData) => {
    setSelectedPricing(pricing)
    setDeleteDialogOpen(true)
  }

  // 处理查看
  const handleView = (pricing: ModelPricingData) => {
    setSelectedPricing(pricing)
    setViewDialogOpen(true)
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("模型定价管理", "Model Pricing Management")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t("管理 Claude 模型的价格配置", "Manage Claude model pricing configuration")}
        </p>
      </div>

      {/* 统计卡片 */}
      <ModelPricingStatsCards pricings={pricings} />

      {/* 搜索过滤器 */}
      <ModelPricingSearchFilters
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        onClearFilters={clearFilters}
        onCreateNew={() => setCreateDialogOpen(true)}
        onRefreshCache={refreshCache}
      />

      {/* 数据表格 */}
      <ModelPricingTable
        pricings={filteredPricings}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* 对话框组件 */}
      <CreatePricingDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={createPricing}
      />

      <EditPricingDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        pricing={selectedPricing}
        onSubmit={updatePricing}
      />

      <DeletePricingDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        pricing={selectedPricing}
        onConfirm={deletePricing}
      />

      <ViewPricingDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        pricing={selectedPricing}
      />
    </div>
  )
}
