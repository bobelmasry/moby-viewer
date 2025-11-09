import { createBrowserClient } from "@supabase/ssr"

export const createClient = () =>
  createBrowserClient(
    'https://jvagnepfuhjraknfqmku.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YWduZXBmdWhqcmFrbmZxbWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzI0MzAsImV4cCI6MjA3NzkwODQzMH0.wro2m4PX1oGOhC5aKhWbPyC2t8F2LfPRFlFzfd2AHLw',
  )
