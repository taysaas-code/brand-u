import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Using demo mode.')
  // Create a mock client for demo purposes
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Demo mode - Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Demo mode - Supabase not configured' } }),
      signInWithOAuth: () => Promise.resolve({ data: null, error: { message: 'Demo mode - Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: { message: 'Demo mode - Supabase not configured' } }),
      updateUser: () => Promise.resolve({ data: null, error: { message: 'Demo mode - Supabase not configured' } }),
      resend: () => Promise.resolve({ data: null, error: { message: 'Demo mode - Supabase not configured' } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Demo mode - Supabase not configured' } }),
      update: () => Promise.resolve({ data: null, error: { message: 'Demo mode - Supabase not configured' } }),
      delete: () => Promise.resolve({ data: null, error: { message: 'Demo mode - Supabase not configured' } })
    })
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}

export { supabase }