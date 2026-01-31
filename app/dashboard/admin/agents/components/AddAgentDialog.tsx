/**
 * 添加代理商对话框
 * 输入用户邮箱查询用户，然后将其设为代理商
 */

"use client"

import { useState, useEffect } from "react"
import { UserPlus, AlertCircle, CheckCircle2, Search, Mail, User } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { agentAdminApi, userApi } from "@/lib/api"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AddAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface UserInfo {
  id: string
  email: string
  role: string
  status: number
}

export function AddAgentDialog({ open, onOpenChange, onSuccess }: AddAgentDialogProps) {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [remark, setRemark] = useState("")
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const [foundUser, setFoundUser] = useState<UserInfo | null>(null)

  useEffect(() => {
    if (open) {
      setEmail("")
      setRemark("")
      setError("")
      setFoundUser(null)
    }
  }, [open])

  // 验证邮箱格式
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 搜索用户
  const handleSearch = async () => {
    if (!email.trim()) {
      setError(t("请输入用户邮箱", "Please enter user email"))
      return
    }

    if (!validateEmail(email.trim())) {
      setError(t("请输入有效的邮箱地址", "Please enter a valid email address"))
      return
    }

    setSearching(true)
    setError("")
    setFoundUser(null)

    try {
      const user = await userApi.getUserByEmail(email.trim())
      setFoundUser(user)
    } catch (error: any) {
      console.error("查询用户失败:", error)
      setError(t("未找到该邮箱对应的用户", "No user found with this email"))
    } finally {
      setSearching(false)
    }
  }

  // 提交添加
  const handleSubmit = async () => {
    if (!foundUser) {
      setError(t("请先查询用户", "Please search for user first"))
      return
    }

    setLoading(true)
    try {
      await agentAdminApi.addAgent({
        userId: foundUser.id,  // 直接使用字符串，避免精度丢失
        remark: remark.trim() || undefined,
      })
      toast.success(t("成功添加代理商", "Agent added successfully"))
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error("添加代理商失败:", error)
      toast.error(error.message || t("添加代理商失败", "Failed to add agent"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden" animation="fade">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {t("添加代理商", "Add Agent")}
              </DialogTitle>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                {t("通过邮箱查询用户并设为代理商", "Search user by email and set as agent")}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          {/* 邮箱搜索 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4" />
              {t("用户邮箱", "User Email")} <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); setFoundUser(null) }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={t("请输入用户邮箱", "Enter user email")}
                className={`flex-1 px-4 py-3 rounded-xl border ${
                  error && !foundUser
                    ? "border-red-300 dark:border-red-600 focus:ring-red-500"
                    : "border-gray-200 dark:border-gray-700 focus:ring-amber-500"
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all`}
              />
              <button
                onClick={handleSearch}
                disabled={searching || !email.trim()}
                className="px-4 py-3 rounded-xl font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {searching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {t("查询", "Search")}
              </button>
            </div>
            {error && !foundUser && (
              <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* 查询结果 */}
          {foundUser && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {t("找到用户", "User Found")}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">{t("用户ID", "User ID")}:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{foundUser.id}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">{t("邮箱", "Email")}:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{foundUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{t("角色", "Role")}:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    foundUser.role === "admin"
                      ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  }`}>
                    {foundUser.role === "admin" ? t("管理员", "Admin") : t("用户", "User")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t("备注（可选）", "Remark (Optional)")}
            </label>
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder={t("输入备注信息", "Enter remark")}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-0 transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {t("取消", "Cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !foundUser}
            className="flex-1 px-4 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("处理中...", "Processing...")}
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t("确认添加", "Confirm")}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
