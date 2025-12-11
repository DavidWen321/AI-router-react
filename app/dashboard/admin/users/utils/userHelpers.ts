/**
 * 用户管理页面 - 工具函数
 */

/**
 * 获取状态颜色类名
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "活跃":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "已过期":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "已取消":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

/**
 * 翻译套餐类型
 */
export function translatePlanType(planType: string, t: (zh: string, en: string) => string): string {
  switch (planType) {
    case "标准套餐":
      return t("标准套餐", "Standard Plan")
    case "专业套餐":
      return t("专业套餐", "Professional Plan")
    case "企业套餐":
      return t("企业套餐", "Enterprise Plan")
    default:
      return planType
  }
}

/**
 * 翻译状态
 */
export function translateStatus(status: string, t: (zh: string, en: string) => string): string {
  switch (status) {
    case "活跃":
      return t("活跃", "Active")
    case "已过期":
      return t("已过期", "Expired")
    case "已取消":
      return t("已取消", "Cancelled")
    default:
      return status
  }
}

/**
 * 获取使用率颜色类名
 */
export function getUsageRateColor(usageRate: number): string {
  if (usageRate < 50) {
    return "text-green-600 dark:text-green-400"
  } else if (usageRate < 80) {
    return "text-yellow-600 dark:text-yellow-400"
  } else {
    return "text-red-600 dark:text-red-400"
  }
}

/**
 * 获取使用率进度条颜色
 */
export function getUsageRateBarColor(usageRate: number): string {
  if (usageRate < 50) {
    return "bg-gradient-to-r from-green-400 to-green-600"
  } else if (usageRate < 80) {
    return "bg-gradient-to-r from-yellow-400 to-orange-500"
  } else {
    return "bg-gradient-to-r from-orange-500 to-red-600"
  }
}
