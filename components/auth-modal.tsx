"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/language-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { authApi, userApi, ApiError } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState(["", "", "", "", "", ""])
  const [countdown, setCountdown] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (!open) {
      setStep("email")
      setEmail("")
      setCode(["", "", "", "", "", ""])
      setCountdown(0)
      setIsLoading(false)
    }
  }, [open])

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await authApi.sendCode(email)
      setStep("code")
      setCountdown(60)
      toast({
        title: t("验证码已发送", "Verification code sent"),
        description: t("请查收您的邮箱", "Please check your email"),
      })
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: t("发送失败", "Failed to send"),
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: t("发送失败", "Failed to send"),
          description: t("网络错误，请稍后重试", "Network error, please try again later"),
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const enteredCode = code.join("")
    if (enteredCode.length !== 6) return

    setIsLoading(true)
    try {
      // 1. Login with backend and get token response
      const loginResponse = await authApi.login(email, enteredCode)

      // 2. Store tokens and user info in localStorage（双Token机制）
      localStorage.setItem("accessToken", loginResponse.accessToken)
      localStorage.setItem("refreshToken", loginResponse.refreshToken)
      localStorage.setItem("userId", loginResponse.userId) // loginResponse.userId已经是string类型,无需toString()
      localStorage.setItem("userEmail", loginResponse.email)
      localStorage.setItem("userRole", loginResponse.role)
      localStorage.setItem("isLoggedIn", "true")
      // Also set isAdmin for backward compatibility
      localStorage.setItem("isAdmin", loginResponse.role === "admin" ? "true" : "false")

      // 3. Close modal immediately
      onOpenChange(false)

      // 4. Redirect based on role (before toast to avoid delay)
      if (loginResponse.role === "admin") {
        router.push("/dashboard/admin/users")
      } else {
        router.push("/dashboard")
      }

      // 6. Show success toast after redirect
      setTimeout(() => {
        toast({
          title: t("登录成功", "Login successful"),
          description: t("欢迎回来", "Welcome back"),
        })
      }, 100)
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: t("登录失败", "Login failed"),
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: t("登录失败", "Login failed"),
          description: t("网络错误，请稍后重试", "Network error, please try again later"),
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return

    setIsLoading(true)
    try {
      await authApi.sendCode(email)
      setCountdown(60)
      toast({
        title: t("验证码已重新发送", "Verification code resent"),
        description: t("请查收您的邮箱", "Please check your email"),
      })
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: t("发送失败", "Failed to send"),
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: t("发送失败", "Failed to send"),
          description: t("网络错误，请稍后重试", "Network error, please try again later"),
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">{t("登录", "Login")}</DialogTitle>
        </DialogHeader>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-6 pt-4">
            <p className="text-center text-gray-600 text-sm">
              {t("我们将向您的邮箱发送验证码进行登录", "We will send a verification code to your email for login")}
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("邮箱地址", "Email Address")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("请输入您的邮箱地址", "Please enter your email address")}
                className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                required
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("发送中...", "Sending...") : t("发送验证码", "Send Verification Code")}
            </button>

            <p className="text-center text-xs text-gray-500">
              {t(
                "登录即表示您同意我们的服务条款和隐私政策",
                "By logging in, you agree to our Terms of Service and Privacy Policy",
              )}
            </p>
          </form>
        ) : (
          <div className="space-y-6 pt-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                {t("已向", "Verification code sent to")} <span className="font-medium text-gray-900">{email}</span>{" "}
                {t("发送验证码", "")}
              </p>
              {countdown > 0 && (
                <p className="text-sm text-cyan-600">
                  {t("验证码有效期", "Code valid for")} {countdown} {t("秒", "seconds")}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{t("验证码", "Verification Code")}</label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className="w-12 h-12 text-center text-2xl font-bold text-gray-900 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all caret-cyan-600 disabled:opacity-50"
                    style={{ color: "#111827" }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleVerify}
              disabled={code.some((d) => !d) || isLoading}
              className="w-full py-3 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("验证中...", "Verifying...") : t("验证并登录", "Verify and Login")}
            </button>

            <div className="flex justify-between items-center text-sm">
              <button
                onClick={() => setStep("email")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                disabled={isLoading}
              >
                {t("返回修改邮箱", "Back to modify email")}
              </button>
              <button
                onClick={handleResend}
                disabled={countdown > 0 || isLoading}
                className="text-cyan-600 hover:text-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {countdown > 0 ? `${countdown}${t("秒后重发", "s to resend")}` : t("重新发送", "Resend")}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
