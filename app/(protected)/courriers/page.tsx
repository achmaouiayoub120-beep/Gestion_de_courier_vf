"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Courier, Entity, CourierType, Category } from "@/lib/types"
import { CourierState, Priority, Role } from "@/lib/types"
import { Plus, Eye, Edit2, Trash2, Download, Calendar, Loader2, Search, Filter } from "lucide-react"
import Link from "next/link"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import { toast } from "sonner"

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
}

export default function CourriersPage() {
  const { user } = useAuth()
  const [courriers, setCourriers] = useState<any[]>([])
  const [filteredCourriers, setFilteredCourriers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [entities, setEntities] = useState<Entity[]>([])
  const [types, setTypes] = useState<CourierType[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [search, setSearch] = useState("")
  const [filterState, setFilterState] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterEntity, setFilterEntity] = useState("all")
  const [sortBy, setSortBy] = useState("date_desc")

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [courriersRes, entitiesRes, typesRes, categoriesRes] = await Promise.all([
        api.getCouriers({ limit: 50 }),
        api.getEntities(),
        api.getTypes(),
        api.getCategories(),
      ])

      setCourriers(courriersRes.data || [])
      setEntities(entitiesRes)
      setTypes(typesRes)
      setCategories(categoriesRes)
    } catch (error) {
      console.error("Erreur chargement courriers:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    let filtered = [...courriers]

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.reference.toLowerCase().includes(search.toLowerCase()) ||
          c.subject.toLowerCase().includes(search.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(search.toLowerCase())),
      )
    }

    if (filterState !== "all") filtered = filtered.filter((c) => c.state === filterState)
    if (filterType !== "all") filtered = filtered.filter((c) => c.typeId === filterType)
    if (filterCategory !== "all") filtered = filtered.filter((c) => c.categoryId === filterCategory)
    if (filterPriority !== "all") filtered = filtered.filter((c) => c.priority === filterPriority)
    if (filterEntity !== "all") filtered = filtered.filter((c) => c.toEntityId === filterEntity)

    switch (sortBy) {
      case "date_asc":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "date_desc":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "priority":
        const priorityOrder = { VERY_URGENT: 0, URGENT: 1, NORMAL: 2 }
        filtered.sort(
          (a, b) =>
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 3),
        )
        break
    }

    setFilteredCourriers(filtered)
  }, [courriers, search, filterState, filterType, filterCategory, filterPriority, filterEntity, sortBy])

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce courrier ?")) {
      try {
        await api.deleteCourier(id)
        toast.success("Courrier supprimé avec succès")
        loadData()
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression")
      }
    }
  }

  const handleExportCSV = () => {
    const csv = [
      ["Référence", "Sujet", "Type", "Catégorie", "État", "Priorité", "Destination", "Date", "Créé par"],
      ...filteredCourriers.map((c) => [
        c.reference,
        c.subject,
        c.type?.label || "N/A",
        c.category?.label || "N/A",
        c.state,
        c.priority,
        c.toEntity?.label || "N/A",
        new Date(c.createdAt).toLocaleDateString(),
        c.createdBy?.name || "N/A",
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `courriers_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    toast.success("Export CSV téléchargé")
  }

  const getStateColor = (state: CourierState) => {
    switch (state) {
      case CourierState.NEW:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case CourierState.IN_PROGRESS:
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      case CourierState.TREATED:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      case CourierState.REJECTED:
        return "bg-red-500/10 text-red-600 dark:text-red-400"
      case CourierState.ARCHIVED:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400"
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400"
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.NORMAL:
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case Priority.URGENT:
        return "bg-orange-500/10 text-orange-600 dark:text-orange-400"
      case Priority.VERY_URGENT:
        return "bg-red-500/10 text-red-600 dark:text-red-400"
      default:
        return "bg-slate-500/10 text-slate-600"
    }
  }

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case Priority.VERY_URGENT:
        return "!!!!"
      case Priority.URGENT:
        return "!!!"
      default:
        return "!"
    }
  }

  const hasFilters =
    filterState !== "all" || search !== "" || filterType !== "all" || filterCategory !== "all" || filterPriority !== "all"

  return (
    <PageTransition>
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Courriers</h1>
            <p className="text-muted-foreground text-sm mt-1">Gestion de vos courriers internes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2 text-sm">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exporter CSV</span>
            </Button>
            {(user?.role === Role.AGENT ||
              user?.role === Role.CHEF ||
              user?.role === Role.ADMIN ||
              user?.role === Role.SUPER_ADMIN) && (
              <Link href="/courriers/create">
                <Button className="gap-2 text-sm shadow-sm shadow-primary/20">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nouveau Courrier</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5">
              <div className="col-span-2 lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Référence, sujet..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-sm rounded-xl"
                  />
                </div>
              </div>
              <div>
                <Select value={filterState} onValueChange={setFilterState}>
                  <SelectTrigger className="h-9 text-sm rounded-xl">
                    <SelectValue placeholder="État" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous états</SelectItem>
                    {Object.values(CourierState).map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-9 text-sm rounded-xl">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-9 text-sm rounded-xl">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="h-9 text-sm rounded-xl">
                    <SelectValue placeholder="Priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {Object.values(Priority).map((priority) => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 text-sm rounded-xl">
                    <SelectValue placeholder="Tri" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Plus récent</SelectItem>
                    <SelectItem value="date_asc">Plus ancien</SelectItem>
                    <SelectItem value="priority">Priorité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setSearch("")
                  setFilterState("all")
                  setFilterType("all")
                  setFilterCategory("all")
                  setFilterPriority("all")
                  setFilterEntity("all")
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Courriers Table */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">
              Liste des courriers{" "}
              <span className="text-muted-foreground font-normal">({filteredCourriers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Chargement des courriers...</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Référence</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sujet</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Type</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">État</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Priorité</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Destination</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Date</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourriers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <Search className="w-8 h-8 text-muted-foreground/30" />
                            <p className="font-medium">Aucun courrier trouvé</p>
                            <p className="text-sm text-muted-foreground/60">Essayez de modifier vos filtres</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCourriers.map((courrier, i) => (
                        <motion.tr
                          key={courrier.id}
                          custom={i}
                          variants={rowVariants}
                          initial="hidden"
                          animate="show"
                          className="border-b border-border/40 hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono text-xs font-semibold text-primary">{courrier.reference}</td>
                          <td className="py-3 px-4">
                            <div className="max-w-xs truncate text-sm">{courrier.subject}</div>
                          </td>
                          <td className="py-3 px-4 text-xs hidden lg:table-cell">{courrier.type?.label}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getStateColor(courrier.state)}`}>
                              {courrier.state}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center hidden md:table-cell">
                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getPriorityColor(courrier.priority)}`}>
                              {getPriorityIcon(courrier.priority)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs hidden xl:table-cell">{courrier.toEntity?.label}</td>
                          <td className="py-3 px-4 text-xs whitespace-nowrap hidden md:table-cell">
                            {new Date(courrier.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center gap-0.5">
                              <Link href={`/courriers/${courrier.id}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600">
                                  <Eye className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                              {(user?.role === Role.AGENT || user?.role === Role.ADMIN || user?.role === Role.SUPER_ADMIN) && (
                                <Link href={`/courriers/${courrier.id}?edit=true`}>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-amber-500/10 hover:text-amber-600">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                </Link>
                              )}
                              {(user?.role === Role.SUPER_ADMIN || user?.role === Role.ADMIN) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(courrier.id)}
                                  className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {!isLoading && (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            {[
              { label: "Nouveaux", count: filteredCourriers.filter((c) => c.state === CourierState.NEW).length, color: "text-blue-500" },
              { label: "En Cours", count: filteredCourriers.filter((c) => c.state === CourierState.IN_PROGRESS).length, color: "text-amber-500" },
              { label: "Traités", count: filteredCourriers.filter((c) => c.state === CourierState.TREATED).length, color: "text-emerald-500" },
              { label: "Urgents", count: filteredCourriers.filter((c) => c.priority === Priority.URGENT || c.priority === Priority.VERY_URGENT).length, color: "text-red-500" },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/60">
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.count}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
