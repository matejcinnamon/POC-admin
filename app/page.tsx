'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import AdminNav from './components/AdminNav';
import StatsCard from './components/StatsCard';
import { getStats } from './lib/api';

interface Stats {
  usersTotal: number;
  invoicesTotal: number;
  totalAmount: number;
  statusCounts: Record<string, number>;
}

export default function OverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Cookies.get('token')) {
      router.push('/login');
      return;
    }

    getStats()
      .then(setStats)
      .catch((err) => setError(err.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Overview</h1>

        {loading && <div className="text-slate-400">Loading stats...</div>}
        {error && <div className="text-red-400">{error}</div>}

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <StatsCard
                title="Total Users"
                value={stats.usersTotal}
                color="indigo"
              />
              <StatsCard
                title="Total Invoices"
                value={stats.invoicesTotal}
                color="emerald"
              />
              <StatsCard
                title="Total Amount"
                value={`€${stats.totalAmount.toFixed(2)}`}
                color="amber"
              />
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Invoice Statuses</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(stats.statusCounts).map(([status, count]) => (
                  <div
                    key={status}
                    className="bg-slate-800 rounded-lg p-4 flex items-center justify-between"
                  >
                    <span className="text-slate-300 capitalize">{status}</span>
                    <span className="text-xl font-bold text-white">{count}</span>
                  </div>
                ))}
                {Object.keys(stats.statusCounts).length === 0 && (
                  <div className="text-slate-500 col-span-3">No invoice status data</div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
