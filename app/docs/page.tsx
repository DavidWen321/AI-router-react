"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import {
  Code,
  FileCode,
  FileText,
  BookOpen,
  Key,
  Terminal,
  Settings,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Shield,
  Clock,
  FileJson,
  Folder,
  ChevronRight,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import Link from "next/link"

export default function DocsPage() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const steps = [
    {
      number: 1,
      title: t("安装 Claude Code", "Install Claude Code"),
      icon: Terminal,
      gradient: "from-blue-500 to-cyan-500",
      content: (
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t("使用 npm 安装 Claude Code CLI 工具", "Use npm to install Claude Code CLI tool")}
          </p>
          <CodeBlock
            code="npm install -g @anthropic-ai/claude-code"
            index={0}
            copiedIndex={copiedIndex}
            onCopy={handleCopy}
          />
        </div>
      ),
    },
    {
      number: 2,
      title: t("配置 Settings 文件", "Configure Settings File"),
      icon: Settings,
      gradient: "from-violet-500 to-purple-500",
      content: (
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t(
              "创建 ~/.claude/settings.json 文件并配置您的 API 密钥",
              "Create ~/.claude/settings.json file and configure your API key"
            )}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-violet-600 dark:text-violet-400 font-medium">
            <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="break-all">~/.claude/settings.json</span>
          </div>
          <CodeBlock
            code={`{
  "env": {
    "CLAUDE_CODE_ATTRIBUTION_HEADER": "0",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1",
    "DISABLE_AUTOUPDATER": "1",
    "DISABLE_INSTALLATION_CHECKS": "1",
    "ANTHROPIC_AUTH_TOKEN": "你自己的密钥",
    "ANTHROPIC_BASE_URL": "https://aiclaude.online"
  },
  "permissions": {
    "allow": [],
    "deny": []
  },
  "alwaysThinkingEnabled": true,
  "hasCompletedOnboarding": true
}`}
            index={1}
            copiedIndex={copiedIndex}
            onCopy={handleCopy}
            language="json"
          />
          <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800/50">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Key className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-0.5 sm:mb-1 text-sm sm:text-base">
                  {t("获取 API Key", "Get API Key")}
                </h4>
                <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">
                  {t(
                    "您可以在用户控制台中找到您的 API Key，请妥善保管",
                    "You can find your API Key in the user console, please keep it safe"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      number: 3,
      title: t("配置 Config 文件", "Configure Config File"),
      icon: FileJson,
      gradient: "from-emerald-500 to-teal-500",
      content: (
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t(
              "创建 ~/.claude/config.json 文件并配置主 API Key",
              "Create ~/.claude/config.json file and configure primary API key"
            )}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="break-all">~/.claude/config.json</span>
          </div>
          <CodeBlock
            code={`{
  "primaryApiKey": "AiClaude"
}`}
            index={2}
            copiedIndex={copiedIndex}
            onCopy={handleCopy}
            language="json"
          />
        </div>
      ),
    },
    {
      number: 4,
      title: t("开始使用", "Start Using"),
      icon: Zap,
      gradient: "from-orange-500 to-rose-500",
      content: (
        <div className="space-y-3 sm:space-y-4">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t("在您的项目目录中运行 Claude Code 命令", "Run Claude Code commands in your project directory")}
          </p>
          <CodeBlock
            code="claude"
            index={3}
            copiedIndex={copiedIndex}
            onCopy={handleCopy}
            language="bash"
          />
        </div>
      ),
    },
  ]

  const useCases = [
    {
      icon: Code,
      title: t("Web 开发", "Web Development"),
      description: t("加速前端后台开发", "Accelerate frontend and backend development"),
      examples: [
        t("React/Vue/Angular 组件开发", "React/Vue/Angular component development"),
        t("API 接口设计和实现", "API interface design and implementation"),
        t("数据库查询优化", "Database query optimization"),
      ],
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      icon: FileCode,
      title: t("代码重构", "Code Refactoring"),
      description: t("智能重构和架构优化", "Smart refactoring and architecture optimization"),
      examples: [
        t("遗留代码现代化", "Legacy code modernization"),
        t("设计模式应用", "Design pattern application"),
        t("代码结构优化", "Code structure optimization"),
      ],
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: FileText,
      title: t("文档生成", "Documentation Generation"),
      description: t("自动生成高质量文档", "Automatically generate high-quality documentation"),
      examples: [
        t("API 文档自动生成", "Automatic API documentation generation"),
        t("代码注释补充", "Code comment supplementation"),
        t("README 文件创建", "README file creation"),
      ],
      gradient: "from-emerald-500 to-teal-500",
    },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
      {/* 动态背景 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-cyan-500/[0.07] via-blue-500/[0.05] to-transparent rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-1/3 right-0 w-[800px] h-[800px] bg-gradient-to-br from-violet-500/[0.07] via-purple-500/[0.05] to-transparent rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-gradient-to-br from-emerald-500/[0.06] via-teal-500/[0.04] to-transparent rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "4s" }}
        />
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-20 sm:pt-28 md:pt-32 pb-10 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className={`text-center ${mounted ? "animate-fade-in-up" : "opacity-0"}`}>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 mb-6 sm:mb-8 rounded-full bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 shadow-lg shadow-gray-200/20 dark:shadow-none">
              <div className="relative">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
                <div className="absolute inset-0 animate-ping">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 opacity-50" />
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 bg-clip-text text-transparent">
                {t("开发文档", "Development Documentation")}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              <span className="text-gray-900 dark:text-white">{t("Claude Code", "Claude Code")}</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-600 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                {t("使用指南", "Usage Guide")}
              </span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-10 px-2">
              {t(
                "了解如何使用 Claude Code AI 编程助手来提高您的开发效率",
                "Learn how to use Claude Code AI programming assistant to improve your development efficiency"
              )}
            </p>

            {/* 特色文档链接按钮 + 小手引导 */}
            <div className="relative inline-flex items-center">
              <a
                href="https://ccnvdus6wtxb.feishu.cn/wiki/SRN8wJ6AUis6UKk1rv2c1TSMnih?from=from_copylink"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 text-white font-semibold shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-300 text-sm sm:text-base"
              >
                {/* 光效动画 */}
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10" />

                <div className="relative flex items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    <div className="absolute inset-0 animate-ping">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 opacity-50" />
                    </div>
                  </div>
                  <span className="hidden sm:inline">{t("查看详细配置文档", "View Detailed Configuration Docs")}</span>
                  <span className="sm:hidden">{t("查看配置文档", "View Config Docs")}</span>
                  <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>

              {/* 小手引导动效 */}
              <div className="hidden sm:flex absolute -right-52 top-1/2 -translate-y-1/2 items-center gap-2 pointer-events-none">
                {/* 小手图标 — 左右轻摆 + 轻微弹跳 */}
                <span className="relative text-2xl hand-sway drop-shadow-md">
                  👈
                  {/* 点击涟漪光圈 */}
                  <span className="absolute -inset-1.5 rounded-full bg-violet-400/20 hand-ripple" />
                </span>
                {/* 提示文字 — 淡入淡出呼吸效果 */}
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap text-breath font-medium">
                  {t("点击该按钮查看最新配置文档", "Click to view latest config docs")}
                </span>
              </div>
            </div>

            {/* 特性标签 */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-6 sm:mt-10">
              {[
                { icon: Zap, text: t("快速配置", "Quick Setup"), color: "text-amber-500" },
                { icon: Shield, text: t("安全可靠", "Secure"), color: "text-emerald-500" },
                { icon: Clock, text: t("5分钟上手", "5 Min Start"), color: "text-blue-500" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur border border-gray-200/50 dark:border-white/10"
                >
                  <item.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.color}`} />
                  <span className="text-gray-700 dark:text-gray-300 font-medium text-xs sm:text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 快速开始步骤 */}
      <section className="relative pb-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-[900px] mx-auto">
          <h2
            className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-12 text-center ${
              mounted ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            {t("快速开始", "Quick Start")}
          </h2>

          <div className="space-y-4 sm:space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`group relative ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative rounded-xl sm:rounded-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* 顶部渐变条 */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.gradient}`} />

                  <div className="p-4 sm:p-6 md:p-8">
                    {/* 标题行 */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span
                            className={`text-xs sm:text-sm font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-gradient-to-r ${step.gradient} text-white`}
                          >
                            Step {step.number}
                          </span>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
                        </div>
                      </div>
                    </div>

                    {/* 内容 */}
                    {step.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 使用场景 */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-900/50 dark:to-gray-950">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t("使用场景", "Use Cases")}
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto px-2">
              {t(
                "Claude Code 适用于各种开发场景，提高您的工作效率",
                "Claude Code is suitable for various development scenarios"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {useCases.map((useCase, idx) => (
              <div
                key={idx}
                className={`group relative rounded-xl sm:rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 ${
                  mounted ? "animate-fade-in-up" : "opacity-0"
                }`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* 图标 */}
                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${useCase.gradient} flex items-center justify-center mb-4 sm:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <useCase.icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1.5 sm:mb-2">{useCase.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4 sm:mb-5 text-xs sm:text-sm">{useCase.description}</p>

                <ul className="space-y-2 sm:space-y-2.5">
                  {useCase.examples.map((example, eIdx) => (
                    <li key={eIdx} className="flex items-center gap-2 sm:gap-2.5">
                      <ChevronRight className={`w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gradient-to-r ${useCase.gradient} bg-clip-text`} style={{ color: 'transparent', background: `linear-gradient(to right, var(--tw-gradient-stops))`, WebkitBackgroundClip: 'text' }} />
                      <span className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-[600px] mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-violet-500/20 rounded-2xl sm:rounded-3xl blur-2xl" />
            <div className="relative p-6 sm:p-10 rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-xl">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                {t("遇到问题？", "Need Help?")}
              </h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8">
                {t("查看详细配置文档获取更多帮助，或联系我们的支持团队", "Check detailed docs for more help, or contact our support team")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a
                  href="https://ccnvdus6wtxb.feishu.cn/wiki/SRN8wJ6AUis6UKk1rv2c1TSMnih?from=from_copylink"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {t("详细文档", "Detailed Docs")}
                </a>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5 text-sm sm:text-base"
                >
                  {t("查看套餐", "View Plans")}
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 sm:py-10 px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <img src="/ac-logo.png" alt="AiClaude" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">AiClaude</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-500">
            <Link href="/features" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("功能", "Features")}
            </Link>
            <Link href="/pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("定价", "Pricing")}
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("隐私", "Privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// 代码块组件
function CodeBlock({
  code,
  index,
  copiedIndex,
  onCopy,
  language = "bash",
}: {
  code: string
  index: number
  copiedIndex: number | null
  onCopy: (text: string, index: number) => void
  language?: string
}) {
  return (
    <div className="relative group">
      <div className="bg-gray-900 dark:bg-gray-950 rounded-lg sm:rounded-xl overflow-hidden border border-gray-800">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-800/50 border-b border-gray-700/50">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex gap-1 sm:gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500 ml-1.5 sm:ml-2">{language}</span>
          </div>
          <button
            onClick={() => onCopy(code, index)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            {copiedIndex === index ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400" />
                <span className="text-green-400 hidden xs:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline">Copy</span>
              </>
            )}
          </button>
        </div>
        {/* 代码内容 */}
        <div className="p-3 sm:p-4 overflow-x-auto">
          <pre className="text-xs sm:text-sm font-mono text-gray-100">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
