"use client"

import { useEffect, useRef, useCallback } from "react"

// Cloudflare Turnstile Site Key
// 在 .env.local 中配置: NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4XXXXXXXXXXXXXXXXX
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""

interface TurnstileProps {
  onVerify: (token: string) => void
  onError?: (error: string) => void
  onExpire?: () => void
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact"
  className?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

interface TurnstileRenderOptions {
  sitekey: string
  callback: (token: string) => void
  "error-callback"?: (error: string) => void
  "expired-callback"?: () => void
  theme?: "light" | "dark" | "auto"
  size?: "normal" | "compact"
  language?: string
}

/**
 * Cloudflare Turnstile 验证码组件
 *
 * 使用方法：
 * 1. 在Cloudflare Dashboard创建Turnstile应用，获取Site Key
 * 2. 在 .env.local 中配置: NEXT_PUBLIC_TURNSTILE_SITE_KEY=你的SiteKey
 * 3. 在需要验证的地方使用此组件
 *
 * 示例：
 * <Turnstile
 *   onVerify={(token) => setCaptchaToken(token)}
 *   onError={(error) => console.error(error)}
 * />
 */
export function Turnstile({
  onVerify,
  onError,
  onExpire,
  theme = "auto",
  size = "normal",
  className = "",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current || widgetIdRef.current) return

    // 如果没有配置Site Key，跳过渲染
    if (!TURNSTILE_SITE_KEY) {
      console.warn("Turnstile Site Key未配置，跳过验证码渲染")
      // 自动验证通过（开发模式）
      onVerify("")
      return
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: onVerify,
        "error-callback": onError,
        "expired-callback": onExpire,
        theme,
        size,
        language: "zh-CN",
      })
    } catch (error) {
      console.error("Turnstile render error:", error)
      onError?.("验证码加载失败")
    }
  }, [onVerify, onError, onExpire, theme, size])

  useEffect(() => {
    // 如果没有配置Site Key，直接返回
    if (!TURNSTILE_SITE_KEY) {
      onVerify("")
      return
    }

    // 检查脚本是否已加载
    if (window.turnstile) {
      renderWidget()
      return
    }

    // 如果脚本正在加载中
    if (scriptLoadedRef.current) {
      window.onTurnstileLoad = renderWidget
      return
    }

    // 加载Turnstile脚本
    scriptLoadedRef.current = true
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
    script.async = true
    script.defer = true

    window.onTurnstileLoad = renderWidget

    document.head.appendChild(script)

    return () => {
      // 清理
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          // ignore
        }
        widgetIdRef.current = null
      }
    }
  }, [renderWidget, onVerify])

  // 如果没有配置Site Key，不渲染任何内容
  if (!TURNSTILE_SITE_KEY) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`flex justify-center ${className}`}
    />
  )
}

/**
 * 重置Turnstile验证码（用于验证失败后重新验证）
 */
export function resetTurnstile(widgetId: string) {
  if (window.turnstile && widgetId) {
    window.turnstile.reset(widgetId)
  }
}
