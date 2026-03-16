"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import type { Courier, Attachment, CourierType, Category, Entity } from "@/lib/types"
import { CourierState, Priority } from "@/lib/types"
import { Upload, X, Loader2, ArrowLeft, FileText } from "lucide-react"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"
import { toast } from "sonner"

export default function CreateCourrierPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    typeId: "",
    categoryId: "",
    toEntityId: "",
    subject: "",
    description: "",
    priority: Priority.NORMAL,
  })

  const [types, setTypes] = useState<CourierType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [entities, setEntities] = useState<Entity[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [typesData, categoriesData, entitiesData] = await Promise.all([
          api.getTypes(),
          api.getCategories(),
          api.getEntities(),
        ])
        setTypes(typesData)
        setCategories(categoriesData)
        setEntities(entitiesData)
      } catch (error) {
        console.error("Erreur lors du chargement des référentiels:", error)
        toast.error("Erreur lors du chargement des données")
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const newAttachment: Attachment = {
            id: Date.now().toString(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: event.target?.result as string,
            uploadedAt: new Date(),
          }
          setAttachments((prev) => [...prev, newAttachment])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!formData.typeId || !formData.categoryId || !formData.toEntityId || !formData.subject) {
        toast.error("Veuillez remplir tous les champs obligatoires")
        setIsSubmitting(false)
        return
      }

      await api.createCourier({
        subject: formData.subject,
        description: formData.description,
        toEntityId: formData.toEntityId,
        categoryId: formData.categoryId,
        typeId: formData.typeId,
        priority: formData.priority,
      })

      toast.success("Courrier créé avec succès")
      router.push("/courriers")
    } catch (error: any) {
      console.error("Erreur creation courrier:", error)
      toast.error(error.message || "Erreur lors de la création du courrier")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement des formulaires...</p>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-5 p-4 md:p-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0 rounded-xl">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Créer un Courrier</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Ajoutez un nouveau courrier au système</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Informations Générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Type *</label>
                    <Select value={formData.typeId} onValueChange={(value) => handleSelectChange("typeId", value)}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Catégorie *</label>
                    <Select value={formData.categoryId} onValueChange={(value) => handleSelectChange("categoryId", value)}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Destination (Entité) *</label>
                    <Select value={formData.toEntityId} onValueChange={(value) => handleSelectChange("toEntityId", value)}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Sélectionnez une entité" />
                      </SelectTrigger>
                      <SelectContent>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id}>{entity.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground/80">Priorité</label>
                    <Select value={formData.priority} onValueChange={(value) => handleSelectChange("priority", value)}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Priority).map((priority) => (
                          <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Sujet *</label>
                  <Input
                    name="subject"
                    placeholder="Entrez le sujet du courrier"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="h-10 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground/80">Description</label>
                  <Textarea
                    name="description"
                    placeholder="Entrez la description détaillée du courrier"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="rounded-xl resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Attachments */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Pièces Jointes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 hover:bg-primary/[0.02] transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">Cliquez pour télécharger</span>
                    <p className="text-xs text-muted-foreground mt-1">ou glissez-déposez vos fichiers (PDF, images)</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border/40">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">{(attachment.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(attachment.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="flex gap-3 justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-xl">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-xl shadow-sm shadow-primary/20">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Création..." : "Créer le Courrier"}
            </Button>
          </motion.div>
        </form>
      </div>
    </PageTransition>
  )
}
