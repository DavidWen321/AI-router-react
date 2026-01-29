"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { proxyConfigApi, type ProxyConfigDTO, ApiError } from "@/lib/api"
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
import { useToast } from "@/hooks/use-toast"

interface CreateProxyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateProxyDialog({ open, onOpenChange, onSuccess }: CreateProxyDialogProps) {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<ProxyConfigDTO>({
    name: "",
    host: "",
    port: 0,
    username: "",
    password: "",
    bindingType: 1,  // 默认哈希绑定
    maxAccounts: 5,  // 默认最多绑定5个账号
    status: 1,       // 默认启用
    priority: 100,   // 默认优先级
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 验证必填字段
      if (!formData.name || !formData.host || !formData.port) {
        toast({
          title: t("验证失败", "Validation Failed"),
          description: t("请填写名称、代理地址和端口", "Please fill in name, host and port"),
          variant: "destructive",
        })
        return
      }

      if (formData.port <= 0 || formData.port > 65535) {
        toast({
          title: t("验证失败", "Validation Failed"),
          description: t("端口号必须在 1-65535 之间", "Port must be between 1 and 65535"),
          variant: "destructive",
        })
        return
      }

      if (formData.maxAccounts !== undefined && formData.maxAccounts <= 0) {
        toast({
          title: t("验证失败", "Validation Failed"),
          description: t("最大账号数必须大于0", "Max accounts must be greater than 0"),
          variant: "destructive",
        })
        return
      }

      // 调用后端API创建代理配置
      await proxyConfigApi.create(formData)

      toast({
        title: t("创建成功", "Created Successfully"),
        description: t("代理配置已创建", "Proxy configuration has been created"),
      })

      // 重置表单
      setFormData({
        name: "",
        host: "",
        port: 0,
        username: "",
        password: "",
        bindingType: 1,
        maxAccounts: 5,
        status: 1,
        priority: 100,
      })

      onOpenChange(false)
      onSuccess()
    } catch (error) {
      console.error("创建代理配置失败:", error)
      toast({
        title: t("创建失败", "Creation Failed"),
        description: error instanceof ApiError ? error.message : t("无法创建代理配置", "Failed to create proxy configuration"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{t("添加代理", "Add Proxy")}</DialogTitle>
          <DialogDescription>
            {t("填写以下信息添加新的IP代理配置", "Fill in the information below to add a new IP proxy configuration")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* 代理名称 */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("代理名称", "Proxy Name")} <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              placeholder={t("例如: 美国代理1", "e.g., US Proxy 1")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          {/* 代理地址和端口 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <label htmlFor="host" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("代理地址", "Proxy Host")} <span className="text-red-500">*</span>
              </label>
              <Input
                id="host"
                placeholder={t("例如: proxy.example.com", "e.g., proxy.example.com")}
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="port" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("端口", "Port")} <span className="text-red-500">*</span>
              </label>
              <Input
                id="port"
                type="number"
                min="1"
                max="65535"
                placeholder="8080"
                value={formData.port || ""}
                onChange={(e) => setFormData({ ...formData, port: Number.parseInt(e.target.value) || 0 })}
                className="dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>
          </div>

          {/* 认证信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("用户名", "Username")}
              </label>
              <Input
                id="username"
                placeholder={t("可选", "Optional")}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("密码", "Password")}
              </label>
              <Input
                id="password"
                type="password"
                placeholder={t("可选", "Optional")}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* 绑定类型和最大账号数 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="bindingType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("绑定类型", "Binding Type")}
              </label>
              <select
                id="bindingType"
                value={formData.bindingType}
                onChange={(e) => setFormData({ ...formData, bindingType: Number.parseInt(e.target.value) })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={1}>{t("哈希绑定", "Hash Binding")}</option>
                <option value={2}>{t("手动绑定", "Manual Binding")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="maxAccounts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("最大账号数", "Max Accounts")}
              </label>
              <Input
                id="maxAccounts"
                type="number"
                min="1"
                placeholder="5"
                value={formData.maxAccounts}
                onChange={(e) => setFormData({ ...formData, maxAccounts: Number.parseInt(e.target.value) || 5 })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          {/* 状态和优先级 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("状态", "Status")}
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: Number.parseInt(e.target.value) })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={1}>{t("启用", "Enabled")}</option>
                <option value={0}>{t("禁用", "Disabled")}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("优先级", "Priority")}
              </label>
              <Input
                id="priority"
                type="number"
                min="1"
                placeholder="100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: Number.parseInt(e.target.value) || 100 })}
                className="dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {t("取消", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {isSubmitting ? t("创建中...", "Creating...") : t("创建", "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
