/**
 * 查看模型定价详情对话框
 */

"use client"

import type React from "react"
import { useLanguage } from "@/lib/language-context"
import type { ModelPricingData } from "../../types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatDateTime } from "../../utils/pricingHelpers"

interface ViewPricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pricing: ModelPricingData | null
}

export function ViewPricingDialog({ open, onOpenChange, pricing }: ViewPricingDialogProps) {
  const { t } = useLanguage()

  if (!pricing) return null

  const details = [
    {
      label: t("模型标识符", "Model Key"),
      value: pricing.modelKey,
    },
    {
      label: t("模型名称", "Model Name"),
      value: pricing.modelName,
    },
    {
      label: t("输入价格", "Input Price"),
      value: formatPrice(pricing.inputPrice) + " / M tokens",
    },
    {
      label: t("输出价格", "Output Price"),
      value: formatPrice(pricing.outputPrice) + " / M tokens",
    },
    {
      label: t("缓存写入价格", "Cache Write Price"),
      value: formatPrice(pricing.cacheWritePrice) + " / M tokens",
    },
    {
      label: t("缓存读取价格", "Cache Read Price"),
      value: formatPrice(pricing.cacheReadPrice) + " / M tokens",
    },
    {
      label: t("创建时间", "Created At"),
      value: formatDateTime(pricing.createdAt),
    },
    {
      label: t("更新时间", "Updated At"),
      value: formatDateTime(pricing.updatedAt),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("模型定价详情", "Model Pricing Details")}</DialogTitle>
          <DialogDescription>
            {t("查看模型定价的详细信息", "View detailed information about model pricing")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 状态标签 */}
          <div className="flex gap-2">
            <Badge variant={pricing.isActive ? "default" : "secondary"}>
              {pricing.isActive ? t("已启用", "Active") : t("已禁用", "Inactive")}
            </Badge>
            <Badge variant={pricing.isAllowed ? "default" : "destructive"}>
              {pricing.isAllowed ? t("允许使用", "Allowed") : t("禁止使用", "Denied")}
            </Badge>
          </div>

          {/* 详细信息 */}
          <div className="space-y-3">
            {details.map((detail, index) => (
              <div
                key={index}
                className="flex justify-between items-start py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {detail.label}
                </span>
                <span className="text-sm text-gray-900 dark:text-white text-right max-w-md">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
