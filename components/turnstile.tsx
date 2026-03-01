"use client"

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react"

// Cloudflare Turnstile Site Key
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""

export interface TurnstileRef {
  reset: () => void
}

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
 * Cloudflare Turnstile CAPTCHA component with ref-based reset support.
 *
 * Usage:
 *   const turnstileRef = useRef<TurnstileRef>(null)
 *   <Turnstile ref={turnstileRef} onVerify={...} />
 *   turnstileRef.current?.reset()
 */
export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(function Turnstile(
  { onVerify, onError, onExpire, theme = "auto", size = "normal", className = "" },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoadedRef = useRef(false)

  // Expose reset method via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current)
        } catch (e) {
          // ignore reset errors
        }
      }
    },
  }))

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current || widgetIdRef.current) return

    if (!TURNSTILE_SITE_KEY) {
      console.warn("Turnstile Site Key not configured, skipping CAPTCHA")
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
      onError?.("CAPTCHA loading failed")
    }
  }, [onVerify, onError, onExpire, theme, size])

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      onVerify("")
      return
    }

    if (window.turnstile) {
      renderWidget()
      return
    }

    if (scriptLoadedRef.current) {
      window.onTurnstileLoad = renderWidget
      return
    }

    scriptLoadedRef.current = true
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
    script.async = true
    script.defer = true

    window.onTurnstileLoad = renderWidget

    document.head.appendChild(script)

    return () => {
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

  if (!TURNSTILE_SITE_KEY) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className={`flex justify-center ${className}`}
    />
  )
})
