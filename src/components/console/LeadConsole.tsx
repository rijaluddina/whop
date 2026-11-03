import { useEffect, useState } from 'react';
import { ConsoleLayout } from './ConsoleLayout';

interface LeadItem {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  service?: string;
  address?: string;
  message?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

interface ConsoleApiResponse<T> {
  data?: T[];
  error?: string;
}

export const LeadConsole = () => {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/leads')
      .then((r) => r.json())
      .then((data: ConsoleApiResponse<LeadItem>) => {
        if (!cancelled) setLeads(Array.isArray(data.data) ? data.data : []);
        if (!cancelled && data.error) setError(data.error);
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat daftar lead.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const metaField = (lead: LeadItem, key: string) => {
    return lead.metadata?.[key] ?? lead[key as keyof LeadItem] ?? '-';
  };

  return (
    <ConsoleLayout title="Lead — estimasi permintaan pelanggan" experienceId="exp_lwCZRXodbz56vG">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Estimate request leads</h2>
          <a
            href="https://whop.com/dashboard/biz_LHN26NTWx9YO5m/people"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 text-sm text-slate-300 hover:text-white border border-slate-600 rounded hover:bg-slate-800 transition"
          >
            Lihat di Whop Dashboard → Sub accounts
          </a>
        </div>

        {error && (
          <div className="rounded bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
            Memuat lead…
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded bg-slate-800 border border-slate-700 p-6 text-center text-slate-400 text-sm">
            Belum ada lead. Ketika pelanggan mengirimkan estimasi melalui situs, lead akan muncul di
            sini.
          </div>
        ) : (
          <div className="rounded bg-slate-800 border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">ID</th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">Nama</th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Email
                  </th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Telepon
                  </th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Layanan
                  </th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Diajukan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-slate-300">{lead.id.slice(-8)}</td>
                    <td className="px-4 py-3 text-slate-200">{metaField(lead, 'name')}</td>
                    <td className="px-4 py-3 text-slate-300">{metaField(lead, 'email')}</td>
                    <td className="px-4 py-3 text-slate-300">{metaField(lead, 'phone')}</td>
                    <td className="px-4 py-3 text-slate-300">{metaField(lead, 'service')}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {metaField(lead, 'createdAt')
                        ? new Date(String(metaField(lead, 'createdAt'))).toLocaleDateString('id-ID')
                        : '-'}
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
