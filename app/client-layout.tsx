"use client"

import type React from "react"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider, useSidebar } from "@/components/sidebar-context"
import { usePathname } from "next/navigation"

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomepage = pathname === "/"
  const { isCollapsed } = useSidebar()

  return (
    <>
      {!isHomepage && <Sidebar />}
      <div className={!isHomepage ? `transition-all duration-300 ${isCollapsed ? "lg:pl-20" : "lg:pl-64"}` : ""}>
        <Suspense fallback={null}>{children}</Suspense>
      </div>
    </>
  )
}

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <SidebarProvider>
          <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
      </ThemeProvider>
      <Analytics />
    </>
  )
}

export default ClientLayout
