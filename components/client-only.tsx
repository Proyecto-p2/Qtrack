"use client"

import { useHydration } from "@/hooks/use-hydration"

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const hydrated = useHydration()

  if (!hydrated) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
