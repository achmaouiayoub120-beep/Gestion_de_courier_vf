"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { AlertCircle, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Identifiants invalides")
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    "Suivi des courriers",
    "Workflow administratif",
    "Gestion centralisée",
  ]

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950">
      {/* Left Panel: Branding (Hidden on mobile, 50% width on desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-900 via-teal-800 to-emerald-900 flex-col justify-between p-12 text-white">
        {/* Animated ambient glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[100px]"
            animate={{ x: [0, 50, 0], y: [0, -50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: "-10%", left: "-10%" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full bg-teal-500/20 blur-[100px]"
            animate={{ x: [0, -50, 0], y: [0, 50, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: "-10%", right: "-10%" }}
          />
        </div>

        {/* Top Content */}
        <div className="relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-6">
              <img src="/estsb-logo.png" alt="EST SB" className="w-10 h-10 object-contain drop-shadow-md" />
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tight mb-4">
              Gestion du Courrier
            </h1>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed">
              Plateforme intelligente de gestion administrative des courriers internes.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col gap-3 pt-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
            }}
          >
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                className="flex items-center gap-3"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-blue-50 font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Content */}
        <motion.div 
          className="relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-blue-200/60 text-sm">
            © {new Date().getFullYear()} École Supérieure de Technologie — Sidi Bennour
          </p>
        </motion.div>
      </div>

      {/* Right Panel: Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-[420px] mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 sm:p-10 relative mt-8 lg:mt-0"
          >
            {/* Mobile/Floating Logo Badge */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 lg:-top-12">
              <div className="p-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
                  <img src="/estsb-logo.png" alt="EST SB Logo" className="w-10 h-10 lg:w-12 lg:h-12" />
                </div>
              </div>
            </div>

            <div className="text-center pt-8 pb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Bon retour</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                Connectez-vous pour accéder à votre espace de gestion
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Alert */}
              {error && (
                <motion.div
                  className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400"
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="text-sm font-medium leading-tight">{error}</span>
                </motion.div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email professionnel</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="email"
                    placeholder="admin@estsb.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mot de passe</label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 group-focus-within:text-emerald-600 dark:group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-white font-medium rounded-xl shadow-md transition-all duration-200 disabled:opacity-70 text-[15px]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authentification...
                  </span>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>

            {/* Test Credentials Box */}
            <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Comptes de test</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Admin</span>
                  <span className="font-medium text-slate-500 font-mono">admin@estsb.edu / Password123!</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Chef</span>
                  <span className="font-medium text-slate-500 font-mono">chef.info@estsb.edu / Password123!</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Agent</span>
                  <span className="font-medium text-slate-500 font-mono">agent.mail@estsb.edu / Password123!</span>
                </div>
              </div>
            </div>

          </motion.div>
          
          {/* Mobile Footer */}
          <p className="text-center text-slate-400 text-xs mt-8 lg:hidden">
            © {new Date().getFullYear()} EST Sidi Bennour
          </p>
        </div>
      </div>
    </div>
  )
}
