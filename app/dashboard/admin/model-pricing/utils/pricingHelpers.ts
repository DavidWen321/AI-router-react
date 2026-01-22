/**
 * 模型定价管理 - 工具函数
 */

/**
 * 格式化价格显示（美元/百万tokens）
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}

/**
 * 格式化日期时间
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

/**
 * 验证价格输入（必须为非负数）
 */
export function validatePrice(price: number): boolean {
  return !isNaN(price) && price >= 0
}

/**
 * 验证模型标识符（不能为空）
 */
export function validateModelKey(modelKey: string): boolean {
  return modelKey.trim().length > 0
}

/**
 * 验证模型名称（不能为空）
 */
export function validateModelName(modelName: string): boolean {
  return modelName.trim().length > 0
}
