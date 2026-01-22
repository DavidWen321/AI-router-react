/**
 * 模型定价数据管理 Hook
 * 负责所有数据的 CRUD 操作
 */

import { useState, useEffect, useCallback } from "react"
import { modelPricingApi } from "@/lib/api"
import type { ModelPricingData, CreatePricingFormData, EditPricingFormData } from "../types"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"

export function useModelPricingData() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [pricings, setPricings] = useState<ModelPricingData[]>([])
  const [loading, setLoading] = useState(true)

  // 获取所有定价数据
  const fetchPricings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await modelPricingApi.getAllPricings()
      setPricings(data)
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

  // 创建定价
  const createPricing = useCallback(
    async (data: CreatePricingFormData) => {
      try {
        await modelPricingApi.createPricing(data)
        toast({
          title: t("创建成功", "Created Successfully"),
          description: t("模型定价已创建", "Model pricing has been created"),
        })
        await fetchPricings()
        return true
      } catch (error) {
        toast({
          title: t("创建失败", "Create Failed"),
          description: error instanceof Error ? error.message : t("未知错误", "Unknown error"),
          variant: "destructive",
        })
        return false
      }
    },
    [t, toast, fetchPricings]
  )

  // 更新定价
  const updatePricing = useCallback(
    async (id: number, data: EditPricingFormData) => {
      try {
        await modelPricingApi.updatePricing(id, data)
        toast({
          title: t("更新成功", "Updated Successfully"),
          description: t("模型定价已更新", "Model pricing has been updated"),
        })
        await fetchPricings()
        return true
      } catch (error) {
        toast({
          title: t("更新失败", "Update Failed"),
          description: error instanceof Error ? error.message : t("未知错误", "Unknown error"),
          variant: "destructive",
        })
        return false
      }
    },
    [t, toast, fetchPricings]
  )

  // 删除定价
  const deletePricing = useCallback(
    async (id: number) => {
      try {
        await modelPricingApi.deletePricing(id)
        toast({
          title: t("删除成功", "Deleted Successfully"),
          description: t("模型定价已删除", "Model pricing has been deleted"),
        })
        await fetchPricings()
        return true
      } catch (error) {
        toast({
          title: t("删除失败", "Delete Failed"),
          description: error instanceof Error ? error.message : t("未知错误", "Unknown error"),
          variant: "destructive",
        })
        return false
      }
    },
    [t, toast, fetchPricings]
  )

  // 刷新缓存
  const refreshCache = useCallback(async () => {
    try {
      await modelPricingApi.refreshCache()
      toast({
        title: t("刷新成功", "Refreshed Successfully"),
        description: t("价格缓存已刷新", "Price cache has been refreshed"),
      })
      await fetchPricings()
    } catch (error) {
      toast({
        title: t("刷新失败", "Refresh Failed"),
        description: error instanceof Error ? error.message : t("未知错误", "Unknown error"),
        variant: "destructive",
      })
    }
  }, [t, toast, fetchPricings])

  // 初始加载
  useEffect(() => {
    fetchPricings()
  }, [fetchPricings])

  return {
    pricings,
    loading,
    createPricing,
    updatePricing,
    deletePricing,
    refreshCache,
    refetch: fetchPricings,
  }
}
