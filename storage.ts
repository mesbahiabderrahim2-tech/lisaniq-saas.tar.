// ══════════════════════════════════════════════════════════════
// LisanIQ — Storage Service
// All Supabase Storage operations go through this module.
// Path convention: {owner_id}/datasets/{dataset_id}/{filename}
// ══════════════════════════════════════════════════════════════

import { createAdminClient } from '@/lib/supabase/admin'

const BUCKET = 'datasets'

export interface StorageUploadResult {
  path:  string
  error: string | null
}

/**
 * Builds the canonical storage path for a dataset file.
 * Pattern: {owner_id}/datasets/{dataset_id}/{sanitized_filename}
 */
export function buildStoragePath(
  ownerId:   string,
  datasetId: string,
  fileName:  string
): string {
  // Sanitise: keep only alphanumeric, dots, dashes, underscores
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${ownerId}/datasets/${datasetId}/${safe}`
}

/**
 * Uploads a file buffer to Supabase Storage.
 * Uses the admin client to bypass RLS (server-side upload).
 */
export async function uploadFileToStorage(
  ownerId:     string,
  datasetId:   string,
  fileName:    string,
  buffer:      Buffer,
  contentType: string
): Promise<StorageUploadResult> {
  const admin = createAdminClient()
  const path  = buildStoragePath(ownerId, datasetId, fileName)

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,   // never silently overwrite
    })

  if (error) {
    return { path: '', error: error.message }
  }

  return { path, error: null }
}

/**
 * Downloads a file from Storage and returns its Buffer.
 * Used to re-parse datasets when loading saved reports.
 */
export async function downloadFileFromStorage(storagePath: string): Promise<Buffer> {
  const admin = createAdminClient()

  const { data, error } = await admin.storage
    .from(BUCKET)
    .download(storagePath)

  if (error || !data) {
    throw new Error(`Storage download failed: ${error?.message ?? 'unknown error'}`)
  }

  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Deletes a file from Storage.
 * Called when a dataset record is deleted.
 */
export async function deleteFileFromStorage(storagePath: string): Promise<void> {
  const admin = createAdminClient()

  const { error } = await admin.storage
    .from(BUCKET)
    .remove([storagePath])

  if (error) {
    // Log but don't throw — orphaned storage files are recoverable
    console.error(`[storage] delete failed for path "${storagePath}":`, error.message)
  }
}

/**
 * Generates a short-lived signed URL for a private file.
 * Expires in 60 seconds — used for secure one-time downloads.
 */
export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
  const admin = createAdminClient()

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, 60)

  if (error || !data?.signedUrl) {
    throw new Error(`Could not generate download URL: ${error?.message ?? 'unknown'}`)
  }

  return data.signedUrl
}

/**
 * Infers the MIME type from a file extension.
 */
export function getMimeType(extension: string): string {
  const map: Record<string, string> = {
    csv:  'text/csv',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls:  'application/vnd.ms-excel',
  }
  return map[extension.toLowerCase()] ?? 'application/octet-stream'
}
