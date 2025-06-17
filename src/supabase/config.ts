import { createClient } from '@supabase/supabase-js'

// Validate required environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

if (supabaseUrl === 'your_supabase_url_here' || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('Please update your .env file with valid Supabase configuration values.')
}

// Get the correct redirect URL based on environment
const getRedirectUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5173'
  
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  
  if (isDevelopment) {
    return `${window.location.protocol}//${window.location.host}`
  }
  
  // Production URL
  return import.meta.env.VITE_PRODUCTION_URL || 'https://panel.solware.agency'
}

export const REDIRECT_URL = getRedirectUrl()

// Create Supabase client with STRICT email confirmation settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Database types (you can generate these with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'owner' | 'employee'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'owner' | 'employee'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'owner' | 'employee'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}