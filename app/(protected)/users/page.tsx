"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { User, Entity } from "@/lib/types"
import { Role } from "@/lib/types"
import { Plus, Edit2, Trash2, Loader2, Users as UsersIcon, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import { toast } from "sonner"

const rowVariants = {
  hidden: { opacity: 0, y: 6 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: Role.AGENT,
    password: "",
    entityId: "",
    isActive: true,
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersRes, entitiesRes] = await Promise.all([api.getUsers(), api.getEntities()])
      setUsers(usersRes)
      setEntities(entitiesRes)
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error)
      toast.error("Erreur lors du chargement")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setFormData({ name: user.name, email: user.email, role: user.role, password: "", entityId: user.entityId || "none", isActive: user.isActive })
      setEditingId(user.id)
    } else {
      setFormData({ name: "", email: "", role: Role.AGENT, password: "", entityId: "none", isActive: true })
      setEditingId(null)
    }
    setIsOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) { toast.error("Nom et email sont obligatoires"); return }

    try {
      const payload = { ...formData, entityId: formData.entityId === 'none' ? undefined : formData.entityId }

      if (editingId) {
        if (!payload.password) delete (payload as any).password
        await api.updateUser(editingId, payload)
        toast.success("Utilisateur modifié avec succès")
      } else {
        if (!formData.password) { toast.error("Le mot de passe est obligatoire pour un nouvel utilisateur"); return }
        await api.createUser(payload)
        toast.success("Utilisateur créé avec succès")
      }

      loadData()
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await api.deleteUser(id)
        toast.success("Utilisateur supprimé avec succès")
        loadData()
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression")
      }
    }
  }

  const getRoleLabel = (role: Role) => {
    const labels: Record<Role, string> = {
      [Role.SUPER_ADMIN]: "Super Admin",
      [Role.ADMIN]: "Admin",
      [Role.CHEF]: "Chef d'Entité",
      [Role.AGENT]: "Agent",
      [Role.AUDITOR]: "Auditeur",
    }
    return labels[role] || role
  }

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN: return "bg-purple-500/10 text-purple-600 dark:text-purple-400"
      case Role.ADMIN:       return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case Role.CHEF:        return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      case Role.AGENT:       return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      case Role.AUDITOR:     return "bg-slate-500/10 text-slate-600 dark:text-slate-400"
      default:               return "bg-slate-500/10 text-slate-600"
    }
  }

  return (
    <PageTransition>
      <div className="space-y-5 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Utilisateurs</h1>
            <p className="text-muted-foreground text-sm mt-1">Gérez les utilisateurs du système</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2 text-sm rounded-xl shadow-sm shadow-primary/20">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nouvel Utilisateur</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier" : "Créer"} un Utilisateur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Nom *</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Email *</label>
                  <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-10 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Rôle</label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as Role })}>
                    <SelectTrigger className="h-10 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.values(Role).map((role) => (
                        <SelectItem key={role} value={role}>{getRoleLabel(role as Role)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Entité</label>
                  <Select value={formData.entityId} onValueChange={(value) => setFormData({ ...formData, entityId: value })}>
                    <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Sélectionnez une entité" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune</SelectItem>
                      {entities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>{entity.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">
                    {editingId ? "Changer le mot de passe (optionnel)" : "Mot de passe *"}
                  </label>
                  <Input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="h-10 rounded-xl" />
                </div>
                <Button onClick={handleSubmit} className="w-full rounded-xl">{editingId ? "Modifier" : "Créer"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Utilisateurs ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rôle</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Entité</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Statut</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <motion.tr key={user.id} custom={i} variants={rowVariants} initial="hidden" animate="show" className="border-b border-border/40 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{user.name}</td>
                        <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getRoleColor(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs hidden lg:table-cell">
                          {user.entityId ? entities.find((e) => e.id === user.entityId)?.label : "-"}
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${user.isActive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-slate-500/10 text-slate-500"}`}>
                            {user.isActive ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center gap-0.5">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)} className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary">
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)} className="h-8 w-8 p-0 rounded-lg hover:bg-red-500/10 hover:text-red-500">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <UsersIcon className="w-10 h-10 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-muted-foreground font-medium">Aucun utilisateur trouvé</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  )
}
