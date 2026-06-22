import { useState, type FormEvent } from 'react'
import { Lock, LogIn } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { Button } from '@/components/ui'

const inputClass =
  'w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-primary'

export function LoginPage() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await signIn(email, password)
    if (error) setError(error)
    setBusy(false)
  }

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-ink text-surface">
            <Lock size={16} />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-ink">Admin</p>
            <p className="text-xs text-muted">Matru Panda — Portfolio CMS</p>
          </div>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" disabled={busy} className="w-full">
            {busy ? 'Signing in…' : 'Sign in'} <LogIn size={16} />
          </Button>

          <p className="text-center text-xs text-muted">
            Access is restricted to authorized accounts.
          </p>
        </form>

        <a href="/" className="mt-4 block text-center text-xs text-muted hover:text-ink">
          ← Back to site
        </a>
      </div>
    </div>
  )
}
