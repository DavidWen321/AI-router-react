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
  TrendingUp,
  Database,
  FileText,
  BookOpen,
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

  const tiers = [
    {
      id: "mini",
      name: t("迷你套餐", "Mini"),
      price: "60",
      dailyQuota: "$6",
      monthlyQuota: "~$180",
      description: t("入门体验，轻度尝鲜", "Entry level trial"),
      icon: Zap,
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
      shadowColor: "shadow-emerald-500/20",
      borderGlow: "hover:shadow-emerald-500/30",
      iconBg: "bg-gradient-to-br from-emerald-400 to-teal-500",
      badgeStyle: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      features: [
        { label: t("每日额度", "Daily Quota"), value: "$6" },
        { label: t("月度额度", "Monthly Quota"), value: "~$180" },
        { label: "Haiku 4.5", value: t("~2M tokens/天", "~2M/day") },
        { label: "Sonnet 4.5", value: t("~500K tokens/天", "~500K/day") },
        { label: "Opus 4.5", value: t("~100K tokens/天", "~100K/day") },
      ],
      includes: [t("无限API调用", "Unlimited API"), t("基础支持", "Basic Support")],
    },
    {
      id: "light",
      name: t("轻量套餐", "Light"),
      price: "120",
      dailyQuota: "$15",
      monthlyQuota: "~$450",
      description: t("个人开发者首选", "For Developers"),
      icon: Rocket,
      gradient: "from-blue-400 via-indigo-500 to-violet-500",
      shadowColor: "shadow-blue-500/20",
      borderGlow: "hover:shadow-blue-500/30",
      iconBg: "bg-gradient-to-br from-blue-400 to-indigo-500",
      badgeStyle: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      features: [
        { label: t("每日额度", "Daily Quota"), value: "$15" },
        { label: t("月度额度", "Monthly Quota"), value: "~$450" },
        { label: "Haiku 4.5", value: t("~5M tokens/天", "~5M/day") },
        { label: "Sonnet 4.5", value: t("~1.4M tokens/天", "~1.4M/day") },
        { label: "Opus 4.5", value: t("~270K tokens/天", "~270K/day") },
      ],
      includes: [t("无限API调用", "Unlimited API"), t("标准支持", "Standard Support")],
    },
    {
      id: "plus",
      name: t("进阶套餐", "Plus"),
      price: "160",
      dailyQuota: "$20",
      monthlyQuota: "~$600",
      description: t("进阶开发者之选", "For Growing Teams"),
      icon: TrendingUp,
      gradient: "from-violet-400 via-purple-500 to-fuchsia-500",
      shadowColor: "shadow-violet-500/20",
      borderGlow: "hover:shadow-violet-500/30",
      iconBg: "bg-gradient-to-br from-violet-400 to-purple-500",
      badgeStyle: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
      features: [
        { label: t("每日额度", "Daily Quota"), value: "$20" },
        { label: t("月度额度", "Monthly Quota"), value: "~$600" },
        { label: "Haiku 4.5", value: t("~6.8M tokens/天", "~6.8M/day") },
        { label: "Sonnet 4.5", value: t("~1.8M tokens/天", "~1.8M/day") },
        { label: "Opus 4.5", value: t("~360K tokens/天", "~360K/day") },
      ],
      includes: [t("无限API调用", "Unlimited API"), t("优先支持", "Priority Support")],
    },
    {
      id: "standard",
      name: t("标准套餐", "Standard"),
      price: "249",
      dailyQuota: "$35",
      monthlyQuota: "~$1,050",
      description: t("专业开发必备", "Professional Choice"),
      icon: Star,
      gradient: "from-amber-400 via-orange-500 to-red-500",
      shadowColor: "shadow-amber-500/20",
      borderGlow: "hover:shadow-amber-500/30",
      iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
      badgeStyle: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      features: [
        { label: t("每日额度", "Daily Quota"), value: "$35" },
        { label: t("月度额度", "Monthly Quota"), value: "~$1,050" },
        { label: "Haiku 4.5", value: t("~12M tokens/天", "~12M/day") },
        { label: "Sonnet 4.5", value: t("~3.2M tokens/天", "~3.2M/day") },
        { label: "Opus 4.5", value: t("~640K tokens/天", "~640K/day") },
      ],
      includes: [t("无限API调用", "Unlimited API"), t("专属支持", "Dedicated Support"), t("7×24服务", "24/7 Service")],
    },
    {
      id: "pro",
      name: t("专业套餐", "Pro"),
      price: "420",
      dailyQuota: "$60",
      monthlyQuota: "~$1,800",
      popular: true,
      description: t("高效团队首选", "Best for Teams"),
      icon: Crown,
      gradient: "from-rose-400 via-pink-500 to-fuchsia-500",
      shadowColor: "shadow-rose-500/25",
      borderGlow: "hover:shadow-rose-500/40",
      iconBg: "bg-gradient-to-br from-rose-400 to-pink-500",
      badgeStyle: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      features: [
        { label: t("每日额度", "Daily Quota"), value: "$60" },
        { label: t("月度额度", "Monthly Quota"), value: "~$1,800" },
        { label: "Haiku 4.5", value: t("~20M tokens/天", "~20M/day") },
        { label: "Sonnet 4.5", value: t("~5.5M tokens/天", "~5.5M/day") },
        { label: "Opus 4.5", value: t("~1.1M tokens/天", "~1.1M/day") },
      ],
      includes: [t("无限API调用", "Unlimited API"), t("VIP专属支持", "VIP Support"), t("7×24服务", "24/7 Service")],
    },
    {
      id: "max",
      name: t("Max 套餐", "Max"),
      price: "900",
      dailyQuota: "$180",
      monthlyQuota: "~$5,400",
      description: t("企业级无限可能", "Enterprise Power"),
      icon: Gem,
      gradient: "from-slate-400 via-zinc-500 to-neutral-600",
      shadowColor: "shadow-slate-500/20",
      borderGlow: "hover:shadow-slate-500/30",
      iconBg: "bg-gradient-to-br from-slate-600 to-zinc-700",
      badgeStyle: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
      features: [
        { label: t("每日额度", "Daily Quota"), value: "$180" },
        { label: t("月度额度", "Monthly Quota"), value: "~$5,400" },
        { label: "Haiku 4.5", value: t("~61M tokens/天", "~61M/day") },
        { label: "Sonnet 4.5", value: t("~16M tokens/天", "~16M/day") },
        { label: "Opus 4.5", value: t("~3.3M tokens/天", "~3.3M/day") },
      ],
      includes: [t("无限API调用", "Unlimited API"), t("企业级支持", "Enterprise Support"), t("优先处理", "Priority Queue")],
    },
  ]

  // Claude 官方完整定价
  const claudePricing = [
    {
      name: "Claude Haiku 4.5",
      description: t("快速响应，高效经济", "Fast & Economical"),
      color: "emerald",
      prices: {
        input: "$0.80",
        output: "$4.00",
        cacheWrite: "$1.00",
        cacheRead: "$0.08",
      },
    },
    {
      name: "Claude Sonnet 4.5",
      description: t("智能平衡，性价比优", "Balanced Performance"),
      color: "blue",
      prices: {
        input: "$3.00",
        output: "$15.00",
        cacheWrite: "$3.75",
        cacheRead: "$0.30",
      },
    },
    {
      name: "Claude Opus 4.5",
      description: t("顶级智能，极致性能", "Maximum Intelligence"),
      color: "violet",
      prices: {
        input: "$5.00",
        output: "$25.00",
        cacheWrite: "$6.25",
        cacheRead: "$0.50",
      },
    },
  ]

  const faqs = [
    {
      q: t("可以随时更改套餐吗？", "Can I change plans anytime?"),
      a: t("是的，您可以随时升级套餐，升级后立即生效，差价按剩余天数折算。", "Yes, upgrade anytime with immediate effect. Price difference calculated by remaining days."),
    },
    {
      q: t("超过每日额度怎么办？", "What if I exceed daily quota?"),
      a: t("超出额度后当日API将暂停，次日0点自动重置。您也可以随时升级套餐。", "API pauses after exceeding. Resets at midnight or upgrade your plan."),
    },
    {
      q: t("提供退款吗？", "Do you offer refunds?"),
      a: t("购买后24小时内不满意可申请全额退款，超过24小时按剩余天数退款。", "Full refund within 24h. Partial refund based on remaining days after that."),
    },
    {
      q: t("什么是Ultrathink模式？", "What is Ultrathink mode?"),
      a: t("Claude深度思考模式，会产生更长的思考链，消耗约30%-50%额外tokens，但输出更准确。", "Claude's extended thinking mode. Uses 30-50% more tokens but provides more accurate responses."),
    },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      {/* 动态背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-violet-500/[0.07] via-fuchsia-500/[0.05] to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/3 right-0 w-[800px] h-[800px] bg-gradient-to-br from-cyan-500/[0.07] via-blue-500/[0.05] to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-gradient-to-br from-rose-500/[0.06] via-orange-500/[0.04] to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      </div>

      <Navigation />

      {/* Hero */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 mb-6 sm:mb-8 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-lg shadow-gray-200/20 dark:shadow-none">
              <div className="relative">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-4 h-4 text-violet-500 opacity-50" />
                </div>
              </div>
              <span className="text-sm font-medium bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">
                {t("简单透明的定价方案", "Simple & Transparent Pricing")}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              <span className="text-gray-900 dark:text-white">{t("选择适合您的", "Choose Your")}</span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 bg-clip-text text-transparent">
                {t("完美方案", "Perfect Plan")}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
              {t("6种套餐灵活选择，支持全系列 Claude AI 模型，按需付费，随时升级", "6 flexible plans with full Claude AI model support. Pay as you need, upgrade anytime.")}
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm">
              {[
                { icon: Shield, text: t("安全可靠", "Secure & Safe"), color: "text-emerald-500" },
                { icon: Clock, text: t("即时开通", "Instant Access"), color: "text-blue-500" },
                { icon: Headphones, text: t("专业支持", "Pro Support"), color: "text-violet-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur border border-gray-200/50 dark:border-white/10">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 套餐卡片 */}
      <section className="relative pb-24 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier, index) => (
              <div
                key={tier.id}
                className={`group relative ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* 热门标签 */}
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full blur-lg opacity-50 animate-pulse" />
                      <div className="relative inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-xl">
                        <Flame className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: '1s' }} />
                        {t("最受欢迎", "MOST POPULAR")}
                      </div>
                    </div>
                  </div>
                )}

                {/* 卡片主体 */}
                <div
                  className={`relative h-full rounded-3xl transition-all duration-500 ${
                    tier.popular
                      ? 'ring-2 ring-rose-500/50 shadow-2xl shadow-rose-500/20'
                      : `shadow-xl ${tier.shadowColor} hover:shadow-2xl ${tier.borderGlow}`
                  }`}
                >
                  {/* 渐变边框效果 */}
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${tier.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10`} />

                  {/* 顶部渐变条 */}
                  <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r ${tier.gradient} opacity-80`} />

                  <div className="relative h-full rounded-3xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
                    {/* 微光效果 */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:left-full transition-all duration-1000 ease-out" />
                    </div>

                    <div className="relative p-7">
                      {/* 头部 */}
                      <div className="flex items-start justify-between mb-5">
                        <div className={`relative w-14 h-14 rounded-2xl ${tier.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <tier.icon className="w-7 h-7 text-white" />
                          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tier.gradient} opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300`} />
                        </div>
                        <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${tier.badgeStyle} backdrop-blur-sm`}>
                          {tier.dailyQuota}/{t("天", "day")}
                        </div>
                      </div>

                      {/* 名称和价格 */}
                      <div className="mb-5">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{tier.name}</h3>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                            ¥{tier.price}
                          </span>
                          <span className="text-gray-500 font-medium">{t("/月", "/mo")}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{tier.description}</p>
                      </div>

                      {/* 按钮 */}
                      <button
                        onClick={() => handlePurchaseClick(tier.name)}
                        className={`relative w-full py-3.5 rounded-2xl font-semibold text-sm overflow-hidden transition-all duration-300 group/btn ${
                          tier.popular
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5'
                            : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:shadow-lg hover:-translate-y-0.5'
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {t("立即订阅", "Subscribe Now")}
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                      </button>

                      {/* 分隔线 */}
                      <div className="my-6 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                      {/* 额度详情 */}
                      <div className="space-y-3">
                        {tier.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">{feature.label}</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{feature.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* 包含功能 */}
                      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t("包含服务", "Includes")}</p>
                        <div className="space-y-2.5">
                          {tier.includes.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2.5">
                              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${tier.gradient} flex items-center justify-center`}>
                                <Check className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claude 官方完整定价 */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-900/50 dark:to-gray-950">
        <div className="max-w-[1200px] mx-auto">
          {/* 标题 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{t("与官方计费完全一致", "100% Consistent with Official Pricing")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Claude {t("模型官方定价", "Official Model Pricing")}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-4">
              {t("每百万 tokens 计费 · 包含输入、输出、缓存写入、缓存读取", "Per million tokens · Including input, output, cache write & read")}
            </p>
            <a
              href="https://claude.com/pricing#api"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              {t("查看 Claude 官方 API 定价", "View Claude Official API Pricing")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* 价格卡片 */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {claudePricing.map((model, idx) => (
              <div
                key={idx}
                className={`relative group rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all duration-300 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* 模型标识 */}
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-${model.color}-100 dark:bg-${model.color}-900/30 flex items-center justify-center`}>
                    <Brain className={`w-6 h-6 text-${model.color}-600 dark:text-${model.color}-400`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{model.name}</h3>
                    <p className="text-xs text-gray-500">{model.description}</p>
                  </div>
                </div>

                {/* 价格表格 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t("输入", "Input")}</span>
                    </div>
                    <span className={`text-sm font-bold text-${model.color}-600 dark:text-${model.color}-400`}>{model.prices.input}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t("输出", "Output")}</span>
                    </div>
                    <span className={`text-sm font-bold text-${model.color}-600 dark:text-${model.color}-400`}>{model.prices.output}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t("缓存写入", "Cache Write")}</span>
                    </div>
                    <span className={`text-sm font-bold text-${model.color}-600 dark:text-${model.color}-400`}>{model.prices.cacheWrite}</span>
                  </div>
                  <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{t("缓存读取", "Cache Read")}</span>
                    </div>
                    <span className={`text-sm font-bold text-${model.color}-600 dark:text-${model.color}-400`}>{model.prices.cacheRead}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{t("常见问题", "FAQ")}</h2>
            <p className="text-gray-500">{t("关于定价的常见疑问", "Common questions about pricing")}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-rose-500/20 rounded-2xl sm:rounded-3xl blur-2xl" />
            <div className="relative p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">{t("准备好开始了吗？", "Ready to Start?")}</h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8 px-2">{t("注册即享免费试用额度，立即体验 Claude AI 的强大能力", "Sign up for free credits and experience Claude AI's power")}</p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="relative w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 hover:opacity-90 transition-all shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto"
              >
                {t("免费开始使用", "Get Started Free")}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-10 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src="/ac-logo.png" alt="AiClaude" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-lg text-gray-900 dark:text-white">AiClaude</span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-500">
            <Link href="/features" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("功能", "Features")}</Link>
            <Link href="/docs" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("文档", "Docs")}</Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("隐私", "Privacy")}</Link>
          </div>
        </div>
      </footer>

      {/* 订阅弹窗 */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent
          className="sm:max-w-[440px] p-0 gap-0 overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl bg-white dark:bg-gray-900"
          hideCloseButton
          animation="fade"
        >
          <DialogTitle className="sr-only">{t("订阅套餐", "Subscribe Plan")}</DialogTitle>
          <DialogDescription className="sr-only">{t("扫码添加微信订阅", "Scan QR to subscribe")}</DialogDescription>

          {/* 头部 */}
          <div className="px-8 pt-8 pb-5 text-center border-b border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedPlan}</h3>
            <p className="text-sm text-gray-500">{t("扫码联系客服开通", "Scan to contact customer service")}</p>
          </div>

          {/* 二维码 */}
          <div className="px-8 py-6">
            <div className="flex justify-center">
              <div className="p-3 rounded-xl bg-white border border-gray-200 dark:border-gray-700 shadow-sm">
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
            <p className="text-center text-sm text-gray-400 mt-4">{t("微信扫一扫添加客服", "Scan with WeChat")}</p>
          </div>

          {/* 底部按钮 */}
          <div className="px-8 pb-8">
            <button
              onClick={() => setIsPurchaseModalOpen(false)}
              className="w-full py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
