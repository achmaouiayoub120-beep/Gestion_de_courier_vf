"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/sidebar"
import { TopBar } from "@/components/top-bar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Restore sidebar collapsed state from localStorage
    const saved = localStorage.getItem("sidebar-collapsed")
    if (saved === "true") setIsCollapsed(true)
  }, [])

  useEffect(() => {
    // Persist collapsed state
    if (isMounted) {
      localStorage.setItem("sidebar-collapsed", String(isCollapsed))
    }
  }, [isCollapsed, isMounted])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && isMounted) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router, isMounted])

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Chargement...</p>
        </div>
      </div>
    )
  }

  const handleToggleSidebar = () => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileOpen(!isMobileOpen)
    } else {
      setIsCollapsed(!isCollapsed)
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-64"
        }`}
      >
        <TopBar onToggleSidebar={handleToggleSidebar} isCollapsed={isCollapsed} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
