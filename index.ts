// ══════════════════════════════════════════════════════
// LisanIQ — Core Type Definitions
// Single source of truth for all shared types.
// ══════════════════════════════════════════════════════

// ── Database Entity Types ──────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'owner' | 'admin' | 'analyst' | 'viewer'
  plan: 'free' | 'pro' | 'enterprise'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  owner_id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
  // Relations
  datasets?: Dataset[]
  reports?: Report[]
}

export interface Dataset {
  id: string
  project_id: string
  owner_id: string
  name: string
  file_name: string
  file_path: string           // Supabase Storage path
  file_size: number           // bytes
  file_type: 'csv' | 'xlsx' | 'xls'
  row_count: number
  column_map: ColumnMap       // normalised column mapping snapshot
  cached_rows: CampaignRow[] | null
  status: 'processing' | 'ready' | 'error'
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  dataset_id: string
  project_id: string
  owner_id: string

  name: string

  kpis: KPISnapshot

  health_score: number
  business_status: BusinessStatus

  insights: StrategicInsight[]
  risks: RiskItem[]
  recommendations: Recommendation[]
  opportunities: Opportunity[]

  notes: string | null
  is_starred: boolean
  pdf_exported_at: string | null

  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string

  stripe_subscription_id: string | null
  stripe_customer_id: string | null
  stripe_price_id: string | null

  plan: 'free' | 'pro' | 'enterprise'

  status:
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'unpaid'

  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  trial_end: string | null
  created_at: string
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string
  action: ActivityAction
  resource_type: 'project' | 'dataset' | 'report'
  resource_id: string
  metadata: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

// ── KPI Engine Types ───────────────────────────────────

export interface CampaignRow {
  campaign:    string
  impressions: number
  clicks:      number
  spend:       number
  revenue:     number
  conversions: number
  // Allow additional columns from user data
  [key: string]: string | number
}

export interface KPISnapshot {
  impressions: number
  clicks:      number
  spend:       number
  revenue:     number
  conversions: number
  ctr:         number   // click-through rate %
  cpc:         number   // cost per click $
  cpm:         number   // cost per mille $
  cpa:         number   // cost per acquisition $
  roas:        number   // return on ad spend x
  roi:         number   // return on investment %
  cvr:         number   // conversion rate %
  profit:      number   // revenue - spend $
}

export interface HealthScore {
  total: number
  factors: {
    CTR:  HealthFactor
    ROAS: HealthFactor
    CPA:  HealthFactor
    CVR:  HealthFactor
  }
}

export interface HealthFactor {
  score: number
  max:   number
  label: string
  color: string
}

export type BusinessStatus = 'Elite' | 'Strong' | 'Average' | 'Critical'

export interface BusinessStatusResult {
  label: BusinessStatus
  cls:   string
}

// ── Column Mapping ─────────────────────────────────────

export interface ColumnMap {
  campaign:    string | null
  impressions: string | null
  clicks:      string | null
  spend:       string | null
  revenue:     string | null
  conversions: string | null
}

// ── Insight / Risk / Recommendation Types ──────────────

export interface StrategicInsight {
  color:  string
  bg:     string
  tag:    string
  icon:   'trend-up' | 'alert' | 'minus' | 'star'
  text:   string
  metric: string
}

export interface RiskItem {
  severity: 'Critical' | 'Caution' | 'Healthy'
  cls:      string
  title:    string
  impact:   string
  action:   string
  kpi:      string
  value:    string
}

export interface Recommendation {
  priority: number
  area:     string
  action:   string
  rationale: string
  impact:   string
}

export interface Opportunity {
  type:    'gold' | 'blue' | 'green'
  label:   string
  name:    string
  stat:    string
  statLabel: string
  badge:   string
}

// ── Upload Types ───────────────────────────────────────

export interface UploadResult {
  success: boolean
  dataset?: Dataset
  data?: CampaignRow[]
  error?: string
}

export interface ParseResult {
  data:    CampaignRow[]
  columns: string[]
  rowCount: number
}

// ── API Response Types ─────────────────────────────────

export interface ApiResponse<T = unknown> {
  data:    T | null
  error:   string | null
  status:  number
}

export interface PaginatedResponse<T> {
  data:        T[]
  total:       number
  page:        number
  page_size:   number
  total_pages: number
}

// ── UI State Types ─────────────────────────────────────

export interface DashboardState {
  rawData:        CampaignRow[]
  kpis:           KPISnapshot | null
  health:         HealthScore | null
  businessStatus: BusinessStatusResult | null
  insights:       StrategicInsight[]
  risks:          RiskItem[]
  recommendations: Recommendation[]
  opportunities:  Opportunity[]
  isLoading:      boolean
  isSample:       boolean
  activeDataset:  Dataset | null
  activeReport:   Report | null
}

// ── Auth Types ─────────────────────────────────────────

export interface LoginCredentials {
  email:    string
  password: string
}

export interface RegisterCredentials {
  email:      string
  password:   string
  full_name:  string
}

export interface ResetPasswordCredentials {
  email: string
}

// ── Activity Actions ───────────────────────────────────

export type ActivityAction =
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'dataset.uploaded'
  | 'dataset.processed'
  | 'dataset.deleted'
  | 'report.generated'
  | 'report.starred'
  | 'report.deleted'
  | 'report.exported'

// ── Supabase Database Schema Types ─────────────────────
// Auto-generated types to complement Supabase's generated types.

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        // id is supplied by the auth.users FK; role/plan/stripe fields have
        // DB defaults or are nullable, so they're optional on insert.
        Insert: Pick<User, 'id' | 'email'> &
          Partial<Pick<User, 'full_name' | 'avatar_url' | 'role' | 'plan' | 'stripe_customer_id' | 'stripe_subscription_id'>>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        // color has a DB default; description is nullable.
        Insert: Pick<Project, 'owner_id' | 'name'> &
          Partial<Pick<Project, 'description' | 'color'>>
        Update: Partial<Omit<Project, 'id' | 'owner_id' | 'created_at'>>
      }
      datasets: {
        Row: Dataset
        // row_count, column_map, status, error_message all have DB
        // defaults or are nullable; id may be client-generated (upload
        // route supplies a UUID up front) so it stays optional too.
        Insert: Pick<Dataset, 'owner_id' | 'project_id' | 'name' | 'file_name' | 'file_path' | 'file_size' | 'file_type'> &
          Partial<Pick<Dataset, 'id' | 'row_count' | 'column_map' | 'cached_rows' | 'status' | 'error_message'>>
        Update: Partial<Omit<Dataset, 'id' | 'owner_id' | 'created_at'>>
      }
      reports: {
        Row: Report
        // insights/risks/recommendations/opportunities/is_starred/notes/
        // pdf_exported_at all have DB defaults or are nullable.
        Insert: Pick<Report, 'owner_id' | 'project_id' | 'dataset_id' | 'name' | 'kpis' | 'health_score' | 'business_status'> &
          Partial<Pick<Report, 'insights' | 'risks' | 'recommendations' | 'opportunities' | 'notes' | 'is_starred' | 'pdf_exported_at'>>
        Update: Partial<Omit<Report, 'id' | 'owner_id' | 'created_at'>>
      }
      subscriptions: {
        Row: Subscription
        // Nearly every column besides user_id has a DB default or is
        // nullable — the webhook handler builds these rows incrementally.
        Insert: Pick<Subscription, 'user_id'> &
          Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
        Update: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at'>>
      }
      activity_logs: {
        Row: ActivityLog
        // metadata and ip_address have a DB default / are nullable.
        Insert: Pick<ActivityLog, 'user_id' | 'action' | 'resource_type' | 'resource_id'> &
          Partial<Pick<ActivityLog, 'metadata' | 'ip_address'>>
        Update: never
      }
    }
  }
}
