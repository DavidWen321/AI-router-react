/**
 * 模型限制数据管理 Hook
 * 负责模型列表和允许状态的管理
 */

import { useState, useEffect, useCallback } from "react"
import { modelRestrictionApi, type ModelPricingData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"

export function useModelRestrictionData() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [models, setModels] = useState<ModelPricingData[]>([])
  const [allowedModelKeys, setAllowedModelKeys] = useState<Set<string>>(new Set())
  const [originalAllowedKeys, setOriginalAllowedKeys] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  // 检查是否有变更
  const hasChanges = useCallback(() => {
    if (allowedModelKeys.size !== originalAllowedKeys.size) return true
    for (const key of allowedModelKeys) {
      if (!originalAllowedKeys.has(key)) return true
    }
    return false
  }, [allowedModelKeys, originalAllowedKeys])

  // 获取所有可用模型和当前允许的模型
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [availableModels, allowedKeys] = await Promise.all([
        modelRestrictionApi.getAvailableModels(),
        modelRestrictionApi.getAllowedModels(),
      ])

      setModels(availableModels)
      const allowedSet = new Set(allowedKeys)
      setAllowedModelKeys(allowedSet)
      setOriginalAllowedKeys(new Set(allowedKeys))
    } catch (error) {
      toast({
        title: t("获取失败", "Failed to fetch"),
        description: error instanceof Error ? error.message : t("未知错误", "Unknown error"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [t, toast])

  // 切换单个模型的允许状态
  const toggleModel = useCallback((modelKey: string) => {
    setAllowedModelKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(modelKey)) {
        newSet.delete(modelKey)
      } else {
        newSet.add(modelKey)
      }
      return newSet
    })
  }, [])

  // 全选
  const selectAll = useCallback(() => {
    setAllowedModelKeys(new Set(models.map((m) => m.modelKey)))
  }, [models])

  // 全不选
  const selectNone = useCallback(() => {
    setAllowedModelKeys(new Set())
  }, [])

  // 反选
  const invertSelection = useCallback(() => {
    setAllowedModelKeys((prev) => {
      const newSet = new Set<string>()
      models.forEach((model) => {
        if (!prev.has(model.modelKey)) {
          newSet.add(model.modelKey)
        }
      })
      return newSet
    })
  }, [models])

  // 保存更改
  const saveChanges = useCallback(async () => {
    try {
      const modelKeysArray = Array.from(allowedModelKeys)
      await modelRestrictionApi.updateAllowedModels(modelKeysArray)
      toast({
        title: t("保存成功", "Saved Successfully"),
        description: t("模型限制已更新", "Model restrictions have been updated"),
      })
      setOriginalAllowedKeys(new Set(allowedModelKeys))
      return true
    } catch (error) {
      toast({
        title: t("保存失败", "Save Failed"),
        description: error instanceof Error ? error.message : t("未知错误", "Unknown error"),
        variant: "destructive",
      })
      return false
    }
  }, [allowedModelKeys, t, toast])

  // 重置更改
  const resetChanges = useCallback(() => {
    setAllowedModelKeys(new Set(originalAllowedKeys))
  }, [originalAllowedKeys])

  // 清空允许列表（恢复默认）
  const clearAllowedModels = useCallback(async () => {
    try {
      await modelRestrictionApi.clearAllowedModels()
      toast({
        title: t("清空成功", "Cleared Successfully"),
        description: t("已恢复默认（允许所有模型）", "Restored to default (allow all models)"),
      })
      await fetchData()
    } catch (error) {
      toast({
        title: t("清空失败", "Clear Failed"),
        description: error instanceof Error ? error.message : t("未知错误", "Unknown error"),
        variant: "destructive",
      })
    }
  }, [t, toast, fetchData])

  // 刷新缓存
  const refreshCache = useCallback(async () => {
    try {
      await modelRestrictionApi.refreshCache()
      toast({
        title: t("刷新成功", "Refreshed Successfully"),
        description: t("缓存已刷新", "Cache has been refreshed"),
      })
      await fetchData()
    } catch (error) {
      toast({
        title: t("刷新失败", "Refresh Failed"),
        description: error instanceof Error ? error.message : t("未知错误", "Unknown error"),
        variant: "destructive",
      })
    }
  }, [t, toast, fetchData])

  // 初始加载
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    models,
    allowedModelKeys,
    loading,
    hasChanges: hasChanges(),
    toggleModel,
    selectAll,
    selectNone,
    invertSelection,
    saveChanges,
    resetChanges,
    clearAllowedModels,
    refreshCache,
    refetch: fetchData,
  }
}
