"use client"

import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/lib/language-context"
import { AuthModal } from "@/components/auth-modal"
import { useState } from "react"
import {
  Sparkles,
  Zap,
  CheckCircle,
  Lightbulb,
  Code,
  Search,
  GitBranch,
  Shield,
  Terminal,
  FileText,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { t } = useLanguage()
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const features = [
    {
      icon: Code,
      title: t("AI 代码生成", "AI Code Generation"),
      description: t(
        "基于上下文的智能代码生成，理解您的项目结构和编码风格",
        "Context-aware intelligent code generation that understands your project structure and coding style",
      ),
      color: "bg-blue-500",
    },
    {
      icon: Search,
      title: t("智能调试", "Smart Debugging"),
      description: t(
        "快速识别和修复代码中的错误，提供详细的解决方案",
        "Quickly identify and fix errors in code with detailed solutions",
      ),
      color: "bg-green-500",
    },
    {
      icon: GitBranch,
      title: t("代码优化", "Code Optimization"),
      description: t(
        "自动重构和优化建议，提升代码性能和可维护性",
        "Automatic refactoring and optimization suggestions to improve code performance",
      ),
      color: "bg-purple-500",
    },
    {
      icon: FileText,
      title: t("Git 集成", "Git Integration"),
      description: t(
        "智能的版本控制辅助，自动生成提交信息和分支管理",
        "Smart version control assistance with automatic commit messages",
      ),
      color: "bg-orange-500",
    },
    {
      icon: Terminal,
      title: t("终端集成", "Terminal Integration"),
      description: t(
        "直接在命令行中使用，无缝集成到您的开发工作流",
        "Use directly in command line, seamlessly integrated into your workflow",
      ),
      color: "bg-gray-500",
    },
    {
      icon: Shield,
      title: t("安全和隐私", "Security & Privacy"),
      description: t(
        "企业级安全保障，确保您的代码和数据安全",
        "Enterprise-level security to ensure your code and data safety",
      ),
      color: "bg-red-500",
    },
  ]

  const benefits = [
    {
      icon: Zap,
      title: t("提高效率", "Boost Efficiency"),
      description: t(
        "平均提高 50% 的开发速度，让您专注于创新而非重复工作",
        "Average 50% increase in development speed, focus on innovation",
      ),
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: CheckCircle,
      title: t("提升质量", "Improve Quality"),
      description: t(
        "减少 90% 的常见错误，通过最佳实践确保代码质量",
        "Reduce 90% of common errors, ensure code quality through best practices",
      ),
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Lightbulb,
      title: t("持续学习", "Continuous Learning"),
      description: t(
        "从 AI 建议中学习新技术和最佳实践，不断提升技能",
        "Learn new technologies and best practices from AI suggestions",
      ),
      color: "bg-purple-100 text-purple-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-full text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {t("强大功能", "Powerful Features")}
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-black dark:text-white leading-tight">
            {t("强大的 AI 编程功能", "Powerful AI Programming Features")}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t(
              "探索 AiClaude 为开发者提供的完整功能集，从代码生成到智能调试，让您的开发工作更高效",
              "Explore the complete feature set AiClaude provides for developers, from code generation to intelligent debugging",
            )}
          </p>

          <div className="pt-4">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 text-white text-lg font-medium rounded-full hover:bg-cyan-700 transition-all hover:scale-105"
            >
              {t("立即开始", "Get Started Now")}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-black dark:text-white">{t("核心功能", "Core Features")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t(
                "AiClaude 提供的强大 AI 功能，帮助您在每个开发阶段都能提高效率",
                "Powerful AI features to help you improve efficiency at every development stage",
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-500 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-black dark:text-white">{t("开发效益", "Development Benefits")}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t("使用 AiClaude 带来的实际好处", "Real benefits of using AiClaude")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-8 rounded-2xl hover:scale-105 transition-transform">
                <div className={`w-16 h-16 ${benefit.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                  <benefit.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-3">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold text-black dark:text-white">
            {t("准备好提升您的开发效率了吗？", "Ready to boost your development efficiency?")}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t(
              "立即开始使用 AiClaude，体验 AI 驱动的编程助手",
              "Start using AiClaude now and experience AI-powered programming assistant",
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 text-white text-lg font-medium rounded-full hover:bg-cyan-700 transition-all hover:scale-105"
            >
              {t("立即开始", "Get Started Now")}
              <ArrowRight className="w-5 h-5" />
            </button>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-black dark:text-white text-lg font-medium rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all hover:scale-105"
            >
              {t("查看定价", "View Pricing")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* AuthModal Section */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}
