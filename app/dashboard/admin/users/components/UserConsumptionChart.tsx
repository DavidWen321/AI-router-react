"use client"

import { useMemo } from "react"
import { useLanguage } from "@/lib/language-context"
import type { MonthlyConsumptionData } from "../types"
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

interface UserConsumptionChartProps {
  data: MonthlyConsumptionData[]
}

function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`
}

export function UserConsumptionChart({ data }: UserConsumptionChartProps) {
  const { t } = useLanguage()

  const chartDisplayData = useMemo(() => {
    return data.map((item) => {
      const normalizedGrowthRate = Number(item.growthRate ?? 0)
      return {
        ...item,
        growthRateForChart: normalizedGrowthRate > 0 ? normalizedGrowthRate : 0,
      }
    })
  }, [data])

  return (
    <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">{t("月度额度消耗与增长率", "Monthly Consumption and Growth")}</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t("柱状图展示每月额度消耗，折线图展示月环比增长率", "Bar chart shows monthly consumption, line chart shows monthly growth rate")}
          </p>
        </div>

        {data.length === 0 ? (
          <div className="h-[280px] sm:h-[320px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            {t("暂无图表数据", "No chart data")}
          </div>
        ) : (
          <div className="h-[280px] sm:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartDisplayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-gray-600 dark:text-gray-400" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} className="text-gray-600 dark:text-gray-400" tickFormatter={(value) => `$${value}`} />
                <YAxis yAxisId="right" orientation="right" domain={[0, "auto"]} tick={{ fontSize: 11 }} className="text-gray-600 dark:text-gray-400" tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "增长率" || name === "Growth") {
                      return [formatPercent(Number(value)), name]
                    }
                    return [formatCurrency(Number(value)), name]
                  }}
                  labelFormatter={(label) => `${t("月份", "Month")}: ${label}`}
                />
                <Legend />
                <ReferenceLine yAxisId="right" y={0} stroke="#6b7280" strokeDasharray="4 4" />
                <Bar yAxisId="left" dataKey="totalConsumption" fill="#06b6d4" name={t("额度消耗", "Consumption")} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="growthRateForChart" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name={t("增长率", "Growth")} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
