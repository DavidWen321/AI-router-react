/**
 * 模型定价管理 - TypeScript 类型定义
 */

export interface ModelPricingData {
  id: number
  modelKey: string              // 模型标识符（如 claude-sonnet-4-5）
  modelName: string             // 模型全名（如 claude-sonnet-4-5-20250929）
  inputPrice: number            // 输入价格（$/百万tokens）
  outputPrice: number           // 输出价格（$/百万tokens）
  cacheWritePrice: number       // 缓存写入价格（$/百万tokens）
  cacheReadPrice: number        // 缓存读取价格（$/百万tokens）
  priceMultiplier: number       // 价格倍率，最终计费 = 原始费用 * 倍率，默认1.0
  isActive: boolean             // 是否启用
  isAllowed: boolean            // 是否允许使用
  createdAt: string             // 创建时间
  updatedAt: string             // 更新时间
}

export interface SearchFilters {
  modelKey: string              // 模型标识符搜索
  modelName: string             // 模型名称搜索
  isActive: boolean | null      // 启用状态过滤
}

export interface CreatePricingFormData {
  modelKey: string
  modelName: string
  inputPrice: number
  outputPrice: number
  cacheWritePrice: number
  cacheReadPrice: number
  priceMultiplier: number
  isActive: boolean
}

export interface EditPricingFormData extends CreatePricingFormData {
  id: number
}
