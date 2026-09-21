/**
 * TTMM Common Formatting and Data Presentation Utilities (DRY)
 */

/**
 * Formats a monetary value with currency symbol and 2 decimal places.
 * Example: formatCurrency(1250, '₹') => "₹ 1,250.00"
 */
export function formatCurrency(amount: number | string | undefined | null, currency: string = '₹'): string {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  const safeNum = isNaN(num) ? 0 : num;
  return `${currency} ${safeNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export type BalanceStatus = 'owed' | 'owing' | 'settled';

export interface NetBalanceMeta {
  status: BalanceStatus;
  text: string;
  sign: string;
  absoluteAmount: number;
  formatted: string;
}

/**
 * Evaluates net financial balance and returns semantic status, sign, and formatted text.
 */
export function getNetBalanceMeta(netBalance: number, currency: string = '₹'): NetBalanceMeta {
  const EPSILON = 0.01;
  if (netBalance > EPSILON) {
    const abs = Math.abs(netBalance);
    return {
      status: 'owed',
      text: `+${formatCurrency(abs, currency)}`,
      sign: '+',
      absoluteAmount: abs,
      formatted: formatCurrency(abs, currency),
    };
  } else if (netBalance < -EPSILON) {
    const abs = Math.abs(netBalance);
    return {
      status: 'owing',
      text: `-${formatCurrency(abs, currency)}`,
      sign: '-',
      absoluteAmount: abs,
      formatted: formatCurrency(abs, currency),
    };
  } else {
    return {
      status: 'settled',
      text: 'Settled',
      sign: '',
      absoluteAmount: 0,
      formatted: formatCurrency(0, currency),
    };
  }
}

/**
 * Extracts a 1-2 character uppercase monogram from a display name or email.
 */
export function getInitials(name?: string | null, fallback: string = '??'): string {
  if (!name || !name.trim()) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Safe date formatter supporting Firestore Timestamps, Date instances, timestamps, and ISO strings.
 */
export function formatDate(
  dateVal: any,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
): string {
  if (!dateVal) return '';
  try {
    const d = typeof dateVal.toDate === 'function' ? dateVal.toDate() : new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, options);
  } catch {
    return '';
  }
}

/**
 * Chronologically sorts items in descending order (newest first).
 */
export function sortByDateDesc<T>(items: T[], dateExtractor: (item: T) => any): T[] {
  return [...items].sort((a, b) => {
    const rawA = dateExtractor(a);
    const rawB = dateExtractor(b);
    const timeA = rawA ? (typeof rawA.toDate === 'function' ? rawA.toDate().getTime() : new Date(rawA).getTime()) : 0;
    const timeB = rawB ? (typeof rawB.toDate === 'function' ? rawB.toDate().getTime() : new Date(rawB).getTime()) : 0;
    return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
  });
}
