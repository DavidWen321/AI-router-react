"use client"

import { useLanguage } from "@/lib/language-context"
import { Code, FileCode, FileText, BookOpen, Download, Key } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function DocsPage() {
  const { t } = useLanguage()

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
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
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
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
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
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-32 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-full text-sm font-medium">
              <BookOpen className="w-4 h-4" />
              {t("开发文档", "Development Documentation")}
            </div>
            <h1 className="text-5xl font-bold text-black">{t("Claude Code 使用指南", "Claude Code Usage Guide")}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t(
                "了解如何使用 Claude Code AI 编程助手来提高您的开发效率",
                "Learn how to use Claude Code AI programming assistant to improve your development efficiency",
              )}
            </p>
          </div>

          <div className="max-w-5xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-black mb-12">{t("快速开始", "Quick Start")}</h2>

            {/* Step 1: Install AiClaude */}
            <div className="mb-12 p-8 bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-2xl font-bold text-black">{t("安装 Claude Code", "Install Claude Code")}</h3>
              </div>





              <div>
                <h4 className="font-semibold text-black mb-3">{t("手动安装", "Manual Installation")}</h4>
                <p className="text-gray-600 text-sm mb-3">
                  {t("使用 npm 手动安装 Claude Code CLI 工具", "Use npm to manually install Claude Code CLI tool")}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                  <code className="text-gray-800">npm install -g @anthropic-ai/claude-code</code>
                </div>
              </div>
            </div>

            {/* Step 2: Configure Settings */}
            <div className="mb-12 p-8 bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-2xl font-bold text-black">{t("配置 Settings 文件", "Configure Settings File")}</h3>
              </div>

              <p className="text-gray-600 mb-6">
                {t(
                  "创建 ~/.claude/settings.json 文件并配置您的 API 密钥(~代表您的c盘的用户文件夹)",
                  "Create ~/.claude/settings.json file and configure your API key (~ represents your C drive user folder)",
                )}
              </p>

              <div className="mb-4 text-sm text-blue-600">~/.claude/settings.json</div>

              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm mb-4 overflow-x-auto">
                <pre className="text-gray-800">{`{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-api-key-here",
    "ANTHROPIC_BASE_URL": "https://aiclaude.online",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC":1
  },
  "permissions": {
    "allow": [],
    "deny": []
  }
}`}</pre>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">{t("获取 API Key", "Get API Key")}</h4>
                    <p className="text-blue-800 text-sm">
                      {t(
                        "您可以在用户控制台中找到您的 API Key，请妥善保管",
                        "You can find your API Key in the user console, please keep it safe",
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Configure Config File */}
            <div className="mb-12 p-8 bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-2xl font-bold text-black">{t("配置 Config 文件", "Configure Config File")}</h3>
              </div>

              <p className="text-gray-600 mb-6">
                {t(
                  "创建 ~/.claude/config.json 文件并配置主 API Key",
                  "Create ~/.claude/config.json file and configure primary API key",
                )}
              </p>

              <div className="mb-4 text-sm text-blue-600">~/.claude/config.json</div>

              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="text-gray-800">{`{
  "primaryApiKey": "AiClaude"
}`}</pre>
              </div>
            </div>

            {/* Step 4: Start Using */}
            <div className="p-8 bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <h3 className="text-2xl font-bold text-black">{t("开始使用", "Start Using")}</h3>
              </div>

              <p className="text-gray-600 mb-6">
                {t("在您的项目目录中运行 Claude Code 命令", "Run Claude Code commands in your project directory")}
              </p>

              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm">
                <div className="text-gray-500 mb-2">bash</div>
                <code className="text-gray-800">claude</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-black">{t("使用场景", "Use Cases")}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="p-8 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-16 h-16 ${useCase.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                  <useCase.icon className={`w-8 h-8 ${useCase.iconColor}`} />
                </div>
                <h3 className="text-2xl font-bold text-black mb-3">{useCase.title}</h3>
                <p className="text-gray-600 mb-6">{useCase.description}</p>
                <ul className="space-y-3">
                  {useCase.examples.map((example, eIndex) => (
                    <li key={eIndex} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-600 mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  )
}
