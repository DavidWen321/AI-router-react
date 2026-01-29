"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { proxyConfigApi, type ProxyConfigVO, ApiError } from "@/lib/api"
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

interface DeleteProxyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proxy: ProxyConfigVO | null  // 要删除的代理配置
  onSuccess: () => void
}

export function DeleteProxyDialog({ open, onOpenChange, proxy, onSuccess }: DeleteProxyDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!proxy?.id) {
      toast({
        title: t("错误", "Error"),
        description: t("缺少代理ID", "Missing proxy ID"),
        variant: "destructive",
      })
      return
    }

    setIsDeleting(true)

    try {
      // 调用后端API删除代理配置
      await proxyConfigApi.delete(proxy.id)

      toast({
        title: t("删除成功", "Deleted Successfully"),
        description: t("代理配置已删除", "Proxy configuration has been deleted"),
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("删除代理配置失败:", error)
      toast({
        title: t("删除失败", "Deletion Failed"),
        description: error instanceof ApiError ? error.message : t("无法删除代理配置", "Failed to delete proxy configuration"),
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
          <AlertDialogTitle>{t("确认删除代理", "Confirm Delete Proxy")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t(
              "您确定要删除此代理配置吗?删除后使用此代理的账号将切换到其他可用代理。",
              "Are you sure you want to delete this proxy configuration? Accounts using this proxy will switch to other available proxies."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {proxy && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 my-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("代理名称", "Proxy Name")}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{proxy.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("代理地址", "Proxy Address")}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100 font-mono">{proxy.host}:{proxy.port}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t("总请求数", "Total Requests")}:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{(proxy.totalRequests || 0).toLocaleString()}</span>
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
