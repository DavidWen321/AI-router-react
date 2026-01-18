/**
 * 用户管理页面 - 用户数据管理 Hook
 */

import { useState, useEffect } from "react"
import type { UserData, EditFormData } from "../types"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { adminApi, membershipApi, ApiError } from "@/lib/api"

/**
 * 格式化日期时间字符串为显示格式
 */
function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return "-"
  try {
    const date = new Date(dateStr)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return dateStr
  }
}

export function useUserData() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  /**
   * 从后端加载用户列表
   */
  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getAllUsers()

      // 转换后端数据格式为前端格式
      const formattedUsers: UserData[] = data.map((user) => ({
        id: String(user.id),
        email: user.email,
        registrationDate: formatDateTime(user.registrationDate),
        planType: user.planType || "无套餐",
        planStatus: user.planStatus as "活跃" | "已过期" | "已取消",
        planExpiry: formatDateTime(user.planExpiry),
        planStartTime: formatDateTime(user.planStartTime),
        dailyBudget: user.dailyBudget,
        todayUsage: user.todayUsage,
        totalUsage: 0, // 后端暂无此字段，保留为0
        totalCalls: 0, // 后端暂无此字段，保留为0（按需求不需要了）
        lastActive: formatDateTime(user.lastActive),
        userMembershipId: user.userMembershipId,
        membershipId: user.membershipId,
      }))

      // 排序逻辑：
      // 1. 活跃会员优先
      // 2. 会员用户之间按每日限额降序
      // 3. 非会员用户排在最后
      const sortedUsers = formattedUsers.sort((a, b) => {
        const aIsActive = a.planStatus === "活跃"
        const bIsActive = b.planStatus === "活跃"

        // 如果一个是活跃会员，另一个不是，活跃会员排前面
        if (aIsActive && !bIsActive) return -1
        if (!aIsActive && bIsActive) return 1

        // 如果都是活跃会员，按每日限额降序
        if (aIsActive && bIsActive) {
          return b.dailyBudget - a.dailyBudget
        }

        // 如果都不是活跃会员，保持原顺序（按注册时间）
        return 0
      })

      setUsers(sortedUsers)
    } catch (error) {
      console.error("Failed to load users:", error)
      toast({
        title: t("加载失败", "Load Failed"),
        description:
          error instanceof ApiError
            ? error.message
            : t("无法加载用户列表，请检查网络连接", "Failed to load user list, please check network connection"),
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * 组件挂载时加载数据
   */
  useEffect(() => {
    loadUsers()
  }, [])

  /**
   * 删除用户
   */
  const deleteUser = async (user: UserData) => {
    try {
      console.log(`[删除用户] 准备删除用户:`, { id: user.id, email: user.email, idType: typeof user.id })
      // 直接传字符串userId,避免精度丢失!
      await adminApi.deleteUser(user.id)
      console.log(`[删除用户] 删除成功:`, user.email)

      // 删除成功后从列表中移除
      setUsers(users.filter((u) => u.id !== user.id))

      toast({
        title: t("删除成功", "Deleted Successfully"),
        description: t(`用户 ${user.email} 已被删除`, `User ${user.email} has been deleted`),
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast({
        title: t("删除失败", "Delete Failed"),
        description:
          error instanceof ApiError
            ? error.message
            : t("无法删除用户，请稍后重试", "Failed to delete user, please try again later"),
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  /**
   * 更新用户信息
   */
  const updateUser = async (userId: string, formData: EditFormData) => {
    const user = users.find((u) => u.id === userId)
    if (!user) {
      toast({
        title: t("更新失败", "Update Failed"),
        description: t("用户不存在", "User not found"),
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    try {
      // 1. 获取所有套餐列表
      const memberships = await membershipApi.getActiveMemberships()

      // 2. 根据表单中选择的套餐名称找到对应的 membershipId
      const selectedMembership = memberships.find((m) => m.levelName === formData.planType)

      if (!selectedMembership) {
        toast({
          title: t("更新失败", "Update Failed"),
          description: t("未找到选择的套餐", "Selected plan not found"),
          variant: "destructive",
          duration: 3000,
        })
        return
      }

      // 3. 将前端的日期格式转换为后端需要的 ISO 8601 格式
      let expireTimeISO: string | undefined
      if (formData.planExpiry) {
        try {
          const date = new Date(formData.planExpiry)
          date.setHours(23, 59, 59) // 设置为当天的最后一秒
          expireTimeISO = date.toISOString().slice(0, 19) // "2025-11-10T23:59:59"
        } catch (error) {
          console.error("Failed to parse expiry date:", error)
        }
      }

      // 4. 调用后端接口更新会员信息(直接传字符串userId,避免精度丢失!)
      await adminApi.updateUserMembership({
        userId: userId,  // 直接传字符串,不要转Number!
        membershipId: selectedMembership.id,
        expireTime: expireTimeISO,
      })

      // 4. 更新成功后重新加载用户列表
      await loadUsers()

      toast({
        title: t("保存成功", "Saved Successfully"),
        description: t(`用户 ${user.email} 的信息已更新`, `User ${user.email} has been updated`),
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to update user:", error)
      toast({
        title: t("更新失败", "Update Failed"),
        description:
          error instanceof ApiError
            ? error.message
            : t("无法更新用户信息，请稍后重试", "Failed to update user information, please try again later"),
        variant: "destructive",
        duration: 5000,
      })
    }
  }

  return {
    users,
    loading,
    deleteUser,
    updateUser,
    refreshUsers: loadUsers,
  }
}
