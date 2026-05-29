'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { LogIn, LogOut, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'

export function AuthButton() {
  const { user, isAdmin, loading, signInWithX, signOut } = useAuth()

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    )
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="gap-2 text-primary">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
        )}
        <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </Button>
      </div>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={signInWithX} className="gap-2">
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Connexion X</span>
    </Button>
  )
}