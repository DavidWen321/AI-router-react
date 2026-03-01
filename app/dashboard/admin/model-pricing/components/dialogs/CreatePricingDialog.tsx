/**
 * 创建模型定价对话框
 */

"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import type { CreatePricingFormData } from "../../types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface CreatePricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreatePricingFormData) => Promise<boolean>
}

export function CreatePricingDialog({ open, onOpenChange, onSubmit }: CreatePricingDialogProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreatePricingFormData>({
    modelKey: "",
    modelName: "",
    inputPrice: 0,
    outputPrice: 0,
    cacheWritePrice: 0,
    cacheReadPrice: 0,
    priceMultiplier: 1,
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const success = await onSubmit(formData)
      if (success) {
        // 重置表单
        setFormData({
          modelKey: "",
          modelName: "",
          inputPrice: 0,
          outputPrice: 0,
          cacheWritePrice: 0,
          cacheReadPrice: 0,
          priceMultiplier: 1,
          isActive: true,
        })
        onOpenChange(false)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("创建模型定价", "Create Model Pricing")}</DialogTitle>
          <DialogDescription>
            {t("添加新的模型定价配置", "Add a new model pricing configuration")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* 模型标识符 */}
            <div className="space-y-2">
              <Label htmlFor="modelKey">
                {t("模型标识符", "Model Key")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="modelKey"
                placeholder="claude-sonnet-4-5"
                value={formData.modelKey}
                onChange={(e) => setFormData({ ...formData, modelKey: e.target.value })}
                required
              />
            </div>

            {/* 模型名称 */}
            <div className="space-y-2">
              <Label htmlFor="modelName">
                {t("模型名称", "Model Name")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="modelName"
                placeholder="claude-sonnet-4-5-20250929"
                value={formData.modelName}
                onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                required
              />
            </div>

            {/* 价格字段 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 输入价格 */}
              <div className="space-y-2">
                <Label htmlFor="inputPrice">
                  {t("输入价格 ($/M tokens)", "Input Price ($/M tokens)")}
                </Label>
                <Input
                  id="inputPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.inputPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, inputPrice: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              {/* 输出价格 */}
              <div className="space-y-2">
                <Label htmlFor="outputPrice">
                  {t("输出价格 ($/M tokens)", "Output Price ($/M tokens)")}
                </Label>
                <Input
                  id="outputPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.outputPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, outputPrice: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              {/* 缓存写入价格 */}
              <div className="space-y-2">
                <Label htmlFor="cacheWritePrice">
                  {t("缓存写入价格 ($/M tokens)", "Cache Write Price ($/M tokens)")}
                </Label>
                <Input
                  id="cacheWritePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cacheWritePrice}
                  onChange={(e) =>
                    setFormData({ ...formData, cacheWritePrice: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>

              {/* 缓存读取价格 */}
              <div className="space-y-2">
                <Label htmlFor="cacheReadPrice">
                  {t("缓存读取价格 ($/M tokens)", "Cache Read Price ($/M tokens)")}
                </Label>
                <Input
                  id="cacheReadPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cacheReadPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, cacheReadPrice: parseFloat(e.target.value) || 0 })
                  }
                  required
                />
              </div>
            </div>

            {/* 价格倍率 */}
            <div className="space-y-2">
              <Label htmlFor="priceMultiplier">
                {t("价格倍率", "Price Multiplier")}
              </Label>
              <Input
                id="priceMultiplier"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.priceMultiplier}
                onChange={(e) =>
                  setFormData({ ...formData, priceMultiplier: parseFloat(e.target.value) || 1 })
                }
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t(
                  "最终计费 = 原始费用 × 倍率，默认为 1（原价）",
                  "Final cost = base cost × multiplier, default is 1 (original price)"
                )}
              </p>
            </div>

            {/* 是否启用 */}
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">{t("启用此模型", "Enable this model")}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("取消", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("创建中...", "Creating...") : t("创建", "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
