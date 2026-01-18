import { Activity } from "lucide-react"

export default function Loading() {
  return (
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-cyan-200 dark:border-cyan-800 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin" />
            <Activity className="absolute inset-0 m-auto w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">加载渠道健康数据...</p>
        </div>
      </div>
    </div>
  )
}
