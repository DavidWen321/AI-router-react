"use client"

import { Navigation } from "@/components/navigation"
import { useLanguage } from "@/lib/language-context"
import { AuthModal } from "@/components/auth-modal"
import { useState, useEffect, useRef } from "react"
import {
  Zap,
  CheckCircle,
  Shield,
  Terminal,
  ArrowRight,
  Globe,
  Rocket,
  Code2,
  Network,
  Lock,
  ChevronRight,
  Star,
  Cpu,
  BarChart3,
  Users,
  MessageSquare,
  Layers,
  GitBranch,
  Sparkles,
  Play,
  Check,
  Loader2,
} from "lucide-react"
import Link from "next/link"

// 终端打字动画组件 - 更逼真版本
function TerminalAnimation() {
  const { t } = useLanguage()
  const [lines, setLines] = useState<{ text: string; type: 'prompt' | 'command' | 'output' | 'success' | 'info' | 'thinking' | 'code' }[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)
  const [thinkingDots, setThinkingDots] = useState('')
  const terminalRef = useRef<HTMLDivElement>(null)

  // 更真实的脚本
  const script = [
    { text: 'claude', type: 'command' as const, delay: 80 },
    { text: '', type: 'output' as const, delay: 500 },
    { text: '╭─────────────────────────────────────────────────────╮', type: 'info' as const, delay: 50 },
    { text: '│  Claude Code v2.0                                  │', type: 'info' as const, delay: 50 },
    { text: '│  Type your request or /help for commands          │', type: 'info' as const, delay: 50 },
    { text: '╰─────────────────────────────────────────────────────╯', type: 'info' as const, delay: 50 },
    { text: '', type: 'output' as const, delay: 300 },
    { text: '> 帮我创建一个用户认证系统，包含登录注册功能', type: 'command' as const, delay: 40 },
    { text: '', type: 'output' as const, delay: 800 },
    { text: '⠋ Thinking...', type: 'thinking' as const, delay: 1200 },
    { text: '', type: 'output' as const, delay: 200 },
    { text: '我来帮你创建一个完整的用户认证系统。', type: 'output' as const, delay: 100 },
    { text: '', type: 'output' as const, delay: 300 },
    { text: '📁 Creating files...', type: 'info' as const, delay: 400 },
    { text: '', type: 'output' as const, delay: 200 },
    { text: '  ✓ src/models/User.ts', type: 'success' as const, delay: 300 },
    { text: '  ✓ src/services/AuthService.ts', type: 'success' as const, delay: 300 },
    { text: '  ✓ src/middleware/auth.ts', type: 'success' as const, delay: 300 },
    { text: '  ✓ src/routes/auth.ts', type: 'success' as const, delay: 300 },
    { text: '  ✓ src/utils/jwt.ts', type: 'success' as const, delay: 300 },
    { text: '', type: 'output' as const, delay: 200 },
    { text: '────────────────────────────────────────────────', type: 'info' as const, delay: 100 },
    { text: '✨ Created 5 files with:', type: 'output' as const, delay: 100 },
    { text: '   • User model with validation', type: 'code' as const, delay: 80 },
    { text: '   • JWT authentication service', type: 'code' as const, delay: 80 },
    { text: '   • Login/Register/Logout endpoints', type: 'code' as const, delay: 80 },
    { text: '   • Auth middleware for protected routes', type: 'code' as const, delay: 80 },
    { text: '', type: 'output' as const, delay: 300 },
    { text: '> _', type: 'command' as const, delay: 50 },
  ]

  // Thinking动画
  useEffect(() => {
    const thinkingInterval = setInterval(() => {
      setThinkingDots(prev => {
        const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
        const currentIndex = dots.indexOf(prev.charAt(0))
        const nextIndex = (currentIndex + 1) % dots.length
        return dots[nextIndex]
      })
    }, 80)
    return () => clearInterval(thinkingInterval)
  }, [])

  useEffect(() => {
    // 光标闪烁
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 530)
    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    if (currentLineIndex >= script.length) {
      // 动画结束，5秒后重新开始
      const resetTimeout = setTimeout(() => {
        setLines([])
        setCurrentLineIndex(0)
        setCurrentCharIndex(0)
      }, 5000)
      return () => clearTimeout(resetTimeout)
    }

    const currentScript = script[currentLineIndex]

    if (currentScript.type === 'command' && currentCharIndex < currentScript.text.length && currentScript.text !== '> _') {
      // 打字效果 - 添加随机延迟更自然
      const randomDelay = currentScript.delay + Math.random() * 30
      const timeout = setTimeout(() => {
        setLines(prev => {
          const newLines = [...prev]
          const lineIndex = newLines.length - 1
          if (lineIndex >= 0 && newLines[lineIndex]?.type === 'command') {
            newLines[lineIndex] = {
              text: currentScript.text.slice(0, currentCharIndex + 1),
              type: currentScript.type
            }
          } else {
            newLines.push({
              text: currentScript.text.slice(0, currentCharIndex + 1),
              type: currentScript.type
            })
          }
          return newLines
        })
        setCurrentCharIndex(prev => prev + 1)
      }, randomDelay)
      return () => clearTimeout(timeout)
    } else {
      // 直接显示整行或空行
      const timeout = setTimeout(() => {
        if (currentScript.text) {
          setLines(prev => {
            // 如果是正在打字的command行，不重复添加
            if (currentScript.type === 'command' && prev.length > 0 && prev[prev.length - 1]?.type === 'command') {
              const newLines = [...prev]
              newLines[newLines.length - 1] = { text: currentScript.text, type: currentScript.type }
              return newLines
            }
            return [...prev, { text: currentScript.text, type: currentScript.type }]
          })
        }
        setCurrentLineIndex(prev => prev + 1)
        setCurrentCharIndex(0)
      }, currentScript.type === 'command' ? 100 : currentScript.delay)
      return () => clearTimeout(timeout)
    }
  }, [currentLineIndex, currentCharIndex])

  // 自动滚动到底部
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const getLineStyle = (type: string, text: string) => {
    switch (type) {
      case 'prompt': return 'text-blue-400'
      case 'command': return 'text-gray-100'
      case 'success': return 'text-emerald-400'
      case 'thinking': return 'text-yellow-400'
      case 'info': return 'text-gray-500'
      case 'code': return 'text-cyan-400'
      default: return 'text-gray-300'
    }
  }

  return (
    <div className="relative rounded-xl overflow-hidden bg-[#1a1b26] shadow-2xl shadow-black/50 border border-gray-800/50">
      {/* Window Header - macOS style */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#24283b] border-b border-gray-800/50">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:bg-[#febc2e]/80 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-[#28c840] hover:bg-[#28c840]/80 transition-colors" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2">
          <Terminal className="w-4 h-4 text-gray-500" />
          <span className="text-gray-400 text-xs font-medium">claude-code — ~/my-project</span>
        </div>
        <div className="w-16" /> {/* Spacer for balance */}
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        className="p-3 sm:p-4 h-[280px] sm:h-[320px] md:h-[340px] overflow-y-auto font-mono text-[11px] sm:text-[12px] md:text-[13px] leading-5 sm:leading-6 bg-[#1a1b26]"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#3b4261 transparent'
        }}
      >
        {/* 初始提示符 */}
        {lines.length === 0 && (
          <div className="flex items-center">
            <span className="text-emerald-400">~/my-project</span>
            <span className="text-gray-500 mx-2">$</span>
            <span className={`inline-block w-2 h-4 bg-gray-300 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
          </div>
        )}

        {lines.map((line, index) => (
          <div key={index} className={`${getLineStyle(line.type, line.text)} whitespace-pre-wrap`}>
            {line.type === 'command' && index === 0 && (
              <>
                <span className="text-emerald-400">~/my-project</span>
                <span className="text-gray-500 mx-2">$</span>
              </>
            )}
            {line.type === 'thinking' ? (
              <span className="flex items-center gap-2">
                <span>{thinkingDots}</span>
                <span>Thinking...</span>
              </span>
            ) : (
              line.text
            )}
            {/* 光标显示在最后一行命令后 */}
            {index === lines.length - 1 && line.type === 'command' && line.text === '> _' && (
              <span className={`inline-block w-2 h-4 bg-gray-300 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  const { t } = useLanguage()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  const coreAdvantages = [
    {
      icon: Globe,
      title: t("官方直连", "Official Direct"),
      description: t("直连 Claude 官方 API，无中间商，数据不经第三方", "Direct connection to Claude API, no middleman"),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Network,
      title: t("无需梯子", "No VPN Needed"),
      description: t("国内网络直接访问，告别繁琐的网络配置", "Access directly from China, no network config"),
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      icon: Zap,
      title: t("极速响应", "Ultra Fast"),
      description: t("智能线路优化，毫秒级响应，编程体验丝滑", "Smart routing, ms-level response"),
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: Shield,
      title: t("稳定可靠", "Stable & Reliable"),
      description: t("99.9% 可用性保障，7×24 运维监控", "99.9% uptime, 24/7 monitoring"),
      gradient: "from-violet-500 to-purple-500",
    },
  ]

  const features = [
    {
      icon: Code2,
      title: t("Agentic Coding", "Agentic Coding"),
      description: t("让 AI 自主完成复杂编程任务", "AI autonomously completes complex coding"),
      color: "text-violet-500",
      bg: "bg-violet-500/10",
    },
    {
      icon: Terminal,
      title: t("命令行集成", "CLI Integration"),
      description: t("一行命令即可配置使用", "One-line setup"),
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      icon: GitBranch,
      title: t("上下文理解", "Context Aware"),
      description: t("深度理解项目结构和代码", "Deep project understanding"),
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Lock,
      title: t("安全加密", "Secure"),
      description: t("端到端加密，企业级安全", "End-to-end encryption"),
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ]

  const stats = [
    { value: "10,000+", label: t("活跃开发者", "Active Developers"), icon: Users },
    { value: "99.9%", label: t("服务可用性", "Service Uptime"), icon: BarChart3 },
    { value: "<100ms", label: t("平均延迟", "Avg Latency"), icon: Zap },
    { value: "24/7", label: t("技术支持", "Tech Support"), icon: MessageSquare },
  ]

  const useCases = [
    { title: t("代码生成", "Code Gen"), icon: Sparkles },
    { title: t("代码审查", "Review"), icon: CheckCircle },
    { title: t("Bug 修复", "Bug Fix"), icon: Cpu },
    { title: t("重构优化", "Refactor"), icon: Layers },
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
        <div className="absolute top-0 left-1/4 w-[1000px] h-[1000px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute top-1/3 right-0 w-[800px] h-[800px] bg-gradient-to-br from-violet-500/15 to-purple-500/15 rounded-full blur-[130px] animate-pulse-slow animation-delay-2000" />
        <div className="absolute bottom-0 left-0 w-[900px] h-[900px] bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-[130px] animate-pulse-slow animation-delay-4000" />
      </div>

      <Navigation />

      {/* Hero Section - 更宽 */}
      <section className="relative pt-24 pb-12 px-4 sm:px-6">
        <div className="relative max-w-[1400px] mx-auto">
          {/* Badge */}
          <div className={`flex justify-center mb-6 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <Link
              href="/docs"
              className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/10 via-cyan-500/10 to-emerald-500/10 border border-gray-200/50 dark:border-gray-700/50 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {t("Claude 官方 API 直连服务", "Claude Official API Direct Service")}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* 主要内容区域 - 两栏布局 */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* 左侧文字 */}
            <div className={`space-y-6 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]">
                <span className="text-gray-900 dark:text-white">Claude Code</span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                  {t("国内直连", "Direct Access")}
                </span>
              </h1>

              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
                {t(
                  "官方 API 直连，无需翻墙。让世界最强的 AI 编程助手，成为你的编程伙伴",
                  "Official API direct connection, no VPN needed. The world's best AI coding assistant",
                )}
              </p>

              {/* Key Points */}
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {[
                  t("官方直连", "Official"),
                  t("无需梯子", "No VPN"),
                  t("稳定高速", "Fast"),
                  t("企业安全", "Secure"),
                ].map((point, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />
                  <span className="relative">{t("立即开始", "Get Started")}</span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all"
                >
                  {t("查看文档", "View Docs")}
                </Link>
              </div>
            </div>

            {/* 右侧终端动画 */}
            <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <TerminalAnimation />
            </div>
          </div>

          {/* Stats Row - 响应式网格 */}
          <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-16 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group text-center p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mx-auto mb-1.5 sm:mb-2 group-hover:text-cyan-500 transition-colors" />
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Advantages - 更宽 */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-4">
              <Rocket className="w-4 h-4" />
              {t("核心优势", "Core Advantages")}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t("为什么选择我们？", "Why Choose Us?")}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreAdvantages.map((advantage, index) => (
              <div
                key={index}
                className="group relative p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:border-transparent transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Glow effect */}
                <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${advantage.gradient} opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`} />
                <div className="absolute inset-0 rounded-2xl bg-white dark:bg-gray-900 transition-colors" />

                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${advantage.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg`}>
                    <advantage.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{advantage.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{advantage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features + Use Cases - 更宽的两栏 */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-900/80 dark:to-gray-950">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Features - 占1列 */}
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-full text-sm font-medium text-violet-600 dark:text-violet-400 mb-4">
                  <Terminal className="w-4 h-4" />
                  Claude Code
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {t("为 Claude Code 而生", "Built for Claude Code")}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`group relative p-5 rounded-xl cursor-pointer transition-all duration-300 ${
                      activeFeature === index
                        ? 'bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 shadow-xl scale-[1.02]'
                        : 'bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all ${
                      activeFeature === index ? 'bg-white/10' : feature.bg
                    }`}>
                      <feature.icon className={`w-5 h-5 transition-colors ${
                        activeFeature === index ? 'text-white' : feature.color
                      }`} />
                    </div>
                    <h3 className={`font-bold mb-1 transition-colors ${
                      activeFeature === index ? 'text-white' : 'text-gray-900 dark:text-white'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-sm transition-colors ${
                      activeFeature === index ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Use Cases - 占1列 */}
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full text-sm font-medium text-cyan-600 dark:text-cyan-400 mb-4">
                  <Sparkles className="w-4 h-4" />
                  {t("应用场景", "Use Cases")}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {t("Claude Code 能做什么？", "What can Claude Code do?")}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {useCases.map((useCase, index) => (
                  <div
                    key={index}
                    className="group p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="w-10 h-10 mb-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/50 transition-colors">
                      <useCase.icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{useCase.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {index === 0 && t("自动生成高质量代码", "Auto-generate quality code")}
                      {index === 1 && t("智能审查代码问题", "Smart code review")}
                      {index === 2 && t("快速定位修复错误", "Quick bug fixing")}
                      {index === 3 && t("优化代码结构性能", "Optimize code structure")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 更宽 */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t("三步开始使用", "Start in 3 Steps")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              { step: "01", title: t("注册账号", "Sign Up"), desc: t("邮箱注册，获取 API Key", "Get your API Key"), icon: Users },
              { step: "02", title: t("配置环境", "Configure"), desc: t("一行命令完成配置", "One-line setup"), icon: Terminal },
              { step: "03", title: t("开始编程", "Code"), desc: t("享受极致编程体验", "Enjoy coding"), icon: Code2 },
            ].map((item, index) => (
              <div key={index} className="relative group">
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 left-full w-full h-px bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent -translate-y-1/2 -translate-x-1/2 z-0" />
                )}
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 hover:border-cyan-300 dark:hover:border-cyan-700 transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -top-3 left-5 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white text-xs font-bold">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                    <item.icon className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - 简洁设计 */}
      <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t("立即体验 Claude Code", "Try Claude Code Now")}
          </h2>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 md:mb-10 px-2">
            {t(
              "注册即享免费额度，无需信用卡。官方 API 直连，国内网络流畅访问",
              "Free credits on signup, no credit card required. Official API direct connection"
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-white rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400" />
              <span className="relative">{t("免费注册", "Sign Up Free")}</span>
              <ArrowRight className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <Link
              href="/pricing"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg transition-all"
            >
              {t("查看定价", "View Pricing")}
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
          <div className="flex flex-col md:flex-row md:justify-between gap-8">
            {/* 左侧区块 - 品牌 + 版权 */}
            <div className="flex flex-col justify-between">
              <div>
                <Link href="/" className="flex items-center gap-2.5 mb-4">
                  <img src="/ac-logo.png" alt="AiClaude" className="w-8 h-8 rounded-lg" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">AiClaude</span>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mb-6">
                  {t("Claude Code 官方 API 直连服务，为国内开发者提供稳定、高速的 AI 编程体验。", "Official Claude Code API direct connection service for developers.")}
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                © 2024 AiClaude. {t("保留所有权利", "All rights reserved.")}
              </div>
            </div>

            {/* 中间 - 导航链接 */}
            <div className="flex gap-8 sm:gap-12 lg:gap-16">
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
            <div className="flex flex-col justify-between text-left md:text-right">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{t("联系方式", "Contact")}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">support@aiclaude.net</p>
              </div>
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
