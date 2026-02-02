"use client"

import { useLanguage } from "@/lib/language-context"
import { type ProxyConfigVO } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Eye, EyeOff, Wifi, WifiOff, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ViewProxyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proxy: ProxyConfigVO | null  // 要查看的代理配置
}

export function ViewProxyDialog({ open, onOpenChange, proxy }: ViewProxyDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)

  const handleCopyAddress = async () => {
    if (!proxy) return

    try {
      const address = `${proxy.host}:${proxy.port}`
      await navigator.clipboard.writeText(address)
      toast({
        title: t("复制成功", "Copied Successfully"),
        description: t("代理地址已复制到剪贴板", "Proxy address has been copied to clipboard"),
      })
    } catch (error) {
      toast({
        title: t("复制失败", "Copy Failed"),
        description: t("无法复制到剪贴板", "Failed to copy to clipboard"),
        variant: "destructive",
      })
    }
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const maskPassword = (password: string) => {
    if (!password) return ""
    return "*".repeat(Math.min(password.length, 12))
  }

  const calculateSuccessRate = (total: number, success: number) => {
    if (total === 0) return 100
    return (success / total) * 100
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("代理详情", "Proxy Details")}</DialogTitle>
          <DialogDescription>
            {t("查看代理配置的详细信息", "View detailed information about the proxy configuration")}
          </DialogDescription>
        </DialogHeader>

        {proxy && (
          <div className="space-y-6 py-4">
            {/* 基本信息 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("基本信息", "Basic Information")}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("代理名称", "Proxy Name")}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{proxy.name}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("代理地址", "Proxy Address")}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-cyan-600 dark:text-cyan-400">
                      {proxy.host}:{proxy.port}
                    </code>
                    <button
                      onClick={handleCopyAddress}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {proxy.exitIp && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("出口IP", "Exit IP")}</span>
                    <code className="text-sm font-mono text-cyan-600 dark:text-cyan-400">
                      {proxy.exitIp}
                    </code>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("状态", "Status")}</span>
                  <Badge variant={proxy.status === 1 ? "default" : "secondary"} className={proxy.status === 1 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""}>
                    {proxy.status === 1 ? (
                      <><Wifi className="w-3 h-3 mr-1" />{t("启用", "Enabled")}</>
                    ) : (
                      <><WifiOff className="w-3 h-3 mr-1" />{t("禁用", "Disabled")}</>
                    )}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("绑定类型", "Binding Type")}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {proxy.bindingType === 1 ? t("哈希绑定", "Hash Binding") : t("手动绑定", "Manual Binding")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("最大账号数", "Max Accounts")}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{proxy.maxAccounts}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{t("优先级", "Priority")}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{proxy.priority}</span>
                </div>
              </div>
            </div>

            {/* 认证信息 */}
            {proxy.username && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("认证信息", "Authentication")}
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("用户名", "Username")}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{proxy.username}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t("密码", "Password")}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {showPassword ? proxy.password : maskPassword(proxy.password || "")}
                      </code>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 统计信息 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("统计信息", "Statistics")}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("总请求数", "Total Requests")}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(proxy.totalRequests || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("成功请求", "Success")}</p>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      {(proxy.successRequests || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("失败请求", "Failed")}</p>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      <XCircle className="w-3 h-3 inline mr-1" />
                      {(proxy.failedRequests || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t("成功率", "Success Rate")}</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {calculateSuccessRate(proxy.totalRequests || 0, proxy.successRequests || 0).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={calculateSuccessRate(proxy.totalRequests || 0, proxy.successRequests || 0)}
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            {/* 时间信息 */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t("时间信息", "Time Information")}
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("最后使用时间", "Last Used")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(proxy.lastUsedAt || "")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("最后错误时间", "Last Error")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(proxy.lastErrorAt || "")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("创建时间", "Created At")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(proxy.createdAt || "")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t("更新时间", "Updated At")}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDateTime(proxy.updatedAt || "")}</p>
                </div>
              </div>
            </div>

            {/* 最后错误信息 */}
            {proxy.lastErrorMsg && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t("最后错误信息", "Last Error Message")}
                </h3>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                  <p className="text-sm text-red-700 dark:text-red-400 break-all">
                    {proxy.lastErrorMsg}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("关闭", "Close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
