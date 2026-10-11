import { useState } from 'react'
import {
  Cloud,
  LayoutDashboard,
  Files,
  Share2,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  Plus,
  Upload,
  FileText,
  FileImage,
  FileSpreadsheet,
  MoreHorizontal,
  Download,
  Clock3,
  ArrowUpRight,
  HardDrive,
  LockKeyhole,
  Activity,
  ChevronDown,
  LogOut,
  Menu,
  X,
  FolderOpen,
} from 'lucide-react'

const initialFiles = [
  {
    id: 1,
    name: 'Project_Report.pdf',
    type: 'PDF Document',
    size: '2.4 MB',
    modified: 'Today, 10:42 AM',
    icon: FileText,
    color: 'text-rose-500',
    background: 'bg-rose-50',
    encrypted: true,
  },
  {
    id: 2,
    name: 'UI_Design.png',
    type: 'Image',
    size: '1.8 MB',
    modified: 'Yesterday',
    icon: FileImage,
    color: 'text-violet-500',
    background: 'bg-violet-50',
    encrypted: true,
  },
  {
    id: 3,
    name: 'Semester_Results.xlsx',
    type: 'Spreadsheet',
    size: '840 KB',
    modified: 'Oct 9, 2026',
    icon: FileSpreadsheet,
    color: 'text-emerald-600',
    background: 'bg-emerald-50',
    encrypted: true,
  },
  {
    id: 4,
    name: 'Project_Documentation.pdf',
    type: 'PDF Document',
    size: '3.2 MB',
    modified: 'Oct 8, 2026',
    icon: FileText,
    color: 'text-rose-500',
    background: 'bg-rose-50',
    encrypted: true,
  },
]

const activities = [
  {
    title: 'Project_Report.pdf uploaded',
    detail: 'Today at 10:42 AM',
    icon: Upload,
    color: 'text-blue-600',
    background: 'bg-blue-50',
  },
  {
    title: 'Sharing link created',
    detail: 'Today at 9:15 AM',
    icon: Share2,
    color: 'text-violet-600',
    background: 'bg-violet-50',
  },
  {
    title: 'Security settings reviewed',
    detail: 'Yesterday at 6:30 PM',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    background: 'bg-emerald-50',
  },
]

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My Files', icon: Files },
  { label: 'Shared Files', icon: Share2 },
  { label: 'Security', icon: ShieldCheck },
  { label: 'Activity Logs', icon: Activity },
]

function Dashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('Overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [files, setFiles] = useState(initialFiles)

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleUpload = (event) => {
    const selectedFiles = Array.from(event.target.files || [])

    if (!selectedFiles.length) return

    const newFiles = selectedFiles.map((file, index) => {
      const extension = file.name.split('.').pop()?.toLowerCase()

      let icon = FileText
      let color = 'text-rose-500'
      let background = 'bg-rose-50'
      let type = 'Document'

      if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)) {
        icon = FileImage
        color = 'text-violet-500'
        background = 'bg-violet-50'
        type = 'Image'
      } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
        icon = FileSpreadsheet
        color = 'text-emerald-600'
        background = 'bg-emerald-50'
        type = 'Spreadsheet'
      }

      return {
        id: `${Date.now()}-${index}`,
        name: file.name,
        type,
        size:
          file.size >= 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.max(1, Math.round(file.size / 1024))} KB`,
        modified: 'Just now',
        icon,
        color,
        background,
        encrypted: false,
      }
    })

    setFiles((previous) => [...newFiles, ...previous])
    setActivePage('My Files')
    event.target.value = ''
  }

  const pageTitle =
    activePage === 'Overview' ? 'Dashboard' : activePage

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Cloud size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Secure<span className="text-blue-600">Cloud</span>
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                File management
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setActivePage(label)
                  setMobileMenuOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  activePage === label
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={19} />
                {label}

                {label === 'Shared Files' && (
                  <span className="ml-auto rounded-md bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                    5
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="mb-4 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                <HardDrive size={18} />
              </div>

              <span className="text-xs font-semibold text-blue-700">
                25.6%
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-800">
              Storage usage
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-blue-100">
              <div className="h-full w-[25.6%] rounded-full bg-blue-600" />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              256 MB of 1 GB
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('Settings')}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              activePage === 'Settings'
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Settings size={19} />
            Settings
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={19} />
            Sign out
          </button>

          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
              C
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                Chandan
              </p>
              <p className="truncate text-xs text-slate-400">
                Personal workspace
              </p>
            </div>

            <ChevronDown size={16} className="text-slate-400" />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="min-h-screen lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div>
              <p className="text-xs text-slate-400">
                Workspace / {pageTitle}
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">
                {pageTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="relative hidden md:block">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setActivePage('My Files')
                }}
                placeholder="Search files..."
                className="w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
            </div>

            <button
              type="button"
              aria-label="Notifications"
              title="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-blue-600" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                C
              </div>
              <span className="text-sm font-medium text-slate-700">
                Chandan
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-5 sm:p-8 lg:p-10">
          {/* Welcome section */}
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Your private workspace
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, Chandan
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage your files and keep your digital workspace secure.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
              <Upload size={17} />
              Upload files
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleUpload}
              />
            </label>
          </div>

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total files"
              value={String(files.length).padStart(2, '0')}
              description="Files in this demo"
              icon={Files}
              color="blue"
              change="+2 this week"
            />

            <StatCard
              title="Storage used"
              value="256 MB"
              description="Of 1 GB sample quota"
              icon={HardDrive}
              color="violet"
              change="25.6% used"
            />

            <StatCard
              title="Active shares"
              value="05"
              description="Sample sharing links"
              icon={Share2}
              color="emerald"
              change="2 expiring soon"
            />

            <StatCard
              title="Security status"
              value="Protected"
              description="Demo security overview"
              icon={ShieldCheck}
              color="amber"
              change="Review settings"
            />
          </div>

          {/* Security banner */}
          <div className="relative mt-7 overflow-hidden rounded-2xl bg-[#0B1120] p-6 text-white sm:p-8">
            <div className="absolute -right-16 -top-28 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/15 text-blue-300">
                  <ShieldCheck size={25} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold">
                      Your security workspace
                    </h3>

                    <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium text-amber-300">
                      Preview
                    </span>
                  </div>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                    Secure sharing, client-side encryption, and access
                    controls are planned features. Complete the security
                    setup when these services are implemented.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePage('Security')}
                className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-white/15 px-4 py-3 text-sm font-medium transition hover:bg-white/10 sm:self-center"
              >
                Security settings
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Files and activity */}
          <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
            {/* Recent files */}
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {activePage === 'Shared Files'
                      ? 'Shared files'
                      : activePage === 'My Files'
                        ? 'My files'
                        : activePage === 'Overview'
                          ? 'Recent files'
                          : activePage}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {activePage === 'Security'
                      ? 'Security settings preview'
                      : 'Your workspace documents'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActivePage('My Files')
                    setSearchQuery('')
                  }}
                  className="inline-flex items-center gap-1 self-start text-sm font-medium text-blue-600 hover:text-blue-700 sm:self-center"
                >
                  View files
                  <ArrowUpRight size={15} />
                </button>
              </div>

              {activePage === 'Security' ? (
                <div className="space-y-4 p-5 sm:p-6">
                  <SettingRow
                    icon={LockKeyhole}
                    title="Private storage"
                    description="Private bucket planned"
                  />
                  <SettingRow
                    icon={ShieldCheck}
                    title="Client-side encryption"
                    description="Not implemented yet"
                  />
                  <SettingRow
                    icon={Clock3}
                    title="Expiring sharing links"
                    description="Backend enforcement planned"
                  />
                </div>
              ) : activePage === 'Activity Logs' ? (
                <div className="divide-y divide-slate-100">
                  {activities.map((activity) => (
                    <ActivityRow key={activity.title} activity={activity} />
                  ))}
                </div>
              ) : activePage === 'Settings' ? (
                <div className="p-6">
                  <p className="text-sm font-medium text-slate-800">
                    Workspace settings
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Account preferences and security configuration will be
                    connected in a later phase.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left">
                    <thead className="bg-slate-50/80">
                      <tr className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-3.5">Name</th>
                        <th className="px-4 py-3.5">Size</th>
                        <th className="px-4 py-3.5">Modified</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5" />
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredFiles.map((file) => {
                        const Icon = file.icon

                        return (
                          <tr
                            key={file.id}
                            className="transition hover:bg-slate-50/70"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${file.background} ${file.color}`}
                                >
                                  <Icon size={19} />
                                </div>

                                <div>
                                  <p className="max-w-[180px] truncate text-sm font-medium text-slate-800">
                                    {file.name}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-400">
                                    {file.type}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 text-sm text-slate-500">
                              {file.size}
                            </td>

                            <td className="px-4 py-4 text-xs text-slate-500">
                              {file.modified}
                            </td>

                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                  file.encrypted
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    file.encrypted
                                      ? 'bg-emerald-500'
                                      : 'bg-amber-500'
                                  }`}
                                />
                                {file.encrypted ? 'Sample status' : 'Local preview'}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <button
                                type="button"
                                aria-label={`Options for ${file.name}`}
                                title="File options preview"
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                              >
                                <MoreHorizontal size={18} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {filteredFiles.length === 0 && (
                    <div className="px-6 py-12 text-center">
                      <FolderOpen
                        size={28}
                        className="mx-auto text-slate-300"
                      />
                      <p className="mt-3 text-sm font-medium text-slate-700">
                        No matching files
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try a different search term.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <span className="text-xs text-slate-400">
                  Demo data · Not connected to cloud storage
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setActivePage('My Files')
                    setSearchQuery('')
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  Open file manager
                </button>
              </div>
            </section>

            {/* Activity panel */}
            <section className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Recent activity
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Example workspace events
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="View activity logs"
                  onClick={() => setActivePage('Activity Logs')}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <MoreHorizontal size={19} />
                </button>
              </div>

              <div className="divide-y divide-slate-100 px-5 sm:px-6">
                {activities.map((activity) => (
                  <ActivityRow key={activity.title} activity={activity} />
                ))}
              </div>

              <div className="mx-5 mb-5 mt-2 rounded-xl bg-slate-50 p-4 sm:mx-6">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock3 size={16} className="text-blue-600" />
                  <span className="text-sm font-medium">
                    Sharing overview
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Expiration checks, download limits, and revocation will
                  be enforced by the backend once implemented.
                </p>

                <button
                  type="button"
                  onClick={() => setActivePage('Shared Files')}
                  className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  View shared files →
                </button>
              </div>
            </section>
          </div>

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
            <p>© 2026 SecureCloud. Secure file management.</p>
            <p>Development preview · Cloud services not connected</p>
          </footer>
        </main>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  change,
}) {
  const styles = {
    blue: 'bg-blue-50 text-blue-600',
    violet: 'bg-violet-50 text-violet-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/50 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[color]}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-400">{description}</p>

      <div className="mt-5 flex items-center gap-1.5 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
        <ArrowUpRight size={14} className="text-emerald-500" />
        {change}
      </div>
    </div>
  )
}

function ActivityRow({ activity }) {
  const Icon = activity.icon

  return (
    <div className="flex items-start gap-3 py-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.background} ${activity.color}`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-medium leading-5 text-slate-800">
          {activity.title}
        </p>
        <p className="mt-1 text-xs text-slate-400">{activity.detail}</p>
      </div>
    </div>
  )
}

function SettingRow({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  )
}

export default Dashboard