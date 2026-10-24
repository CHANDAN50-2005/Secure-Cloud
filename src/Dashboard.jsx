import { useEffect, useState } from 'react'
import {
  Cloud,
  LayoutDashboard,
  Files,
  Share2,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  Upload,
  FileText,
  FileImage,
  FileSpreadsheet,
  MoreHorizontal,
  Trash2,
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
import AdminDashboard from './components/AdminDashboard'
import {
  checkAdminRole,
  loadAdminOverview,
  loadMyRecentActivity,
} from './services/admin'
import {
  deleteCloudFile,
  downloadCloudFile,
  listCloudFiles,
  uploadCloudFile,
} from './services/fileStorage'

const navigation = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'My Files', icon: Files },
  { label: 'Shared Files', icon: Share2 },
  { label: 'Security', icon: ShieldCheck },
  { label: 'Activity Logs', icon: Activity },
]

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function presentFile(record) {
  const extension = record.name.split('.').pop()?.toLowerCase()
  let icon = FileText
  let color = 'text-rose-500'
  let background = 'bg-rose-50'
  let type = record.content_type || 'File'

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
  } else if (extension === 'pdf') {
    type = 'PDF Document'
  }

  return {
    ...record,
    type,
    size: formatFileSize(Number(record.size_bytes)),
    modified: new Date(record.created_at).toLocaleString(),
    icon,
    color,
    background,
  }
}

function presentActivity(event) {
  const activityTypes = {
    'file.uploaded': {
      title: 'File uploaded',
      icon: Upload,
      color: 'text-blue-600',
      background: 'bg-blue-50',
    },
    'file.downloaded': {
      title: 'File downloaded',
      icon: Download,
      color: 'text-violet-600',
      background: 'bg-violet-50',
    },
    'file.deleted': {
      title: 'File deleted',
      icon: Trash2,
      color: 'text-rose-600',
      background: 'bg-rose-50',
    },
  }
  const description = activityTypes[event.event_type] || {
    title: event.event_type,
    icon: Activity,
    color: 'text-slate-600',
    background: 'bg-slate-50',
  }

  return {
    ...description,
    id: event.id,
    detail: `${new Date(event.created_at).toLocaleString()} · Ref ${event.file_id?.slice(0, 8) || '—'}`,
  }
}

function Dashboard({ onLogout, user }) {
  const [activePage, setActivePage] = useState('Overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [files, setFiles] = useState([])
  const [isLoadingFiles, setIsLoadingFiles] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [fileMessage, setFileMessage] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminOverview, setAdminOverview] = useState(null)
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true)
  const [adminError, setAdminError] = useState('')
  const [activities, setActivities] = useState([])
  const [isLoadingActivities, setIsLoadingActivities] = useState(true)
  const [activityError, setActivityError] = useState('')

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const totalBytes = files.reduce((total, file) => total + Number(file.size_bytes), 0)

  useEffect(() => {
    let isMounted = true
    checkAdminRole()
      .then((hasAdminRole) => {
        if (isMounted) setIsAdmin(hasAdminRole)
      })
      .catch(() => {
        if (isMounted) setIsAdmin(false)
      })
    return () => {
      isMounted = false
    }
  }, [user?.id])

  useEffect(() => {
    if (activePage !== 'Admin Console' || !isAdmin) return undefined
    let isMounted = true
    loadAdminOverview()
      .then((overview) => {
        if (isMounted) {
          setAdminOverview(overview)
          setAdminError('')
        }
      })
      .catch((error) => {
        if (isMounted) setAdminError(error.message || 'Unable to load admin overview.')
      })
      .finally(() => {
        if (isMounted) setIsLoadingAdmin(false)
      })
    return () => {
      isMounted = false
    }
  }, [activePage, isAdmin])

  useEffect(() => {
    let isMounted = true
    loadMyRecentActivity()
      .then((records) => {
        if (isMounted) setActivities(records.map(presentActivity))
      })
      .catch((error) => {
        if (isMounted) setActivityError(error.message || 'Unable to load activity.')
      })
      .finally(() => {
        if (isMounted) setIsLoadingActivities(false)
      })
    return () => {
      isMounted = false
    }
  }, [user?.id])

  const refreshActivities = async () => {
    try {
      const records = await loadMyRecentActivity()
      setActivities(records.map(presentActivity))
      setActivityError('')
    } catch (error) {
      setActivityError(error.message || 'Unable to refresh activity.')
    }
  }

  const refreshAdminOverview = async () => {
    setIsLoadingAdmin(true)
    setAdminError('')
    try {
      setAdminOverview(await loadAdminOverview())
    } catch (error) {
      setAdminError(error.message || 'Unable to load admin overview.')
    } finally {
      setIsLoadingAdmin(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    listCloudFiles()
      .then((records) => {
        if (isMounted) setFiles(records.map(presentFile))
      })
      .catch((error) => {
        if (isMounted) setFileMessage(error.message || 'Unable to load your files.')
      })
      .finally(() => {
        if (isMounted) setIsLoadingFiles(false)
      })

    return () => {
      isMounted = false
    }
  }, [user?.id])

  const filteredFiles = files.filter((file) => {
    const matchesPage = activePage !== 'Shared Files'
    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    return matchesPage && matchesSearch
  })

  const handleUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files || [])
    event.target.value = ''

    if (!selectedFiles.length || !user) return

    setIsUploading(true)
    setFileMessage('')
    const uploadedFiles = []
    const failures = []

    for (const file of selectedFiles) {
      try {
        uploadedFiles.push(presentFile(await uploadCloudFile(user, file)))
      } catch (error) {
        failures.push(`${file.name}: ${error.message}`)
      }
    }

    if (uploadedFiles.length) {
      setFiles((previous) => [...uploadedFiles, ...previous])
      setActivePage('My Files')
      await refreshActivities()
    }
    setFileMessage(
      failures.length
        ? `Some uploads failed. ${failures.join(' ')}`
        : `${uploadedFiles.length} file${uploadedFiles.length === 1 ? '' : 's'} uploaded to Supabase Storage.`,
    )
    setIsUploading(false)
  }

  const handleDownload = async (file) => {
    setFileMessage('')
    try {
      await downloadCloudFile(file)
      await refreshActivities()
    } catch (error) {
      setFileMessage(error.message || `Unable to download ${file.name}.`)
    }
  }

  const handleDelete = async (file) => {
    setFileMessage('')
    try {
      await deleteCloudFile(file)
      setFiles((previous) => previous.filter((item) => item.id !== file.id))
      await refreshActivities()
      setFileMessage(`${file.name} was deleted from cloud storage.`)
    } catch (error) {
      setFileMessage(error.message || `Unable to delete ${file.name}.`)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setFileMessage('')
    try {
      await onLogout()
    } catch (error) {
      setFileMessage(error.message || 'Unable to sign out.')
      setIsLoggingOut(false)
    }
  }

  const pageTitle =
    activePage === 'Overview' ? 'Dashboard' : activePage
  const menuItems = isAdmin
    ? [...navigation, { label: 'Admin Console', icon: ShieldCheck }]
    : navigation

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
            {menuItems.map(({ label, icon: Icon }) => (
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
                Private bucket
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-800">
              Storage usage
            </p>

            <p className="mt-2 text-xs text-slate-500">
              {formatFileSize(totalBytes)} in your files
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
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut size={19} />
            Sign out
          </button>

          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {displayName}
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
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] p-5 sm:p-8 lg:p-10">
          {activePage === 'Admin Console' ? (
            isAdmin ? (
              <AdminDashboard
                overview={adminOverview}
                isLoading={isLoadingAdmin}
                errorMessage={adminError}
                onRefresh={refreshAdminOverview}
              />
            ) : (
              <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-800">
                Admin access is not enabled for this account.
              </p>
            )
          ) : (
            <>
          {/* Welcome section */}
          <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Your private workspace
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Welcome back, {displayName}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Manage your files and keep your digital workspace secure.
              </p>
            </div>

            <label className={`inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 ${isUploading ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}>
              <Upload size={17} />
              {isUploading ? 'Uploading…' : 'Upload files'}
              <input
                type="file"
                multiple
                disabled={isUploading}
                className="hidden"
                onChange={handleUpload}
              />
            </label>
          </div>

          {fileMessage && (
            <p role="status" className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-800">
              {fileMessage}
            </p>
          )}

          {/* Statistics */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total files"
              value={String(files.length).padStart(2, '0')}
              description="Files in your cloud account"
              icon={Files}
              color="blue"
              change="Supabase Storage"
            />

            <StatCard
              title="Storage used"
              value={formatFileSize(totalBytes)}
              description="File contents in your bucket"
              icon={HardDrive}
              color="violet"
              change="Supabase Storage"
            />

            <StatCard
              title="Active shares"
              value="Not active"
              description="Sharing is not connected"
              icon={Share2}
              color="emerald"
              change="Planned feature"
            />

            <StatCard
              title="Security status"
              value="Encryption off"
              description="Client-side encryption is not implemented"
              icon={ShieldCheck}
              color="amber"
              change="Review setup"
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
                      Uploads use your Supabase account and access policies
                      after setup. Sharing and client-side encryption are
                      still planned features.
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
                    description="Configured as a private Supabase bucket in supabase/schema.sql"
                  />
                  <SettingRow
                    icon={ShieldCheck}
                    title="Client-side encryption"
                    description="Not implemented. Cloud files are not app-encrypted."
                  />
                  <SettingRow
                    icon={Clock3}
                    title="Expiring sharing links"
                    description="Not implemented yet"
                  />
                </div>
              ) : activePage === 'Activity Logs' ? (
                <div>
                  {activityError ? (
                    <p role="alert" className="p-6 text-sm text-rose-700">{activityError}</p>
                  ) : activities.length ? (
                    <div className="divide-y divide-slate-100 px-5 sm:px-6">
                      {activities.map((activity) => (
                        <ActivityRow key={activity.id} activity={activity} />
                      ))}
                    </div>
                  ) : (
                    <p className="px-6 py-12 text-center text-sm text-slate-500">
                      {isLoadingActivities ? 'Loading your activity…' : 'No file activity yet. Upload, download, or delete a file to see events here.'}
                    </p>
                  )}
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
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-medium text-amber-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Cloud · not app-encrypted
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  aria-label={`Download ${file.name}`}
                                  title="Download file"
                                  onClick={() => handleDownload(file)}
                                  className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Download size={17} />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Delete ${file.name} from cloud storage`}
                                  title="Delete file"
                                  onClick={() => handleDelete(file)}
                                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
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
                        {isLoadingFiles
                          ? 'Loading cloud files…'
                          : activePage === 'Shared Files'
                            ? 'File sharing is not connected yet'
                            : searchQuery
                              ? 'No matching files'
                              : 'No cloud files yet'}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {isLoadingFiles
                          ? 'Loading your Supabase file list.'
                          : activePage === 'Shared Files'
                            ? 'Secure sharing will be added in a later step.'
                            : searchQuery
                              ? 'Try a different search term.'
                              : 'Upload a file to store it in your private bucket.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
                <span className="text-xs text-slate-400">
                  File contents are in Supabase Storage; client-side encryption is not enabled.
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
                    Your recent file events
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
                {activities.length ? activities.slice(0, 3).map((activity) => (
                  <ActivityRow key={activity.id} activity={activity} />
                )) : (
                  <p className="py-5 text-sm text-slate-500">
                    {isLoadingActivities ? 'Loading activity…' : activityError || 'No file activity yet.'}
                  </p>
                )}
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
            <p>Supabase Storage · Client-side encryption not enabled</p>
          </footer>
            </>
          )}
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
