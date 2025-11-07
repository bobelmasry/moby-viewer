import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    'https://jvagnepfuhjraknfqmku.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YWduZXBmdWhqcmFrbmZxbWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzI0MzAsImV4cCI6MjA3NzkwODQzMH0.wro2m4PX1oGOhC5aKhWbPyC2t8F2LfPRFlFzfd2AHLw',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}