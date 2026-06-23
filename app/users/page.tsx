'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import AdminNav from '../components/AdminNav';
import { getUsers, setUserAdmin } from '../lib/api';

interface User {
  _id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!Cookies.get('token')) {
      router.push('/login');
      return;
    }
    loadUsers();
  }, [router, page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, 20);
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (user: User) => {
    try {
      await setUserAdmin(user._id, !user.isAdmin);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isAdmin: !u.isAdmin } : u))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const SUPERADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || 'cinnamon.development@cinnamon.agency';

  const formatDate = (date: string) => new Date(date).toLocaleString();

  return (
    <div className="min-h-screen bg-slate-950">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Users</h1>

        {loading && <div className="text-slate-400">Loading users...</div>}
        {error && <div className="text-red-400">{error}</div>}

        {!loading && !error && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-800 text-slate-300">
                  <tr>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Admin</th>
                    <th className="px-6 py-3 font-medium">Created</th>
                    <th className="px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <Link
                          href={`/users/${user._id}`}
                          className="text-white hover:text-indigo-300 transition font-medium"
                        >
                          {user.email}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {user.isAdmin ? (
                          <span className="px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-medium">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-slate-700 text-slate-400 text-xs font-medium">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4 flex items-center gap-4">
                        <Link
                          href={`/users/${user._id}`}
                          className="text-sm text-slate-400 hover:text-white transition"
                        >
                          View
                        </Link>
                        {!(user.isAdmin && user.email === SUPERADMIN_EMAIL) && (
                          <button
                            onClick={() => toggleAdmin(user)}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                          >
                            {user.isAdmin ? 'Revoke admin' : 'Make admin'}
                          </button>
                        )}
                      </td>
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
