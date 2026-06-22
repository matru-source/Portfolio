import type { ReactNode } from 'react'
import { useAuth } from './AuthProvider'
import { LoginPage } from './LoginPage'
import { AdminEditor } from './AdminEditor'
import { supabaseEnabled } from '@/lib/supabase'

function Centered({ children }: { children: ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">{children}</div>
}

export function AdminApp() {
  const { ready, isAdmin } = useAuth()

  if (!supabaseEnabled) {
    return (
      <Centered>
        <div className="max-w-md">
          <h1 className="font-display text-xl font-semibold text-ink">Admin not configured</h1>
          <p className="mt-2 text-sm text-body">
            Set <code className="font-mono">VITE_SUPABASE_URL</code> and{' '}
            <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> in your <code>.env</code>,
            then restart the dev server.
          </p>
        </div>
      </Centered>
    )
  }

  if (!ready) {
    return (
      <Centered>
        <p className="font-mono text-sm text-muted">Loading…</p>
      </Centered>
    )
  }

  return isAdmin ? <AdminEditor /> : <LoginPage />
}
