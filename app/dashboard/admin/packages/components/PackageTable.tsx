/**
 * 套餐表格组件
 * 响应式设计：移动端卡片视图 + 桌面端表格视图
 */

import { Edit, Trash2, Package, DollarSign, Calendar, Tag } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import type { MembershipData } from "@/lib/api"

interface PackageTableProps {
  packages: MembershipData[]
  onEditPackage: (pkg: MembershipData) => void
  onDeletePackage: (pkg: MembershipData) => void
}

export function PackageTable({ packages, onEditPackage, onDeletePackage }: PackageTableProps) {
  const { t } = useLanguage()

  const getStatusColor = (status: number) => {
    return status === 1
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const translateStatus = (status: number) => {
    return status === 1 ? t("启用", "Active") : t("禁用", "Inactive")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      {/* 移动端卡片视图 */}
      <div className="lg:hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {packages.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              {t("暂无套餐数据", "No package data")}
            </div>
          ) : (
            packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                {/* 顶部：套餐名称 + 状态 */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Package className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {pkg.levelName}
                    </span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${getStatusColor(pkg.status)}`}>
                    {translateStatus(pkg.status)}
                  </span>
                </div>

                {/* 套餐代码 */}
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                  <Tag className="w-3 h-3" />
                  <span>{pkg.levelCode}</span>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <span>ID: {pkg.id}</span>
                </div>

                {/* 价格信息网格 */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-2">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                      {t("价格", "Price")}
                    </span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      ¥{pkg.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-2">
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block">
                      {t("每日用量", "Daily Usage")}
                    </span>
                    <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                      ${pkg.dailyUsage.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 底部：时间信息 + 操作按钮 */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{t("创建", "Created")}: {formatDateShort(pkg.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditPackage(pkg)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={t("编辑", "Edit")}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePackage(pkg)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={t("删除", "Delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 桌面端表格视图 */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("会员等级名称", "Membership Name")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("会员等级代码", "Level Code")}
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("每日用量 ($)", "Daily Usage ($)")}
              </th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("价格 (¥)", "Price (¥)")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("状态", "Status")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("创建时间", "Created At")}
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("更新时间", "Updated At")}
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                {t("操作", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {packages.map((pkg) => (
              <tr
                key={pkg.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
              >
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{pkg.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {pkg.levelName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{pkg.levelCode}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100">
                  ${pkg.dailyUsage.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-right font-medium text-indigo-600 dark:text-indigo-400">
                  ¥{pkg.price.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getStatusColor(pkg.status)}`}
                  >
                    {translateStatus(pkg.status)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(pkg.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(pkg.updatedAt)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1.5">
                    {/* 编辑按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditPackage(pkg)
                      }}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      title={t("编辑", "Edit")}
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* 删除按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeletePackage(pkg)
                      }}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 hover:scale-110"
                      title={t("删除", "Delete")}
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
  )
}
