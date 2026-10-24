import { STORAGE_BUCKET, supabase } from '../lib/supabase'

const FILE_COLUMNS = 'id, owner_id, object_path, name, size_bytes, content_type, created_at'

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add its URL and publishable key to .env.')
  }
}

async function recordFileActivity(eventType, fileId) {
  const { error } = await supabase.rpc('log_file_activity', {
    p_event_type: eventType,
    p_file_id: fileId,
  })
  if (error) console.warn('Could not record file activity.')
}

export async function listCloudFiles() {
  requireSupabase()

  const { data, error } = await supabase
    .from('file_records')
    .select(FILE_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function uploadCloudFile(user, file) {
  requireSupabase()

  const safeName = file.name.replace(/[^\w.-]/g, '_').slice(0, 160) || 'file'
  const objectPath = `${user.id}/${crypto.randomUUID()}-${safeName}`
  const contentType = file.type || 'application/octet-stream'
  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(objectPath, file, {
      cacheControl: '3600',
      contentType,
      upsert: false,
    })

  if (uploadError) throw uploadError

  const { data, error: recordError } = await supabase
    .from('file_records')
    .insert({
      owner_id: user.id,
      object_path: objectPath,
      name: file.name,
      size_bytes: file.size,
      content_type: contentType,
    })
    .select(FILE_COLUMNS)
    .single()

  if (recordError) {
    await supabase.storage.from(STORAGE_BUCKET).remove([objectPath])
    throw recordError
  }

  await recordFileActivity('file.uploaded', data.id)

  return data
}

export async function downloadCloudFile(file) {
  requireSupabase()

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(file.object_path)

  if (error) throw error

  await recordFileActivity('file.downloaded', file.id)

  const downloadUrl = URL.createObjectURL(data)
  const anchor = document.createElement('a')
  anchor.href = downloadUrl
  anchor.download = file.name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 60_000)
}

export async function deleteCloudFile(file) {
  requireSupabase()

  const { error: storageError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([file.object_path])

  if (storageError) throw storageError

  await recordFileActivity('file.deleted', file.id)

  const { error: recordError } = await supabase
    .from('file_records')
    .delete()
    .eq('id', file.id)

  if (recordError) throw recordError
}
