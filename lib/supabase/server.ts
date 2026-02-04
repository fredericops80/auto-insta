import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ... existing createClient ... but we will add createAdminClient

export async function createClient() {
    // ... existing implementation
    const cookieStore = await cookies()

    // Server-side dedicated variables
    const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
    const supabaseKey = process.env.SUPABASE_API_KEY;

    // ... checks ...

    return createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `remove` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

// NEW: Admin Client for Webhooks/Background Jobs
export async function createAdminClient() {
    const supabaseUrl = process.env.SUPABASE_PROJECT_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for Admin Client');
    }

    return createServerClient(
        supabaseUrl,
        serviceRoleKey,
        {
            cookies: {
                get(name: string) {
                    return ''
                },
                set(name: string, value: string, options: CookieOptions) {
                    // No-op
                },
                remove(name: string, options: CookieOptions) {
                    // No-op
                },
            },
        }
    )
}
