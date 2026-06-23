'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import AdminNav from '../../components/AdminNav';
import { getUserInvoices, getUserActivity, getUserMetrics } from '../../lib/api';

type Tab = 'metrics' | 'invoices' | 'activity';

interface Invoice {
  _id: string;
  vendor: string;
  amount: number;
  currency: string;
  status: string;
  invoiceNumber: string;
  createdAt: string;
  extractionMethod?: string;
  confidence?: number;
}

interface ActivityItem {
  _id: string;
  subject: string;
  from: string;
  date: string;
  status: 'processed' | 'skipped' | 'failed';
  reason?: string;
  invoicesFound: number;
  pdfAttachments: number;
  processedAt: string;
  failureCount: number;
  errorDetails?: string;
}

interface Metrics {
  extraction: {
    total: number;
    byMethod: Record<string, number>;
    averageConfidence: number;
  };
  processing: {
    totalEmails: number;
    processed: number;
    skipped: number;
    failed: number;
  };
  invoices: {
    total: number;
    unpaid: number;
    paid: number;
    ignored: number;
    totalAmount: number;
  };
  topVendors: { vendor: string; count: number; totalAmount: number }[];
}

const statusColor = (status: string) => {
  switch (status) {
    case 'paid':
    case 'processed':
      return 'bg-emerald-500/20 text-emerald-400';
    case 'ignored':
    case 'skipped':
      return 'bg-slate-500/20 text-slate-400';
    case 'failed':
      return 'bg-red-500/20 text-red-400';
    default:
      return 'bg-amber-500/20 text-amber-400';
  }
};

function MetricCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-slate-400 text-xs uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold text-white">{value}</span>
      {sub && <span className="text-slate-500 text-xs">{sub}</span>}
    </div>
  );
}

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>('metrics');

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicePagination, setInvoicePagination] = useState<any>(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityPagination, setActivityPagination] = useState<any>(null);
  const [activityPage, setActivityPage] = useState(1);

  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Cookies.get('token')) {
      router.push('/login');
      return;
    }
    setLoadingMetrics(true);
    getUserMetrics(id)
      .then(setMetrics)
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load metrics'))
      .finally(() => setLoadingMetrics(false));
  }, [id, router]);

  useEffect(() => {
    if (tab !== 'invoices') return;
    setLoadingInvoices(true);
    getUserInvoices(id, invoicePage)
      .then((data) => { setInvoices(data.invoices); setInvoicePagination(data.pagination); })
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load invoices'))
      .finally(() => setLoadingInvoices(false));
  }, [id, tab, invoicePage]);

  useEffect(() => {
    if (tab !== 'activity') return;
    setLoadingActivity(true);
    getUserActivity(id, activityPage)
      .then((data) => { setActivity(data.activity); setActivityPagination(data.pagination); })
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load activity'))
      .finally(() => setLoadingActivity(false));
  }, [id, tab, activityPage]);

  const formatDate = (d: string) => new Date(d).toLocaleString();

  const tabs: { key: Tab; label: string }[] = [
    { key: 'metrics', label: 'Metrics' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'activity', label: 'Email Activity' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/users" className="text-slate-400 hover:text-white text-sm transition">
            ← Users
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-2xl font-bold text-white truncate">{id}</h1>
        </div>

        {error && <div className="text-red-400 mb-4">{error}</div>}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-800">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition ${
                tab === t.key
                  ? 'bg-slate-800 text-white border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* METRICS TAB */}
        {tab === 'metrics' && (
          <>
            {loadingMetrics && <div className="text-slate-400">Loading metrics...</div>}
            {metrics && (
              <div className="space-y-8">
                {/* Invoice stats */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-3">Invoices</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <MetricCard label="Total" value={metrics.invoices.total} />
                    <MetricCard label="Unpaid" value={metrics.invoices.unpaid} />
                    <MetricCard label="Paid" value={metrics.invoices.paid} />
                    <MetricCard label="Ignored" value={metrics.invoices.ignored} />
                  </div>
                  <div className="mt-4">
                    <MetricCard
                      label="Total Amount"
                      value={`€${metrics.invoices.totalAmount.toFixed(2)}`}
                    />
                  </div>
                </section>

                {/* Email processing */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-3">Email Processing</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <MetricCard label="Total Emails" value={metrics.processing.totalEmails} />
                    <MetricCard label="Processed" value={metrics.processing.processed} />
                    <MetricCard label="Skipped" value={metrics.processing.skipped} />
                    <MetricCard label="Failed" value={metrics.processing.failed} />
                  </div>
                </section>

                {/* Extraction */}
                <section>
                  <h2 className="text-lg font-semibold text-white mb-3">Extraction Methods</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <MetricCard
                      label="Total Extracted"
                      value={metrics.extraction.total}
                      sub={`Avg confidence: ${metrics.extraction.averageConfidence}`}
                    />
                    {Object.entries(metrics.extraction.byMethod).map(([method, count]) => (
                      <MetricCard key={method} label={method} value={count} />
                    ))}
                  </div>
                </section>

                {/* Top vendors */}
                {metrics.topVendors.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-white mb-3">Top Vendors</h2>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-800 text-slate-300">
                          <tr>
                            <th className="px-6 py-3 font-medium">Vendor</th>
                            <th className="px-6 py-3 font-medium">Invoices</th>
                            <th className="px-6 py-3 font-medium">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                          {metrics.topVendors.map((v) => (
                            <tr key={v.vendor} className="hover:bg-slate-800/50">
                              <td className="px-6 py-3 text-white">{v.vendor}</td>
                              <td className="px-6 py-3 text-slate-300">{v.count}</td>
                              <td className="px-6 py-3 text-slate-300">€{v.totalAmount.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}

        {/* INVOICES TAB */}
        {tab === 'invoices' && (
          <>
            {loadingInvoices && <div className="text-slate-400">Loading invoices...</div>}
            {!loadingInvoices && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="px-6 py-3 font-medium">Vendor</th>
                        <th className="px-6 py-3 font-medium">Invoice #</th>
                        <th className="px-6 py-3 font-medium">Amount</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Method</th>
                        <th className="px-6 py-3 font-medium">Confidence</th>
                        <th className="px-6 py-3 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {invoices.map((inv) => (
                        <tr key={inv._id} className="hover:bg-slate-800/50">
                          <td className="px-6 py-4 text-white">{inv.vendor}</td>
                          <td className="px-6 py-4 text-slate-400">{inv.invoiceNumber}</td>
                          <td className="px-6 py-4 text-white">
                            {inv.amount.toFixed(2)} {inv.currency}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(inv.status)}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {inv.extractionMethod || '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs">
                            {inv.confidence != null ? `${(inv.confidence * 100).toFixed(0)}%` : '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-400">{formatDate(inv.createdAt)}</td>
                        </tr>
                      ))}
                      {invoices.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                            No invoices found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {invoicePagination && invoicePagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setInvoicePage((p) => Math.max(1, p - 1))}
                      disabled={!invoicePagination.hasPrev}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-slate-400 text-sm">
                      Page {invoicePagination.page} of {invoicePagination.totalPages}
                    </span>
                    <button
                      onClick={() => setInvoicePage((p) => p + 1)}
                      disabled={!invoicePagination.hasNext}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ACTIVITY TAB */}
        {tab === 'activity' && (
          <>
            {loadingActivity && <div className="text-slate-400">Loading activity...</div>}
            {!loadingActivity && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800 text-slate-300">
                      <tr>
                        <th className="px-6 py-3 font-medium">Subject</th>
                        <th className="px-6 py-3 font-medium">From</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Invoices Found</th>
                        <th className="px-6 py-3 font-medium">PDFs</th>
                        <th className="px-6 py-3 font-medium">Reason / Error</th>
                        <th className="px-6 py-3 font-medium">Processed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {activity.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-800/50">
                          <td className="px-6 py-4 text-white max-w-xs truncate" title={item.subject}>
                            {item.subject}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate" title={item.from}>
                            {item.from}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-300 text-center">{item.invoicesFound}</td>
                          <td className="px-6 py-4 text-slate-300 text-center">{item.pdfAttachments}</td>
                          <td className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate" title={item.errorDetails || item.reason}>
                            {item.errorDetails || item.reason || '—'}
                          </td>
                          <td className="px-6 py-4 text-slate-400">{formatDate(item.processedAt)}</td>
                        </tr>
                      ))}
                      {activity.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                            No activity found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {activityPagination && activityPagination.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                      disabled={!activityPagination.hasPrev}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-slate-400 text-sm">
                      Page {activityPagination.page} of {activityPagination.totalPages}
                    </span>
                    <button
                      onClick={() => setActivityPage((p) => p + 1)}
                      disabled={!activityPagination.hasNext}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
