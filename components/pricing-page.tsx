"use client"

import { Check, Crown, Zap, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const vipTiers = [
  {
    level: "VIP1",
    name: "萌新",
    threshold: "0元",
    rpm: "3 RPM",
    rpmDesc: "适合网页对话，跑Code易报错",
    discount: "原价",
    discountDesc: "无折扣",
    color: "from-slate-400 to-slate-500",
    bgColor: "bg-slate-50 dark:bg-slate-900/50",
    borderColor: "border-slate-200 dark:border-slate-700",
  },
  {
    level: "VIP2",
    name: "进阶",
    threshold: "1,000元",
    rpm: "5 RPM",
    rpmDesc: "写小脚本勉强够用",
    discount: "95折",
    discountDesc: "立省5%",
    color: "from-emerald-400 to-teal-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-800",
  },
  {
    level: "VIP3",
    name: "核心",
    threshold: "2,000元",
    rpm: "10 RPM",
    rpmDesc: "Code模式流畅线",
    discount: "9折",
    discountDesc: "立省10%",
    color: "from-blue-400 to-indigo-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    level: "VIP4",
    name: "股东",
    threshold: "3,000元",
    rpm: "15 RPM / 独享",
    rpmDesc: "极速响应，冗余充足",
    discount: "85折",
    discountDesc: "立省15%",
    color: "from-amber-400 to-orange-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
]

const pricingTiers = [
  {
    name: "迷你体验卡",
    price: "39",
    description: "适合初次体验和轻度使用的入门方案",
    features: [
      { text: "月度预算", value: "$150.00" },
      { text: "日度预算", value: "$5.00" },
      { text: "包含杂额", value: "$150.00" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "社区支持", value: null },
    ],
    cta: "暂不可购买",
    popular: false,
  },
  {
    name: "轻量开发者",
    price: "89",
    description: "适合个人开发者和小型项目的基础套餐",
    features: [
      { text: "月度预算", value: "$450.00" },
      { text: "日度预算", value: "$15.00" },
      { text: "包含杂额", value: "$450.00" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "基础支持", value: null },
    ],
    cta: "暂不可购买",
    popular: false,
  },
  {
    name: "标准生产力",
    price: "249",
    description: "适合中小企业和专业开发团队的专业套餐",
    features: [
      { text: "月度预算", value: "$1,200.00" },
      { text: "日度预算", value: "$40.00" },
      { text: "包含杂额", value: "$1,200.00" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "优先支持", value: null },
    ],
    cta: "暂不可购买",
    popular: true,
  },
  {
    name: "专业工作室",
    price: "399",
    description: "适合成长型团队和多项目管理的协作方案",
    features: [
      { text: "月度预算", value: "$2,400.00" },
      { text: "日度预算", value: "$80.00" },
      { text: "包含杂额", value: "$2,400.00" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "专属支持", value: null },
    ],
    cta: "暂不可购买",
    popular: false,
  },
  {
    name: "旗舰算力版",
    price: "599",
    description: "适合大规模企业和高强度使用的旗舰方案",
    features: [
      { text: "月度预算", value: "$3,600.00" },
      { text: "日度预算", value: "$135.00" },
      { text: "包含杂额", value: "$3,600.00" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "专属客户经理", value: null },
    ],
    cta: "暂不可购买",
    popular: false,
  },
]

export default function PricingPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            简单透明的 <span className="text-muted-foreground">定价</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            选择适合您开发需求的完美方案。立即开始，随时升级。
          </p>
        </div>

        {/* VIP Benefits Card - Apple Style */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/50 bg-gradient-to-b from-card to-card/80 p-1 shadow-2xl shadow-black/5 dark:shadow-black/20">
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5" />

            <div className="relative rounded-[2rem] bg-card/95 backdrop-blur-xl">
              {/* Header */}
              <div className="border-b border-border/50 px-8 py-8 text-center sm:px-12">
                <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 px-5 py-2">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-sm font-semibold text-transparent">
                    VIP 会员权益
                  </span>
                  <Sparkles className="h-4 w-4 text-rose-500" />
                </div>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  累计消费解锁专属特权
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
                  消费越多，等级越高，享受更强并发与更大折扣
                </p>
              </div>

              {/* Table Header */}
              <div className="hidden border-b border-border/30 bg-muted/30 px-8 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-12 sm:py-4">
                <div className="text-sm font-medium text-muted-foreground">VIP 等级</div>
                <div className="text-sm font-medium text-muted-foreground">门槛 (历史累计消费)</div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  并发限制 (RPM)
                </div>
                <div className="text-sm font-medium text-muted-foreground">专属折扣</div>
              </div>

              {/* VIP Tiers */}
              <div className="divide-y divide-border/30">
                {vipTiers.map((tier, index) => (
                  <div
                    key={tier.level}
                    className={`group relative px-8 py-6 transition-all duration-300 hover:bg-muted/20 sm:grid sm:grid-cols-4 sm:items-center sm:gap-4 sm:px-12 ${
                      index === vipTiers.length - 1 ? "rounded-b-[2rem]" : ""
                    }`}
                  >
                    {/* Level Badge */}
                    <div className="flex items-center gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tier.color} shadow-lg shadow-black/10`}>
                        <span className="text-sm font-bold text-white">{tier.level}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{tier.name}</div>
                        <div className="text-sm text-muted-foreground sm:hidden">{tier.threshold}</div>
                      </div>
                    </div>

                    {/* Threshold */}
                    <div className="mt-4 sm:mt-0">
                      <div className="text-sm text-muted-foreground sm:hidden">门槛</div>
                      <div className="font-medium text-foreground">{tier.threshold}</div>
                    </div>

                    {/* RPM */}
                    <div className="mt-4 sm:mt-0">
                      <div className="text-sm text-muted-foreground sm:hidden">并发限制</div>
                      <div className="font-semibold text-foreground">{tier.rpm}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{tier.rpmDesc}</div>
                    </div>

                    {/* Discount */}
                    <div className="mt-4 sm:mt-0">
                      <div className="text-sm text-muted-foreground sm:hidden">专属折扣</div>
                      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${tier.bgColor} ${tier.borderColor} border`}>
                        <span className={`bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                          {tier.discount}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">({tier.discountDesc})</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Notice */}
              <div className="border-t border-border/30 bg-gradient-to-r from-rose-500/5 via-orange-500/5 to-amber-500/5 px-8 py-5 sm:px-12">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">温馨提示：</span>
                    为避免高级 VIP 权益被滥用，如退订套餐将重置之前的所有累计消费记录。请珍惜您的会员等级！
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-20 grid max-w-7xl grid-cols-1 gap-8 pt-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.name}
              className="relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-5 left-1/2 z-10 -translate-x-1/2">
                  <div className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-foreground">
                    最受欢迎
                  </div>
                </div>
              )}

              {/* Card */}
              <div
                className={`relative h-full rounded-3xl border bg-card p-10 shadow-sm transition-all duration-500 ${
                  tier.popular ? "border-accent/20 shadow-lg shadow-accent/5" : "border-border"
                } ${hoveredIndex === index ? "scale-[1.02] shadow-2xl shadow-foreground/5" : ""}`}
              >
                {/* Tier Name */}
                <h3 className="text-2xl font-semibold tracking-tight text-card-foreground">{tier.name}</h3>

                {/* Price */}
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-6xl font-semibold tracking-tight text-card-foreground">${tier.price}</span>
                  <span className="text-lg text-muted-foreground">/月</span>
                </div>

                {/* Description */}
                <p className="mt-6 text-pretty text-base leading-relaxed text-muted-foreground">{tier.description}</p>

                {/* CTA Button */}
                <Button
                  className={`mt-8 w-full rounded-full py-6 text-base font-medium transition-all duration-300 ${
                    tier.popular
                      ? "bg-accent text-accent-foreground hover:bg-accent/90"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  disabled
                >
                  {tier.cta}
                </Button>

                {/* Divider */}
                <div className="my-10 h-px bg-border" />

                {/* Features */}
                <div className="space-y-1">
                  <p className="mb-6 text-sm font-medium tracking-wide text-muted-foreground">包含功能：</p>
                  <ul className="space-y-4">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-4">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10">
                          <Check className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <span className="text-base leading-relaxed text-card-foreground">
                            {feature.text}
                            {feature.value && <span className="ml-2 font-medium">{feature.value}</span>}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto mt-20 max-w-2xl text-center">
          <p className="text-pretty text-base leading-relaxed text-muted-foreground">
            需要更多信息？我们的团队随时为您提供帮助。
          </p>
          <Button variant="link" className="mt-4 text-base font-medium text-accent hover:text-accent/80">
            联系销售团队 →
          </Button>
        </div>
      </div>
    </div>
  )
}
