import Dashboard from './Dashboard'
import { useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import {
  Cloud,
  ShieldCheck,
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  FileText,
  Fingerprint,
  Zap,
} from 'lucide-react'

function App() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isLogin, setIsLogin] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [message, setMessage] = useState(
    isSupabaseConfigured
      ? ''
      : 'Add your Supabase URL and publishable key to the project .env file to enable accounts.',
  )

  useEffect(() => {
    if (!isSupabaseConfigured) {
      return undefined
    }

    let isMounted = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return
      if (error) setMessage(error.message)
      setCurrentUser(data.session?.user ?? null)
      setShowDashboard(Boolean(data.session))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
      setShowDashboard(Boolean(session))
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!supabase) {
      setMessage('Supabase is not configured. Add your project URL and publishable key to .env.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim() } },
        })
        if (error) throw error
        if (!data.session) {
          setMessage('Account created. Check your email for the confirmation link before signing in.')
        }
      }
    } catch (error) {
      setMessage(error.message || 'Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showDashboard) {
    return (
      <Dashboard
        user={currentUser}
        onLogout={async () => {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
          setShowDashboard(false)
        }}
      />
    )
  }

  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <section className="relative hidden min-h-screen overflow-hidden bg-[#0B1120] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
        <div className="absolute -right-32 top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-[100px]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <Cloud size={25} strokeWidth={2.2} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Secure<span className="text-blue-400">Cloud</span>
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">
                Secure file management
              </p>
            </div>
          </div>

          <div className="mt-24 max-w-xl xl:mt-32">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-medium text-blue-300">
              <ShieldCheck size={15} />
              Security-first cloud storage
            </div>

            <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Your files.
              <br />
              Your privacy.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Your control.
              </span>
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
              Store your documents, manage access, and share files securely
              from one simple workspace designed around your privacy.
            </p>
          </div>

          {/* Feature cards */}
          <div className="mt-12 grid max-w-xl grid-cols-2 gap-4">
            <FeatureCard
              icon={<LockKeyhole size={19} />}
              title="Private by design"
              description="Controlled access to your files"
            />

            <FeatureCard
              icon={<Fingerprint size={19} />}
              title="Secure sharing"
              description="Links with access controls"
            />

            <FeatureCard
              icon={<FileText size={19} />}
              title="One workspace"
              description="Manage your documents"
            />

            <FeatureCard
              icon={<Zap size={19} />}
              title="Cloud powered"
              description="Access files from anywhere"
            />
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-500">
          <span>© 2026 SecureCloud</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Cloud security, simplified
          </span>
        </div>
      </section>

      {/* Right authentication panel */}
      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-10 lg:bg-white">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Cloud size={25} />
            </div>

            <h1 className="text-xl font-bold text-slate-900">
              Secure<span className="text-blue-600">Cloud</span>
            </h1>
          </div>

          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              {isLogin ? (
                <LockKeyhole size={23} />
              ) : (
                <ShieldCheck size={23} />
              )}
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {isLogin
                ? 'Sign in to access your secure workspace.'
                : 'Create an account to start managing your files securely.'}
            </p>
          </div>

          {/* Login / registration switch */}
          <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true)
                setMessage('')
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(false)
                setMessage('')
              }}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required={!isLogin}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() =>
                      setMessage(
                        'Password recovery will be added in a later step.',
                      )
                    }
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={
                    isLogin ? 'current-password' : 'new-password'
                  }
                  placeholder={
                    isLogin ? 'Enter your password' : 'Create a password'
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((previous) => !previous)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isLogin && (
                <p className="mt-2 text-xs text-slate-500">
                  Use at least 8 characters.
                </p>
              )}
            </div>

            {isLogin && (
              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <span className="text-sm text-slate-600">
                  Remember me
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:shadow-blue-600/30 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting
                ? 'Please wait…'
                : isLogin
                  ? 'Sign in to SecureCloud'
                  : 'Create account'}
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            {message && (
              <div
                role="status"
                className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-800"
              >
                {message}
              </div>
            )}
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">YOUR FILES, YOUR CONTROL</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-emerald-500"
            />

            <div>
              <p className="text-sm font-medium text-slate-800">
                Built around privacy
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Private cloud storage and controlled sharing are core goals
                of SecureCloud.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            By continuing, you agree to the terms of service and privacy
            policy.
            <br />
            SecureCloud is currently under development.
          </p>
        </div>
      </section>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-blue-400/30 hover:bg-white/[0.07]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
        {icon}
      </div>

      <h3 className="text-sm font-medium text-white">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  )
}

export default App
