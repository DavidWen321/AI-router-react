"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Package, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { membershipApi, type MembershipData } from "@/lib/api"
import { PackageTable } from "./components/PackageTable"
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

export default function PackagesPage() {
  const { t } = useLanguage()
  const { toast } = useToast()

  const [packages, setPackages] = useState<MembershipData[]>([])
  const [loading, setLoading] = useState(true)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [packageToDelete, setPackageToDelete] = useState<MembershipData | null>(null)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [packageToEdit, setPackageToEdit] = useState<MembershipData | null>(null)
  const [editFormData, setEditFormData] = useState({
    levelName: "",
    levelCode: "",
    price: "",
    dailyUsage: "",
    status: 1,
  })

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addFormData, setAddFormData] = useState({
    levelName: "",
    levelCode: "",
    price: "",
    dailyUsage: "",
    status: 1,
  })

  // 加载套餐数据
  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const data = await membershipApi.getAllMemberships()
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

  const handleAddPackage = () => {
    setAddFormData({
      levelName: "",
      levelCode: "",
      price: "",
      dailyUsage: "",
      status: 1,
    })
    setAddDialogOpen(true)
  }

  const handleSaveAdd = async () => {
    try {
      await membershipApi.addMembership({
        levelName: addFormData.levelName,
        levelCode: addFormData.levelCode,
        dailyUsage: Number.parseFloat(addFormData.dailyUsage) || 0,
        price: Number.parseFloat(addFormData.price) || 0,
        status: addFormData.status,
      })
      toast({
        title: t("添加成功", "Added Successfully"),
        description: t(`套餐 ${addFormData.levelName} 已创建`, `Package ${addFormData.levelName} has been created`),
        duration: 3000,
      })
      setAddDialogOpen(false)
      loadPackages()
    } catch (error) {
      console.error("Failed to add package:", error)
      toast({
        title: t("添加失败", "Add Failed"),
        description: t("无法添加套餐", "Failed to add package"),
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleEditPackage = (pkg: MembershipData) => {
    setPackageToEdit(pkg)
    setEditFormData({
      levelName: pkg.levelName,
      levelCode: pkg.levelCode,
      price: String(pkg.price),
      dailyUsage: String(pkg.dailyUsage),
      status: pkg.status,
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!packageToEdit) return

    try {
      await membershipApi.updateMembership({
        id: packageToEdit.id,
        levelName: editFormData.levelName,
        levelCode: editFormData.levelCode,
        dailyUsage: Number.parseFloat(editFormData.dailyUsage) || 0,
        price: Number.parseFloat(editFormData.price) || 0,
        status: editFormData.status,
      })
      toast({
        title: t("保存成功", "Saved Successfully"),
        description: t(`套餐 ${editFormData.levelName} 已更新`, `Package ${editFormData.levelName} has been updated`),
        duration: 3000,
      })
      setEditDialogOpen(false)
      setPackageToEdit(null)
      loadPackages()
    } catch (error) {
      console.error("Failed to update package:", error)
      toast({
        title: t("保存失败", "Save Failed"),
        description: t("无法保存套餐", "Failed to save package"),
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleDeletePackage = (pkg: MembershipData) => {
    setPackageToDelete(pkg)
    setDeleteDialogOpen(true)
  }

  const confirmDeletePackage = async () => {
    if (!packageToDelete) return

    try {
      await membershipApi.deleteMembership(packageToDelete.id)
      toast({
        title: t("删除成功", "Deleted Successfully"),
        description: t(`套餐 ${packageToDelete.levelName} 已被删除`, `Package ${packageToDelete.levelName} has been deleted`),
        duration: 3000,
      })
      setDeleteDialogOpen(false)
      setPackageToDelete(null)
      loadPackages()
    } catch (error) {
      console.error("Failed to delete package:", error)
      toast({
        title: t("删除失败", "Delete Failed"),
        description: t("无法删除套餐", "Failed to delete package"),
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-500 dark:text-indigo-300" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("套餐管理", "Package Management")}
            </h1>
          </div>
          <Button onClick={handleAddPackage} className="bg-indigo-500 hover:bg-indigo-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t("新增套餐", "Add Package")}
          </Button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t("管理所有套餐类型和定价配置", "Manage all package types and pricing configurations")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("套餐总数", "Total Packages")}</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{packages.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] hover:border-green-400 dark:hover:border-green-500 cursor-pointer">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("启用套餐", "Active Packages")}</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {packages.filter((p) => p.status === 1).length}
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
        <PackageTable packages={packages} onEditPackage={handleEditPackage} onDeletePackage={handleDeletePackage} />
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("会员等级名称", "Membership Name")}
                </Label>
                <Input
                  value={addFormData.levelName}
                  onChange={(e) => setAddFormData({ ...addFormData, levelName: e.target.value })}
                  placeholder={t("例如：标准会员", "e.g., Standard Member")}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("会员等级代码", "Level Code")}
                </Label>
                <Input
                  value={addFormData.levelCode}
                  onChange={(e) => setAddFormData({ ...addFormData, levelCode: e.target.value })}
                  placeholder="e.g., STANDARD"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("价格 (¥)", "Price (¥)")}
                </Label>
                <Input
                  type="number"
                  value={addFormData.price}
                  onChange={(e) => setAddFormData({ ...addFormData, price: e.target.value })}
                  placeholder="99.00"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("每日用量 ($)", "Daily Usage ($)")}
                </Label>
                <Input
                  type="number"
                  value={addFormData.dailyUsage}
                  onChange={(e) => setAddFormData({ ...addFormData, dailyUsage: e.target.value })}
                  placeholder="60.00"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                {t("状态", "Status")}
              </Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="add-status"
                    value="1"
                    checked={addFormData.status === 1}
                    onChange={(e) => setAddFormData({ ...addFormData, status: Number(e.target.value) })}
                    className="w-4 h-4 text-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t("启用", "Active")}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="add-status"
                    value="0"
                    checked={addFormData.status === 0}
                    onChange={(e) => setAddFormData({ ...addFormData, status: Number(e.target.value) })}
                    className="w-4 h-4 text-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t("禁用", "Inactive")}</span>
                </label>
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
                className="flex-1 bg-indigo-500 dark:bg-indigo-800 hover:bg-indigo-600 dark:hover:bg-indigo-700"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("会员等级名称", "Membership Name")}
                  </Label>
                  <Input
                    value={editFormData.levelName}
                    onChange={(e) => setEditFormData({ ...editFormData, levelName: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("会员等级代码", "Level Code")}
                  </Label>
                  <Input
                    value={editFormData.levelCode}
                    onChange={(e) => setEditFormData({ ...editFormData, levelCode: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("价格 (¥)", "Price (¥)")}
                  </Label>
                  <Input
                    type="number"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                    {t("每日用量 ($)", "Daily Usage ($)")}
                  </Label>
                  <Input
                    type="number"
                    value={editFormData.dailyUsage}
                    onChange={(e) => setEditFormData({ ...editFormData, dailyUsage: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  {t("状态", "Status")}
                </Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-status"
                      value="1"
                      checked={editFormData.status === 1}
                      onChange={(e) => setEditFormData({ ...editFormData, status: Number(e.target.value) })}
                      className="w-4 h-4 text-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t("启用", "Active")}</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-status"
                      value="0"
                      checked={editFormData.status === 0}
                      onChange={(e) => setEditFormData({ ...editFormData, status: Number(e.target.value) })}
                      className="w-4 h-4 text-indigo-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t("禁用", "Inactive")}</span>
                  </label>
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
                  className="flex-1 bg-indigo-500 dark:bg-indigo-800 hover:bg-indigo-600 dark:hover:bg-indigo-700"
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
