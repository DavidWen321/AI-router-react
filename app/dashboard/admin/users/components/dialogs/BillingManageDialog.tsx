"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { adminApi, ApiError } from "@/lib/api"
import type { BillingJournalRecord, WalletLedgerRecord } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import type { UserData } from "../../types"

interface BillingManageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserData | null
  onSuccess: () => void
}

export function BillingManageDialog({ open, onOpenChange, user, onSuccess }: BillingManageDialogProps) {
  const { toast } = useToast()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [recordLoading, setRecordLoading] = useState(false)

  const [isPaygEnabled, setIsPaygEnabled] = useState(false)
  const [profileRemark, setProfileRemark] = useState("")

  const [walletBalance, setWalletBalance] = useState(0)
  const [walletTotalRecharged, setWalletTotalRecharged] = useState(0)
  const [walletTotalConsumed, setWalletTotalConsumed] = useState(0)

  const [rechargeAmount, setRechargeAmount] = useState("")
  const [rechargeRemark, setRechargeRemark] = useState("")

  const [adjustAmount, setAdjustAmount] = useState("")
  const [adjustRemark, setAdjustRemark] = useState("")

  const [activeRecordTab, setActiveRecordTab] = useState<"ledger" | "journal">("ledger")
  const [ledgerPageNum, setLedgerPageNum] = useState(1)
  const [ledgerPageSize] = useState(10)
  const [ledgerTotal, setLedgerTotal] = useState(0)
  const [ledgerList, setLedgerList] = useState<WalletLedgerRecord[]>([])

  const [journalPageNum, setJournalPageNum] = useState(1)
  const [journalPageSize] = useState(10)
  const [journalTotal, setJournalTotal] = useState(0)
  const [journalList, setJournalList] = useState<BillingJournalRecord[]>([])

  const ledgerPages = useMemo(() => Math.max(1, Math.ceil(ledgerTotal / ledgerPageSize)), [ledgerTotal, ledgerPageSize])
  const journalPages = useMemo(() => Math.max(1, Math.ceil(journalTotal / journalPageSize)), [journalTotal, journalPageSize])

  const formatMoney = (value: number) => {
    if (Number.isNaN(value)) return "$0.000000"
    return `$${value.toFixed(6)}`
  }

  const getBillingModeLabel = (mode?: string) => {
    switch (mode) {
      case "MEMBERSHIP":
        return t("月卡套餐", "Membership Plan")
      case "PAYG":
        return t("按量充值", "Pay-as-you-go")
      default:
        return mode || "-"
    }
  }

  const getLedgerChangeTypeLabel = (changeType?: string) => {
    switch (changeType) {
      case "RECHARGE":
        return t("充值", "Recharge")
      case "CONSUME":
        return t("消费", "Consume")
      case "REFUND":
        return t("退款", "Refund")
      case "ADJUST":
        return t("调账", "Adjust")
      case "FREEZE":
        return t("冻结", "Freeze")
      case "UNFREEZE":
        return t("解冻", "Unfreeze")
      default:
        return changeType || "-"
    }
  }

  const getLedgerBizTypeLabel = (bizType?: string) => {
    switch (bizType) {
      case "ADMIN_RECHARGE":
        return t("管理员充值", "Admin Recharge")
      case "API_REQUEST":
        return t("请求计费", "API Billing")
      case "API_REFUND":
        return t("请求退款", "API Refund")
      case "ADMIN_ADJUST":
        return t("管理员调账", "Admin Adjust")
      default:
        return bizType || "-"
    }
  }

  const getJournalStatusLabel = (status?: number) => {
    switch (status) {
      case 0:
        return t("处理中", "Processing")
      case 1:
        return t("已结算", "Settled")
      case 2:
        return t("已退款", "Refunded")
      case 3:
        return t("失败/取消", "Failed/Cancelled")
      default:
        return status == null ? "-" : String(status)
    }
  }

  const loadBaseData = async () => {
    if (!user) return
    const [profile, wallet] = await Promise.all([
      adminApi.getBillingProfile(user.id),
      adminApi.getWallet(user.id),
    ])

    setIsPaygEnabled(profile.billingMode === "PAYG")
    setProfileRemark(profile.remark || "")
    setWalletBalance(wallet.availableBalance || 0)
    setWalletTotalRecharged(wallet.totalRecharged || 0)
    setWalletTotalConsumed(wallet.totalConsumed || 0)
  }

  const loadLedger = async (pageNum: number) => {
    if (!user) return
    const data = await adminApi.getWalletLedger(user.id, pageNum, ledgerPageSize)
    setLedgerList(data.list || [])
    setLedgerTotal(data.total || 0)
  }

  const loadJournal = async (pageNum: number) => {
    if (!user) return
    const data = await adminApi.getBillingJournal(user.id, pageNum, journalPageSize)
    setJournalList(data.list || [])
    setJournalTotal(data.total || 0)
  }

  const loadAllData = async (ledgerPage = 1, journalPage = 1) => {
    if (!user) return

    try {
      setLoading(true)
      setRecordLoading(true)

      await Promise.all([
        loadBaseData(),
        loadLedger(ledgerPage),
        loadJournal(journalPage),
      ])
    } catch (error) {
      toast({
        title: t("加载失败", "Load Failed"),
        description: error instanceof ApiError ? error.message : t("无法加载按量信息", "Failed to load billing info"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRecordLoading(false)
    }
  }

  useEffect(() => {
    if (!open || !user) return

    setRechargeAmount("")
    setRechargeRemark("")
    setAdjustAmount("")
    setAdjustRemark("")
    setActiveRecordTab("ledger")
    setLedgerPageNum(1)
    setJournalPageNum(1)

    loadAllData(1, 1)
  }, [open, user])

  const saveProfile = async () => {
    if (!user) return
    try {
      setLoading(true)
      await adminApi.updateBillingProfile(user.id, {
        billingMode: "PAYG",
        unlimitedConcurrency: 1,
        remark: profileRemark || undefined,
      })
      setIsPaygEnabled(true)
      toast({
        title: t("保存成功", "Saved"),
        description: t("按量策略已启用并更新", "PAYG profile enabled and updated"),
      })
      await loadBaseData()
      onSuccess()
    } catch (error) {
      toast({
        title: t("保存失败", "Save Failed"),
        description: error instanceof ApiError ? error.message : t("保存按量配置失败", "Failed to save PAYG profile"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const doRecharge = async () => {
    if (!user) return
    if (!isPaygEnabled) {
      toast({
        title: t("请先启用按量", "Enable PAYG First"),
        description: t("请先在上方保存按量策略，再进行钱包充值", "Please enable PAYG profile before wallet recharge"),
        variant: "destructive",
      })
      return
    }
    const amount = Number(rechargeAmount)
    if (!amount || amount <= 0) {
      toast({
        title: t("输入错误", "Invalid Input"),
        description: t("充值金额必须大于0", "Recharge amount must be greater than 0"),
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await adminApi.rechargeWallet(user.id, {
        amount,
        paymentChannel: "OFFLINE_TRANSFER",
        remark: rechargeRemark || undefined,
      })
      toast({
        title: t("充值成功", "Recharge Success"),
        description: t("钱包余额已更新", "Wallet balance updated"),
      })

      setRechargeAmount("")
      setRechargeRemark("")

      await loadAllData(ledgerPageNum, journalPageNum)
      onSuccess()
    } catch (error) {
      toast({
        title: t("充值失败", "Recharge Failed"),
        description: error instanceof ApiError ? error.message : t("充值操作失败", "Failed to recharge wallet"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const doAdjust = async () => {
    if (!user) return
    if (!isPaygEnabled) {
      toast({
        title: t("请先启用按量", "Enable PAYG First"),
        description: t("请先在上方保存按量策略，再进行钱包调账", "Please enable PAYG profile before wallet adjust"),
        variant: "destructive",
      })
      return
    }
    const amount = Number(adjustAmount)
    if (!amount || amount === 0) {
      toast({
        title: t("输入错误", "Invalid Input"),
        description: t("调账金额不能为0", "Adjust amount cannot be 0"),
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await adminApi.adjustWallet(user.id, {
        amount,
        remark: adjustRemark || undefined,
      })
      toast({
        title: t("调账成功", "Adjust Success"),
        description: t("钱包余额已更新", "Wallet balance updated"),
      })

      setAdjustAmount("")
      setAdjustRemark("")

      await loadAllData(ledgerPageNum, journalPageNum)
      onSuccess()
    } catch (error) {
      toast({
        title: t("调账失败", "Adjust Failed"),
        description: error instanceof ApiError ? error.message : t("调账操作失败", "Failed to adjust wallet"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const changeLedgerPage = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > ledgerPages) return
    try {
      setRecordLoading(true)
      setLedgerPageNum(nextPage)
      await loadLedger(nextPage)
    } finally {
      setRecordLoading(false)
    }
  }

  const changeJournalPage = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > journalPages) return
    try {
      setRecordLoading(true)
      setJournalPageNum(nextPage)
      await loadJournal(nextPage)
    } finally {
      setRecordLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("按量计费管理", "Billing Management")}</DialogTitle>
          <DialogDescription>
            {user ? `${user.email}` : "-"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
            <div className="font-medium text-sm">{t("计费策略", "Billing Profile")}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1">{t("按量状态", "PAYG Status")}</label>
                <div className="w-full border rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900/40">
                  {isPaygEnabled
                    ? t("已启用按量充值", "PAYG enabled")
                    : t("未启用按量（当前走会员/临时额度）", "PAYG disabled")}
                </div>
              </div>
              <div className="flex items-end">
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {t("按量用户默认无限并发（系统自动生效）", "PAYG users always run with unlimited concurrency")}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1">{t("备注", "Remark")}</label>
              <input
                value={profileRemark}
                onChange={(event) => setProfileRemark(event.target.value)}
                className="w-full border rounded-md px-2 py-2 text-sm bg-white dark:bg-gray-900"
                placeholder={t("如：商务合作用户", "e.g. Commercial partner")}
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={loading}
              className="px-3 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {isPaygEnabled ? t("保存按量策略", "Save PAYG Profile") : t("启用按量并保存", "Enable PAYG and Save")}
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
            <div className="font-medium text-sm">{t("钱包概览", "Wallet Overview")}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>{t("可用余额", "Available")}: <span className="font-semibold">{formatMoney(walletBalance)}</span></div>
              <div>{t("累计充值", "Total Recharged")}: <span className="font-semibold">{formatMoney(walletTotalRecharged)}</span></div>
              <div>{t("累计消费", "Total Consumed")}: <span className="font-semibold">{formatMoney(walletTotalConsumed)}</span></div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
            <div className="font-medium text-sm">{t("钱包充值", "Wallet Recharge")}</div>
            {!isPaygEnabled && (
              <div className="text-xs text-amber-600 dark:text-amber-400">
                {t("请先在上方启用按量策略后再充值", "Enable PAYG profile first") }
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={rechargeAmount}
                onChange={(event) => setRechargeAmount(event.target.value)}
                type="number"
                min="0"
                step="0.0001"
                className="border rounded-md px-2 py-2 text-sm bg-white dark:bg-gray-900"
                placeholder={t("充值金额", "Recharge amount")}
              />
              <input
                value={rechargeRemark}
                onChange={(event) => setRechargeRemark(event.target.value)}
                className="border rounded-md px-2 py-2 text-sm bg-white dark:bg-gray-900"
                placeholder={t("充值备注", "Recharge remark")}
              />
            </div>
            <button
              onClick={doRecharge}
              disabled={loading || !isPaygEnabled}
              className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              {t("确认充值", "Confirm Recharge")}
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
            <div className="font-medium text-sm">{t("钱包调账", "Wallet Adjust")}</div>
            {!isPaygEnabled && (
              <div className="text-xs text-amber-600 dark:text-amber-400">
                {t("请先在上方启用按量策略后再调账", "Enable PAYG profile first") }
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                value={adjustAmount}
                onChange={(event) => setAdjustAmount(event.target.value)}
                type="number"
                step="0.0001"
                className="border rounded-md px-2 py-2 text-sm bg-white dark:bg-gray-900"
                placeholder={t("调账金额（正加负减）", "Adjust amount (+/-)")}
              />
              <input
                value={adjustRemark}
                onChange={(event) => setAdjustRemark(event.target.value)}
                className="border rounded-md px-2 py-2 text-sm bg-white dark:bg-gray-900"
                placeholder={t("调账备注", "Adjust remark")}
              />
            </div>
            <button
              onClick={doAdjust}
              disabled={loading || !isPaygEnabled}
              className="px-3 py-2 rounded-md bg-amber-600 text-white text-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {t("确认调账", "Confirm Adjust")}
            </button>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{t("计费记录", "Billing Records")}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveRecordTab("ledger")}
                  className={`px-2 py-1 text-xs rounded ${activeRecordTab === "ledger" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  {t("钱包流水", "Wallet Ledger")}
                </button>
                <button
                  onClick={() => setActiveRecordTab("journal")}
                  className={`px-2 py-1 text-xs rounded ${activeRecordTab === "journal" ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                >
                  {t("请求结算", "Billing Journal")}
                </button>
              </div>
            </div>

            {activeRecordTab === "ledger" ? (
              <div className="space-y-2">
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-64 overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                        <tr>
                          <th className="text-left p-2">{t("时间", "Time")}</th>
                          <th className="text-left p-2">{t("类型", "Type")}</th>
                          <th className="text-left p-2">{t("业务", "Biz")}</th>
                          <th className="text-left p-2">{t("金额", "Amount")}</th>
                          <th className="text-left p-2">{t("余额", "Balance")}</th>
                          <th className="text-left p-2">requestId</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-3 text-center text-gray-500">
                              {recordLoading ? t("加载中...", "Loading...") : t("暂无数据", "No records")}
                            </td>
                          </tr>
                        ) : (
                          ledgerList.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="p-2">{item.createdAt || "-"}</td>
                              <td className="p-2">{getLedgerChangeTypeLabel(item.changeType)}</td>
                              <td className="p-2">{getLedgerBizTypeLabel(item.bizType)}</td>
                              <td className="p-2">{formatMoney(Number(item.amount || 0))}</td>
                              <td className="p-2">{formatMoney(Number(item.balanceAfter || 0))}</td>
                              <td className="p-2">{item.requestId || "-"}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => changeLedgerPage(ledgerPageNum - 1)}
                    disabled={ledgerPageNum <= 1 || recordLoading}
                    className="px-2 py-1 rounded border disabled:opacity-50"
                  >
                    {t("上一页", "Prev")}
                  </button>
                  <span>{ledgerPageNum}/{ledgerPages}</span>
                  <button
                    onClick={() => changeLedgerPage(ledgerPageNum + 1)}
                    disabled={ledgerPageNum >= ledgerPages || recordLoading}
                    className="px-2 py-1 rounded border disabled:opacity-50"
                  >
                    {t("下一页", "Next")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border rounded-md overflow-hidden">
                  <div className="max-h-64 overflow-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                        <tr>
                          <th className="text-left p-2">{t("时间", "Time")}</th>
                          <th className="text-left p-2">requestId</th>
                          <th className="text-left p-2">{t("模式", "Mode")}</th>
                          <th className="text-left p-2">{t("预扣", "Estimated")}</th>
                          <th className="text-left p-2">{t("实际", "Actual")}</th>
                          <th className="text-left p-2">{t("状态", "Status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {journalList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-3 text-center text-gray-500">
                              {recordLoading ? t("加载中...", "Loading...") : t("暂无数据", "No records")}
                            </td>
                          </tr>
                        ) : (
                          journalList.map((item) => (
                            <tr key={item.id} className="border-t">
                              <td className="p-2">{item.createdAt || "-"}</td>
                              <td className="p-2">{item.requestId || "-"}</td>
                              <td className="p-2">{getBillingModeLabel(item.billingMode)}</td>
                              <td className="p-2">{formatMoney(Number(item.estimatedAmount || 0))}</td>
                              <td className="p-2">{formatMoney(Number(item.actualAmount || 0))}</td>
                              <td className="p-2">{getJournalStatusLabel(item.status)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => changeJournalPage(journalPageNum - 1)}
                    disabled={journalPageNum <= 1 || recordLoading}
                    className="px-2 py-1 rounded border disabled:opacity-50"
                  >
                    {t("上一页", "Prev")}
                  </button>
                  <span>{journalPageNum}/{journalPages}</span>
                  <button
                    onClick={() => changeJournalPage(journalPageNum + 1)}
                    disabled={journalPageNum >= journalPages || recordLoading}
                    className="px-2 py-1 rounded border disabled:opacity-50"
                  >
                    {t("下一页", "Next")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
