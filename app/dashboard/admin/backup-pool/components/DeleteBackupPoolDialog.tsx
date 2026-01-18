"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { backupPoolApi, type BackupPoolVO, ApiError } from "@/lib/api"

interface DeleteBackupPoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pool: BackupPoolVO | null
  onSuccess: () => void
}

export function DeleteBackupPoolDialog({ open, onOpenChange, pool, onSuccess }: DeleteBackupPoolDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!pool) return

    setIsDeleting(true)
    try {
      await backupPoolApi.delete(pool.id)

      toast({
        title: t("删除成功", "Deleted Successfully"),
        description: t("备用号池已删除", "Backup pool deleted successfully"),
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("删除备用号池失败:", error)
      toast({
        title: t("删除失败", "Deletion Failed"),
        description: error instanceof ApiError ? error.message : t("无法删除备用号池", "Failed to delete backup pool"),
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
          <AlertDialogTitle>{t("确认删除", "Confirm Deletion")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              `确定要删除备用号池 "${pool?.name}" 吗？此操作无法撤销。`,
              `Are you sure you want to delete backup pool "${pool?.name}"? This action cannot be undone.`
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            {t("取消", "Cancel")}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("删除", "Delete")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
