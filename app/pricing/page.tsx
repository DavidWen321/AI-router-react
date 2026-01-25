"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/lib/language-context"
import Link from "next/link"
import {
  Check,
  Sparkles,
  Zap,
  Crown,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Headphones,
  Rocket,
  Gem,
  Flame,
  Brain,
  AlertCircle,
  Info,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { AuthModal } from "@/components/auth-modal"

export default function PricingPage() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePurchaseClick = (planName: string) => {
    setSelectedPlan(planName)
    setIsPurchaseModalOpen(true)
  }

  // 所有套餐数据
  const allPlans = [
    // 标准系列
    {
      id: "mini",
      name: t("迷你体验", "Mini"),
      series: "standard",
      price: "39",
      dailyQuota: "$5",
      monthlyQuota: "~$150",
      haiku: "~1.7M",
      sonnet: "~420K",
      opus: "~85K",
      support: t("基础支持", "Basic"),
      description: t("入门体验", "Entry Level"),
      tag: t("入门探索", "Entry"),
      tagColor: "sky",
      icon: Zap,
    },
    {
      id: "light",
      name: t("轻量开发", "Light"),
      series: "standard",
      price: "89",
      dailyQuota: "$15",
      monthlyQuota: "~$450",
      haiku: "~5M",
      sonnet: "~1.4M",
      opus: "~270K",
      support: t("标准支持", "Standard"),
      description: t("个人开发", "Personal Dev"),
      tag: t("进阶选择", "Advanced"),
      tagColor: "blue",
      icon: Rocket,
    },
    {
      id: "standard",
      name: t("标准生产力", "Standard"),
      series: "standard",
      price: "249",
      dailyQuota: "$40",
      monthlyQuota: "~$1,200",
      haiku: "~13M",
      sonnet: "~3.6M",
      opus: "~720K",
      support: t("优先支持", "Priority"),
      description: t("专业开发", "Professional"),
      tag: t("推荐选择", "Recommended"),
      tagColor: "violet",
      recommended: true,
      icon: Star,
    },
    // 旗舰系列
    {
      id: "pro",
      name: t("专业工作室", "Pro Studio"),
      series: "flagship",
      price: "399",
      dailyQuota: "$80",
      monthlyQuota: "~$2,400",
      haiku: "~27M",
      sonnet: "~7.2M",
      opus: "~1.4M",
      support: t("VIP专属", "VIP"),
      description: t("团队首选", "Team Choice"),
      tag: t("推荐选择", "Recommended"),
      tagColor: "emerald",
      recommended: true,
      icon: Crown,
    },
    {
      id: "max",
      name: t("旗舰算力", "Max Power"),
      series: "flagship",
      price: "599",
      dailyQuota: "$135",
      monthlyQuota: "~$3,600",
      haiku: "~40M",
      sonnet: "~11M",
      opus: "~2.2M",
      support: t("企业级", "Enterprise"),
      description: t("架构师首选", "Architect"),
      tag: t("架构师首选", "Architect"),
      tagColor: "teal",
      icon: Gem,
    },
    {
      id: "ultra",
      name: t("Ultra 至尊", "Ultra"),
      series: "flagship",
      price: "899",
      dailyQuota: "$200",
      monthlyQuota: "~$6,000",
      haiku: "~67M",
      sonnet: "~18M",
      opus: "~3.6M",
      support: t("专属客服", "Dedicated"),
      description: t("无限算力", "Unlimited"),
      tag: t("量大管够", "Unlimited"),
      tagColor: "amber",
      icon: Flame,
    },
  ]

  const standardPlans = allPlans.filter(p => p.series === "standard")
  const flagshipPlans = allPlans.filter(p => p.series === "flagship")

  // 标准系列显示顺序（中间推荐）
  const standardDisplay = [
    allPlans.find(p => p.id === "mini")!,
    allPlans.find(p => p.id === "standard")!,
    allPlans.find(p => p.id === "light")!,
  ]

  // 旗舰系列显示顺序（中间推荐）
  const flagshipDisplay = [
    allPlans.find(p => p.id === "max")!,
    allPlans.find(p => p.id === "pro")!,
    allPlans.find(p => p.id === "ultra")!,
  ]

  // VIP等级数据
  const vipLevels = [
    { level: "VIP1", name: t("白银会员", "Silver"), threshold: "0", windows: "3", discount: t("原价", "100%"), color: "slate" },
    { level: "VIP2", name: t("黄金会员", "Gold"), threshold: "1,000", windows: "5", discount: "95%", color: "amber" },
    { level: "VIP3", name: t("铂金会员", "Platinum"), threshold: "2,000", windows: "10", discount: "90%", color: "cyan" },
    { level: "SVIP", name: t("至尊会员", "Diamond"), threshold: "3,000", windows: "15", discount: "85%", color: "violet" },
  ]

  // 套餐卡片组件
  const PlanCard = ({
    plan,
    isCenter = false,
    accentColor = "violet"
  }: {
    plan: typeof allPlans[0]
    isCenter?: boolean
    accentColor?: "violet" | "amber"
  }) => {
    const colorMap = {
      violet: {
        ring: "ring-violet-500",
        shadow: "shadow-violet-500/20",
        gradient: "from-violet-500 to-fuchsia-500",
        bg: "bg-violet-50",
        text: "text-violet-600",
        border: "border-violet-200",
      },
      amber: {
        ring: "ring-amber-500",
        shadow: "shadow-amber-500/20",
        gradient: "from-amber-500 to-orange-500",
        bg: "bg-amber-50",
        text: "text-amber-600",
        border: "border-amber-200",
      }
    }
    const colors = colorMap[accentColor]

    return (
      <div className={`relative ${isCenter ? 'md:scale-105 md:z-10' : ''}`}>
        {plan.recommended && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-xs font-bold shadow-lg bg-gradient-to-r ${colors.gradient}`}>
              <Star className="w-3.5 h-3.5" />
              {t("推荐选择", "RECOMMENDED")}
            </div>
          </div>
        )}

        <div className={`relative h-full rounded-2xl bg-white transition-all duration-300 ${
          isCenter ? `ring-2 ${colors.ring} shadow-xl ${colors.shadow}` : 'border border-gray-200 hover:shadow-lg'
        }`}>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isCenter ? `bg-gradient-to-br ${colors.gradient}` : 'bg-gray-100'
              }`}>
                <plan.icon className={`w-6 h-6 ${isCenter ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
                isCenter ? `${colors.bg} ${colors.text} ${colors.border}` : 'border-gray-200 text-gray-500 bg-gray-50'
              }`}>
                {plan.dailyQuota}/{t("天", "day")}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className={`font-bold ${isCenter ? 'text-4xl' : 'text-3xl'} text-gray-900`}>
                  ¥{plan.price}
                </span>
                <span className="text-gray-500 text-sm">{t("/月", "/mo")}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
            </div>

            <button
              onClick={() => handlePurchaseClick(plan.name)}
              className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                isCenter
                  ? `text-white bg-gradient-to-r ${colors.gradient} shadow-lg hover:shadow-xl hover:-translate-y-0.5`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {t("立即订阅", "Subscribe")}
                {isCenter && <ArrowRight className="w-4 h-4" />}
              </span>
            </button>

            <div className="my-5 h-px bg-gray-100" />

            <div className="space-y-2.5 text-xs">
              {[
                { label: t("每日额度", "Daily"), value: plan.dailyQuota },
                { label: t("月度额度", "Monthly"), value: plan.monthlyQuota },
                { label: "Haiku 4.5", value: `${plan.haiku}/天` },
                { label: "Sonnet 4.5", value: `${plan.sonnet}/天` },
                { label: "Opus 4.5", value: `${plan.opus}/天` },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="font-medium text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isCenter ? `bg-gradient-to-br ${colors.gradient}` : 'bg-gray-200'
                }`}>
                  <Check className={`w-3 h-3 ${isCenter ? 'text-white' : 'text-gray-600'}`} />
                </div>
                <span className="text-sm text-gray-600">{plan.support}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const tagColorClasses: Record<string, string> = {
    sky: "bg-sky-100 text-sky-700 border-sky-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    violet: "bg-violet-100 text-violet-700 border-violet-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    teal: "bg-teal-100 text-teal-700 border-teal-200",
    amber: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200",
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden">
      {/* Background - 与主页和功能页统一风格 */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 right-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute top-1/3 left-0 w-[800px] h-[800px] bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-[130px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute bottom-0 right-0 w-[900px] h-[900px] bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-[130px] animate-pulse-slow animation-delay-4000" />
      </div>

      <Navigation />

      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <Sparkles className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                {t("简单透明的定价方案", "Simple & Transparent Pricing")}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="text-gray-900 dark:text-white">{t("选择适合您的", "Choose Your")}</span>
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent ml-2">
                {t("完美方案", "Perfect Plan")}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              {t("6种套餐灵活选择，支持全系列 Claude AI 模型", "6 flexible plans with full Claude AI model support")}
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {[
                { icon: Shield, text: t("安全可靠", "Secure"), color: "text-emerald-500" },
                { icon: Clock, text: t("即时开通", "Instant"), color: "text-blue-500" },
                { icon: Headphones, text: t("专业支持", "Support"), color: "text-violet-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur border border-gray-200/50 dark:border-gray-700/50">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 套餐对比表格 */}
      <section className="relative py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`relative overflow-hidden rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-lg ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {/* 表格头部 */}
            <div className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 px-6 py-5">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-violet-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t("套餐对比", "Plan Comparison")}</h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("标准系列适合个人开发，配额相对有限；旗舰系列配额充裕，适合团队使用", "Standard for individuals; Flagship for teams with abundant quota")}
                </p>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  <div className="inline-flex items-center px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg text-xs">
                    <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mr-1.5" />
                    <span className="text-amber-800 dark:text-amber-200">{t("推荐旗舰系列，配额充裕，适合日常开发使用", "Recommend Flagship series for daily development")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 移动端卡片视图 */}
            <div className="block lg:hidden p-4 space-y-4">
              {/* 标准系列 */}
              <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 rounded-xl p-4 border border-violet-200/50 dark:border-violet-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{t("标准系列", "Standard")}</div>
                    <div className="text-xs text-violet-600 dark:text-violet-400">{t("适合个人开发", "For Individuals")}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {standardPlans.map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => handlePurchaseClick(plan.name)}
                      className={`bg-white dark:bg-gray-800 rounded-lg p-3 border cursor-pointer transition-all ${
                        plan.recommended ? 'border-violet-300 dark:border-violet-600 ring-1 ring-violet-200 dark:ring-violet-700' : 'border-gray-200 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            {plan.name}
                            {plan.recommended && (
                              <span className="text-xs bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-300 px-1.5 py-0.5 rounded">★</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{plan.dailyQuota}/{t("天", "day")}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-violet-600 dark:text-violet-400">¥{plan.price}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{t("/月", "/mo")}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 旗舰系列 */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-amber-200/50 dark:border-amber-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{t("旗舰系列", "Flagship")}</div>
                    <div className="text-xs text-amber-600 dark:text-amber-400">{t("配额充裕稳定", "Abundant Quota")}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {flagshipPlans.map(plan => (
                    <div
                      key={plan.id}
                      onClick={() => handlePurchaseClick(plan.name)}
                      className={`bg-white dark:bg-gray-800 rounded-lg p-3 border cursor-pointer transition-all ${
                        plan.recommended ? 'border-amber-300 dark:border-amber-600 ring-1 ring-amber-200 dark:ring-amber-700' : 'border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-600'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                            {plan.name}
                            {plan.recommended && (
                              <span className="text-xs bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 rounded">★</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{plan.dailyQuota}/{t("天", "day")}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">¥{plan.price}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">{t("/月", "/mo")}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 桌面端表格视图 */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  {/* 系列分组头 */}
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[100px] border-r border-gray-200 dark:border-gray-700">
                      {t("套餐对比", "Compare")}
                    </th>
                    <th colSpan={3} className="px-4 py-3 text-center border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg flex items-center justify-center">
                          <Zap className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-base font-bold text-violet-700 dark:text-violet-400">{t("标准系列", "Standard Series")}</span>
                      </div>
                      <div className="text-xs text-violet-500 dark:text-violet-400 mt-1">{t("适合个人开发，配额相对有限", "For individuals, limited quota")}</div>
                    </th>
                    <th colSpan={3} className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <Crown className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-base font-bold text-amber-700 dark:text-amber-400">{t("旗舰系列", "Flagship Series")}</span>
                      </div>
                      <div className="text-xs text-amber-500 dark:text-amber-400 mt-1">{t("配额充裕稳定，适合团队使用", "Abundant quota for teams")}</div>
                    </th>
                  </tr>
                  {/* 套餐名称行 */}
                  <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-y border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                      {t("产品规格", "Specs")}
                    </th>
                    {allPlans.map((plan, i) => (
                      <th key={plan.id} className={`px-3 py-3 text-center min-w-[120px] ${
                        i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''
                      } ${plan.recommended ? (plan.series === 'standard' ? 'bg-violet-50/50 dark:bg-violet-900/20' : 'bg-amber-50/50 dark:bg-amber-900/20') : ''}`}>
                        <div className="space-y-1.5">
                          <div className="font-bold text-gray-900 dark:text-white">{plan.name}</div>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${tagColorClasses[plan.tagColor]}`}>
                            {plan.recommended && <Star className="w-3 h-3 mr-1" />}
                            {plan.tag}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            {plan.series === 'standard' ? t("标准系列", "Standard") : t("旗舰系列", "Flagship")}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {/* 支持模型 */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">{t("支持模型", "Models")}</td>
                    {allPlans.map((plan, i) => (
                      <td key={plan.id} className={`px-3 py-3 text-center ${i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                        <div className="text-gray-900 dark:text-gray-100 text-xs">Sonnet 4.5</div>
                        <div className="text-violet-600 dark:text-violet-400 text-xs font-medium">+ Opus 4.5</div>
                      </td>
                    ))}
                  </tr>
                  {/* 每日额度 */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 bg-red-50/50 dark:bg-red-900/20 border-r border-gray-200 dark:border-gray-700">
                      <span className="text-red-700 dark:text-red-400">{t("每日限制", "Daily")}</span>
                    </td>
                    {allPlans.map((plan, i) => (
                      <td key={plan.id} className={`px-3 py-3 text-center ${i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''} ${
                        plan.recommended ? (plan.series === 'standard' ? 'bg-violet-50/30 dark:bg-violet-900/10' : 'bg-amber-50/30 dark:bg-amber-900/10') : ''
                      }`}>
                        <span className="text-green-600 dark:text-green-400 font-medium text-xs">{t("每日上限", "Limit")} {plan.dailyQuota}</span>
                      </td>
                    ))}
                  </tr>
                  {/* 月度额度 */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">{t("月度额度", "Monthly")}</td>
                    {allPlans.map((plan, i) => (
                      <td key={plan.id} className={`px-3 py-3 text-center text-gray-600 dark:text-gray-400 text-xs ${i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                        {plan.monthlyQuota}
                      </td>
                    ))}
                  </tr>
                  {/* Haiku */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">Haiku 4.5</td>
                    {allPlans.map((plan, i) => (
                      <td key={plan.id} className={`px-3 py-3 text-center text-gray-600 dark:text-gray-400 text-xs ${i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                        {plan.haiku}
                      </td>
                    ))}
                  </tr>
                  {/* Sonnet */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">Sonnet 4.5</td>
                    {allPlans.map((plan, i) => (
                      <td key={plan.id} className={`px-3 py-3 text-center text-gray-600 dark:text-gray-400 text-xs ${i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                        {plan.sonnet}
                      </td>
                    ))}
                  </tr>
                  {/* Opus */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700">Opus 4.5</td>
                    {allPlans.map((plan, i) => (
                      <td key={plan.id} className={`px-3 py-3 text-center text-gray-600 dark:text-gray-400 text-xs ${i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                        {plan.opus}
                      </td>
                    ))}
                  </tr>
                  {/* 有效期 */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 bg-green-50/50 dark:bg-green-900/20 border-r border-gray-200 dark:border-gray-700">
                      <span className="text-green-700 dark:text-green-400">{t("有效期", "Validity")}</span>
                    </td>
                    {allPlans.map((plan, i) => (
                      <td key={plan.id} className={`px-3 py-3 text-center text-green-600 dark:text-green-400 text-xs font-medium ${i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                        30{t("天", " days")}
                      </td>
                    ))}
                  </tr>
                  {/* 技术支持 */}
                  <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-700 dark:text-gray-300 bg-green-50/50 dark:bg-green-900/20 border-r border-gray-200 dark:border-gray-700">
                      <span className="text-green-700 dark:text-green-400">{t("技术支持", "Support")}</span>
                    </td>
                    {allPlans.map((plan, i) => (
                      <td key={plan.id} className={`px-3 py-3 text-center ${i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  {/* 价格按钮 */}
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <td className="px-4 py-4 text-xs font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">{t("立即选购", "Buy Now")}</td>
                    {allPlans.map((plan, i) => (
                      <td key={plan.id} className={`px-3 py-4 text-center ${i === 2 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                        <button
                          onClick={() => handlePurchaseClick(plan.name)}
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                        >
                          ¥{plan.price}/{t("月", "mo")}
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 标准系列 */}
      <section className="relative py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-3 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-200/50 dark:border-violet-700/50 backdrop-blur-sm">
              <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{t("标准系列", "Standard Series")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("个人开发者首选", "For Individual Developers")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t("适合入门体验、个人项目、日常开发使用", "Ideal for entry-level, personal projects, daily development")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {standardDisplay.map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} isCenter={index === 1} accentColor="violet" />
            ))}
          </div>
        </div>
      </section>

      {/* 旗舰系列 */}
      <section className="relative py-12 px-4 sm:px-6 bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-900/10 dark:to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-8 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-3 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/50 dark:border-amber-700/50 backdrop-blur-sm">
              <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{t("旗舰系列", "Flagship Series")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t("团队与企业之选", "For Teams & Enterprises")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              {t("适合团队协作、高强度使用、企业级项目", "Ideal for teams, heavy usage, enterprise projects")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {flagshipDisplay.map((plan, index) => (
              <PlanCard key={plan.id} plan={plan} isCenter={index === 1} accentColor="amber" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mx-auto text-center">
            <div className="relative p-8 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{t("准备好开始了吗？", "Ready to Start?")}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{t("注册即享免费试用额度", "Sign up for free credits")}</p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 hover:opacity-90 transition-all shadow-xl shadow-violet-500/25 hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
              >
                {t("免费开始使用", "Get Started Free")}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/ac-logo.png" alt="AiClaude" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">AiClaude</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/features" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("功能", "Features")}</Link>
            <Link href="/docs" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("文档", "Docs")}</Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("隐私", "Privacy")}</Link>
          </div>
        </div>
      </footer>

      {/* 订阅弹窗 */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 gap-0 overflow-hidden border border-gray-200 shadow-2xl rounded-2xl bg-white" hideCloseButton animation="fade">
          <DialogTitle className="sr-only">{t("订阅套餐", "Subscribe Plan")}</DialogTitle>
          <DialogDescription className="sr-only">{t("扫码添加微信订阅", "Scan QR to subscribe")}</DialogDescription>

          <div className="px-8 pt-8 pb-5 text-center border-b border-gray-100">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedPlan}</h3>
            <p className="text-sm text-gray-500">{t("扫码联系客服开通", "Scan to contact service")}</p>
          </div>

          <div className="px-8 py-6">
            <div className="flex justify-center">
              <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-sm">
                <img
                  src="/wechat-qr.jpg"
                  alt="QR Code"
                  className="w-48 h-48 rounded-lg object-contain"
                  onError={(e) => {
                    e.currentTarget.parentElement!.innerHTML = '<div class="w-48 h-48 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-xs">QR Code</div>'
                  }}
                />
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">{t("微信扫一扫", "Scan with WeChat")}</p>
          </div>

          <div className="px-8 pb-8">
            <button
              onClick={() => setIsPurchaseModalOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {t("关闭", "Close")}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}
