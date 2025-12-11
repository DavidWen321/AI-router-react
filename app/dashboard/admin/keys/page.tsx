"use client"

import { useState } from "react"
import { useLanguage } from "@/lib/language-context"
import { Eye, Copy, Trash2, Key, Calendar, Activity, Hash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"

interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string
  status: "活跃" | "已禁用"
  totalCalls: number
}

export default function KeysPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null)

  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "生产环境密钥",
      key: "sk-prod-abc123...",
      createdAt: "2025/08/15",
      lastUsed: "2025/10/06 20:26",
      status: "活跃",
      totalCalls: 15234,
    },
    {
      id: "2",
      name: "测试环境密钥",
      key: "sk-test-def456...",
      createdAt: "2025/09/01",
      lastUsed: "2025/10/06 18:45",
      status: "活跃",
      totalCalls: 8567,
    },
    {
      id: "3",
      name: "开发环境密钥",
      key: "sk-dev-ghi789...",
      createdAt: "2025/07/20",
      lastUsed: "2025/09/30 14:22",
      status: "已禁用",
      totalCalls: 3421,
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "活跃":
        return "bg-green-100 text-green-800"
      case "已禁用":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const translateStatus = (status: string) => {
    switch (status) {
      case "活跃":
        return t("活跃", "Active")
      case "已禁用":
        return t("已禁用", "Disabled")
      default:
        return status
    }
  }

  const translateKeyName = (name: string) => {
    const translations: Record<string, string> = {
      生产环境密钥: t("生产环境密钥", "Production Environment Key"),
      测试环境密钥: t("测试环境密钥", "Test Environment Key"),
      开发环境密钥: t("开发环境密钥", "Development Environment Key"),
    }
    return translations[name] || name
  }

  const handleCopyKey = (key: ApiKey) => {
    navigator.clipboard.writeText(key.key)
    toast({
      title: t("复制成功", "Copied Successfully"),
      description: t("API密钥已复制到剪贴板", "API key has been copied to clipboard"),
      duration: 3000,
    })
  }

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null)

  const handleViewKey = (key: ApiKey) => {
    setSelectedKey(key)
    setIsViewDialogOpen(true)
  }

  const handleDeleteKey = (key: ApiKey) => {
    setKeyToDelete(key)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteKey = () => {
    if (keyToDelete) {
      setKeys(keys.filter((k) => k.id !== keyToDelete.id))
      toast({
        title: t("删除成功", "Deleted Successfully"),
        description: t(`密钥 ${keyToDelete.name} 已被删除`, `Key ${keyToDelete.name} has been deleted`),
        duration: 3000,
      })
      setIsDeleteDialogOpen(false)
      setKeyToDelete(null)
    }
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Key className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("密钥管理", "Key Management")}</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t("管理所有API密钥和访问权限", "Manage all API keys and access permissions")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-gray-400 dark:hover:border-gray-500 cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("总密钥数", "Total Keys")}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{keys.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-green-400 dark:hover:border-green-500 cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("活跃密钥", "Active Keys")}</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {keys.filter((k) => k.status === "活跃").length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-cyan-400 dark:hover:border-cyan-500 cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("总调用次数", "Total Calls")}</div>
          <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
            {keys.reduce((sum, k) => sum + k.totalCalls, 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("密钥名称", "Key Name")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("密钥", "Key")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("创建时间", "Created At")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("最后使用", "Last Used")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("状态", "Status")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("调用次数", "Total Calls")}
                </th>
                <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t("操作", "Actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {keys.map((key) => (
                <tr
                  key={key.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {translateKeyName(key.name)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">{key.key}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{key.createdAt}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{key.lastUsed}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(key.status)}`}>
                      {translateStatus(key.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                    {key.totalCalls.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewKey(key)
                        }}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded transition-all duration-200 hover:scale-110"
                        title={t("查看详情", "View Details")}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopyKey(key)
                        }}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded transition-all duration-200 hover:scale-110"
                        title={t("复制密钥", "Copy Key")}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteKey(key)
                        }}
                        className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all duration-200 hover:scale-110"
                        title={t("删除密钥", "Delete Key")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-600" />
              {t("密钥详情", "Key Details")}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {t("查看API密钥的详细信息", "View detailed information about the API key")}
            </DialogDescription>
          </DialogHeader>

          {selectedKey && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-600" />
                  {t("基本信息", "Basic Information")}
                </h3>
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t("密钥名称", "Key Name")}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {translateKeyName(selectedKey.name)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t("状态", "Status")}</div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedKey.status)}`}
                    >
                      {translateStatus(selectedKey.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-cyan-600" />
                  {t("API密钥", "API Key")}
                </h3>
                <div className="pl-6">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <code className="flex-1 text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                      {selectedKey.key}
                    </code>
                    <button
                      onClick={() => handleCopyKey(selectedKey)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-white dark:hover:bg-gray-900/20 rounded transition-all"
                      title={t("复制密钥", "Copy Key")}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-600" />
                  {t("时间信息", "Time Information")}
                </h3>
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t("创建时间", "Created At")}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedKey.createdAt}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{t("最后使用", "Last Used")}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedKey.lastUsed}</div>
                  </div>
                </div>
              </div>

              {/* Usage Statistics */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  {t("使用统计", "Usage Statistics")}
                </h3>
                <div className="pl-6">
                  <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      {t("总调用次数", "Total Calls")}
                    </div>
                    <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                      {selectedKey.totalCalls.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setIsViewDialogOpen(false)}
              className="px-6 bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700"
            >
              {t("关闭", "Close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("删除密钥", "Delete Key")}</AlertDialogTitle>
            <AlertDialogDescription>
              {keyToDelete &&
                t(
                  `确认删除密钥 ${keyToDelete.name}？此操作无法撤销。`,
                  `Are you sure you want to delete key ${keyToDelete.name}? This action cannot be undone.`,
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("取消", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteKey}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
            >
              {t("确认删除", "Confirm Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
