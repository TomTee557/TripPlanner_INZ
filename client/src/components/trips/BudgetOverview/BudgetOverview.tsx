import { useEffect, useState } from 'react';
import api from '@services/api';
import type { ApiSuccessResponse } from '@types';
import './BudgetOverview.scss';

// ── Types ─────────────────────────────────────────────────────────────────────

interface BudgetExpense {
  id: string;
  amount: number;
  currency: string;
}

interface BudgetTripSummary {
  id: string;
  title: string;
  budget: string | null;
  dateFrom: string;
  dateTo: string;
  expenses: BudgetExpense[];
}

interface BudgetOverviewProps {
  trips: { id: string }[]; // only used to refresh when selection changes
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PALETTE = [
  '#2979ff', '#ff6b35', '#00c853', '#aa00ff', '#ffc107',
  '#00bcd4', '#e91e63', '#8bc34a', '#ff5722', '#607d8b',
  '#9c27b0', '#3f51b5', '#009688', '#ff9800', '#795548',
];

const CURRENCIES = [
  { code: 'PLN', name: 'Polish Zloty',      flag: '🇵🇱' },
  { code: 'USD', name: 'US Dollar',         flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro',              flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound',     flag: '🇬🇧' },
  { code: 'CHF', name: 'Swiss Franc',       flag: '🇨🇭' },
  { code: 'JPY', name: 'Japanese Yen',      flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar',   flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'SEK', name: 'Swedish Krona',     flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone',   flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone',      flag: '🇩🇰' },
  { code: 'CZK', name: 'Czech Koruna',      flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint',  flag: '🇭🇺' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract the numeric part from budget strings like "600$", "€3,800", "2 500 PLN", "1.234,56 EUR" */
function parseBudgetAmount(raw: string | null): number | null {
  if (!raw) return null;

  // Keep only digits, dot, and comma
  let s = raw.replace(/[^\d.,]/g, '');
  if (!s) return null;

  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');

  if (lastComma !== -1 && lastDot !== -1) {
    // Both separators present — the one appearing later is the decimal separator
    if (lastComma > lastDot) {
      // EU format: "1.234,56" → remove dots, replace comma with dot
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: "1,234.56" → remove commas
      s = s.replace(/,/g, '');
    }
  } else if (lastComma !== -1) {
    // Only comma: if exactly 3 digits follow it, it's a thousands separator ("3,800")
    // otherwise treat as decimal separator ("3,5")
    s = s.slice(lastComma + 1).length === 3
      ? s.replace(/,/g, '')
      : s.replace(',', '.');
  }
  // Only dot or bare digits: already valid for parseFloat

  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

/** Detect budget currency from strings like "600$", "2500 PLN", "200 EUR" */
function parseBudgetCurrency(raw: string | null): string {
  if (!raw) return 'PLN';
  const upper = raw.toUpperCase();
  for (const c of CURRENCIES) {
    if (upper.includes(c.code)) return c.code;
  }
  if (upper.includes('$')) return 'USD';
  if (upper.includes('€')) return 'EUR';
  if (upper.includes('£')) return 'GBP';
  return 'PLN';
}

/** Convert amount from one currency to another using a PLN-based rates map */
function convert(amount: number, from: string, to: string, ratesMap: Map<string, number>): number {
  const fromRate = ratesMap.get(from) ?? 1;
  const toRate = ratesMap.get(to) ?? 1;
  return (amount * fromRate) / toRate;
}

// SVG pie chart — returns path data for each slice
// Zero-value slices are returned with d='' and pct=0 so they are skipped in rendering.
// A single full-circle slice (100%) is handled via a special SVG circle fallback.
function buildPieSlices(values: number[]): { d: string; pct: number }[] {
  const total = values.reduce((s, v) => s + v, 0);
  if (total === 0) return values.map(() => ({ d: '', pct: 0 }));

  const CX = 100, CY = 100, R = 90;
  let angle = -Math.PI / 2;
  return values.map((v) => {
    if (v === 0) return { d: '', pct: 0 };
    const pct = v / total;
    const sweep = pct * 2 * Math.PI;
    // Nearly-full circle: nudge end point slightly so the arc is valid
    const effectiveSweep = sweep >= 2 * Math.PI ? 2 * Math.PI - 0.0001 : sweep;
    const x1 = CX + R * Math.cos(angle);
    const y1 = CY + R * Math.sin(angle);
    angle += effectiveSweep;
    const x2 = CX + R * Math.cos(angle);
    const y2 = CY + R * Math.sin(angle);
    const large = effectiveSweep > Math.PI ? 1 : 0;
    const d = `M ${CX} ${CY} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
    return { d, pct };
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export const BudgetOverview = ({ trips }: BudgetOverviewProps) => {
  const [allSummaries, setAllSummaries] = useState<BudgetTripSummary[]>([]);
  const [ratesMap, setRatesMap] = useState<Map<string, number>>(new Map([['PLN', 1]]));
  const [targetCurrency, setTargetCurrency] = useState('PLN');
  const [pieMode, setPieMode] = useState<'expenses' | 'budget'>('expenses');
  const [loading, setLoading] = useState(true);
  const [ratesError, setRatesError] = useState(false);

  // Fetch all budget summaries once on mount
  useEffect(() => {
    setLoading(true);
    api
      .get<ApiSuccessResponse<BudgetTripSummary[]>>('/trips/budget-summary')
      .then((res) => setAllSummaries(res.data ?? []))
      .catch(() => setAllSummaries([]))
      .finally(() => setLoading(false));
  }, []);

  // Apply the same filter as the trips panel: only show trips present in the `trips` prop
  const allowedIds = new Set(trips.map((t) => t.id));
  const summaries = allSummaries.filter((s) => allowedIds.has(s.id));

  // Fetch live NBP exchange rates once on mount
  useEffect(() => {
    fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json')
      .then((r) => r.json())
      .then((data) => {
        const map = new Map<string, number>();
        map.set('PLN', 1);
        (data[0].rates as { code: string; mid: number }[]).forEach((rate) => {
          map.set(rate.code, rate.mid);
        });
        setRatesMap(map);
      })
      .catch(() => setRatesError(true));
  }, []);

  if (loading) {
    return <div className="budget-overview__loading">Loading budget data…</div>;
  }

  if (summaries.length === 0) {
    return <div className="budget-overview__empty">No trips to display.</div>;
  }

  // Per-trip totals in targetCurrency
  const spentTotals = summaries.map((s) =>
    s.expenses.reduce(
      (sum, e) => sum + convert(e.amount, e.currency, targetCurrency, ratesMap),
      0
    )
  );

  const budgetTotals = summaries.map((s) => {
    const raw = parseBudgetAmount(s.budget);
    const cur = parseBudgetCurrency(s.budget);
    return raw !== null ? convert(raw, cur, targetCurrency, ratesMap) : 0;
  });

  const pieValues = pieMode === 'expenses' ? spentTotals : budgetTotals;
  const grandTotal = pieValues.reduce((s, v) => s + v, 0);
  const slices = buildPieSlices(pieValues);

  return (
    <div className="budget-overview">
      {/* Currency selector */}
      <div className="budget-overview__controls">
        <label className="budget-overview__currency-label" htmlFor="budget-currency">
          Display currency:
        </label>
        <select
          id="budget-currency"
          className="budget-overview__currency-select"
          value={targetCurrency}
          onChange={(e) => setTargetCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.code} — {c.name}
            </option>
          ))}
        </select>
        {ratesError && (
          <span className="budget-overview__rates-error">
            ⚠ Live rates unavailable, using approximate values
          </span>
        )}
        <label className="budget-overview__currency-label" htmlFor="budget-pie-mode">
          Pie chart shows:
        </label>
        <select
          id="budget-pie-mode"
          className="budget-overview__currency-select"
          value={pieMode}
          onChange={(e) => setPieMode(e.target.value as 'expenses' | 'budget')}
        >
          <option value="expenses">Expenses (spent)</option>
          <option value="budget">Budget (planned)</option>
        </select>
      </div>

      {/* Pie chart + legend */}
      <div className="budget-overview__chart-section">
        {grandTotal > 0 ? (
          <>
            <svg
              className="budget-overview__pie"
              viewBox="0 0 200 200"
              aria-label={pieMode === 'expenses' ? 'Expenses by trip' : 'Budget by trip'}
            >
              {slices.map((slice, i) =>
                slice.d ? (
                  <path
                    key={summaries[i].id}
                    d={slice.d}
                    fill={PALETTE[i % PALETTE.length]}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                ) : null
              )}
            </svg>

            <ul className="budget-overview__legend">
              {summaries.map((s, i) => (
                <li key={s.id} className="budget-overview__legend-item">
                  <span
                    className="budget-overview__legend-dot"
                    style={{ background: PALETTE[i % PALETTE.length] }}
                  />
                  <span className="budget-overview__legend-title">{s.title}</span>
                  <span className="budget-overview__legend-amount">
                    {pieValues[i].toFixed(2)} {targetCurrency}
                  </span>
                  <span className="budget-overview__legend-pct">
                    ({(slices[i].pct * 100).toFixed(1)}%)
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="budget-overview__no-expenses">
            {pieMode === 'expenses'
              ? 'No expenses recorded for selected trips.'
              : 'No budget set for selected trips.'}
          </p>
        )}
      </div>

      {/* Budget vs Expenses rows */}
      <div className="budget-overview__list">
        <h3 className="budget-overview__list-title">Budget vs Expenses</h3>
        {summaries.map((s, i) => {
          const spent = spentTotals[i];
          const budget = budgetTotals[i] > 0 ? budgetTotals[i] : null;
          const over = budget !== null && spent > budget;
          const pct = budget && budget > 0
            ? Math.min((spent / budget) * 100, 100)
            : null;

          return (
            <div key={s.id} className="budget-overview__row">
              <div className="budget-overview__row-header">
                <span
                  className="budget-overview__row-dot"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                />
                <span className="budget-overview__row-name">{s.title}</span>
                {over && (
                  <span className="budget-overview__warn" title="Budget exceeded">⚠️</span>
                )}
              </div>

              <div className="budget-overview__row-amounts">
                <span className={`budget-overview__spent${over ? ' budget-overview__spent--over' : ''}`}>
                  Spent: {spent.toFixed(2)} {targetCurrency}
                </span>
                {budget !== null ? (
                  <span className="budget-overview__budget">
                    Budget: {budget.toFixed(2)} {targetCurrency}
                  </span>
                ) : (
                  <span className="budget-overview__budget budget-overview__budget--none">
                    No budget set
                  </span>
                )}
              </div>

              {pct !== null && (
                <div className="budget-overview__bar-wrap">
                  <div
                    className={`budget-overview__bar${over ? ' budget-overview__bar--over' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
              {over && budget !== null && (
                <p className="budget-overview__over-label">
                  Over by {(spent - budget).toFixed(2)} {targetCurrency}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
