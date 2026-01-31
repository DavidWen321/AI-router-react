/**
 * 代理商管理页面（管理员）
 * 管理所有代理商：添加、充值、查看详情、启用/禁用等
 * 智能响应式布局
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { UserPlus, Search, Wallet, Users, RefreshCw, Eye, Power, Trash2, TrendingUp, Gift, Mail, Calendar } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { agentAdminApi, type AgentInfoVO, type AgentStatisticsVO } from "@/lib/api"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AddAgentDialog } from "./components/AddAgentDialog"
import { RechargeDialog } from "./components/RechargeDialog"
import { AgentDetailDialog } from "./components/AgentDetailDialog"

export default function AgentManagementPage() {
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [agents, setAgents] = useState<AgentInfoVO[]>([])
  const [statistics, setStatistics] = useState<AgentStatisticsVO | null>(null)
  const [keyword, setKeyword] = useState("")
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // 对话框状态
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentInfoVO | null>(null)

  // 加载代理商列表
  const loadAgents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await agentAdminApi.listAgents(currentPage, pageSize, keyword || undefined, statusFilter)
      setAgents(res.list || [])
      setTotal(res.total || 0)
    } catch (error) {
      console.error("加载代理商列表失败:", error)
      toast.error(t("加载代理商列表失败", "Failed to load agent list"))
    } finally {
      setLoading(false)
    }
  }, [currentPage, keyword, statusFilter, t])

  // 加载统计数据
  const loadStatistics = useCallback(async () => {
    try {
      const stats = await agentAdminApi.getStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error("加载统计数据失败:", error)
    }
  }, [])

  useEffect(() => {
    loadAgents()
    loadStatistics()
  }, [loadAgents, loadStatistics])

  // 搜索
  const handleSearch = () => {
    setCurrentPage(1)
    loadAgents()
  }

  // 刷新
  const handleRefresh = () => {
    loadAgents()
    loadStatistics()
  }

  // 打开充值对话框
  const handleRecharge = (agent: AgentInfoVO) => {
    setSelectedAgent(agent)
    setRechargeDialogOpen(true)
  }

  // 打开详情对话框
  const handleViewDetail = (agent: AgentInfoVO) => {
    setSelectedAgent(agent)
    setDetailDialogOpen(true)
  }

  // 切换状态
  const handleToggleStatus = async (agent: AgentInfoVO) => {
    const newStatus = agent.status === 1 ? 0 : 1
    try {
      await agentAdminApi.updateStatus(agent.userId, newStatus)
      toast.success(t(
        newStatus === 1 ? "已启用代理商" : "已禁用代理商",
        newStatus === 1 ? "Agent enabled" : "Agent disabled"
      ))
      loadAgents()
    } catch (error: any) {
      console.error("更新状态失败:", error)
      toast.error(error.message || t("更新状态失败", "Failed to update status"))
    }
  }

  // 移除代理商
  const handleRemove = async (agent: AgentInfoVO) => {
    if (!confirm(t("确定要移除该代理商身份吗？", "Are you sure you want to remove this agent?"))) {
      return
    }
    try {
      await agentAdminApi.removeAgent(agent.userId)
      toast.success(t("已移除代理商", "Agent removed"))
      loadAgents()
      loadStatistics()
    } catch (error: any) {
      console.error("移除代理商失败:", error)
      toast.error(error.message || t("移除代理商失败", "Failed to remove agent"))
    }
  }

  // 格式化时间
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-"
    const date = new Date(dateStr)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      {/* 页面标题 */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("代理商管理", "Agent Management")}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {t("刷新", "Refresh")}
            </button>
            <button
              onClick={() => setAddDialogOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <UserPlus className="w-4 h-4" />
              {t("添加代理商", "Add Agent")}
            </button>
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {t("管理代理商账户，包括添加代理、充值、查看记录等功能", "Manage agent accounts including adding agents, recharging, viewing records, etc.")}
        </p>
      </div>

      {/* 统计卡片 - 响应式网格 */}
      {statistics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t("代理商总数", "Total Agents")}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{statistics.totalAgents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t("总余额", "Total Balance")}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{statistics.totalBalance?.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t("总充值", "Total Recharged")}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{statistics.totalRecharged?.toFixed(2)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">{t("总兑换次数", "Total Redemptions")}</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{statistics.totalRedemptions}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("搜索邮箱或用户ID...", "Search by email or user ID...")}
              className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter ?? ""}
              onChange={(e) => {
                setStatusFilter(e.target.value === "" ? undefined : Number(e.target.value))
                setCurrentPage(1)
              }}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">{t("全部状态", "All Status")}</option>
              <option value="1">{t("已启用", "Enabled")}</option>
              <option value="0">{t("已禁用", "Disabled")}</option>
            </select>
            <button
              onClick={handleSearch}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-medium text-sm text-white bg-amber-500 hover:bg-amber-600 transition-colors"
            >
              {t("搜索", "Search")}
            </button>
          </div>
        </div>
      </div>

      {/* 代理商列表 */}
      {loading ? (
        <div className="flex justify-center items-center py-12 sm:py-20">
          <div className="text-gray-600 dark:text-gray-400">
            {t("加载中...", "Loading...")}
          </div>
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {t("暂无代理商", "No agents")}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
          {/* 移动端卡片视图 */}
          <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {agents.map((agent) => (
              <div key={agent.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                {/* 顶部：邮箱 + 状态 */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {agent.email}
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${
                    agent.status === 1
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                  }`}>
                    {agent.status === 1 ? t("已启用", "Enabled") : t("已禁用", "Disabled")}
                  </span>
                </div>

                {/* 额度信息网格 */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("余额", "Balance")}</span>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {agent.balance?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("充值", "Recharged")}</span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {agent.totalRecharged?.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">{t("消费", "Consumed")}</span>
                    <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                      {agent.totalConsumed?.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(agent.createdAt)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewDetail(agent)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={t("详情", "Detail")}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRecharge(agent)}
                      className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                      title={t("充值", "Recharge")}
                    >
                      <Wallet className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(agent)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        agent.status === 1
                          ? "text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                          : "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                      title={agent.status === 1 ? t("禁用", "Disable") : t("启用", "Enable")}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(agent)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t("移除", "Remove")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 桌面端表格视图 - 智能响应式 */}
          <div className="hidden lg:block">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-2 xl:px-4 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[20%] xl:w-[18%]">
                    {t("用户邮箱", "Email")}
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[12%] xl:w-[10%]">
                    {t("余额", "Balance")}
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[12%] xl:w-[10%]">
                    {t("累计充值", "Recharged")}
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[12%] xl:w-[10%]">
                    {t("累计消费", "Consumed")}
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[8%]">
                    {t("状态", "Status")}
                  </th>
                  <th className="hidden xl:table-cell px-2 xl:px-4 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[10%]">
                    {t("创建时间", "Created")}
                  </th>
                  <th className="hidden 2xl:table-cell px-2 xl:px-4 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[10%]">
                    {t("更新时间", "Updated")}
                  </th>
                  <th className="px-2 xl:px-4 py-3 text-center text-xs xl:text-sm font-medium text-gray-900 dark:text-gray-100 w-[18%] xl:w-[14%]">
                    {t("操作", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {/* 邮箱 + Tooltip */}
                    <td className="px-2 xl:px-4 py-3 text-center text-xs xl:text-sm text-gray-900 dark:text-gray-100">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate cursor-default">{agent.email}</span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          sideOffset={4}
                          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm font-medium max-w-[300px] break-all"
                        >
                          {agent.email} (ID: {agent.userId})
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    {/* 余额 */}
                    <td className="px-2 xl:px-4 py-3 text-center">
                      <span className="text-sm xl:text-base font-bold text-amber-600 dark:text-amber-400">
                        {agent.balance?.toFixed(2)}
                      </span>
                    </td>
                    {/* 累计充值 */}
                    <td className="px-2 xl:px-4 py-3 text-center text-xs xl:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      {agent.totalRecharged?.toFixed(2)}
                    </td>
                    {/* 累计消费 */}
                    <td className="px-2 xl:px-4 py-3 text-center text-xs xl:text-sm text-orange-600 dark:text-orange-400 font-medium">
                      {agent.totalConsumed?.toFixed(2)}
                    </td>
                    {/* 状态 */}
                    <td className="px-2 xl:px-4 py-3 text-center">
                      <span className={`inline-flex px-1.5 xl:px-2 py-0.5 text-[10px] xl:text-xs font-medium rounded ${
                        agent.status === 1
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      }`}>
                        {agent.status === 1 ? t("已启用", "Enabled") : t("已禁用", "Disabled")}
                      </span>
                    </td>
                    {/* 创建时间 - xl以上显示 */}
                    <td className="hidden xl:table-cell px-2 xl:px-4 py-3 text-center text-xs xl:text-sm text-gray-600 dark:text-gray-400">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate cursor-default">{formatDate(agent.createdAt)}</span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          sideOffset={4}
                          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm"
                        >
                          {agent.createdAt}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    {/* 更新时间 - 2xl以上显示 */}
                    <td className="hidden 2xl:table-cell px-2 xl:px-4 py-3 text-center text-xs xl:text-sm text-gray-600 dark:text-gray-400">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="block truncate cursor-default">{formatDate(agent.updatedAt)}</span>
                        </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          sideOffset={4}
                          className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-2 rounded-lg shadow-xl text-sm"
                        >
                          {agent.updatedAt}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    {/* 操作 */}
                    <td className="px-2 xl:px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5 xl:gap-1">
                        <button
                          onClick={() => handleViewDetail(agent)}
                          className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("查看详情", "View Details")}
                        >
                          <Eye className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                        <button
                          onClick={() => handleRecharge(agent)}
                          className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("充值", "Recharge")}
                        >
                          <Wallet className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(agent)}
                          className={`p-1 xl:p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                            agent.status === 1
                              ? "text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                              : "text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          }`}
                          title={agent.status === 1 ? t("禁用", "Disable") : t("启用", "Enable")}
                        >
                          <Power className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(agent)}
                          className="p-1 xl:p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                          title={t("移除代理商", "Remove Agent")}
                        >
                          <Trash2 className="w-3.5 h-3.5 xl:w-4 xl:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {t("共", "Total")} {total} {t("条", "records")}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("上一页", "Prev")}
                </button>
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("下一页", "Next")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 对话框 */}
      <AddAgentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => {
          loadAgents()
          loadStatistics()
        }}
      />

      <RechargeDialog
        open={rechargeDialogOpen}
        onOpenChange={setRechargeDialogOpen}
        agent={selectedAgent}
        onSuccess={() => {
          loadAgents()
          loadStatistics()
        }}
      />

      <AgentDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        agent={selectedAgent}
      />
    </div>
  )
}
