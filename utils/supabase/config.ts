// Explicit opt-in prevents old/deleted project credentials from slowing down the demo.
export const backendEnabled = process.env.NEXT_PUBLIC_SUPABASE_ENABLED === 'true'
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:9'
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-disabled'
