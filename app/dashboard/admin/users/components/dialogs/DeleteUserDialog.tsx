/**
 * 删除用户对话框组件
 */

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
import { useLanguage } from "@/lib/language-context"
import type { UserData } from "../../types"

interface DeleteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserData | null
  onConfirm: () => void
}

export function DeleteUserDialog({ open, onOpenChange, user, onConfirm }: DeleteUserDialogProps) {
  const { t } = useLanguage()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("删除用户", "Delete User")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              `确认删除用户 ${user?.email}？此操作无法撤销。`,
              `Are you sure you want to delete user ${user?.email}? This action cannot be undone.`
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("取消", "Cancel")}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t("确认删除", "Confirm Delete")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
