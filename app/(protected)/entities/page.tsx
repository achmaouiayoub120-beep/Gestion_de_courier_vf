"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { Entity, User } from "@/lib/types"
import { Plus, Edit2, Trash2, Loader2, Building2, Mail as MailIcon, Phone, Code2, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import { toast } from "sonner"

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
}

export default function EntitiesPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    label: "",
    description: "",
    parentEntityId: "",
    chefId: "",
    email: "",
    phone: "",
    code: "",
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [entitiesRes, usersRes] = await Promise.all([
        api.getEntities(),
        api.getUsers(),
      ])
      setEntities(entitiesRes)
      setUsers(usersRes.filter(u => u.role === 'CHEF' || u.role === 'SUPER_ADMIN' || u.role === 'ADMIN'))
    } catch (error) {
      console.error("Erreur chargement entités:", error)
      toast.error("Erreur lors du chargement des entités")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleOpenDialog = (entity?: Entity) => {
    if (entity) {
      setFormData({
        label: entity.label || "",
        description: entity.description || "",
        parentEntityId: entity.parentEntityId || "none",
        chefId: entity.chefId || "none",
        email: entity.email || "",
        phone: entity.phone || "",
        code: entity.code || "",
      })
      setEditingId(entity.id)
    } else {
      setFormData({
        label: "",
        description: "",
        parentEntityId: "none",
        chefId: "none",
        email: "",
        phone: "",
        code: "",
      })
      setEditingId(null)
    }
    setIsOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.label) {
      toast.error("Le libellé est obligatoire")
      return
    }

    try {
      const payload = {
        ...formData,
        parentEntityId: formData.parentEntityId === 'none' ? undefined : formData.parentEntityId,
        chefId: formData.chefId === 'none' ? undefined : formData.chefId,
      }

      if (editingId) {
        await api.updateEntity(editingId, payload)
        toast.success("Entité modifiée avec succès")
      } else {
        await api.createEntity(payload)
        toast.success("Entité créée avec succès")
      }

      loadData()
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette entité ?")) {
      try {
        await api.deleteEntity(id)
        toast.success("Entité supprimée avec succès")
        loadData()
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression")
      }
    }
  }

  const getChefName = (chefId: string | undefined) => {
    if (!chefId) return "-"
    return users.find((u) => u.id === chefId)?.name || "Inconnu"
  }

  return (
    <PageTransition>
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Entités Administratives</h1>
            <p className="text-muted-foreground text-sm mt-1">Gérez les départements et services</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2 text-sm rounded-xl shadow-sm shadow-primary/20">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvelle Entité</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier" : "Créer"} une Entité</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Libellé *</label>
                  <Input value={formData.label} onChange={(e) => setFormData({ ...formData, label: e.target.value })} placeholder="Ex: Informatique" className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Description</label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description de l'entité" className="rounded-xl resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Entité Parente</label>
                  <Select value={formData.parentEntityId} onValueChange={(value) => setFormData({ ...formData, parentEntityId: value })}>
                    <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Sélectionnez une entité parente" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {entities.filter((e) => e.id !== editingId).map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>{entity.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Chef d'Entité</label>
                  <Select value={formData.chefId} onValueChange={(value) => setFormData({ ...formData, chefId: value })}>
                    <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Sélectionnez un chef" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Non assigné</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Email</label>
                    <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Téléphone</label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-10 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Code Interne</label>
                  <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="Ex: INFO" className="h-10 rounded-xl" />
                </div>
                <Button onClick={handleSubmit} className="w-full rounded-xl">{editingId ? "Modifier" : "Créer"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Liste des Entités ({entities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {entities.map((entity, i) => (
                  <motion.div
                    key={entity.id}
                    custom={i}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:bg-muted/50 hover:border-border transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <h3 className="font-semibold text-sm truncate">{entity.label}</h3>
                      </div>
                      {entity.description && (
                        <p className="text-xs text-muted-foreground mt-1 pl-6 truncate">{entity.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2 pl-6">
                        {entity.code && (
                          <span className="flex items-center gap-1">
                            <Code2 className="w-3 h-3" /> {entity.code}
                          </span>
                        )}
                        {entity.email && (
                          <span className="flex items-center gap-1">
                            <MailIcon className="w-3 h-3" /> {entity.email}
                          </span>
                        )}
                        {entity.chefId && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {getChefName(entity.chefId)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(entity)} className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(entity.id)} className="h-8 w-8 p-0 rounded-lg hover:bg-red-500/10 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
                {entities.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Building2 className="w-10 h-10 text-muted-foreground/30" />
                    <p className="font-medium text-muted-foreground">Aucune entité trouvée</p>
                    <p className="text-sm text-muted-foreground/60">Créez votre première entité</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
