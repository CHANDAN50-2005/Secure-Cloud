import { Activity, Files, HardDrive, RefreshCw, Users } from 'lucide-react'

function formatFileSize(value) {
  const bytes = Number(value || 0)
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function AdminDashboard({ overview, isLoading, errorMessage, onRefresh }) {
  const summary = overview?.summary
  const cards = [
    { label: 'Registered users', value: summary?.user_count ?? '—', icon: Users, color: 'blue' },
    { label: 'Stored files', value: summary?.file_count ?? '—', icon: Files, color: 'violet' },
    { label: 'Tracked storage', value: formatFileSize(summary?.storage_bytes), icon: HardDrive, color: 'emerald' },
    { label: 'Recorded events', value: summary?.activity_count ?? '—', icon: Activity, color: 'amber' },
  ]
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <section aria-labelledby="admin-title">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">Administrative overview</p>
          <h1 id="admin-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Admin console
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Account and file activity summaries. File contents remain private to their owners.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Refresh overview
        </button>
      </div>

      {errorMessage && (
        <p role="alert" className="mb-6 rounded-xl border border-rose-100 bg-rose-50 p-3 text-sm leading-6 text-rose-800">
          {errorMessage}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
                <Icon size={20} />
              </div>
            </div>
            <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
              {isLoading ? '…' : value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">Recent file activity</h2>
          <p className="mt-1 text-xs text-slate-500">Uploads, downloads, and deletions recorded by SecureCloud.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3.5">User</th>
                <th className="px-4 py-3.5">Event</th>
                <th className="px-4 py-3.5">File reference</th>
                <th className="px-4 py-3.5">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(overview?.activity ?? []).map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 text-sm text-slate-700">{event.actor_email || 'Account removed'}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{event.event_type.replace('file.', '')}</td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-500">{event.file_id?.slice(0, 8) || '—'}</td>
                  <td className="px-4 py-4 text-xs text-slate-500">{new Date(event.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && !errorMessage && !(overview?.activity?.length) && (
            <p className="px-6 py-12 text-center text-sm text-slate-500">No file activity has been recorded yet.</p>
          )}
          {isLoading && <p className="px-6 py-12 text-center text-sm text-slate-500">Loading admin overview…</p>}
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-400">
        Storage is estimated from SecureCloud metadata. Activity is app-reported and is not a tamper-proof forensic audit log.
      </p>
    </section>
  )
}

export default AdminDashboard
