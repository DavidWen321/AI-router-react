/**
 * 编辑模型定价对话框
 */

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import type { ModelPricingData, EditPricingFormData } from "../../types"
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

interface EditPricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pricing: ModelPricingData | null
  onSubmit: (id: number, data: EditPricingFormData) => Promise<boolean>
}

export function EditPricingDialog({
  open,
  onOpenChange,
  pricing,
  onSubmit,
}: EditPricingDialogProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<EditPricingFormData>({
    id: 0,
    modelKey: "",
    modelName: "",
    inputPrice: 0,
    outputPrice: 0,
    cacheWritePrice: 0,
    cacheReadPrice: 0,
    isActive: true,
  })

  // 当 pricing 变化时更新表单数据
  useEffect(() => {
    if (pricing) {
      setFormData({
        id: pricing.id,
        modelKey: pricing.modelKey,
        modelName: pricing.modelName,
        inputPrice: pricing.inputPrice,
        outputPrice: pricing.outputPrice,
        cacheWritePrice: pricing.cacheWritePrice,
        cacheReadPrice: pricing.cacheReadPrice,
        isActive: pricing.isActive,
      })
    }
  }, [pricing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pricing) return

    setLoading(true)
    try {
      const success = await onSubmit(pricing.id, formData)
      if (success) {
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
          <DialogTitle>{t("编辑模型定价", "Edit Model Pricing")}</DialogTitle>
          <DialogDescription>
            {t("修改模型定价配置", "Modify model pricing configuration")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* 模型标识符 */}
            <div className="space-y-2">
              <Label htmlFor="edit-modelKey">
                {t("模型标识符", "Model Key")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-modelKey"
                placeholder="claude-sonnet-4-5"
                value={formData.modelKey}
                onChange={(e) => setFormData({ ...formData, modelKey: e.target.value })}
                required
              />
            </div>

            {/* 模型名称 */}
            <div className="space-y-2">
              <Label htmlFor="edit-modelName">
                {t("模型名称", "Model Name")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-modelName"
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
                <Label htmlFor="edit-inputPrice">
                  {t("输入价格 ($/M tokens)", "Input Price ($/M tokens)")}
                </Label>
                <Input
                  id="edit-inputPrice"
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
                <Label htmlFor="edit-outputPrice">
                  {t("输出价格 ($/M tokens)", "Output Price ($/M tokens)")}
                </Label>
                <Input
                  id="edit-outputPrice"
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
                <Label htmlFor="edit-cacheWritePrice">
                  {t("缓存写入价格 ($/M tokens)", "Cache Write Price ($/M tokens)")}
                </Label>
                <Input
                  id="edit-cacheWritePrice"
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
                <Label htmlFor="edit-cacheReadPrice">
                  {t("缓存读取价格 ($/M tokens)", "Cache Read Price ($/M tokens)")}
                </Label>
                <Input
                  id="edit-cacheReadPrice"
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

            {/* 是否启用 */}
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">{t("启用此模型", "Enable this model")}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t("取消", "Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("保存中...", "Saving...") : t("保存", "Save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
