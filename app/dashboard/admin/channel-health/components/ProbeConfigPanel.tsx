"use client"

import { useState, useEffect, useCallback } from "react"
import { useLanguage } from "@/lib/language-context"
import { useToast } from "@/hooks/use-toast"
import {
  Settings2,
  Plus,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Save,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { probeConfigApi, type ProbeModelConfig, ApiError } from "@/lib/api"

export function ProbeConfigPanel() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [expanded, setExpanded] = useState(false)
  const [configs, setConfigs] = useState<ProbeModelConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  // 新增表单
  const [newConfig, setNewConfig] = useState({
    modelId: "",
    displayName: "",
    probeFrequency: "high" as "high" | "low",
    sortOrder: 0,
  })

  // 编辑表单
  const [editForm, setEditForm] = useState({
    modelId: "",
    displayName: "",
    probeFrequency: "high" as "high" | "low",
    sortOrder: 0,
  })

  const loadConfigs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await probeConfigApi.list()
      setConfigs(data)
    } catch (error) {
      console.error("加载探测配置失败:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (expanded) {
      loadConfigs()
    }
  }, [expanded, loadConfigs])

  const handleCreate = async () => {
    if (!newConfig.modelId || !newConfig.displayName) {
      toast({
        title: t("请填写完整", "Please fill in all fields"),
        variant: "destructive",
      })
      return
    }
    try {
      await probeConfigApi.create({
        ...newConfig,
        enabled: true,
      })
      toast({ title: t("新增成功", "Created") })
      setShowAddForm(false)
      setNewConfig({ modelId: "", displayName: "", probeFrequency: "high", sortOrder: 0 })
      loadConfigs()
    } catch (error) {
      toast({
        title: t("新增失败", "Create Failed"),
        description: error instanceof ApiError ? error.message : undefined,
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async (id: number) => {
    try {
      await probeConfigApi.update(id, editForm)
      toast({ title: t("更新成功", "Updated") })
      setEditingId(null)
      loadConfigs()
    } catch (error) {
      toast({
        title: t("更新失败", "Update Failed"),
        description: error instanceof ApiError ? error.message : undefined,
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await probeConfigApi.delete(id)
      toast({ title: t("删除成功", "Deleted") })
      loadConfigs()
    } catch (error) {
      toast({
        title: t("删除失败", "Delete Failed"),
        description: error instanceof ApiError ? error.message : undefined,
        variant: "destructive",
      })
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await probeConfigApi.toggle(id)
      loadConfigs()
    } catch (error) {
      toast({
        title: t("切换失败", "Toggle Failed"),
        variant: "destructive",
      })
    }
  }

  const handleRefreshCache = async () => {
    try {
      await probeConfigApi.refresh()
      toast({ title: t("缓存已刷新", "Cache Refreshed") })
    } catch (error) {
      toast({
        title: t("刷新失败", "Refresh Failed"),
        variant: "destructive",
      })
    }
  }

  const startEdit = (config: ProbeModelConfig) => {
    setEditingId(config.id!)
    setEditForm({
      modelId: config.modelId,
      displayName: config.displayName,
      probeFrequency: config.probeFrequency,
      sortOrder: config.sortOrder,
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
      {/* 折叠头部 */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors rounded-xl sm:rounded-2xl"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              {t("探测模型配置", "Probe Model Config")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("管理探测使用的模型和频率", "Manage probe models and frequencies")}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* 展开内容 */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 dark:border-gray-700/50">
          {/* 操作栏 */}
          <div className="flex items-center justify-between py-3">
            <span className="text-xs text-gray-500">
              {t(`共 ${configs.length} 个模型`, `${configs.length} models`)}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefreshCache} className="text-xs h-7 px-2">
                <RefreshCw className="w-3 h-3 mr-1" />
                {t("刷新缓存", "Refresh Cache")}
              </Button>
              <Button
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="text-xs h-7 px-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-3 h-3 mr-1" />
                {t("新增", "Add")}
              </Button>
            </div>
          </div>

          {/* 新增表单 */}
          {showAddForm && (
            <div className="mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                <input
                  type="text"
                  placeholder={t("模型ID", "Model ID")}
                  value={newConfig.modelId}
                  onChange={(e) => setNewConfig({ ...newConfig, modelId: e.target.value })}
                  className="text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <input
                  type="text"
                  placeholder={t("显示名称", "Display Name")}
                  value={newConfig.displayName}
                  onChange={(e) => setNewConfig({ ...newConfig, displayName: e.target.value })}
                  className="text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
                <select
                  value={newConfig.probeFrequency}
                  onChange={(e) => setNewConfig({ ...newConfig, probeFrequency: e.target.value as "high" | "low" })}
                  className="text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="high">{t("高频 (30s)", "High (30s)")}</option>
                  <option value="low">{t("低频 (5min)", "Low (5min)")}</option>
                </select>
                <input
                  type="number"
                  placeholder={t("排序", "Sort")}
                  value={newConfig.sortOrder}
                  onChange={(e) => setNewConfig({ ...newConfig, sortOrder: parseInt(e.target.value) || 0 })}
                  className="text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="text-xs h-7">
                  <X className="w-3 h-3 mr-1" />
                  {t("取消", "Cancel")}
                </Button>
                <Button size="sm" onClick={handleCreate} className="text-xs h-7 bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Save className="w-3 h-3 mr-1" />
                  {t("保存", "Save")}
                </Button>
              </div>
            </div>
          )}

          {/* 模型列表 */}
          {loading ? (
            <div className="py-6 text-center text-gray-400 text-sm">{t("加载中...", "Loading...")}</div>
          ) : (
            <div className="space-y-2">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg"
                >
                  {editingId === config.id ? (
                    /* 编辑模式 */
                    <div className="flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-2">
                        <input
                          type="text"
                          value={editForm.modelId}
                          onChange={(e) => setEditForm({ ...editForm, modelId: e.target.value })}
                          className="text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <input
                          type="text"
                          value={editForm.displayName}
                          onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                          className="text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                        <select
                          value={editForm.probeFrequency}
                          onChange={(e) => setEditForm({ ...editForm, probeFrequency: e.target.value as "high" | "low" })}
                          className="text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                          <option value="high">{t("高频 (30s)", "High (30s)")}</option>
                          <option value="low">{t("低频 (5min)", "Low (5min)")}</option>
                        </select>
                        <input
                          type="number"
                          value={editForm.sortOrder}
                          onChange={(e) => setEditForm({ ...editForm, sortOrder: parseInt(e.target.value) || 0 })}
                          className="text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} className="text-xs h-6">
                          {t("取消", "Cancel")}
                        </Button>
                        <Button size="sm" onClick={() => handleUpdate(config.id!)} className="text-xs h-6 bg-indigo-600 hover:bg-indigo-700 text-white">
                          {t("保存", "Save")}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* 显示模式 */
                    <>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={() => handleToggle(config.id!)}
                          className="scale-75"
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {config.displayName}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                            {config.modelId}
                          </div>
                        </div>
                        <span
                          className={`flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            config.probeFrequency === "high"
                              ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          }`}
                        >
                          {config.probeFrequency === "high" ? t("高频", "High") : t("低频", "Low")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => startEdit(config)}
                          className="p-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                          title={t("编辑", "Edit")}
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(config.id!)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                          title={t("删除", "Delete")}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {configs.length === 0 && !loading && (
                <div className="py-6 text-center text-gray-400 text-sm">
                  {t("暂无探测模型配置", "No probe model configurations")}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
