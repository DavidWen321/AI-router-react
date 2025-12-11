"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/lib/language-context"
import { Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function PricingPage() {
  const { t } = useLanguage()
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  const handlePurchaseClick = (planName: string) => {
    setSelectedPlan(planName)
    setIsPurchaseModalOpen(true)
  }

  const tiers = [
    {
      name: t("基础会员", "Basic Member"),
      price: "¥300",
      description: t("适合个人开发者和轻度使用者", "Perfect for individual developers and light users"),
      features: [
        t("每日额度：$25", "Daily quota: $25"),
        t("月度额度：约 $750", "Monthly quota: ~$750"),
        t("无限制 API 调用次数", "Unlimited API calls"),
        t("基础技术支持", "Basic technical support"),
        t("7×24小时服务", "24/7 service availability"),
      ],
    },
    {
      name: t("标准会员", "Standard Member"),
      price: "¥420",
      popular: true,
      description: t("适合中小企业和团队使用", "Ideal for SMBs and team collaboration"),
      features: [
        t("每日额度：$50", "Daily quota: $50"),
        t("月度额度：约 $1,500", "Monthly quota: ~$1,500"),
        t("无限制 API 调用次数", "Unlimited API calls"),
        t("优先技术支持", "Priority technical support"),
        t("7×24小时服务", "24/7 service availability"),
      ],
    },
    {
      name: t("专业会员", "Professional Member"),
      price: "¥840",
      description: t("适合高频使用和专业团队", "Perfect for high-frequency use and professional teams"),
      features: [
        t("每日额度：$100", "Daily quota: $100"),
        t("月度额度：约 $3,000", "Monthly quota: ~$3,000"),
        t("无限制 API 调用次数", "Unlimited API calls"),
        t("专属技术支持", "Dedicated technical support"),
        t("7×24小时服务", "24/7 service availability"),
      ],
    },
  ]

  const faqs = [
    {
      question: t("我可以随时更改套餐吗？", "Can I change my plan at any time?"),
      answer: t(
        "是的，您可以随时升级套餐、更改立即生效，我们会按比例调整任何账单差额。",
        "Yes, you can upgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
      ),
    },
    {
      question: t("如果我超过了 API 调用限制会怎样？", "What happens if I exceed the API call limit?"),
      answer: t(
        "当您接近限制时，我们会通知您。您可以升级套餐或等待下一个计费周期配额重置。",
        "When you approach the limit, we'll notify you. You can upgrade your plan or wait for the next billing cycle to reset your quota.",
      ),
    },
    {
      question: t("你们提供退款吗？", "Do you offer refunds?"),
      answer: t(
        "是的，我们提供 24 小时内不满意退款保证。购买后 24 小时内如果您不满意，请联系我们的支持团队获取全额退款。",
        "Yes, we offer a 24-hour satisfaction guarantee. If you're not satisfied within 24 hours of purchase, contact our support team for a full refund.",
      ),
    },
    {
      question: t("如何开始使用 AiClaude？", "How do I start using AiClaude?"),
      answer: t(
        "注册账户后，您可以选择适合的套餐并立即开始使用。我们提供详细的文档和技术支持。",
        "After registering an account, you can choose a suitable plan and start using it immediately. We provide detailed documentation and technical support.",
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navigation />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-5xl font-bold text-black">
              {t("简单透明的", "Simple and Transparent")} <span className="text-cyan-600">{t("定价", "Pricing")}</span>
            </h1>
            <p className="text-xl text-gray-600">
              {t(
                "选择适合您开发需求的完美方案，立即开始，随时升级。",
                "Choose the perfect plan for your development needs. Start now, upgrade anytime.",
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pt-8">
            {tiers.map((tier, index) => (
              <div
                key={index}
                className={`relative p-8 bg-white rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  tier.popular
                    ? "border-cyan-500 shadow-xl shadow-cyan-100"
                    : "border-gray-200 hover:border-cyan-300 hover:shadow-xl"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-600 text-white text-sm font-medium rounded-full">
                    {t("最受欢迎", "Most Popular")}
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className="text-5xl font-bold text-black">{tier.price}</span>
                    <span className="text-gray-600">{t("/月", "/mo")}</span>
                  </div>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>

                <button
                  onClick={() => handlePurchaseClick(tier.name)}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 mb-8 ${
                    tier.popular
                      ? "bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-lg"
                      : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg"
                  }`}
                >
                  {t("立即购买", "Buy Now")}
                </button>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-black">{t("包含功能：", "Included features:")}</p>
                  {tier.features.map((feature, fIndex) => (
                    <div key={fIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-black mb-4">{t("常见问题", "Frequently Asked Questions")}</h2>
              <p className="text-lg text-gray-600">
                {t("关于 AiClaude 定价的所有信息。", "All information about AiClaude pricing.")}
              </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-xl font-bold text-black mb-4">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Apple-style Purchase Modal */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="sm:max-w-[540px] p-0 gap-0 overflow-hidden border-0 shadow-2xl animate-in fade-in duration-300" hideCloseButton>
          <DialogTitle className="sr-only">{t("购买会员", "Purchase Membership")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("扫描二维码添加微信客服进行购买", "Scan QR code to add WeChat for purchase")}
          </DialogDescription>

          {/* Modal Content */}
          <div className="relative">
            {/* QR Code Section */}
            <div className="bg-white px-8 pt-8 pb-8">
              <div className="space-y-5">
                {/* QR Code with subtle cyan glow */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-2xl blur-2xl opacity-15"></div>
                    <div className="relative bg-white p-6 rounded-2xl shadow-md ring-1 ring-gray-100">
                      <img
                        src="/wechat-qr.jpg"
                        alt="WeChat QR Code"
                        className="w-80 h-80 rounded-xl object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-80 h-80 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs text-center px-4">请将二维码保存至<br/>public/wechat-qr.jpg</div>'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="text-center space-y-3">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-gray-900">
                      {t("请添加微信购买", "Add WeChat to Purchase")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("扫描上方二维码，添加客服微信完成购买", "Scan the QR code to add customer service and complete purchase")}
                    </p>
                  </div>

                  {/* Features with cyan theme - single row */}
                  <div className="pt-2 flex items-center justify-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      <span>{t("7×24小时在线服务", "24/7 Service")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      <span>{t("专业售前咨询", "Professional Consultation")}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                      <span>{t("快速开通服务", "Fast Activation")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Apple-style Close Button */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="w-full py-3.5 rounded-xl font-semibold text-base text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow border border-gray-200"
              >
                {t("关闭", "Close")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
