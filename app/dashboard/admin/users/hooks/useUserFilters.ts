/**
 * 用户管理页面 - 搜索过滤 Hook
 */

import { useState, useMemo } from "react"
import type { UserData, SearchFilters } from "../types"

export function useUserFilters(users: UserData[]) {
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    email: "",
    planType: "",
    apiKey: "",
  })

  /**
   * 过滤后的用户列表
   */
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const emailMatch = user.email.toLowerCase().includes(searchFilters.email.toLowerCase())
      const planTypeMatch =
        searchFilters.planType === "" || searchFilters.planType === "all" || user.planType === searchFilters.planType
      // Note: API key search would require API key data to be added to UserData interface
      // For now, we'll search by user ID as a placeholder
      const apiKeyMatch =
        searchFilters.apiKey === "" || user.id.toLowerCase().includes(searchFilters.apiKey.toLowerCase())

      return emailMatch && planTypeMatch && apiKeyMatch
    })
  }, [users, searchFilters])

  /**
   * 清除所有筛选条件
   */
  const clearFilters = () => {
    setSearchFilters({
      email: "",
      planType: "",
      apiKey: "",
    })
  }

  return {
    searchFilters,
    setSearchFilters,
    filteredUsers,
    clearFilters,
  }
}
