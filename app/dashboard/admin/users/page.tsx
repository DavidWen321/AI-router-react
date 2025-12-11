/**
 * 用户管理页面 - 重构后的主页面
 * 模块化、低耦合设计
 */

"use client"

import { useState } from "react"
import { Users, Gift } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

// 导入自定义 Hooks
import { useUserData } from "./hooks/useUserData"
import { useUserFilters } from "./hooks/useUserFilters"

// 导入类型
import type { UserData, EditFormData, TimePeriod } from "./types"

// 导入组件
import { UserStatsCards } from "./components/UserStatsCards"
import { UserSearchFilters } from "./components/UserSearchFilters"
import { UserTable } from "./components/UserTable"
import { ViewUserDialog } from "./components/dialogs/ViewUserDialog"
import { DeleteUserDialog } from "./components/dialogs/DeleteUserDialog"
import { ActivateMembershipDialog } from "./components/dialogs/ActivateMembershipDialog"
import { UpgradeMembershipDialog } from "./components/dialogs/UpgradeMembershipDialog"
import { RenewMembershipDialog } from "./components/dialogs/RenewMembershipDialog"
import { BatchCompensateDialog } from "./components/dialogs/BatchCompensateDialog"
import { AdjustTempLimitDialog } from "./components/dialogs/AdjustTempLimitDialog"

// 导入图表视图组件
import { UserChartView } from "./components/UserChartView"

export default function UsersPage() {
  const { t } = useLanguage()

  // 使用自定义 Hooks
  const { users, loading, deleteUser } = useUserData()
  const { searchFilters, setSearchFilters, filteredUsers, clearFilters } = useUserFilters(users)

  // 图表视图状态
  const [showChartView, setShowChartView] = useState(false)
  const [selectedUserForChart, setSelectedUserForChart] = useState<UserData | null>(null)
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>("7days")

  // 对话框状态
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [userToView, setUserToView] = useState<UserData | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null)

  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [userToActivate, setUserToActivate] = useState<UserData | null>(null)

  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [userToUpgrade, setUserToUpgrade] = useState<UserData | null>(null)

  const [renewDialogOpen, setRenewDialogOpen] = useState(false)
  const [userToRenew, setUserToRenew] = useState<UserData | null>(null)

  const [adjustTempLimitDialogOpen, setAdjustTempLimitDialogOpen] = useState(false)
  const [userToAdjustLimit, setUserToAdjustLimit] = useState<UserData | null>(null)

  const [batchCompensateDialogOpen, setBatchCompensateDialogOpen] = useState(false)

  // 事件处理函数
  const handleViewUser = (user: UserData) => {
    setUserToView(user)
    setViewDialogOpen(true)
  }

  const handleDeleteUser = (user: UserData) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete)
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  const handleActivateMembership = (user: UserData) => {
    setUserToActivate(user)
    setActivateDialogOpen(true)
  }

  const handleUpgradeMembership = (user: UserData) => {
    setUserToUpgrade(user)
    setUpgradeDialogOpen(true)
  }

  const handleRenewMembership = (user: UserData) => {
    setUserToRenew(user)
    setRenewDialogOpen(true)
  }

  const handleAdjustTempLimit = (user: UserData) => {
    setUserToAdjustLimit(user)
    setAdjustTempLimitDialogOpen(true)
  }

  const handleBatchCompensate = () => {
    setBatchCompensateDialogOpen(true)
  }

  const handleDialogSuccess = () => {
    // Reload user data after successful operation
    window.location.reload()
  }

  const handleUsageRateClick = (user: UserData) => {
    setSelectedUserForChart(user)
    setShowChartView(true)
  }

  const handleBackToTable = () => {
    setShowChartView(false)
    setSelectedUserForChart(null)
    setSelectedTimePeriod("7days")
  }

  // 如果显示图表视图
  if (showChartView && selectedUserForChart) {
    return (
      <UserChartView
        user={selectedUserForChart}
        users={users}
        timePeriod={selectedTimePeriod}
        onTimePeriodChange={setSelectedTimePeriod}
        onBack={handleBackToTable}
      />
    )
  }

  // 主表格视图
  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("用户管理", "User Management")}</h1>
          </div>
          <button
            onClick={handleBatchCompensate}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-sm hover:shadow-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300"
          >
            <Gift className="w-4 h-4" />
            {t("一键会员补偿", "Batch Compensation")}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t("查看和管理所有用户的使用情况和会员信息", "View and manage all users' usage and membership information")}
        </p>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600 dark:text-gray-400">
            {t("加载中...", "Loading...")}
          </div>
        </div>
      )}

      {/* 搜索过滤器 */}
      <UserSearchFilters
        filters={searchFilters}
        onFiltersChange={setSearchFilters}
        onClearFilters={clearFilters}
        resultCount={filteredUsers.length}
      />

      {/* 统计卡片 */}
      <UserStatsCards users={users} />

      {/* 用户表格 */}
      <UserTable
        users={filteredUsers}
        onViewUser={handleViewUser}
        onActivateMembership={handleActivateMembership}
        onUpgradeMembership={handleUpgradeMembership}
        onRenewMembership={handleRenewMembership}
        onDeleteUser={handleDeleteUser}
        onUsageRateClick={handleUsageRateClick}
        onAdjustTempLimit={handleAdjustTempLimit}
      />

      {/* 查看用户对话框 */}
      <ViewUserDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} user={userToView} />

      {/* 删除用户对话框 */}
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={userToDelete}
        onConfirm={confirmDeleteUser}
      />

      {/* 开通会员对话框 */}
      <ActivateMembershipDialog
        open={activateDialogOpen}
        onOpenChange={setActivateDialogOpen}
        user={userToActivate}
        onSuccess={handleDialogSuccess}
      />

      {/* 会员升级对话框 */}
      <UpgradeMembershipDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        user={userToUpgrade}
        onSuccess={handleDialogSuccess}
      />

      {/* 会员续费对话框 */}
      <RenewMembershipDialog
        open={renewDialogOpen}
        onOpenChange={setRenewDialogOpen}
        user={userToRenew}
        onSuccess={handleDialogSuccess}
      />

      {/* 临时调整额度对话框 */}
      <AdjustTempLimitDialog
        open={adjustTempLimitDialogOpen}
        onOpenChange={setAdjustTempLimitDialogOpen}
        user={userToAdjustLimit}
        onSuccess={handleDialogSuccess}
      />

      {/* 一键批量补偿对话框 */}
      <BatchCompensateDialog
        open={batchCompensateDialogOpen}
        onOpenChange={setBatchCompensateDialogOpen}
        onSuccess={handleDialogSuccess}
      />
    </div>
  )
}
