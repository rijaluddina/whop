import { useEffect, useState } from 'react';
import { ConsoleLayout } from './ConsoleLayout';

interface InvoiceItem {
  id: string;
  number?: string;
  status?: string;
  customer_name?: string;
  email_address?: string;
  amount_due?: { currency?: string; amount?: string };
  total?: { currency?: string; amount?: string };
  created_at?: string;
}

interface ConsoleApiResponse<T> {
  data?: T[];
  error?: string;
}

export const InvoiceConsole = () => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    description: '',
    payment_method_id: '',
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/invoices')
      .then((r) => r.json())
      .then((data: ConsoleApiResponse<InvoiceItem>) => {
        if (!cancelled) setInvoices(Array.isArray(data.data) ? data.data : []);
        if (!cancelled && data.error) setError(data.error);
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat daftar invoice.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          description: form.description.trim(),
          payment_method_id: form.payment_method_id.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error((data as { message?: string }).message || 'Gagal membuat invoice');
      setOpen(false);
      setForm({ name: '', email: '', description: '', payment_method_id: '' });
      const r2 = await fetch('/api/invoices');
      const d2 = (await r2.json()) as ConsoleApiResponse<InvoiceItem>;
      setInvoices(Array.isArray(d2.data) ? d2.data : []);
    } catch (err: any) {
      alert(err.message || 'Gagal membuat invoice.');
    } finally {
      setSaving(false);
    }
  };

  const formatMoney = (v: { currency?: string; amount?: string } | null | undefined) => {
    if (!v) return '-';
    const amt = parseFloat(v.amount ?? '0');
    return `${(v.currency ?? 'USD').toUpperCase()} ${amt.toFixed(0)}`;
  };

  const statusBadge = (status: string | undefined) => {
    const s = (status || 'draft').toLowerCase();
    const draft =
      'px-2 py-1 rounded text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20';
    const paid =
      'px-2 py-1 rounded text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    const other =
      'px-2 py-1 rounded text-xs font-medium border bg-slate-600/20 text-slate-400 border-slate-600';
    return s === 'draft' ? draft : s === 'paid' || s === 'collected' ? paid : other;
  };

  return (
    <ConsoleLayout
      title="Invoice — buat &amp; kirim invoice final balance"
      experienceId="exp_ORsFI0oQ0idUBO"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Final balance invoices</h2>
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-2 bg-amber-500 text-[#020617] rounded text-sm font-bold hover:bg-amber-400 transition"
          >
            Buat invoice baru
          </button>
        </div>

        {error && (
          <div className="rounded bg-red-500/10 border border-red-500/30 p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="h-32 flex items-center justify-center text-slate-500 text-sm">
            Memuat invoice…
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded bg-slate-800 border border-slate-700 p-6 text-center text-slate-400 text-sm">
            Belum ada invoice. Buat invoice pertama di atas.
          </div>
        ) : (
          <div className="rounded bg-slate-800 border border-slate-700 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Invoice ID
                  </th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Jumlah
                  </th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Status
                  </th>
                  <th className="px-4 py-3 text-slate-400 font-semibold uppercase text-xs">
                    Dibuat
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-slate-300">{inv.number || inv.id.slice(-8)}</td>
                    <td className="px-4 py-3 text-slate-200">{inv.customer_name || '-'}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {formatMoney(inv.amount_due ?? inv.total)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusBadge(inv.status)}>{inv.status || 'draft'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {inv.created_at ? new Date(inv.created_at).toLocaleDateString('id-ID') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create invoice modal */}
        {open ? (
          <>
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0f172a] border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <h3 className="text-lg font-semibold text-slate-100 mb-4">
                Buat Invoice Final Balance
              </h3>
              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">
                    Nama customer
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">
                    Email customer
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">
                    Deskripsi / referensi pekerjaan
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="Roof replacement final balance (minus deposit). Job: JOB-XXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase font-semibold mb-1">
                    Stored Payment Method ID (opsional, wajib untuk auto-charge)
                  </label>
                  <input
                    value={form.payment_method_id}
                    onChange={(e) => setForm({ ...form, payment_method_id: e.target.value })}
                    className="w-full bg-[#020617] border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                    placeholder="payt_..."
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2 border border-slate-700 rounded text-sm text-slate-300 hover:bg-slate-800 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2 bg-amber-500 rounded text-sm font-bold text-[#020617] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400 transition"
                  >
                    {saving ? 'Membuat…' : 'Buat invoice'}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : null}
      </div>
    </ConsoleLayout>
  );
};
