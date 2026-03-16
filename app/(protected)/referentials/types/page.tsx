"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import type { CourierType } from "@/lib/types"
import { Plus, Edit2, Trash2, Loader2, Package } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import { toast } from "sonner"

const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  show: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.3 },
  }),
}

export default function TypesPage() {
  const [types, setTypes] = useState<CourierType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({ label: "", description: "" })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.getTypes()
      setTypes(data)
    } catch (error) {
      console.error("Erreur chargement types:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleOpenDialog = (type?: CourierType) => {
    if (type) {
      setFormData({ label: type.label, description: type.description || "" })
      setEditingId(type.id)
    } else {
      setFormData({ label: "", description: "" })
      setEditingId(null)
    }
    setIsOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.label) { toast.error("Le libellé est obligatoire"); return }
    try {
      if (editingId) {
        await api.updateType(editingId, formData)
        toast.success("Type modifié avec succès")
      } else {
        await api.createType(formData)
        toast.success("Type créé avec succès")
      }
      loadData()
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr ?")) {
      try {
        await api.deleteType(id)
        toast.success("Type supprimé")
        loadData()
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression")
      }
    }
  }

  return (
    <PageTransition>
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Types de Courrier</h1>
            <p className="text-muted-foreground text-sm mt-1">Gérez les types de courrier (Ex: Entrant, Sortant...)</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2 text-sm rounded-xl shadow-sm shadow-primary/20">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouveau Type</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier" : "Créer"} un Type</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Libellé *</label>
                  <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Ex: Entrant, Sortant, Interne..." className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Description</label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description du type" className="rounded-xl resize-none" />
                </div>
                <Button onClick={handleSubmit} className="w-full rounded-xl">{editingId ? "Modifier" : "Créer"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {types.map((type, i) => (
              <motion.div key={type.id} custom={i} variants={itemVariants} initial="hidden" animate="show">
                <Card className="border-border/60 hover:shadow-md hover:border-border transition-all duration-300 group">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-primary/10">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <CardTitle className="text-base">{type.label}</CardTitle>
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(type)} className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10 hover:text-primary">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(type.id)} className="h-7 w-7 p-0 rounded-lg hover:bg-red-500/10 hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{type.description || "—"}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {types.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                <Package className="w-10 h-10 mb-2 text-muted-foreground/30" />
                <p className="font-medium">Aucun type défini</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Créez votre premier type</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
