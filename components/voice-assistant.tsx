// @ts-nocheck
"use client"

import { Mic, MicOff } from "lucide-react"
import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)

  const toggleListening = useCallback(() => {
    if (isListening) {
      setIsListening(false)
      toast.info("Assistance vocale désactivée", {
        description: "Le microphone a été coupé.",
        duration: 2000,
      })
    } else {
      setIsListening(true)
      toast("En écoute...", {
        description: "Parlez pour interagir avec l'assistant.",
        duration: 3000,
        icon: "🎤",
      })
    }
  }, [isListening])

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`relative p-2.5 rounded-xl transition-all duration-300 group ${
          isListening
            ? "bg-primary text-primary-foreground voice-pulse"
            : "bg-accent hover:bg-accent/80 text-foreground/70 hover:text-foreground"
        }`}
        title={isListening ? "Arrêter l'écoute" : "Assistant vocal"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isListening ? (
            <motion.div
              key="mic-on"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MicOff className="w-[18px] h-[18px]" />
            </motion.div>
          ) : (
            <motion.div
              key="mic-off"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Mic className="w-[18px] h-[18px]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ripple rings when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-xl animate-ping bg-primary/20" />
            <span className="absolute -inset-1 rounded-xl animate-pulse bg-primary/10" />
          </>
        )}
      </button>
    </div>
  )
}
