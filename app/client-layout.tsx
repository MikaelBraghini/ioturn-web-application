"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { AuthProvider } from "@/components/auth-provider"
import { usePathname } from "next/navigation"

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomepage = pathname === "/"
  const isAuthPage = pathname?.startsWith("/auth")
  const { isCollapsed } = useSidebar()

  return (
    <>
      {!isHomepage && !isAuthPage && <Sidebar />}
      <div
        className={
          !isHomepage && !isAuthPage ? `transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}` : ""
        }
      >
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </>
  )
}

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <AuthProvider>
          <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
      <Analytics />
    </>
  )
}

export default ClientLayout
