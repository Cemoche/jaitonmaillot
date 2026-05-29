'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Shirt, ArrowRight, AtSign } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Jersey = Database['public']['Tables']['jerseys']['Row']
type JerseyWithSimilarity = Jersey & { similarity_score?: number }

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<JerseyWithSimilarity[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openImageId, setOpenImageId] = useState<string | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const searchJerseys = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: searchError } = await supabase
        .rpc('search_jerseys_fuzzy', { search_query: searchQuery.trim() } as any)

      if (searchError) {
        throw searchError
      }

      setResults(data || [])
    } catch (err) {
      console.error('Search error:', err)
      setError('Une erreur est survenue lors de la recherche')
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setError(null)
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    if (value.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => searchJerseys(value), 300)
    } else if (value.length === 0) {
      setResults([])
      setHasSearched(false)
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-start pt-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 mb-4">
            <Shirt className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            J'ai ton maillot
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Tu as reçu un maillot avec le mauvais flocage ? Ou quelqu'un a reçu le tien par erreur ? Cherche ton flocage et retrouve qui a reçu ton maillot !
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher un flocage..."
              value={query}
              onChange={handleInputChange}
              className="w-full h-14 pl-12 pr-4 text-lg rounded-2xl border-2 border-border bg-background shadow-sm focus:border-primary focus:ring-0 transition-colors"
            />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-muted-foreground"
            >
              Recherche en cours...
            </motion.div>
          ) : hasSearched && results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground text-center">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </p>
              {results.map((jersey, index) => (
                <motion.div
                  key={jersey.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {jersey.flocage}
                          </h3>
                          {jersey.size && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Taille : {jersey.size}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {jersey.twitter_handle && (
                            <a
                              href={`https://twitter.com/${jersey.twitter_handle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-medium hover:bg-primary/10 transition-colors"
                            >
                              <AtSign className="w-3.5 h-3.5" />
                              {jersey.twitter_handle}
                            </a>
                          )}
                        </div>
                      </div>
                      
                      {jersey.photo_url && (
                        <Dialog open={openImageId === jersey.id} onOpenChange={(open) => setOpenImageId(open ? jersey.id : null)}>
                          <DialogTrigger>
                            <div className="mt-4 cursor-pointer hover:opacity-90 transition-opacity">
                              <img
                                src={jersey.photo_url}
                                alt={`Maillot ${jersey.flocage}`}
                                className="w-full max-h-64 object-cover rounded-lg"
                              />
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-transparent border-0">
                            <img
                              src={jersey.photo_url}
                              alt={`Maillot ${jersey.flocage}`}
                              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-destructive">
                {error}
              </p>
            </motion.div>
          ) : hasSearched && results.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">
                Aucun résultat trouvé pour "{query}"
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="pt-8 text-center space-y-4"
        >
          <div className="space-y-2">
            <Link href="/declare">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-6 h-12 text-base"
              >
                Déclarer un maillot
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tu as reçu un maillot qui ne t'appartient pas ? Déclare-le ici pour que son propriétaire puisse te retrouver.
          </p>
        </motion.div>
      </div>
    </main>
  )
}