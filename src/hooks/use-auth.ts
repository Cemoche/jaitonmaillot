'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const { data } = await supabase
            .from('admins')
            .select('*')
            .eq('user_id', currentUser.id)
            .maybeSingle()
          setIsAdmin(!!data)
        }
      } catch (error) {
        console.error('Auth check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        supabase
          .from('admins')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle()
          .then(({ data }) => {
            setIsAdmin(!!data)
          })
      } else {
        setIsAdmin(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithX = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'x',
      options: {
        redirectTo: `${window.location.origin}/declare`,
      },
    })
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return { user, isAdmin, loading, signInWithX, signOut }
}