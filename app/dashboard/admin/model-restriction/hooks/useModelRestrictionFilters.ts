/**
 * 模型限制过滤器 Hook
 * 负责搜索和过滤逻辑
 */

import { useState, useMemo } from "react"
import type { ModelPricingData } from "@/lib/api"
import type { SearchFilters } from "../types"

export function useModelRestrictionFilters(
  models: ModelPricingData[],
  allowedModelKeys: Set<string>
) {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    modelKey: "",
    modelName: "",
    isAllowed: null,
  })

  // 过滤后的数据
  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      // 模型标识符搜索
      if (
        searchFilters.modelKey &&
        !model.modelKey.toLowerCase().includes(searchFilters.modelKey.toLowerCase())
      ) {
        return false
      }

      // 模型名称搜索
      if (
        searchFilters.modelName &&
        !model.modelName.toLowerCase().includes(searchFilters.modelName.toLowerCase())
      ) {
        return false
      }

      // 允许状态过滤
      if (searchFilters.isAllowed !== null) {
        const isAllowed = allowedModelKeys.has(model.modelKey)
        if (isAllowed !== searchFilters.isAllowed) {
          return false
        }
      }

      return true
    })
  }, [models, searchFilters, allowedModelKeys])

  // 清除过滤器
  const clearFilters = () => {
    setSearchFilters({
      modelKey: "",
      modelName: "",
      isAllowed: null,
    })
  }

  return {
    searchFilters,
    setSearchFilters,
    filteredModels,
    clearFilters,
  }
}
