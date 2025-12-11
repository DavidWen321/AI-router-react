"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { accountPoolApi, type AccountPoolVO, ApiError } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface DeleteAccountPoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pool: AccountPoolVO | null  // 要删除的号池
  onSuccess: () => void
}

export function DeleteAccountPoolDialog({ open, onOpenChange, pool, onSuccess }: DeleteAccountPoolDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!pool?.id) {
      toast({
        title: t("错误", "Error"),
        description: t("缺少号池ID", "Missing pool ID"),
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      // 调用后端API删除号池
      await accountPoolApi.delete(pool.id)

      toast({
        title: t("删除成功", "Deleted Successfully"),
        description: t("号池已删除", "Account pool has been deleted"),
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("删除号池失败:", error)
      toast({
        title: t("删除失败", "Deletion Failed"),
        description: error instanceof ApiError ? error.message : t("无法删除号池", "Failed to delete account pool"),
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("确认删除号池", "Confirm Delete Account Pool")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "您确定要删除此号池吗?此操作无法撤销。",
              "Are you sure you want to delete this account pool? This action cannot be undone."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {pool && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 my-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("供应商网址", "Supplier Website")}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{pool.supplierWeb}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("账号", "Account")}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{pool.account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("每日额度", "Daily Quota")}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">${pool.accountDailyUsage.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t("取消", "Cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isDeleting ? t("删除中...", "Deleting...") : t("确认删除", "Confirm Delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
