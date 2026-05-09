// Tier-based late fine + plan-aware task earnings calculator.
// Used both server-side and client-side.

/**
 * Calculate task earnings for a given count of completed tasks (e.g. calls).
 * - First `plan` tasks earn `rate` so'm each
 * - Tasks above `plan` earn `overflowRate` so'm each
 *
 * Example: 80 tasks, plan=60, rate=897, overflowRate=300
 *   = 60 × 897 + 20 × 300 = 53,820 + 6,000 = 59,820 so'm
 */
export function calcTaskEarnings(tasks, rate, overflowRate, plan) {
  const t = Number(tasks) || 0;
  if (t <= 0) return 0;
  const r = Number(rate) || 0;
  const oR = Number(overflowRate) || 0;
  const p = Number(plan) || 0;
  if (p <= 0 || t <= p) return t * r;
  return p * r + (t - p) * oR;
}


export const DEFAULT_LATE_FINE_TIERS = [
  { from: 0, to: 10, percent: 10, amount: 15000 },
  { from: 10, to: 30, percent: 20, amount: 30000 },
  { from: 30, to: 60, percent: 30, amount: 60000 },
  { from: 60, to: 90, percent: 40, amount: 100000 },
  { from: 90, to: null, percent: 100, amount: 150000 },
];

/**
 * Calculate the late penalty (in so'm) for given lateMinutes using the tier list.
 * Tiers are ordered by `to` ascending; the last tier may have `to: null` for unlimited.
 * Match rule: lateMinutes > from AND lateMinutes <= to.
 *
 * Backward-compat fallback: if tiers is empty/missing, returns lateMinutes * fallbackPerMinute.
 */
export function calcLateFineFromTiers(lateMinutes, tiers, fallbackPerMinute = 0) {
  const minutes = Number(lateMinutes) || 0;
  if (minutes <= 0) return 0;
  const list = Array.isArray(tiers) ? tiers : null;
  if (!list || list.length === 0) {
    return minutes * Number(fallbackPerMinute || 0);
  }
  // Walk tiers in order; first match wins
  for (const tier of list) {
    const from = Number(tier.from || 0);
    const to = tier.to == null ? Infinity : Number(tier.to);
    if (minutes > from && minutes <= to) {
      return Number(tier.amount || 0);
    }
  }
  return 0;
}

/** Return the matching tier object (for UI badges). null if no match / 0 minutes. */
export function findLateFineTier(lateMinutes, tiers) {
  const minutes = Number(lateMinutes) || 0;
  if (minutes <= 0 || !Array.isArray(tiers)) return null;
  for (const tier of tiers) {
    const from = Number(tier.from || 0);
    const to = tier.to == null ? Infinity : Number(tier.to);
    if (minutes > from && minutes <= to) return tier;
  }
  return null;
}
