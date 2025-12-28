"use client"

import { useLanguage } from "@/lib/language-context"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Code,
  Search,
  Sparkles,
  Shield,
  Zap,
  FileCheck,
  Code2,
  RefreshCw,
  FileText,
  Terminal,
  ArrowRight,
  Check,
  Rocket,
  Layers,
  GitBranch,
  Bot,
  ChevronRight,
} from "lucide-react"
import { AuthModal } from "@/components/auth-modal"

export default function FeaturesPage() {
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    {
      icon: Code,
      title: t("AI 代码生成", "AI Code Generation"),
      description: t(
        "基于上下文的智能代码生成，理解您的项目结构和编码风格",
        "Context-aware intelligent code generation that understands your project structure and coding style",
      ),
      items: [
        t("支持多种编程语言和框架", "Support for multiple programming languages and frameworks"),
        t("根据注释和描述生成完整代码", "Generate complete code based on comments and descriptions"),
        t("智能补全和代码建议", "Intelligent completion and code suggestions"),
        t("保持一致的代码风格", "Maintain consistent code style"),
      ],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Search,
      title: t("智能调试", "Intelligent Debugging"),
      description: t(
        "快速识别和修复代码中的错误，提供详细的解决方案",
        "Quickly identify and fix errors in code with detailed solutions",
      ),
      items: [
        t("自动识别测试和分析", "Automatic test identification and analysis"),
        t("提供修复建议和相关文档", "Provide fix suggestions and related documentation"),
        t("性能瓶颈识别", "Performance bottleneck identification"),
        t("代码质量评估", "Code quality assessment"),
      ],
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Sparkles,
      title: t("智能代码补全", "Smart Code Completion"),
      description: t(
        "实时智能代码补全，提升编码速度和准确性",
        "Real-time intelligent code completion to improve coding speed and accuracy",
      ),
      items: [
        t("上下文感知的代码建议", "Context-aware code suggestions"),
        t("多行代码预测", "Multi-line code prediction"),
        t("API 和库的智能推荐", "Intelligent API and library recommendations"),
        t("自动导入依赖", "Automatic dependency imports"),
      ],
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Shield,
      title: t("代码审查", "Code Review"),
      description: t(
        "AI 驱动的代码审查，发现潜在问题和改进建议",
        "AI-powered code review to discover potential issues and improvement suggestions",
      ),
      items: [
        t("安全漏洞检测", "Security vulnerability detection"),
        t("代码规范检查", "Code standard checking"),
        t("最佳实践建议", "Best practice recommendations"),
        t("性能优化提示", "Performance optimization tips"),
      ],
      gradient: "from-rose-500 to-pink-500",
    },
    {
      icon: Zap,
      title: t("性能优化", "Performance Optimization"),
      description: t(
        "自动识别性能瓶颈，提供优化建议",
        "Automatically identify performance bottlenecks and provide optimization suggestions",
      ),
      items: [
        t("代码执行效率分析", "Code execution efficiency analysis"),
        t("内存使用优化", "Memory usage optimization"),
        t("算法复杂度评估", "Algorithm complexity assessment"),
        t("资源加载优化", "Resource loading optimization"),
      ],
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: FileCheck,
      title: t("安全分析", "Security Analysis"),
      description: t(
        "全面的安全扫描，保护您的代码免受威胁",
        "Comprehensive security scanning to protect your code from threats",
      ),
      items: [
        t("SQL 注入检测", "SQL injection detection"),
        t("XSS 漏洞扫描", "XSS vulnerability scanning"),
        t("依赖安全检查", "Dependency security checking"),
        t("敏感信息泄露检测", "Sensitive information leak detection"),
      ],
      gradient: "from-cyan-500 to-blue-500",
    },
  ]

  const useCases = [
    {
      icon: Code2,
      title: t("Web 开发", "Web Development"),
      subtitle: t("加速前端和后端开发", "Accelerate frontend and backend development"),
      items: [
        t("React/Vue/Angular 组件开发", "React/Vue/Angular component development"),
        t("API 接口设计和实现", "API interface design and implementation"),
        t("数据库查询优化", "Database query optimization"),
      ],
    },
    {
      icon: RefreshCw,
      title: t("代码重构", "Code Refactoring"),
      subtitle: t("智能重构和架构优化", "Intelligent refactoring and architecture optimization"),
      items: [
        t("遗留代码现代化", "Legacy code modernization"),
        t("设计模式应用", "Design pattern application"),
        t("代码结构优化", "Code structure optimization"),
      ],
    },
    {
      icon: FileText,
      title: t("文档生成", "Documentation Generation"),
      subtitle: t("自动生成高质量文档", "Automatically generate high-quality documentation"),
      items: [
        t("API 文档自动生成", "Automatic API documentation generation"),
        t("代码注释补充", "Code comment supplementation"),
        t("README 文件创建", "README file creation"),
      ],
    },
  ]

  const highlights = [
    {
      icon: Bot,
      title: t("Agentic Coding", "Agentic Coding"),
      description: t("让 AI 自主理解需求并完成复杂编程任务", "Let AI autonomously understand requirements and complete complex coding tasks"),
    },
    {
      icon: Terminal,
      title: t("命令行原生", "CLI Native"),
      description: t("深度集成终端，一行命令即可开始使用", "Deep terminal integration, start with a single command"),
    },
    {
      icon: GitBranch,
      title: t("项目感知", "Project Aware"),
      description: t("理解整个代码库的结构、依赖和架构", "Understand the entire codebase structure, dependencies and architecture"),
    },
    {
      icon: Layers,
      title: t("多模态支持", "Multi-modal Support"),
      description: t("支持图片、文档等多种输入形式", "Support images, documents and other input formats"),
    },
  ]

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] overflow-hidden">
      {/* Background */}
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

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          {/* Badge */}
          <div className={`flex justify-center mb-6 sm:mb-8 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-emerald-500/10 border border-gray-200/50 dark:border-gray-700/50 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
              <Rocket className="w-4 h-4 text-violet-500" />
              {t("Claude Code 核心能力", "Claude Code Core Capabilities")}
            </div>
          </div>

          {/* Title */}
          <div className={`text-center max-w-4xl mx-auto ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              <span className="text-gray-900 dark:text-white">{t("强大的", "Powerful")}</span>
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                {t("AI 编程能力", "AI Coding Capabilities")}
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
              {t(
                "AiClaude 提供的强大 AI 功能，帮助您在每个开发阶段都能提高效率，让编程变得更简单、更高效",
                "Powerful AI features provided by AiClaude to help you improve efficiency at every development stage",
              )}
            </p>

            {/* Key highlights */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              {[
                t("Agentic Coding", "Agentic Coding"),
                t("多语言支持", "Multi-language"),
                t("上下文感知", "Context Aware"),
                t("实时响应", "Real-time"),
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="relative py-12 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            {highlights.map((item, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="relative py-16 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-4">
              <Sparkles className="w-4 h-4" />
              {t("核心功能", "Core Features")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t("全方位的 AI 编程辅助", "Comprehensive AI Coding Assistance")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-transparent transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`} />
                <div className="absolute inset-0 rounded-2xl bg-white dark:bg-gray-900 transition-colors" />

                <div className="relative">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2.5">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative py-16 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-4">
              <Layers className="w-4 h-4" />
              {t("使用场景", "Use Cases")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t("适用于各种开发场景", "Suitable for Various Development Scenarios")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t(
                "无论是 Web 开发、移动应用还是系统编程，AiClaude 都能助您一臂之力",
                "Whether it's web development, mobile apps or system programming, AiClaude can help",
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="group p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-5 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:scale-110 transition-all">
                  <useCase.icon className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{useCase.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-5">{useCase.subtitle}</p>
                <ul className="space-y-2.5">
                  {useCase.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t("开始体验强大功能", "Start Experiencing Powerful Features")}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 md:mb-10 px-2">
            {t(
              "注册即享免费额度，无需信用卡。立即开始您的 AI 编程之旅",
              "Free credits on signup, no credit card required. Start your AI coding journey now",
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />
              <span className="relative">{t("免费开始", "Get Started Free")}</span>
              <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <Link
              href="/docs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all"
            >
              {t("查看文档", "View Docs")}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-12">
          {/* 支持的平台 */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-8 sm:mb-10 pb-8 sm:pb-10 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 w-full sm:w-auto text-center sm:text-left">{t("支持平台", "Supported Platforms")}:</span>
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Windows</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">macOS</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.002c-.06.135-.12.2-.21.335h-.003c-.2.27-.47.468-.87.536-.199-.135-.436-.27-.332-.534.113-.2.199-.333.06-.6v-.003c-.003-.007-.006-.008-.009-.014-.21-.4-.77-.933-1.09-1.335-.085-.135-.142-.198-.214-.267-.39-.4-.706-.797-.927-1.2v-.134c-.02-.135-.034-.2-.06-.267-.058-.133-.123-.198-.21-.133-.106.066-.18.2-.21.333l-.003.003c-.082.2-.091.333-.141.531v.003c-.05.2-.142.467-.269.735-.631 1.333-1.875 2.93-2.56 3.864.155.135.37.267.465.467.268-.468.663-1.133.892-1.534.198-.333.468-.667.692-.933.2-.333.469-.733.468-1 .065-.065.173-.008.24-.065.18.54.12 1.268-.069 1.936-.188.667-.5 1.334-1.145 1.871l.003.003c-.3.527-.53 1.052-.67 1.574-.135.533-.164 1.07-.014 1.6.073.6.139.266.139.4v.003c0 .461-.494.733-1.167.867-.411.133-.747.133-1.078.066l-.001.001c-.132-.132-.132-.265-.197-.532-.066-.2-.2-.333-.2-.533-.003-.2.065-.332.065-.6.065-.135 0-.267-.066-.332-.064-.202-.132-.6-.264-.2-.12.269-.147.534-.147.869 0 .134-.066.398-.2.6-.133.199-.333.333-.8.333-.199 0-.467-.132-.534-.465-.065-.2-.065-.666.067-1.067.269-.468.466-1.066.732-1.534.267-.468.534-.8.8-.8.2 0 .2.133.2.267.002.399-.065.665-.065.931v.003c-.066.465-.066 1.131.133 1.331.066.066.132.066.197.066.2 0 .265-.065.265-.265 0-.266-.065-.532-.065-.998v-.003c-.002-.199.003-.4.069-.664a.62.62 0 01.27-.332c.067-.066.2-.067.333-.134.133-.066.26-.133.405-.133.136 0 .2.066.267.2.066.133 0 .332-.068.6l-.003.003c-.131.533-.263 1.001-.263 1.266 0 .2.066.265.198.265.133 0 .267-.133.4-.265.131-.133.263-.265.395-.465.135-.2.27-.465.405-.734.133-.265.332-.6.532-.93v-.005c.066-.134.135-.2.263-.2.132 0 .197.067.197.2v.002c0 .2-.065.334-.065.532.002.533.133 1.067.4 1.2.135.067.333.067.532-.065.2-.133.336-.266.469-.532.134-.27.266-.601.399-1.135l.003.001c.265-.935.732-1.87 1.197-2.806.466-.933.93-1.869 1.263-2.668.199-.402.398-.735.465-1.066.067-.337.068-.665-.065-.932-.269-.534-.873-.933-1.474-1.267l-.003-.003a.51.51 0 00-.267-.066h-.004c-.133.001-.333.066-.464.133l-.002-.003c-.397.2-.662.533-1.197.933l-.002.002c-.598.534-1.531 1.137-2.53 1.137-.266 0-.532-.065-.665-.065h-.136c-.466.002-1.131.266-1.53.467l-.001-.001c-.536.2-1 .4-1.333.4-.4 0-.466-.333-.333-.6.132-.265.332-.466.665-.531.333-.068.664-.068 1-.135v-.003c.267-.065.6-.132.867-.265.267-.133.532-.265.732-.4.464-.465.864-1.197 1.33-2.064.333-.532.598-1.199.732-1.866v-.003c.066-.2.133-.397.133-.6.002-.132-.065-.2-.198-.2zm3.348 2.746v-.003c-.066-.065-.133.066-.267.132-.134.067-.267.202-.534.268-.531.197-.998.397-1.33.531.265.465.598.931 1.063 1.33v.003c.267.2.465.332.666.465.195.135.33.2.462.267.136-.332.266-.598.398-.93v-.003c.202-.399.403-.798.537-1.195.067-.2.067-.4 0-.465-.065-.133-.133-.2-.265-.2l-.267-.066h-.463v-.134z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Linux</span>
              </div>
            </div>
          </div>

          {/* 主内容区：左 - 中 - 右 布局 */}
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* 左侧区块 - 品牌 + 版权 */}
            <div className="flex-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <img src="/ac-logo.png" alt="AiClaude" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">AiClaude</span>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mb-6">
                {t("Claude Code 官方 API 直连服务，为国内开发者提供稳定、高速的 AI 编程体验。", "Official Claude Code API direct connection service for developers.")}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © 2024 AiClaude. {t("保留所有权利", "All rights reserved.")}
              </div>
            </div>

            {/* 中间 - 导航链接 */}
            <div className="flex gap-8 sm:gap-12 md:gap-16 lg:gap-20">
              {/* 产品 */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t("产品", "Product")}</h3>
                <ul className="space-y-3">
                  <li><Link href="/features" className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t("功能特性", "Features")}</Link></li>
                  <li><Link href="/pricing" className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t("定价方案", "Pricing")}</Link></li>
                  <li><Link href="/docs" className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t("使用文档", "Documentation")}</Link></li>
                </ul>
              </div>

              {/* 支持 */}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t("支持", "Support")}</h3>
                <ul className="space-y-3">
                  <li><Link href="/docs" className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t("帮助中心", "Help Center")}</Link></li>
                  <li><a href="mailto:support@aiclaude.net" className="text-sm text-gray-500 dark:text-gray-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">{t("联系我们", "Contact Us")}</a></li>
                </ul>
              </div>
            </div>

            {/* 右侧区块 - 联系方式 + 隐私条款 */}
            <div className="flex-1 text-left md:text-right">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t("联系方式", "Contact")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">support@aiclaude.net</p>
              <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 md:justify-end">
                <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("隐私政策", "Privacy")}</Link>
                <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("服务条款", "Terms")}</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  )
}
