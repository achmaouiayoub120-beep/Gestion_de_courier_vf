"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Bell, Building2 } from "lucide-react"
import { PageTransition } from "@/components/page-transition"
import { motion } from "framer-motion"

export default function SettingsPage() {
  return (
    <PageTransition>
      <div className="space-y-5 p-4 md:p-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground text-sm mt-1">Configurez les paramètres du système</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.3 }}>
            <Card className="border-border/60 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Général
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Nom de l'Institution</label>
                  <p className="text-sm font-medium">École Supérieure de Technologie Sidi Bennour</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Version du Système</label>
                  <p className="text-sm font-medium">1.0.0</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.3 }}>
            <Card className="border-border/60 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email pour les notifications</label>
                  <p className="text-sm font-medium">admin@estsb.edu</p>
                </div>
                <Button variant="outline" className="rounded-xl text-sm">Configurer les notifications</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
