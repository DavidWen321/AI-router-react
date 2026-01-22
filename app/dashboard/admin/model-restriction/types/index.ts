/**
 * 模型限制管理 - TypeScript 类型定义
 */

export interface ModelRestrictionData {
  id: number
  modelKey: string              // 模型标识符（如 claude-sonnet-4-5）
  modelName: string             // 模型全名（如 claude-sonnet-4-5-20250929）
  isActive: boolean             // 是否启用
  isAllowed: boolean            // 是否允许使用（勾选状态）
}

export interface SearchFilters {
  modelKey: string              // 模型标识符搜索
  modelName: string             // 模型名称搜索
  isAllowed: boolean | null     // 允许状态过滤
}
