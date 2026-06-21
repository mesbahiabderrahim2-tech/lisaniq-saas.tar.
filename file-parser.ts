// ══════════════════════════════════════════════════════════════
// LisanIQ — File Parser Service
// Server-side CSV/XLSX parsing with full validation.
// Returns normalised CampaignRow[] ready for KPI computation.
// ══════════════════════════════════════════════════════════════

import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { normaliseRows } from '@/lib/kpi-engine'
import type { CampaignRow, ParseResult } from '@/types'

const ALLOWED_EXTENSIONS = ['csv', 'xlsx', 'xls'] as const
type FileExtension = typeof ALLOWED_EXTENSIONS[number]

export interface FileValidationResult {
  valid:     boolean
  extension: FileExtension | null
  error:     string | null
}

/**
 * Validates file extension and size before parsing.
 */
export function validateFileMetadata(
  fileName:     string,
  fileSizeBytes: number,
  maxSizeBytes:  number
): FileValidationResult {
  const ext = fileName.split('.').pop()?.toLowerCase() as FileExtension | undefined

  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid:     false,
      extension: null,
      error:     `Unsupported file type ".${ext ?? 'unknown'}". Please upload a CSV or Excel file.`,
    }
  }

  if (fileSizeBytes > maxSizeBytes) {
    const sizeMB    = (fileSizeBytes    / 1024 / 1024).toFixed(1)
    const limitMB   = (maxSizeBytes     / 1024 / 1024).toFixed(0)
    return {
      valid:     false,
      extension: ext,
      error:     `File is ${sizeMB}MB. Your plan allows up to ${limitMB}MB per file.`,
    }
  }

  return { valid: true, extension: ext, error: null }
}

/**
 * Parses a CSV Buffer into CampaignRow[].
 */
export function parseCSVBuffer(buffer: Buffer): ParseResult {
  const text = buffer.toString('utf-8')

  const result = Papa.parse<Record<string, string>>(text, {
    header:          true,
    skipEmptyLines:  'greedy',
    dynamicTyping:   false,
    transformHeader: (h: string) => h.trim(),
  })

  if (result.errors.length > 0) {
    const critical = result.errors.find((e: Papa.ParseError) => e.type === 'Delimiter' || e.type === 'Quotes')
    if (critical) {
      throw new Error(`CSV parse error: ${critical.message}`)
    }
  }

  if (!result.data.length) {
    throw new Error('The CSV file is empty or contains no data rows.')
  }

  const columns = result.meta.fields ?? Object.keys(result.data[0])
  const rows    = normaliseRows(result.data as Record<string, string | number>[])

  return { data: rows, columns, rowCount: rows.length }
}

/**
 * Parses an XLSX/XLS Buffer into CampaignRow[].
 * Reads the first worksheet only.
 */
export function parseXLSXBuffer(buffer: Buffer): ParseResult {
  let workbook: XLSX.WorkBook

  try {
    workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false })
  } catch {
    throw new Error('Could not read Excel file. Verify the file is not corrupted or password-protected.')
  }

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('The Excel file contains no worksheets.')
  }

  const worksheet = workbook.Sheets[sheetName]
  const rawRows   = XLSX.utils.sheet_to_json<Record<string, string | number>>(
    worksheet,
    { defval: '', raw: false }
  )

  if (!rawRows.length) {
    throw new Error('The first worksheet is empty. Add campaign data and try again.')
  }

  const columns = Object.keys(rawRows[0]).map(h => h.trim())
  const rows    = normaliseRows(rawRows)

  return { data: rows, columns, rowCount: rows.length }
}

/**
 * Route-handler entry point: parse ArrayBuffer from multipart upload.
 */
export async function parseUploadedFile(
  buffer:    Buffer,
  _fileName: string,
  extension: FileExtension
): Promise<ParseResult> {
  switch (extension) {
    case 'csv':
      return parseCSVBuffer(buffer)
    case 'xlsx':
    case 'xls':
      return parseXLSXBuffer(buffer)
    default:
      throw new Error(`Unsupported extension: ${extension}`)
  }
}

/**
 * Validates that parsed rows contain at least one recognisable numeric column.
 * Prevents saving metadata-only or header-only files.
 */
export function validateParsedRows(rows: CampaignRow[]): void {
  if (rows.length === 0) {
    throw new Error('No data rows found after parsing.')
  }

  const numericKeys: Array<keyof CampaignRow> = ['impressions','clicks','spend','revenue','conversions']
  const firstRow = rows[0]
  const hasNumeric = numericKeys.some(k => typeof firstRow[k] === 'number' && (firstRow[k] as number) > 0)

  if (!hasNumeric) {
    throw new Error(
      'Could not find required campaign columns (impressions, clicks, spend, revenue, conversions). ' +
      'Check that your column headers match the expected format.'
    )
  }
}
