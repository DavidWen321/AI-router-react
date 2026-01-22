/**
 * 模型定价过滤器 Hook
 * 负责搜索和过滤逻辑
 */

import { useState, useMemo } from "react"
import type { ModelPricingData, SearchFilters } from "../types"

export function useModelPricingFilters(pricings: ModelPricingData[]) {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    modelKey: "",
    modelName: "",
    isActive: null,
  })

  // 过滤后的数据
  const filteredPricings = useMemo(() => {
    return pricings.filter((pricing) => {
      // 模型标识符搜索
      if (
        searchFilters.modelKey &&
        !pricing.modelKey.toLowerCase().includes(searchFilters.modelKey.toLowerCase())
      ) {
        return false
      }

      // 模型名称搜索
      if (
        searchFilters.modelName &&
        !pricing.modelName.toLowerCase().includes(searchFilters.modelName.toLowerCase())
      ) {
        return false
      }

      // 启用状态过滤
      if (searchFilters.isActive !== null && pricing.isActive !== searchFilters.isActive) {
        return false
      }

      return true
    })
  }, [pricings, searchFilters])

  // 清除过滤器
  const clearFilters = () => {
    setSearchFilters({
      modelKey: "",
      modelName: "",
      isActive: null,
    })
  }

  return {
    searchFilters,
    setSearchFilters,
    filteredPricings,
    clearFilters,
  }
}
