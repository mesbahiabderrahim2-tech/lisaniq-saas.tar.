// ══════════════════════════════════════════════════════
// LisanIQ — KPI Calculation Engine
//
// PRESERVED exactly from the original HTML implementation.
// All formulas, thresholds, and scoring algorithms are
// identical to the prototype — this is the business logic
// source of truth.
//
// Pure functions only — no side effects, no UI dependencies.
// ══════════════════════════════════════════════════════

import type {
  CampaignRow,
  KPISnapshot,
  HealthScore,
  BusinessStatusResult,
  StrategicInsight,
  RiskItem,
  Recommendation,
  Opportunity,
} from '@/types'

// ── Column Alias Map ───────────────────────────────────
// Maps known column name variants to canonical field names.

export const COLUMN_ALIASES: Record<string, string[]> = {
  campaign:    ['campaign','campaign_name','campaignname','campaign name','name','ad name','ad set name','حملة','اسم الحملة','اسم'],
  impressions: ['impressions','impr','impression','views','مشاهدات','ظهور'],
  clicks:      ['clicks','click','link clicks','نقرات','نقر'],
  spend:       ['spend','cost','amount spent','budget spent','ad spend','إنفاق','تكلفة','المصروف','الإنفاق'],
  revenue:     ['revenue','income','sales','conversion value','purchase value','إيراد','عائد','مبيعات','إجمالي الإيراد'],
  conversions: ['conversions','conv','results','purchases','leads','تحويلات','نتائج'],
}

/**
 * Finds the matching header from the user's file for a given canonical field.
 */
export function matchHeader(headers: string[], aliases: string[]): string | null {
  for (const h of headers) {
    if (aliases.includes(h.toLowerCase().trim())) return h
  }
  return null
}

/**
 * Normalises raw parsed rows to the canonical CampaignRow schema.
 * Applies column alias matching and preserves all additional columns.
 */
export function normaliseRows(rows: Record<string, string | number>[]): CampaignRow[] {
  if (!rows.length) return []

  const headers = Object.keys(rows[0])
  const map: Record<string, string> = {}

  for (const [canonical, aliases] of Object.entries(COLUMN_ALIASES)) {
    const found = matchHeader(headers, aliases)
    if (found && !map[found]) map[found] = canonical
  }

  return rows.map(r => {
    const normalised: CampaignRow = {
      campaign:    '',
      impressions: 0,
      clicks:      0,
      spend:       0,
      revenue:     0,
      conversions: 0,
    }

    headers.forEach(h => {
      const canonical = map[h] || h
      const raw = r[h]
      const numeric = parseFloat(String(raw))

      if (['impressions','clicks','spend','revenue','conversions'].includes(canonical)) {
        (normalised as Record<string, string | number>)[canonical] = isNaN(numeric) ? 0 : numeric
      } else {
        (normalised as Record<string, string | number>)[canonical] = raw
      }
    })

    return normalised
  })
}

// ── KPI Engine (PRESERVED from original) ──────────────

/**
 * Calculates aggregate KPIs across all campaign rows.
 * Formulas are identical to the original HTML implementation.
 */
export function calcKPIs(rows: CampaignRow[]): KPISnapshot {
  const sum = (key: keyof CampaignRow): number =>
    rows.reduce((acc, r) => acc + (parseFloat(String(r[key])) || 0), 0)

  const imp = sum('impressions')
  const clk = sum('clicks')
  const spd = sum('spend')
  const rev = sum('revenue')
  const con = sum('conversions')

  return {
    impressions: imp,
    clicks:      clk,
    spend:       spd,
    revenue:     rev,
    conversions: con,
    ctr:   imp ? (clk / imp) * 100        : 0,
    cpc:   clk ? spd / clk                : 0,
    cpm:   imp ? (spd / imp) * 1000       : 0,
    cpa:   con ? spd / con                : 0,
    roas:  spd ? rev / spd                : 0,
    roi:   spd ? ((rev - spd) / spd) * 100 : 0,
    cvr:   clk ? (con / clk) * 100        : 0,
    profit: rev - spd,
  }
}

// ── Health Score (PRESERVED from original) ─────────────

/**
 * Calculates the Marketing Health Score (0–100).
 * Four-factor weighted model identical to original.
 */
export function calcHealth(k: KPISnapshot): HealthScore {
  const sCTR  = Math.min(30, (k.ctr  / 2.5) * 30)
  const sROAS = Math.min(30, (k.roas / 4.5) * 30)
  const sCPA  = Math.min(20, Math.max(0, (1 - Math.max(0, k.cpa - 3) / 47) * 20))
  const sCVR  = Math.min(20, (k.cvr  / 4.0) * 20)
  const total = Math.min(100, Math.max(0, Math.round(sCTR + sROAS + sCPA + sCVR)))

  return {
    total,
    factors: {
      CTR:  { score: Math.round(sCTR),  max: 30, label: 'Click-Through', color: '#3d6fe8' },
      ROAS: { score: Math.round(sROAS), max: 30, label: 'Ad Return',     color: '#1fbb8a' },
      CPA:  { score: Math.round(sCPA),  max: 20, label: 'Acq. Cost',     color: '#d4922a' },
      CVR:  { score: Math.round(sCVR),  max: 20, label: 'Conversion',    color: '#7c4dff' },
    },
  }
}

export function healthColor(score: number): string {
  return score >= 75 ? '#1fbb8a' : score >= 50 ? '#d4922a' : '#dc4b4b'
}

export function healthLabel(score: number): string {
  return score >= 80 ? 'Exceptional'
       : score >= 65 ? 'Strong'
       : score >= 45 ? 'Adequate'
       : 'Underperforming'
}

// ── Business Status (PRESERVED from original) ──────────

/**
 * Classifies portfolio performance as Elite / Strong / Average / Critical.
 */
export function calcBusinessStatus(k: KPISnapshot): BusinessStatusResult {
  const hs = calcHealth(k)

  if (hs.total >= 78 && k.roas >= 4  && k.roi > 80)
    return { label: 'Elite',    cls: 'status-elite' }
  if (hs.total >= 58 && k.roas >= 2.5 && k.roi > 20)
    return { label: 'Strong',   cls: 'status-strong' }
  if (k.roi >= 0)
    return { label: 'Average',  cls: 'status-average' }

  return   { label: 'Critical', cls: 'status-critical' }
}

// ── Formatting Utilities (PRESERVED from original) ─────

/**
 * Formats numeric KPI values for display.
 * Identical formatting logic to original f() function.
 */
export function formatValue(v: number | null | undefined, type: string): string {
  if (v == null || isNaN(v)) return '—'
  const n = v

  switch (type) {
    case '%':  return n.toFixed(2) + '%'
    case '$':  return '$' + n.toFixed(2)
    case 'x':  return n.toFixed(2) + 'x'
    case 'k':
      return n >= 1e6 ? (n / 1e6).toFixed(1) + 'M'
           : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K'
           : n.toFixed(0)
    case '$k':
      return n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M'
           : n >= 1e3 ? '$' + (n / 1e3).toFixed(1) + 'K'
           : '$' + n.toFixed(0)
    default: return n.toFixed(2)
  }
}

// ── Strategic Insights (PRESERVED from original) ───────

/**
 * Generates deterministic strategic insights from KPI snapshot.
 * Logic identical to original rStrategicInsights().
 */
export function calcStrategicInsights(k: KPISnapshot): StrategicInsight[] {
  const insights: StrategicInsight[] = []
  const fv = formatValue

  // ROAS insight
  if (k.roas >= 5)
    insights.push({ color:'#1fbb8a', bg:'rgba(31,187,138,.1)', tag:'Return on Spend', icon:'trend-up',
      text:`Advertising investment is generating exceptional returns at ${fv(k.roas,'x')} ROAS, significantly outperforming the 4x industry benchmark.`,
      metric:`ROAS ${fv(k.roas,'x')}` })
  else if (k.roas >= 3)
    insights.push({ color:'#3d6fe8', bg:'rgba(61,111,232,.1)', tag:'Return on Spend', icon:'trend-up',
      text:`Ad investment is returning ${fv(k.roas,'x')} for every unit spent. Performance is solid but optimization toward 4x+ is achievable.`,
      metric:`ROAS ${fv(k.roas,'x')}` })
  else
    insights.push({ color:'#dc4b4b', bg:'rgba(220,75,75,.1)', tag:'Return on Spend', icon:'alert',
      text:`ROAS of ${fv(k.roas,'x')} signals underperforming ad investment. Budget reallocation is recommended to improve returns.`,
      metric:`ROAS ${fv(k.roas,'x')}` })

  // CTR insight
  if (k.ctr >= 2)
    insights.push({ color:'#1fbb8a', bg:'rgba(31,187,138,.1)', tag:'Creative Performance', icon:'trend-up',
      text:`Click-through rate of ${fv(k.ctr,'%')} confirms strong creative resonance with the target audience.`,
      metric:`CTR ${fv(k.ctr,'%')}` })
  else if (k.ctr >= 1)
    insights.push({ color:'#d4922a', bg:'rgba(212,146,42,.1)', tag:'Creative Performance', icon:'minus',
      text:`CTR of ${fv(k.ctr,'%')} is below the 2% threshold. Creative refresh could meaningfully increase reach efficiency.`,
      metric:`CTR ${fv(k.ctr,'%')}` })
  else
    insights.push({ color:'#dc4b4b', bg:'rgba(220,75,75,.1)', tag:'Creative Performance', icon:'alert',
      text:`Creative performance is limiting growth. A CTR of ${fv(k.ctr,'%')} indicates ad copy and visuals require immediate revision.`,
      metric:`CTR ${fv(k.ctr,'%')}` })

  // CPA insight
  if (k.cpa > 25)
    insights.push({ color:'#dc4b4b', bg:'rgba(220,75,75,.1)', tag:'Acquisition Cost', icon:'alert',
      text:`Acquisition costs at ${fv(k.cpa,'$')} per conversion are reducing overall profitability and compressing margins.`,
      metric:`CPA ${fv(k.cpa,'$')}` })
  else if (k.cpa > 12)
    insights.push({ color:'#d4922a', bg:'rgba(212,146,42,.1)', tag:'Acquisition Cost', icon:'minus',
      text:`CPA of ${fv(k.cpa,'$')} is within acceptable range but optimization of the conversion funnel could reduce costs further.`,
      metric:`CPA ${fv(k.cpa,'$')}` })
  else
    insights.push({ color:'#1fbb8a', bg:'rgba(31,187,138,.1)', tag:'Acquisition Cost', icon:'trend-up',
      text:`Acquisition cost efficiency is strong at ${fv(k.cpa,'$')} per conversion, supporting profitable scaling.`,
      metric:`CPA ${fv(k.cpa,'$')}` })

  // CVR insight
  if (k.cvr >= 3)
    insights.push({ color:'#3d6fe8', bg:'rgba(61,111,232,.1)', tag:'Conversion Efficiency', icon:'trend-up',
      text:`Conversion rate of ${fv(k.cvr,'%')} indicates effective landing page and funnel alignment with campaign messaging.`,
      metric:`CVR ${fv(k.cvr,'%')}` })
  else
    insights.push({ color:'#d4922a', bg:'rgba(212,146,42,.1)', tag:'Conversion Efficiency', icon:'minus',
      text:`Conversion rate of ${fv(k.cvr,'%')} suggests friction in the post-click journey. Landing page optimization is a high-leverage opportunity.`,
      metric:`CVR ${fv(k.cvr,'%')}` })

  // ROI macro insight
  if (k.roi > 100)
    insights.push({ color:'#c9a84c', bg:'rgba(201,168,76,.1)', tag:'Business Return', icon:'star',
      text:`Marketing ROI of ${fv(k.roi,'%')} places this portfolio in the top performance tier. Current strategy should be documented and scaled.`,
      metric:`ROI ${fv(k.roi,'%')}` })

  return insights.slice(0, 5)
}

// ── Risk Detection (PRESERVED from original) ───────────

/**
 * Generates risk matrix from KPI snapshot.
 * Severity classification and thresholds identical to original.
 */
export function calcRisks(k: KPISnapshot): RiskItem[] {
  const fv = formatValue
  const risks: RiskItem[] = []

  // ROAS
  if (k.roas < 2)
    risks.push({ severity:'Critical', cls:'ri-critical', title:'Critically Low Return on Ad Spend',
      impact:`A ROAS of ${fv(k.roas,'x')} means advertising is generating less than $2 for every $1 invested. The business is not recovering its marketing costs through revenue.`,
      action:'Pause underperforming campaigns immediately', kpi:'ROAS', value:fv(k.roas,'x') })
  else if (k.roas < 4)
    risks.push({ severity:'Caution', cls:'ri-caution', title:'ROAS Below Industry Benchmark',
      impact:`ROAS of ${fv(k.roas,'x')} is below the 4x benchmark. While profitable, substantial optimization opportunity exists.`,
      action:'Reallocate toward high-ROAS campaigns', kpi:'ROAS', value:fv(k.roas,'x') })
  else
    risks.push({ severity:'Healthy', cls:'ri-ok', title:'ROAS Performing Above Benchmark',
      impact:`Return on ad spend at ${fv(k.roas,'x')} exceeds industry standards. Current media mix is generating strong returns.`,
      action:'Scale budget to maximize returns', kpi:'ROAS', value:fv(k.roas,'x') })

  // ROI
  if (k.roi < 0)
    risks.push({ severity:'Critical', cls:'ri-critical', title:'Negative Return on Marketing Investment',
      impact:`ROI of ${fv(k.roi,'%')} indicates total advertising spend exceeds total revenue. This is unsustainable and requires immediate portfolio restructuring.`,
      action:'Suspend negative-ROI campaigns', kpi:'ROI', value:fv(k.roi,'%') })
  else if (k.roi < 30)
    risks.push({ severity:'Caution', cls:'ri-caution', title:'Low Marketing ROI',
      impact:`ROI of ${fv(k.roi,'%')} indicates slim profitability margins. Strategic reallocation could significantly improve returns.`,
      action:'Optimize funnel and reduce CPA', kpi:'ROI', value:fv(k.roi,'%') })

  // CPA
  if (k.cpa > 40)
    risks.push({ severity:'Critical', cls:'ri-critical', title:'Acquisition Cost Critically Elevated',
      impact:`At ${fv(k.cpa,'$')} per acquisition, unit economics are unsustainable. Each customer is too expensive to profitably retain.`,
      action:'Audit audience targeting and landing pages', kpi:'CPA', value:fv(k.cpa,'$') })
  else if (k.cpa > 20)
    risks.push({ severity:'Caution', cls:'ri-caution', title:'Acquisition Cost Above Optimal Range',
      impact:`CPA of ${fv(k.cpa,'$')} is compressing profit margins. Landing page and funnel optimization could reduce this meaningfully.`,
      action:'A/B test landing pages and CTAs', kpi:'CPA', value:fv(k.cpa,'$') })

  // CTR
  if (k.ctr < 0.5)
    risks.push({ severity:'Critical', cls:'ri-critical', title:'Click-Through Rate Critically Low',
      impact:`A CTR of ${fv(k.ctr,'%')} indicates severe creative or targeting misalignment. Reach is being wasted on disengaged audiences.`,
      action:'Replace creative assets immediately', kpi:'CTR', value:fv(k.ctr,'%') })
  else if (k.ctr < 1.5)
    risks.push({ severity:'Caution', cls:'ri-caution', title:'Click-Through Rate Below Benchmark',
      impact:`CTR of ${fv(k.ctr,'%')} suggests room for improvement in ad creative and audience targeting efficiency.`,
      action:'Refresh ad copy and creative formats', kpi:'CTR', value:fv(k.ctr,'%') })

  // CVR
  if (k.cvr < 1)
    risks.push({ severity:'Caution', cls:'ri-caution', title:'Post-Click Conversion Rate Low',
      impact:`CVR of ${fv(k.cvr,'%')} signals friction in the conversion funnel. Traffic is being acquired but not converting.`,
      action:'Optimize post-click experience', kpi:'CVR', value:fv(k.cvr,'%') })

  return risks
}

// ── Recommendations (PRESERVED from original) ──────────

/**
 * Generates priority-ordered executive recommendations.
 * Logic identical to original rRecommendations().
 */
export function calcRecommendations(k: KPISnapshot): Recommendation[] {
  const fv = formatValue
  const recs: Recommendation[] = []

  if (k.roas < 3)
    recs.push({ priority:1, area:'Budget Strategy',
      action:'Reallocate budget toward highest-performing campaigns',
      rationale:`Current ROAS of ${fv(k.roas,'x')} indicates uneven campaign performance. Concentrating spend on proven performers will accelerate returns.`,
      impact:'High Revenue Impact' })

  if (k.ctr < 1.5)
    recs.push({ priority:2, area:'Creative Optimization',
      action:'Refresh creative assets and ad copy across all active campaigns',
      rationale:`A CTR of ${fv(k.ctr,'%')} signals creative fatigue or audience misalignment. New formats and messaging should be tested immediately.`,
      impact:'High Efficiency Gain' })

  if (k.cvr < 2)
    recs.push({ priority:3, area:'Funnel Performance',
      action:'Improve landing page conversion flow and post-click experience',
      rationale:`With CVR at ${fv(k.cvr,'%')}, a significant portion of acquired traffic is not converting. Funnel analysis and A/B testing are recommended.`,
      impact:'Medium Revenue Lift' })

  if (k.cpa > 20)
    recs.push({ priority:4, area:'Cost Efficiency',
      action:'Audit audience targeting parameters to reduce acquisition cost',
      rationale:`CPA of ${fv(k.cpa,'$')} is above optimal. Tighter audience segmentation and negative keyword refinement typically reduce this by 20–35%.`,
      impact:'Medium Cost Reduction' })

  if (k.roas >= 4 && k.roi > 50)
    recs.push({ priority:3, area:'Growth Acceleration',
      action:'Increase budget allocation to scale top-performing campaigns',
      rationale:`With ROAS at ${fv(k.roas,'x')} and ROI at ${fv(k.roi,'%')}, the economics justify aggressive scaling of the highest-performing campaigns.`,
      impact:'High Revenue Impact' })

  if (k.cpm > 10)
    recs.push({ priority:5, area:'Media Efficiency',
      action:'Explore lower-CPM channels to expand reach at reduced cost',
      rationale:`CPM of ${fv(k.cpm,'$')} suggests premium inventory dependence. Diversifying into contextual and programmatic channels may reduce cost-per-reach.`,
      impact:'Low–Medium Cost Saving' })

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 5)
}

// ── Opportunities (PRESERVED from original) ────────────

/**
 * Identifies top-performing campaigns as scaling opportunities.
 * Logic identical to original rOpportunities().
 */
export function calcOpportunities(data: CampaignRow[]): Opportunity[] {
  if (!data.length) return []

  const n = (r: CampaignRow): string =>
    String(r.campaign || r['campaign_name'] || r['Campaign Name'] || r.name || r['ad name'] || 'Campaign')

  const opps: Opportunity[] = []

  // Highest revenue
  const byRev = [...data].sort(
    (a, b) => (parseFloat(String(b.revenue)) || 0) - (parseFloat(String(a.revenue)) || 0)
  )
  if (byRev.length) {
    const r = byRev[0]
    opps.push({
      type: 'gold', label: 'Highest Revenue Campaign',
      name: n(r), stat: formatValue(parseFloat(String(r.revenue)), '$k'),
      statLabel: 'Total Revenue', badge: 'Top Performer',
    })
  }

  // Highest ROAS
  const byROAS = [...data]
    .filter(r => parseFloat(String(r.spend)) > 0)
    .sort((a, b) =>
      (parseFloat(String(b.revenue)) / parseFloat(String(b.spend))) -
      (parseFloat(String(a.revenue)) / parseFloat(String(a.spend)))
    )
  if (byROAS.length) {
    const r = byROAS[0]
    const rv = parseFloat(String(r.spend))
      ? parseFloat(String(r.revenue)) / parseFloat(String(r.spend)) : 0
    opps.push({
      type: 'blue', label: 'Highest ROAS Campaign',
      name: n(r), stat: formatValue(rv, 'x'),
      statLabel: 'Return on Spend', badge: 'Scale Opportunity',
    })
  }

  // Highest CVR
  const byCVR = [...data]
    .filter(r => parseFloat(String(r.clicks)) > 0)
    .sort((a, b) =>
      (parseFloat(String(b.conversions)) / parseFloat(String(b.clicks))) -
      (parseFloat(String(a.conversions)) / parseFloat(String(a.clicks)))
    )
  if (byCVR.length) {
    const r = byCVR[0]
    const cv = parseFloat(String(r.clicks))
      ? (parseFloat(String(r.conversions)) / parseFloat(String(r.clicks))) * 100 : 0
    opps.push({
      type: 'green', label: 'Highest Conversion Campaign',
      name: n(r), stat: formatValue(cv, '%'),
      statLabel: 'Conversion Rate', badge: 'Efficiency Leader',
    })
  }

  return opps
}

// ── Sample Data (PRESERVED from original) ──────────────

export const SAMPLE_DATA: CampaignRow[] = [
  { campaign:'Brand Awareness Q2',   impressions:420000, clicks:8820,  spend:3200,  revenue:11200, conversions:224 },
  { campaign:'Retargeting – Cart',   impressions:185000, clicks:9250,  spend:4100,  revenue:20500, conversions:410 },
  { campaign:'Search – High Intent', impressions:98000,  clicks:7840,  spend:5600,  revenue:28000, conversions:560 },
  { campaign:'Social – Prospecting', impressions:650000, clicks:9750,  spend:2800,  revenue:8400,  conversions:168 },
  { campaign:'Video Pre-Roll',        impressions:310000, clicks:4650,  spend:1950,  revenue:5850,  conversions:117 },
  { campaign:'Email Reactivation',    impressions:72000,  clicks:7200,  spend:900,   revenue:9000,  conversions:180 },
  { campaign:'Influencer Campaign',   impressions:230000, clicks:6900,  spend:6200,  revenue:18600, conversions:248 },
  { campaign:'Google Shopping',       impressions:144000, clicks:11520, spend:7800,  revenue:39000, conversions:780 },
]
