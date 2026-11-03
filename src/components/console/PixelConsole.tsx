import { useEffect, useState } from 'react';
import { ConsoleLayout } from './ConsoleLayout';

interface EventItem {
  id?: string;
  name?: string;
  properties?: Record<string, unknown>;
  created_at?: string;
  timestamp?: string;
}

interface ConsoleApiResponse<T> {
  data?: T[];
  error?: string;
}

const defaultRange = () => {
  const to = new Date();
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return { from: from.toISOString(), to: to.toISOString() };
};

export const PixelConsole = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState(defaultRange());

  useEffect(() => {
    let cancelled = false;
    const url = `/api/events?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`;
    fetch(url)
      .then((r) => r.json())
      .then((data: ConsoleApiResponse<EventItem>) => {
        if (!cancelled) setEvents(Array.isArray(data.data) ? data.data : []);
        if (!cancelled && data.error) setError(data.error);
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat daftar event pixel.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range.from, range.to]);

  const eventTime = (ev: EventItem) => {
    const ts = ev.created_at ?? ev.timestamp ?? ev.id ?? '';
    try {
      return new Date(ts).toLocaleString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <ConsoleLayout title="Pixel — event whop.track" experienceId="exp_wFsRMd3RWEdBoz">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">Whop.track events</h2>
            <p className="text-xs text-slate-500">
              Event pelanggan (estimate, checkout, invoice) dalam 30 hari terakhir.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={range.from.slice(0, 10)}
              onChange={(e) =>
                setRange({
                  ...range,
                  from: e.target.value ? new Date(e.target.value).toISOString() : range.from,
                })
              }
              className="bg-[#020617] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
            <span className="text-xs text-slate-500">ke</span>
            <input
              type="date"
              value={range.to.slice(0, 10)}
              onChange={(e) =>
                setRange({
                  ...range,
                  to: e.target.value ? new Date(e.target.value).toISOString() : range.to,
                })
              }
              className="bg-[#020617] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="rounded bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
            Memuat event…
          </div>
        ) : events.length === 0 ? (
          <div className="rounded bg-slate-800 border border-slate-700 p-6 text-center text-slate-400 text-sm">
            Belum ada event tercatat. Buka layanan, kirim estimasi, atau mulai checkout di situs.
          </div>
        ) : (
          <div className="rounded bg-slate-800 border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Waktu
                  </th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Event
                  </th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Payload
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {events.map((ev) => (
                  <tr key={ev.id || ev.name} className="hover:bg-slate-800/50 transition group">
                    <td className="px-4 py-3 text-slate-500 text-xs">{eventTime(ev)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                        <span className="text-slate-200 font-mono text-xs">{ev.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs font-mono max-w-[420px] truncate">
                      {JSON.stringify(ev.properties ?? {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ConsoleLayout>
  );
};
