export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
      }
      jerseys: {
        Row: {
          approved: boolean | null
          created_at: string | null
          flocage: string
          id: string
          photo_url: string | null
          size: string | null
          twitter_handle: string | null
          user_id: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          flocage: string
          id?: string
          photo_url?: string | null
          size?: string | null
          twitter_handle?: string | null
          user_id?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          flocage?: string
          id?: string
          photo_url?: string | null
          size?: string | null
          twitter_handle?: string | null
          user_id?: string | null
        }
      }
    }
    Functions: {
      search_jerseys_fuzzy: {
        Args: {
          search_query: string
        }
        Returns: Array<{
          approved: boolean | null
          created_at: string
          flocage: string
          id: string
          photo_url: string | null
          similarity_score: number
          size: string | null
          twitter_handle: string | null
          user_id: string | null
        }>
      }
    }
  }
}
