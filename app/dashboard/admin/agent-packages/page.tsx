"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Package, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { agentPricingApi, membershipApi, type AgentPricingData, type MembershipData } from "@/lib/api"
import { AgentPackageTable } from "./components/AgentPackageTable"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AgentPackagesPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [packages, setPackages] = useState<AgentPricingData[]>([])
  const [loading, setLoading] = useState(true)
  const [memberships, setMemberships] = useState<MembershipData[]>([])

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<AgentPricingData | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [packageToEdit, setPackageToEdit] = useState<AgentPricingData | null>(null)
  const [editFormData, setEditFormData] = useState({
    membershipId: "",
    agentPrice: "",
    originalPrice: "",
    description: "",
    sortOrder: "",
  })

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addFormData, setAddFormData] = useState({
    membershipId: "",
    agentPrice: "",
    originalPrice: "",
    description: "",
    sortOrder: "",
  })

  // 加载套餐数据和会员等级
  useEffect(() => {
    loadPackages()
    loadMemberships()
  }, [])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const data = await agentPricingApi.getAllPricing()
      setPackages(data)
    } catch (error) {
      console.error("Failed to load packages:", error)
      toast({
        title: t("加载失败", "Load Failed"),
        description: t("无法加载套餐列表", "Failed to load package list"),
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMemberships = async () => {
    try {
      const data = await membershipApi.getActiveMemberships()
      setMemberships(data)
    } catch (error) {
      console.error("Failed to load memberships:", error)
    }
  }

  const handleAddPackage = () => {
    setAddFormData({
      membershipId: "",
      agentPrice: "",
      originalPrice: "",
      description: "",
      sortOrder: "",
    })
    setAddDialogOpen(true)
  }

  const handleSaveAdd = async () => {
    try {
      await agentPricingApi.addPricing({
        membershipId: Number.parseInt(addFormData.membershipId),
        agentPrice: Number.parseFloat(addFormData.agentPrice) || 0,
        originalPrice: Number.parseFloat(addFormData.originalPrice) || 0,
        description: addFormData.description || undefined,
        sortOrder: addFormData.sortOrder ? Number.parseInt(addFormData.sortOrder) : undefined,
      })
      toast({
        title: t("添加成功", "Added Successfully"),
        description: t("代理价格已创建", "Agent pricing has been created"),
        duration: 3000,
      })
      setAddDialogOpen(false)
      loadPackages()
    } catch (error) {
      console.error("Failed to add pricing:", error)
      toast({
        title: t("添加失败", "Add Failed"),
        description: t("无法添加代理价格", "Failed to add agent pricing"),
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleEditPackage = (pkg: AgentPricingData) => {
    setPackageToEdit(pkg)
    setEditFormData({
      membershipId: String(pkg.membershipId),
      agentPrice: String(pkg.agentPrice),
      originalPrice: String(pkg.originalPrice),
      description: pkg.description || "",
      sortOrder: pkg.sortOrder ? String(pkg.sortOrder) : "",
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!packageToEdit) return

    try {
      await agentPricingApi.updatePricing(packageToEdit.id, {
        membershipId: Number.parseInt(editFormData.membershipId),
        agentPrice: Number.parseFloat(editFormData.agentPrice) || 0,
        originalPrice: Number.parseFloat(editFormData.originalPrice) || 0,
        description: editFormData.description || undefined,
        sortOrder: editFormData.sortOrder ? Number.parseInt(editFormData.sortOrder) : undefined,
      })
      toast({
        title: t("保存成功", "Saved Successfully"),
        description: t("代理价格已更新", "Agent pricing has been updated"),
        duration: 3000,
      })
      setEditDialogOpen(false)
      setPackageToEdit(null)
      loadPackages()
    } catch (error) {
      console.error("Failed to update pricing:", error)
      toast({
        title: t("保存失败", "Save Failed"),
        description: t("无法保存代理价格", "Failed to save agent pricing"),
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleDeletePackage = (pkg: AgentPricingData) => {
    setPackageToDelete(pkg)
    setDeleteDialogOpen(true)
  }

  const confirmDeletePackage = async () => {
    if (!packageToDelete) return

    try {
      await agentPricingApi.deletePricing(packageToDelete.id)
      toast({
        title: t("删除成功", "Deleted Successfully"),
        description: t(`代理价格 ${packageToDelete.levelName} 已被删除`, `Agent pricing ${packageToDelete.levelName} has been deleted`),
        duration: 3000,
      })
      setDeleteDialogOpen(false)
      setPackageToDelete(null)
      loadPackages()
    } catch (error) {
      console.error("Failed to delete pricing:", error)
      toast({
        title: t("删除失败", "Delete Failed"),
        description: t("无法删除代理价格", "Failed to delete agent pricing"),
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 dark:text-indigo-300" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("代理商套餐管理", "Agent Package Management")}
            </h1>
          </div>
          <Button onClick={handleAddPackage} className="bg-indigo-500 hover:bg-indigo-600 text-white w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4 mr-2" />
            {t("新增套餐", "Add Package")}
          </Button>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {t("管理所有代理商套餐类型和定价配置", "Manage all agent package types and pricing configurations")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("套餐总数", "Total Packages")}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{packages.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-green-400 dark:hover:border-green-500 cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("会员等级数", "Membership Levels")}</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {memberships.length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("订阅用户", "Subscribed Users")}</div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {t("计算中", "Calculating")}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-cyan-400 dark:hover:border-cyan-500 cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("月度收入", "Monthly Revenue")}</div>
          <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
            {t("计算中", "Calculating")}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600 dark:text-gray-400">{t("加载中...", "Loading...")}</div>
        </div>
      ) : (
        <AgentPackageTable packages={packages} onEditPackage={handleEditPackage} onDeletePackage={handleDeletePackage} />
      )}

      {/* 新增套餐对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("新增套餐", "Add Package")}</DialogTitle>
            <DialogDescription>
              {t("创建新的套餐配置和定价", "Create new package configuration and pricing")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t("选择会员等级", "Select Membership Level")} <span className="text-red-500">*</span>
              </Label>
              <select
                value={addFormData.membershipId}
                onChange={(e) => setAddFormData({ ...addFormData, membershipId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">{t("请选择会员等级", "Please select membership level")}</option>
                {memberships.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.levelName} ({m.levelCode}) - ${m.dailyUsage}/day
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("代理价格 (积分/月)", "Agent Price (Credits/Month)")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={addFormData.agentPrice}
                  onChange={(e) => setAddFormData({ ...addFormData, agentPrice: e.target.value })}
                  placeholder="99.00"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("原价/官方价 (¥)", "Original Price (¥)")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={addFormData.originalPrice}
                  onChange={(e) => setAddFormData({ ...addFormData, originalPrice: e.target.value })}
                  placeholder="199.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("描述（可选）", "Description (Optional)")}
                </Label>
                <Input
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                  placeholder={t("套餐描述", "Package description")}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("排序顺序（可选）", "Sort Order (Optional)")}
                </Label>
                <Input
                  type="number"
                  value={addFormData.sortOrder}
                  onChange={(e) => setAddFormData({ ...addFormData, sortOrder: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(false)}
                className="flex-1 bg-transparent dark:bg-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t("取消", "Cancel")}
              </Button>
              <Button
                onClick={handleSaveAdd}
                disabled={!addFormData.membershipId || !addFormData.agentPrice || !addFormData.originalPrice}
                className="flex-1 bg-indigo-500 dark:bg-indigo-800 hover:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("创建", "Create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 编辑套餐对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("编辑套餐", "Edit Package")}</DialogTitle>
            <DialogDescription>
              {t("修改套餐的配置信息和定价", "Modify package configuration and pricing")}
            </DialogDescription>
          </DialogHeader>

          {packageToEdit && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("选择会员等级", "Select Membership Level")} <span className="text-red-500">*</span>
                </Label>
                <select
                  value={editFormData.membershipId}
                  onChange={(e) => setEditFormData({ ...editFormData, membershipId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">{t("请选择会员等级", "Please select membership level")}</option>
                  {memberships.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.levelName} ({m.levelCode}) - ${m.dailyUsage}/day
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("代理价格 (积分/月)", "Agent Price (Credits/Month)")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.agentPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, agentPrice: e.target.value })}
                    placeholder="99.00"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("原价/官方价 (¥)", "Original Price (¥)")} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.originalPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, originalPrice: e.target.value })}
                    placeholder="199.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("描述（可选）", "Description (Optional)")}
                  </Label>
                  <Input
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder={t("套餐描述", "Package description")}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("排序顺序（可选）", "Sort Order (Optional)")}
                  </Label>
                  <Input
                    type="number"
                    value={editFormData.sortOrder}
                    onChange={(e) => setEditFormData({ ...editFormData, sortOrder: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                  className="flex-1 bg-transparent dark:bg-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("取消", "Cancel")}
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editFormData.membershipId || !editFormData.agentPrice || !editFormData.originalPrice}
                  className="flex-1 bg-indigo-500 dark:bg-indigo-800 hover:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t("保存", "Save")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("删除套餐", "Delete Package")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                `确认删除套餐 ${packageToDelete?.levelName}？此操作无法撤销。`,
                `Are you sure you want to delete package ${packageToDelete?.levelName}? This action cannot be undone.`,
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("取消", "Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePackage} className="bg-red-600 hover:bg-red-700">
              {t("确认删除", "Confirm Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
