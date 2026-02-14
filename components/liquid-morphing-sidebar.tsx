"use client"

import * as React from "react"
import { motion, LayoutGroup } from "framer-motion"
import {
  Home,
  Inbox,
  Calendar,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react"

type SidebarItem = {
  id: string
  label: string
  icon: LucideIcon
}

export type { SidebarItem }

type NavItemProps = {
  item: SidebarItem
  active: boolean
  compact: boolean
  onClick: () => void
}

const DEFAULT_ITEMS: SidebarItem[] = [
  { id: "home", label: "Dashboard", icon: Home },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings },
]

function NavItem({ item, active, compact, onClick }: NavItemProps) {
  const Icon = item.icon

  return (
    <button
      type="button"
      onClick={onClick}
      title={item.label}
      className={`group relative flex h-11 w-full items-center overflow-hidden rounded-xl text-left transition-colors duration-200 ${
        compact ? "justify-center px-0" : "gap-3 px-3"
      } ${
        active ? "" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
      }`}
    >
      <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center">
        <Icon
          className={`h-4 w-4 ${
            active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
          }`}
        />
      </span>
      {!compact && (
        <span
          className={`relative z-10 text-sm font-medium tracking-[-0.01em] ${
            active ? "text-blue-600" : "text-gray-500"
          }`}
        >
          {item.label}
        </span>
      )}
    </button>
  )
}

export function Sidebar({
  items = DEFAULT_ITEMS,
  activeId: controlledActiveId,
  onActiveChange,
  initialActiveId,
  compact = false,
  className,
}: {
  items?: SidebarItem[]
  activeId?: string
  onActiveChange?: (nextActiveId: string) => void
  initialActiveId?: string
  compact?: boolean
  className?: string
}) {
  const reactId = React.useId().replace(/:/g, "")
  const bgLayoutId = `refined-active-bg-${reactId}`
  const indicatorLayoutId = `refined-active-indicator-${reactId}`

  const [internalActiveId, setInternalActiveId] = React.useState(
    initialActiveId ?? items[0]?.id ?? ""
  )

  const activeId = controlledActiveId ?? internalActiveId

  const handleActiveChange = (nextActiveId: string) => {
    if (controlledActiveId === undefined) {
      setInternalActiveId(nextActiveId)
    }
    onActiveChange?.(nextActiveId)
  }

  return (
    <LayoutGroup id={`liquid-sidebar-${reactId}`}>
      <div className={`h-full w-full border-r border-gray-100 bg-white ${compact ? "px-1.5 py-2.5" : "px-2 py-3"} ${className ?? ""}`}>
        <div className={compact ? "space-y-1" : "space-y-1.5"}>
          {items.map((item) => {
            const isActive = activeId === item.id

            return (
              <div key={item.id} className="relative">
                {isActive && (
                  <>
                    <motion.div
                      layoutId={bgLayoutId}
                      className="absolute inset-0 rounded-xl bg-blue-50"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                    <motion.div
                      layoutId={indicatorLayoutId}
                      className={`absolute left-0 ${compact ? "top-1 bottom-1" : "top-1.5 bottom-1.5"} w-1 rounded-r-full bg-blue-500`}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  </>
                )}

                <NavItem
                  item={item}
                  active={isActive}
                  compact={compact}
                  onClick={() => handleActiveChange(item.id)}
                />
              </div>
            )
          })}
        </div>
      </div>
    </LayoutGroup>
  )
}

export default Sidebar
