"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "@/components/sidebar-context"
import { useAuth } from "@/components/auth-provider"
import {
  Settings,
  Activity,
  UserPlus,
  Cpu,
  Radio,
  List,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react"

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: "Monitoramento",
    icon: Activity,
    children: [
      {
        title: "Máquinas",
        href: "/maquinas-monitoramento",
        icon: List,
      },
      {
        title: "Logs de Clusters",
        href: "/logs",
        icon: FileText,
      },
    ],
  },
  {
    title: "Hermes AI",
    href: "/hermes",
    icon: Bot,
  },
  {
    title: "Gerenciamento",
    icon: Settings,
    children: [
      {
        title: "Usuários",
        href: "/usuarios",
        icon: UserPlus,
      },
      {
        title: "Máquinas",
        href: "/maquinas",
        icon: Settings,
      },
      {
        title: "Dispositivos",
        href: "/dispositivos",
        icon: Cpu,
      },
      {
        title: "Gateways",
        href: "/gateways",
        icon: Radio,
      },
    ],
  },
]

function NavItemComponent({ item, level = 0, isCollapsed }: { item: NavItem; level?: number; isCollapsed?: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const Icon = item.icon
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href === pathname

  if (hasChildren) {
    const buttonContent = (
      <button
        onClick={() => !isCollapsed && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-200",
          "hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm hover:scale-[1.02]",
          "active:scale-[0.98]",
          level === 0 && "text-foreground",
          isCollapsed ? "justify-center px-2 py-2.5" : "justify-between px-4 py-2.5",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="w-4 h-4 text-primary" />
          </div>
          {!isCollapsed && <span>{item.title}</span>}
        </div>
        {!isCollapsed && (
          <div className={cn("transition-transform duration-300", isOpen && "rotate-180")}>
            <ChevronDown className="w-4 h-4" />
          </div>
        )}
      </button>
    )

    return (
      <div>
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
              <TooltipContent side="right" className="font-semibold">
                {item.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          buttonContent
        )}
        {!isCollapsed && (
          <div
            className={cn(
              "ml-4 mt-1 space-y-1 border-l-2 border-border/50 pl-3 overflow-hidden transition-all duration-300",
              isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            {item.children?.map((child, index) => (
              <NavItemComponent key={index} item={child} level={level + 1} isCollapsed={isCollapsed} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const linkContent = (
    <Link
      href={item.href || "#"}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200",
        "hover:shadow-sm hover:scale-[1.02] active:scale-[0.98]",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        isCollapsed ? "justify-center px-2 py-2.5" : "px-4 py-2.5",
      )}
    >
      {isActive && !isCollapsed && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-foreground rounded-r-full" />
      )}
      <div
        className={cn(
          "p-1.5 rounded-lg transition-all duration-200",
          isActive ? "bg-primary-foreground/20" : "bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110",
        )}
      >
        <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-primary")} />
      </div>
      {!isCollapsed && <span className="font-medium">{item.title}</span>}
    </Link>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-semibold">
            {item.title}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return linkContent
}

export function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isCollapsed, toggleSidebar } = useSidebar()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    setIsMobileOpen(false)
  }

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U"

  const sidebarContent = (
    <>
      <div
        className={cn(
          "border-b border-border/50 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300",
          isCollapsed ? "p-3" : "p-6",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl bg-gradient-to-br from-accent/50 to-accent/20 border border-border/30 shadow-sm transition-all duration-300",
            isCollapsed ? "flex-col p-2" : "p-4",
          )}
        >
          <div className="relative flex-shrink-0">
            <div className="p-2.5 bg-primary/10 rounded-full ring-2 ring-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{userInitials}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-base font-bold text-foreground truncate">{user?.name || "Usuário"}</p>
              <p className="text-sm text-muted-foreground font-medium truncate">{user?.email || "email@exemplo.com"}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-6">
        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <NavItemComponent key={index} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </ScrollArea>

      <div
        className={cn(
          "border-t border-border/50 space-y-3 bg-gradient-to-t from-muted/20 to-transparent transition-all duration-300",
          isCollapsed ? "p-2" : "p-4",
        )}
      >
        {isCollapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="icon"
                  className={cn(
                    "w-full rounded-xl transition-all duration-200",
                    "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 hover:shadow-sm hover:scale-[1.02]",
                    "active:scale-[0.98] bg-transparent border-border/50",
                  )}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-semibold">
                Sair
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button
            onClick={handleLogout}
            variant="outline"
            className={cn(
              "w-full justify-start gap-3 text-sm font-semibold rounded-xl transition-all duration-200",
              "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 hover:shadow-sm hover:scale-[1.02]",
              "active:scale-[0.98] bg-transparent border-border/50",
            )}
          >
            <div className="p-1.5 rounded-lg bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span>Sair</span>
          </Button>
        )}

        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-accent/30">
              <p className="text-xs font-semibold text-muted-foreground">Tema</p>
              <ThemeToggle />
            </div>
            <p className="text-xs text-muted-foreground text-center font-medium pt-1">IoTurn © 2025</p>
          </>
        )}
      </div>
    </>
  )

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed top-4 left-4 z-50 lg:hidden rounded-xl shadow-lg transition-all duration-200",
          "hover:shadow-xl hover:scale-105 active:scale-95 bg-card border-border",
        )}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/90 backdrop-blur-md z-40 lg:hidden transition-all duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-border/50 lg:bg-card lg:shadow-xl transition-all duration-300",
          isCollapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        {sidebarContent}

        <Button
          onClick={toggleSidebar}
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -right-4 top-8 z-10 h-7 w-7 rounded-full border-2 border-border bg-card shadow-lg transition-all duration-200",
            "hover:shadow-xl hover:scale-110 hover:border-primary/50 active:scale-95",
          )}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </Button>
      </aside>

      {/* Sidebar - Mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border/50 bg-card shadow-2xl transition-transform duration-300 lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
