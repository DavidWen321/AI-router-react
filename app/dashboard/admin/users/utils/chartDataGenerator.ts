/**
 * 用户管理页面 - 图表数据生成器
 */

import type { TimePeriod, ChartDataPoint, ChartStats, UserData } from "../types"

/**
 * 生成图表数据
 */
export function generateChartData(timePeriod: TimePeriod): ChartDataPoint[] {
  if (timePeriod === "today") {
    // Generate 24 hours of data
    return Array.from({ length: 24 }, (_, i) => ({
      time: `${i.toString().padStart(2, "0")}:00`,
      usageRate: Math.random() * 15 + 10, // Random between 10-25%
    }))
  } else if (timePeriod === "7days") {
    // Generate 7 days of data
    const today = new Date()
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (6 - i))
      return {
        time: `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`,
        usageRate: Math.random() * 10 + 10, // Random between 10-20%
      }
    })
  } else if (timePeriod === "15days") {
    // Generate 15 days of data
    const today = new Date()
    return Array.from({ length: 15 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (14 - i))
      return {
        time: `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`,
        usageRate: Math.random() * 12 + 8, // Random between 8-20%
      }
    })
  } else {
    // Generate 30 days of data
    const today = new Date()
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today)
      date.setDate(date.getDate() - (29 - i))
      return {
        time: `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`,
        usageRate: Math.random() * 15 + 5, // Random between 5-20%
      }
    })
  }
}

/**
 * 获取图表统计信息
 */
export function getChartStats(users: UserData[]): ChartStats {
  const chartData = generateChartData("7days") // Always use 7 days for overall stats
  const rates = chartData.map((d) => d.usageRate)
  const maxRate = Math.max(...rates)
  const minRate = Math.min(...rates)
  const currentRate = rates[rates.length - 1]

  // Find peak time/day
  const maxIndex = rates.indexOf(maxRate)
  const peakTime = chartData[maxIndex].time

  // Find user with highest usage
  const highestUsageUser = users.reduce((prev, current) =>
    (current.todayUsage > prev.todayUsage ? current : prev),
    users[0] || { todayUsage: 0 } as UserData
  )

  return {
    peakTime,
    peakRate: maxRate,
    maxRate,
    minRate,
    currentRate,
    highestUsageUser,
  }
}
