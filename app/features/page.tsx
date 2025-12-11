"use client"

import { useLanguage } from "@/lib/language-context"
import { Navigation } from "@/components/navigation"
import { Code, Search, Sparkles, Shield, Zap, FileCheck, Code2, RefreshCw, FileText } from "lucide-react"

export default function FeaturesPage() {
  const { t } = useLanguage()

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
      color: "bg-blue-500",
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
      color: "bg-green-500",
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
      color: "bg-purple-500",
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
      color: "bg-red-500",
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
      color: "bg-orange-500",
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
      color: "bg-cyan-500",
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navigation />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">{t("功能特性", "Features")}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t(
                "AiClaude 提供的强大 AI 功能，帮助您在每个开发阶段都能提高效率",
                "Powerful AI features provided by AiClaude to help you improve efficiency at every development stage",
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mb-16">
            <h1 className="font-bold text-gray-900 mb-4 text-5xl">{t("使用场景", "Use Cases")}</h1>
            <p className="text-xl text-gray-600">
              {t(
                "AiClaude 适用于各种开发场景，提高您的工作效率",
                "AiClaude is suitable for various development scenarios, improving your work efficiency",
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mb-6">
                  <useCase.icon className="w-8 h-8 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 mb-6">{useCase.subtitle}</p>
                <ul className="space-y-3">
                  {useCase.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
