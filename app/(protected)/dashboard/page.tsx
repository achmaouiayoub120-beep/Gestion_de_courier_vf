"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { CourierState, Priority } from "@/lib/types"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import { Mail, Clock, CheckCircle2, XCircle, Archive } from "lucide-react"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCourriers: 0,
    byState: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [couriersRes, types, categories] = await Promise.all([
          api.getCouriers({ limit: 100 }),
          api.getTypes(),
          api.getCategories(),
        ])

        const courriers = couriersRes.data || []

        const byState: Record<string, number> = {}
        const byType: Record<string, number> = {}
        const byCategory: Record<string, number> = {}
        const byPriority: Record<string, number> = {}

        Object.values(CourierState).forEach((state) => {
          byState[state] = 0
        })
        Object.values(Priority).forEach((priority) => {
          byPriority[priority] = 0
        })

        types.forEach((t: any) => {
          byType[t.label] = 0
        })
        categories.forEach((c: any) => {
          byCategory[c.label] = 0
        })

        courriers.forEach((c: any) => {
          byState[c.state] = (byState[c.state] || 0) + 1
          if (c.priority) {
            byPriority[c.priority] = (byPriority[c.priority] || 0) + 1
          }
          const typeLabel = c.type?.label || "Inconnu"
          const catLabel = c.category?.label || "Inconnu"
          byType[typeLabel] = (byType[typeLabel] || 0) + 1
          byCategory[catLabel] = (byCategory[catLabel] || 0) + 1
        })

        setStats({
          totalCourriers: courriers.length,
          byState,
          byType,
          byCategory,
          byPriority,
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const stateData = Object.entries(stats.byState)
    .map(([state, count]) => ({ name: state, value: count }))
    .filter((data) => data.value > 0)

  const categoryData = Object.entries(stats.byCategory).map(([cat, count]) => ({
    name: cat,
    value: count,
  }))

  const typeData = Object.entries(stats.byType).map(([type, count]) => ({
    name: type,
    value: count,
  }))

  const COLORS = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
  ]

  const kpiCards = [
    { title: "Total Courriers", value: stats.totalCourriers, icon: Mail, color: "text-primary", bg: "bg-primary/10" },
    { title: "Nouveaux", value: stats.byState[CourierState.NEW] || 0, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "En Cours", value: stats.byState[CourierState.IN_PROGRESS] || 0, icon: Archive, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Traités", value: stats.byState[CourierState.TREATED] || 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Rejetés", value: stats.byState[CourierState.REJECTED] || 0, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  ]

  const hasData = stats.totalCourriers > 0

  const EmptyStateFallback = () => (
    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/30">
      <Mail className="w-10 h-10 mb-3 text-muted-foreground/40" />
      <p className="font-medium">Aucune donnée disponible</p>
      <p className="text-sm text-muted-foreground/60 mt-1">Les statistiques apparaîtront ici</p>
    </div>
  )

  return (
    <PageTransition>
      <div className="flex-1 space-y-6 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Bienvenue dans le système de gestion du courrier</p>
        </div>

        {/* KPI Cards */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {kpiCards.map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <motion.div key={kpi.title} variants={itemVariants}>
                <Card className="relative overflow-hidden hover:shadow-md transition-shadow duration-300 border-border/60">
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">{kpi.title}</p>
                        <p className="text-2xl md:text-3xl font-bold tracking-tight">{kpi.value}</p>
                      </div>
                      <div className={`p-2 rounded-xl ${kpi.bg}`}>
                        <Icon className={`w-4 h-4 md:w-5 md:h-5 ${kpi.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Charts */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
            <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm">Chargement des statistiques...</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <motion.div variants={itemVariants}>
                <Card className="border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Distribution par État</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasData ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={stateData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {stateData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyStateFallback />
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">Distribution par Catégorie</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasData ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyStateFallback />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="mt-4 md:mt-6">
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">Distribution par Type de Courrier</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasData ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={typeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyStateFallback />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
