import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Gestion du Courrier - EST SB",
  description: "Système de gestion du courrier interne - École Supérieure de Technologie Sidi Bennour",
  generator: "v0.app",
  icons: {
    icon: "/estsb-logo.png",
    apple: "/estsb-logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/estsb-logo.png" type="image/png" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              classNames: {
                toast: "!bg-card !text-card-foreground !border-border !shadow-lg",
                success: "!border-l-4 !border-l-primary",
                error: "!border-l-4 !border-l-destructive",
              },
            }}
            richColors
            closeButton
          />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
