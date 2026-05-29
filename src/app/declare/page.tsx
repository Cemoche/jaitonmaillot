'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Check, LogIn, Shirt, Pencil, Trash2, X, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export default function DeclarePage() {
  const router = useRouter()
  const { user, loading: authLoading, signInWithX } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isNewDeclaration, setIsNewDeclaration] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasJersey, setHasJersey] = useState(false)
  const [checkingJersey, setCheckingJersey] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [existingJersey, setExistingJersey] = useState<any>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    flocage: '',
    size: '',
    photo: null as File | null,
  })

  // Check if user already has a jersey
  useEffect(() => {
    const checkExistingJersey = async () => {
      if (!user) {
        setCheckingJersey(false)
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from('jerseys')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        const jersey = data as any
        setHasJersey(true)
        setExistingJersey(jersey)
        setFormData({
          flocage: jersey.flocage,
          size: jersey.size || '',
          photo: null,
        })
      }
      setCheckingJersey(false)
    }

    checkExistingJersey()
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('Vous devez être connecté pour déclarer un maillot')
      return
    }

    if (!formData.flocage.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      let photoUrl = null

      if (formData.photo) {
        const fileExt = formData.photo.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('jersey-photos')
          .upload(fileName, formData.photo)

        if (uploadError) {
          throw new Error('Erreur lors du téléchargement de la photo')
        }

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('jersey-photos')
            .getPublicUrl(fileName)
          photoUrl = publicUrl
        }
      }

      const { error: insertError } = await supabase.from('jerseys').insert({
        flocage: formData.flocage.trim(),
        size: formData.size.trim() || null,
        twitter_handle: user.user_metadata?.user_name || user.user_metadata?.preferred_username || null,
        photo_url: photoUrl,
        user_id: user.id,
      } as any)

      if (insertError) {
        throw insertError
      }

      setIsNewDeclaration(true)
      setIsSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !existingJersey) return
    if (!formData.flocage.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      let photoUrl = existingJersey.photo_url

      if (formData.photo) {
        const fileExt = formData.photo.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('jersey-photos')
          .upload(fileName, formData.photo)

        if (uploadError) {
          throw new Error('Erreur lors du téléchargement de la photo')
        }

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('jersey-photos')
            .getPublicUrl(fileName)
          photoUrl = publicUrl
        }
      }

      const { error: updateError } = await (supabase as any)
        .from('jerseys')
        .update({
          flocage: formData.flocage.trim(),
          size: formData.size.trim() || null,
          photo_url: photoUrl,
        })
        .eq('id', existingJersey.id)

      if (updateError) {
        throw updateError
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !existingJersey) return

    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase
        .from('jerseys')
        .delete()
        .eq('id', existingJersey.id)

      if (deleteError) {
        throw deleteError
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
      setShowDeleteConfirm(false)
    }
  }

  // Loading state
  if (authLoading || checkingJersey) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 mb-4 animate-pulse">
            <Shirt className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </main>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-md"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold">
            {isNewDeclaration ? 'Déclaration envoyée !' : 'Modifications enregistrées !'}
          </h2>
          {isNewDeclaration ? (
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Votre déclaration est en attente d'approbation par un modérateur.
              </p>
              <p className="text-sm text-muted-foreground">
                Elle sera visible dans les résultats de recherche une fois approuvée.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Redirection vers l'accueil...
            </p>
          )}
        </motion.div>
      </main>
    )
  }

  // User already has a jersey - show jersey details with edit/delete
  if (hasJersey && !isEditing) {
    return (
      <main className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md w-full"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5">
            <Shirt className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Votre maillot</h2>
            <p className="text-muted-foreground">
              Vous avez déjà déclaré un maillot.
            </p>
            {existingJersey?.approved === false && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                <Clock className="w-3.5 h-3.5" />
                En attente d'approbation
              </div>
            )}
            {existingJersey?.approved === true && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <Check className="w-3.5 h-3.5" />
                Approuvé
              </div>
            )}
          </div>
          
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Flocage</p>
                <p className="text-lg font-semibold">{existingJersey?.flocage}</p>
              </div>
              {existingJersey?.size && (
                <div>
                  <p className="text-sm text-muted-foreground">Taille</p>
                  <p className="text-lg">{existingJersey.size}</p>
                </div>
              )}
              {existingJersey?.photo_url && (
                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                  <DialogTrigger>
                    <div className="cursor-pointer hover:opacity-90 transition-opacity">
                      <img
                        src={existingJersey.photo_url}
                        alt={`Maillot ${existingJersey.flocage}`}
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0">
                    <img
                      src={existingJersey.photo_url}
                      alt={`Maillot ${existingJersey.flocage}`}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div className="flex gap-3">
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="outline" 
                className="flex-1 gap-2"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </Button>
              <Button 
                onClick={() => setShowDeleteConfirm(true)} 
                variant="outline" 
                className="flex-1 gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </Button>
            </div>
            <Link href="/">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-background rounded-lg p-6 max-w-sm w-full space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
                    <Trash2 className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold">Supprimer votre maillot ?</h3>
                  <p className="text-sm text-muted-foreground">
                    Cette action est irréversible. Votre déclaration sera définitivement supprimée.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Annuler
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Suppression...' : 'Supprimer'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
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
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Connexion requise</h2>
            <p className="text-muted-foreground">
              Pour déclarer un maillot, vous devez vous connecter avec votre compte X (Twitter).
              Cela permet de limiter les déclarations à un seul maillot par personne.
            </p>
          </div>
          <div className="space-y-3">
            <Button onClick={signInWithX} className="w-full gap-2">
              <LogIn className="w-4 h-4" />
              Se connecter avec X
            </Button>
            <Link href="/">
              <Button variant="ghost" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  // Authenticated form
  return (
    <main className="flex-1 flex flex-col items-center justify-start pt-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                {isEditing ? 'Modifier votre maillot' : 'Déclarer un maillot'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={isEditing ? handleUpdate : handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="flocage">
                    Flocage *
                  </Label>
                  <Input
                    id="flocage"
                    placeholder="Ex: Mbappé, Zidane..."
                    value={formData.flocage}
                    onChange={(e) => setFormData({ ...formData, flocage: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">
                    Taille (optionnel)
                  </Label>
                  <Input
                    id="size"
                    placeholder="Ex: M, L, XL..."
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photo">
                    Photo (optionnel)
                  </Label>
                  <div className="relative">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setFormData({ ...formData, photo: file })
                      }}
                      className="hidden"
                    />
                    <Label
                      htmlFor="photo"
                      className="flex items-center justify-center gap-2 w-full h-12 px-4 rounded-md border border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-sm text-muted-foreground">
                        {formData.photo ? formData.photo.name : 'Choisir une photo'}
                      </span>
                    </Label>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? 'Envoi en cours...' 
                      : isEditing 
                        ? 'Enregistrer les modifications' 
                        : 'Déclarer le maillot'
                    }
                  </Button>
                  
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 gap-2"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}