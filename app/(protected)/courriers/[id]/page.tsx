"use client"

import { useEffect, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { Courier, Entity, User } from "@/lib/types"
import { CourierState } from "@/lib/types"
import { Download, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CourrierDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [courrier, setCourrier] = useState<Courier | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [courrierRes, entitiesRes] = await Promise.all([
        api.getCourierById(id),
        api.getEntities()
      ])
      setCourrier(courrierRes)
      setEntities(entitiesRes)
    } catch (error) {
      console.error("Erreur chargement détails courrier:", error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleStateChange = async (newState: string) => {
    if (!courrier) return
    setIsUpdating(true)
    try {
      await api.updateCourierState(id, newState)
      await loadData() // Reload to get fresh history and state
    } catch (error: any) {
      alert(error.message || "Erreur lors de la mise à jour de l'état")
    } finally {
      setIsUpdating(false)
    }
  }

  const getEntityLabel = (entityId?: string | any) => {
    if (!entityId) return "Non assigné"
    if (typeof entityId === "object" && entityId !== null) return entityId.label || "Inconnu"
    return entities.find((e) => e.id === entityId)?.label || "Inconnu"
  }

  const getStateColor = (state: CourierState) => {
    switch (state) {
      case CourierState.NEW:
        return "bg-blue-100 text-blue-800"
      case CourierState.IN_PROGRESS:
        return "bg-yellow-100 text-yellow-800"
      case CourierState.TREATED:
        return "bg-green-100 text-green-800"
      case CourierState.REJECTED:
        return "bg-red-100 text-red-800"
      case CourierState.ARCHIVED:
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!courrier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Courrier non trouvé</p>
        <Link href="/courriers">
          <Button variant="outline">Retour à la liste</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <Link href="/courriers">
        <Button variant="outline" className="gap-2 bg-transparent">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{courrier.subject}</h1>
        <p className="text-muted-foreground">Référence: {courrier.reference}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Détails généraux */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Type</label>
                  <p className="text-sm font-medium">{typeof courrier.type === "object" ? (courrier.type as any).label : courrier.type}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Catégorie</label>
                  <p className="text-sm font-medium">{typeof courrier.category === "object" ? (courrier.category as any).label : courrier.category}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Priorité</label>
                  <p className="text-sm font-medium">{courrier.priority}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Destination</label>
                  <p className="text-sm font-medium">{getEntityLabel(courrier.toEntity)}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <p className="text-sm mt-2">{courrier.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pièces jointes */}
          {courrier.attachments && courrier.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pièces Jointes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courrier.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{(attachment.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <a href={attachment.url} download={attachment.name} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historique */}
          <Card>
            <CardHeader>
              <CardTitle>Historique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {courrier.history && courrier.history.length > 0 ? (
                  courrier.history.sort((a,b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()).map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`px-3 py-1 rounded text-xs font-medium ${getStateColor(entry.state)}`}>
                        {entry.state}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{new Date(entry.changedAt).toLocaleString()}</p>
                        {entry.notes && <p className="text-sm mt-1">{entry.notes}</p>}
                        <p className="text-xs text-muted-foreground italic">Par: {typeof entry.changedBy === "object" ? (entry.changedBy as any)?.name : entry.changedBy}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun historique disponible</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - État et actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>État du Courrier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-bold w-fit ${getStateColor(courrier.state)}`}
                >
                  {courrier.state}
                </span>
                {isUpdating && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Mise à jour...</div>}
              </div>

              {courrier.state !== CourierState.TREATED && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Changer l'état</label>
                  <Select value={courrier.state} onValueChange={handleStateChange} disabled={isUpdating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CourierState).map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Créé par</label>
                <p>{typeof courrier.createdBy === "object" ? (courrier.createdBy as any)?.name : courrier.createdBy}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Date de création</label>
                <p>{new Date(courrier.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">ID</label>
                <p className="font-mono text-xs">{courrier.id}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
