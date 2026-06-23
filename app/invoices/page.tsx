'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminNav from '../components/AdminNav';
import { getAllInvoices } from '../lib/api';

interface Invoice {
  _id: string;
  vendor: string;
  amount: number;
  currency: string;
  status: string;
  invoiceNumber: string;
  user: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Cookies.get('token')) {
      router.push('/login');
      return;
    }
    loadInvoices();
  }, [router, page]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await getAllInvoices(page, 20);
      setInvoices(data.invoices);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleString();
  const formatAmount = (amount: number, currency: string) =>
    `${amount.toFixed(2)} ${currency}`;

  const statusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'ignored':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return 'bg-amber-500/20 text-amber-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Invoices</h1>

        {loading && <div className="text-slate-400">Loading invoices...</div>}
        {error && <div className="text-red-400">{error}</div>}

        {!loading && !error && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="px-6 py-3 font-medium">Vendor</th>
                    <th className="px-6 py-3 font-medium">Invoice #</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">User ID</th>
                    <th className="px-6 py-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 text-white">{invoice.vendor}</td>
                      <td className="px-6 py-4 text-slate-400">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-white">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        {invoice.user}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(invoice.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-slate-400 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
