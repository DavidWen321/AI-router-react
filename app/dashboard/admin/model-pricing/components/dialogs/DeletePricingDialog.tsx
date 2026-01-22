/**
 * 删除模型定价确认对话框
 */

"use client"

import type React from "react"
import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import type { ModelPricingData } from "../../types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface DeletePricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pricing: ModelPricingData | null
  onConfirm: (id: number) => Promise<boolean>
}

export function DeletePricingDialog({
  open,
  onOpenChange,
  pricing,
  onConfirm,
}: DeletePricingDialogProps) {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!pricing) return

    setLoading(true)
    try {
      const success = await onConfirm(pricing.id)
      if (success) {
        onOpenChange(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!pricing) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {t("确认删除", "Confirm Delete")}
          </DialogTitle>
          <DialogDescription>
            {t("此操作无法撤销，确定要删除此模型定价吗？", "This action cannot be undone. Are you sure you want to delete this model pricing?")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("模型标识符", "Model Key")}:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {pricing.modelKey}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("模型名称", "Model Name")}:
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {pricing.modelName}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("取消", "Cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? t("删除中...", "Deleting...") : t("确认删除", "Confirm Delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
