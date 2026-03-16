// @ts-nocheck
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Mail,
  PenSquare,
  Building2,
  Settings,
  LogOut,
  BarChart3,
  Users,
  Package,
  Layers,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react"
import { Role } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

interface SidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (v: boolean) => void
  isMobileOpen: boolean
  setIsMobileOpen: (v: boolean) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  /**
   * STRICT route matching:
   * - For /courriers → active ONLY when pathname === "/courriers"
   * - For /courriers/create → active ONLY when pathname === "/courriers/create"
   * - For other routes → exact match OR startsWith(path + "/") for nested routes
   */
  const isNavActive = (href: string): boolean => {
    // Strict exact-match routes (no startsWith)
    const strictExactRoutes = ["/courriers", "/courriers/create"]
    if (strictExactRoutes.includes(href)) {
      return pathname === href
    }
    // Default: exact match or nested child match
    return pathname === href || pathname.startsWith(href + "/")
  }

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.CHEF, Role.AGENT, Role.AUDITOR],
    },
    {
      label: "Courriers",
      icon: Mail,
      href: "/courriers",
      roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.CHEF, Role.AGENT, Role.AUDITOR],
    },
    {
      label: "Créer Courrier",
      icon: PenSquare,
      href: "/courriers/create",
      roles: [Role.AGENT, Role.CHEF, Role.ADMIN, Role.SUPER_ADMIN],
    },
    {
      label: "Entités",
      icon: Building2,
      href: "/entities",
      roles: [Role.SUPER_ADMIN, Role.ADMIN],
    },
    {
      label: "Types",
      icon: Package,
      href: "/referentials/types",
      roles: [Role.SUPER_ADMIN, Role.ADMIN],
    },
    {
      label: "Catégories",
      icon: Layers,
      href: "/referentials/categories",
      roles: [Role.SUPER_ADMIN, Role.ADMIN],
    },
    {
      label: "États",
      icon: BarChart3,
      href: "/referentials/states",
      roles: [Role.SUPER_ADMIN, Role.ADMIN],
    },
    {
      label: "Utilisateurs",
      icon: Users,
      href: "/users",
      roles: [Role.SUPER_ADMIN, Role.ADMIN],
    },
    {
      label: "Paramètres",
      icon: Settings,
      href: "/settings",
      roles: [Role.SUPER_ADMIN],
    },
  ]

  const canViewItem = (roles: Role[]) => {
    return user && roles.includes(user.role as Role)
  }

  const handleNavClick = () => {
    // Auto-close sidebar on mobile after navigation
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsMobileOpen(false)
    }
  }

  const sidebarWidth = isCollapsed ? "w-[72px]" : "w-64"

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img
            src="/estsb-logo.png"
            alt="EST SB"
            className={`flex-shrink-0 transition-all duration-300 ${isCollapsed ? "w-10 h-10" : "w-11 h-11"}`}
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                <h1 className="font-bold text-sm text-sidebar-foreground tracking-tight">EST Sidi Bennour</h1>
                <p className="text-[11px] text-sidebar-foreground/60 font-medium">Gestion du Courrier</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle (Desktop Only) */}
      <div className="hidden lg:flex justify-end px-2 py-2 border-b border-sidebar-border">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Close Button */}
      <div className="lg:hidden flex justify-end px-3 py-2 border-b border-sidebar-border">
        <button
          onClick={() => setIsMobileOpen(false)}
          className="p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (!canViewItem(item.roles)) return null
          const Icon = item.icon
          const active = isNavActive(item.href)

          return (
            <Link key={item.href} href={item.href} onClick={handleNavClick}>
              <div
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Active indicator bar */}
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary-foreground rounded-full -ml-3"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className={`flex-shrink-0 transition-all duration-200 ${isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]"}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-3 py-2.5 bg-sidebar-accent rounded-xl">
                <p className="text-[11px] text-sidebar-foreground/50 font-medium">Connecté en tant que</p>
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.name}</p>
                <p className="text-[11px] text-sidebar-foreground/50 font-medium">{user?.role}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full gap-2 text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl ${
            isCollapsed ? "justify-center px-2" : "justify-start"
          }`}
          title={isCollapsed ? "Déconnexion" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {/* @ts-expect-error React 19 type mismatch */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-sm"
              >
                Déconnexion
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 ease-in-out ${sidebarWidth}`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-sidebar-border lg:hidden z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
