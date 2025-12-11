"use client"

import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const pricingTiers = [
  {
    name: "入门套餐",
    price: "5.90",
    description: "适合个人用户和小型测试项目的入门方案",
    features: [
      { text: "月度预算", value: "$300.00" },
      { text: "日度预算", value: "$10.00" },
      { text: "包含杂额", value: "$300.00" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "社区支持", value: null },
    ],
    cta: "暂不可购买",
    popular: false,
  },
  {
    name: "基础套餐",
    price: "11.90",
    description: "适合个人开发者和小型项目的基础套餐",
    features: [
      { text: "月度预算", value: "$750.00" },
      { text: "日度预算", value: "$25.00" },
      { text: "包含杂额", value: "$750.00" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "基础支持", value: null },
    ],
    cta: "暂不可购买",
    popular: false,
  },
  {
    name: "专业套餐",
    price: "35.90",
    description: "适合中小企业和专业开发团队的专业套餐",
    features: [
      { text: "月度预算", value: "$3.0k" },
      { text: "日度预算", value: "$100.00" },
      { text: "包含杂额", value: "$3.0k" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "基础支持", value: null },
    ],
    cta: "暂不可购买",
    popular: true,
  },
  {
    name: "团队套餐",
    price: "89.90",
    description: "适合成长型团队和多项目管理的协作方案",
    features: [
      { text: "月度预算", value: "$8.0k" },
      { text: "日度预算", value: "$300.00" },
      { text: "包含杂额", value: "$8.0k" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "优先支持", value: null },
    ],
    cta: "暂不可购买",
    popular: false,
  },
  {
    name: "企业套餐",
    price: "175.00",
    description: "适合大型企业和复杂业务需求的企业套餐",
    features: [
      { text: "月度预算", value: "$15.0k" },
      { text: "日度预算", value: "$500.00" },
      { text: "包含杂额", value: "$15.0k" },
      { text: "最多 无限制 次请求/月", value: null },
      { text: "基础支持", value: null },
    ],
    cta: "暂不可购买",
    popular: false,
  },
  {
    name: "旗舰套餐",
    price: "399.00",
    description: "适合超大规模企业和关键任务应用的旗舰方案",
    features: [
      { text: "月度预算", value: "$35.0k" },
      { text: "日度预算", value: "$1,200.00" },
      { text: "包含杂额", value: "$35.0k" },
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
