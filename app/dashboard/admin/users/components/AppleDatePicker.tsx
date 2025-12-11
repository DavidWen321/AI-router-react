/**
 * Apple风格日期选择器组件
 */

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface AppleDatePickerProps {
  value: string // YYYY-MM-DD 格式
  onChange: (date: string) => void
  onClose: () => void
}

export function AppleDatePicker({ value, onChange, onClose }: AppleDatePickerProps) {
  const { t } = useLanguage()

  // 解析当前日期或使用今天
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date()
    try {
      return new Date(dateStr)
    } catch {
      return new Date()
    }
  }

  const [currentDate, setCurrentDate] = useState<Date>(parseDate(value))
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? parseDate(value) : null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 获取月份的天数
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  // 获取月份第一天是星期几（0=周日, 1=周一...）
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDayOfWeek = getFirstDayOfMonth(year, month)

  // 生成日历数据
  const calendarDays: (number | null)[] = []

  // 填充前面的空白
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // 填充实际的日期
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const monthNames = [
    t("1月", "January"),
    t("2月", "February"),
    t("3月", "March"),
    t("4月", "April"),
    t("5月", "May"),
    t("6月", "June"),
    t("7月", "July"),
    t("8月", "August"),
    t("9月", "September"),
    t("10月", "October"),
    t("11月", "November"),
    t("12月", "December"),
  ]

  const weekDays = [t("日", "Sun"), t("一", "Mon"), t("二", "Tue"), t("三", "Wed"), t("四", "Thu"), t("五", "Fri"), t("六", "Sat")]

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const selected = new Date(year, month, day)
    setSelectedDate(selected)
  }

  const handleConfirm = () => {
    if (selectedDate) {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const day = String(selectedDate.getDate()).padStart(2, "0")
      onChange(`${year}-${month}-${day}`)
    }
    onClose()
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    )
  }

  const isSelected = (day: number) => {
    if (!selectedDate) return false
    return (
      day === selectedDate.getDate() &&
      month === selectedDate.getMonth() &&
      year === selectedDate.getFullYear()
    )
  }

  return (
    <div className="absolute left-0 right-0 bottom-full mb-2 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {year}年 {monthNames[month]}
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={index} className="h-9" />
              }

              const today = isToday(day)
              const selected = isSelected(day)

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`
                    h-9 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      selected
                        ? "bg-blue-500 text-white shadow-md scale-105"
                        : today
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-all duration-200"
          >
            {t("取消", "Cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 px-3 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all duration-200"
          >
            {t("确定", "Confirm")}
          </button>
        </div>
      </div>
    </div>
  )
}
