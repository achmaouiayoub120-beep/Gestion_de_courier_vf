"use client"

import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Bell, Menu, ChevronRight, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { VoiceAssistant } from "@/components/voice-assistant"
import { useRouter } from "next/navigation"
import { useState, useRef, useEffect } from "react"

interface TopBarProps {
  onToggleSidebar: () => void
  isCollapsed: boolean
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/courriers": "Courriers",
  "/courriers/create": "Créer un Courrier",
  "/entities": "Entités Administratives",
  "/referentials/types": "Types de Courrier",
  "/referentials/categories": "Catégories",
  "/referentials/states": "États",
  "/users": "Utilisateurs",
  "/settings": "Paramètres",
}

function getPageTitle(pathname: string): string {
  // Try exact match first
  if (pageTitles[pathname]) return pageTitles[pathname]
  // Try matching by prefix for detail pages
  if (pathname.startsWith("/courriers/")) return "Détail du Courrier"
  return "Gestion du Courrier"
}

function getBreadcrumb(pathname: string): { label: string; href?: string }[] {
  const parts = pathname.split("/").filter(Boolean)
  const breadcrumbs: { label: string; href?: string }[] = []

  if (parts[0] === "dashboard") {
    breadcrumbs.push({ label: "Dashboard" })
  } else if (parts[0] === "courriers") {
    breadcrumbs.push({ label: "Courriers", href: "/courriers" })
    if (parts[1] === "create") {
      breadcrumbs.push({ label: "Créer" })
    } else if (parts[1]) {
      breadcrumbs.push({ label: "Détail" })
    }
  } else if (parts[0] === "entities") {
    breadcrumbs.push({ label: "Entités" })
  } else if (parts[0] === "referentials") {
    breadcrumbs.push({ label: "Référentiels" })
    if (parts[1]) {
      const labels: Record<string, string> = { types: "Types", categories: "Catégories", states: "États" }
      breadcrumbs.push({ label: labels[parts[1]] || parts[1] })
    }
  } else if (parts[0] === "users") {
    breadcrumbs.push({ label: "Utilisateurs" })
  } else if (parts[0] === "settings") {
    breadcrumbs.push({ label: "Paramètres" })
  }

  return breadcrumbs
}

export function TopBar({ onToggleSidebar, isCollapsed }: TopBarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const pageTitle = getPageTitle(pathname)
  const breadcrumbs = getBreadcrumb(pathname)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
    setShowUserMenu(false)
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 md:px-6 transition-colors duration-300">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-accent text-foreground/60 hover:text-foreground transition-colors"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-foreground transition-colors">
                    {crumb.label}
                  </a>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </div>
          {/* Page Title */}
          <h1 className="text-lg font-semibold text-foreground tracking-tight leading-tight">{pageTitle}</h1>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <VoiceAssistant />
        <ThemeToggle />

        {/* Notification Bell */}
        <button className="relative p-2.5 rounded-xl bg-accent hover:bg-accent/80 transition-colors group" title="Notifications">
          <Bell className="w-[18px] h-[18px] text-foreground/70 group-hover:text-foreground transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-foreground leading-tight truncate max-w-[120px]">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground leading-tight">{user?.role}</p>
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
