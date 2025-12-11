/**
 * 套餐表格组件
 */

import { Edit, Trash2 } from "lucide-react"
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <div className="overflow-x-auto">
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
