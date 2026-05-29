'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Shield, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Database } from '@/lib/database.types'

type Jersey = Database['public']['Tables']['jerseys']['Row']

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [pendingJerseys, setPendingJerseys] = useState<Jersey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setCheckingAdmin(false)
        return
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        setIsAdmin(false)
      } else {
        setIsAdmin(true)
        loadPendingJerseys()
      }
      setCheckingAdmin(false)
    }

    checkAdmin()
  }, [user])

  const loadPendingJerseys = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('jerseys')
        .select('*')
        .eq('approved', false)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPendingJerseys(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (jerseyId: string) => {
    try {
      const supabase = createClient()
      const { error } = await (supabase as any)
        .from('jerseys')
        .update({ approved: true })
        .eq('id', jerseyId)

      if (error) throw error

      setPendingJerseys(prev => prev.filter(j => j.id !== jerseyId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  const handleReject = async (jerseyId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('jerseys')
        .delete()
        .eq('id', jerseyId)

      if (error) throw error

      setPendingJerseys(prev => prev.filter(j => j.id !== jerseyId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  // Loading state
  if (authLoading || checkingAdmin) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </main>
    )
  }

  // Not authenticated
  if (!user) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Accès restreint</h2>
            <p className="text-muted-foreground">
              Vous devez être connecté pour accéder à cette page.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </motion.div>
      </main>
    )
  }

  // Not admin
  if (!isAdmin) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Accès refusé</h2>
            <p className="text-muted-foreground">
              Vous n'avez pas les droits d'administration.
            </p>
          </div>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-start pt-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-medium">Administration</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Déclarations en attente</h2>
            <span className="text-sm text-muted-foreground">
              {pendingJerseys.length} en attente
            </span>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Chargement des déclarations...</p>
            </div>
          ) : pendingJerseys.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">Tout est à jour !</h3>
              <p className="text-muted-foreground mt-1">
                Aucune déclaration en attente d'approbation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJerseys.map((jersey, index) => (
                <motion.div
                  key={jersey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Flocage</p>
                            <p className="text-lg font-semibold">{jersey.flocage}</p>
                          </div>
                          {jersey.size && (
                            <div>
                              <p className="text-sm text-muted-foreground">Taille</p>
                              <p>{jersey.size}</p>
                            </div>
                          )}
                          {jersey.twitter_handle && (
                            <div>
                              <p className="text-sm text-muted-foreground">Twitter/X</p>
                              <a
                                href={`https://twitter.com/${jersey.twitter_handle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                @{jersey.twitter_handle.replace('@', '')}
                              </a>
                            </div>
                          )}
                          <div>
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="text-sm">
                              {new Date(jersey.created_at || '').toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(jersey.id)}
                            className="gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(jersey.id)}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                            Refuser
                          </Button>
                        </div>
                      </div>

                      {jersey.photo_url && (
                        <div className="mt-4">
                          <img
                            src={jersey.photo_url}
                            alt={`Maillot ${jersey.flocage}`}
                            className="w-full max-h-64 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
