import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listRegisteredUsers, RegisteredUser } from '../services/users';

const AdminMembers: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchUsers = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const loadedUsers = await listRegisteredUsers();
        if (isMounted) {
          setUsers(loadedUsers);
        }
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : 'Members could not be loaded.';
          setLoadError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredUsers = useMemo(() => {
    if (!normalizedSearch) return users;
    return users.filter((item) => {
      return (
        (item.fullName ?? '').toLowerCase().includes(normalizedSearch) ||
        (item.phone ?? '').toLowerCase().includes(normalizedSearch) ||
        (item.refCode ?? '').toLowerCase().includes(normalizedSearch) ||
        (item.role ?? '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [users, normalizedSearch]);

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101a22] text-slate-900 dark:text-white">
      <header className="sticky top-0 z-40 border-b border-[#283239] bg-[#f6f7f8] dark:bg-[#101a22] px-6 py-3">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="rounded-lg border border-slate-300 dark:border-[#3b4954] px-3 py-2 text-sm font-semibold"
            >
              Back To Dashboard
            </Link>
            <div>
              <p className="text-lg font-bold">Registered Members</p>
              <p className="text-xs text-[#9dadb9]">Siteye uye olan tum kullanicilar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-[#283239] px-2 py-1 text-xs text-slate-700 dark:text-white/90">
              {profile?.refCode ?? 'No Ref'}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="rounded-lg border border-[#283239] px-3 py-2 text-sm font-semibold text-slate-700 dark:text-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-lg bg-[#1183d4]/10 px-3 py-2 text-sm font-semibold text-[#1183d4]">
            Total Members: {users.length}
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, ref code..."
            className="w-full max-w-[320px] rounded-lg border border-slate-300 dark:border-[#3b4954] bg-white dark:bg-[#16202a] px-3 py-2 text-sm"
          />
        </div>

        {loadError && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-[#3b4954] bg-white dark:bg-[#101a22]/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-[#1a262f] text-slate-600 dark:text-[#9dadb9] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Ref Code</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#283239]">
              {loading && (
                <tr>
                  <td className="px-4 py-4 text-[#9dadb9]" colSpan={5}>
                    Loading members...
                  </td>
                </tr>
              )}
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-[#9dadb9]" colSpan={5}>
                    No members found.
                  </td>
                </tr>
              )}
              {!loading &&
                filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#283239]/30 transition-colors">
                    <td className="px-4 py-3 font-semibold">{item.fullName || '-'}</td>
                    <td className="px-4 py-3">{item.phone || '-'}</td>
                    <td className="px-4 py-3 font-mono">{item.refCode || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-slate-300 dark:border-[#3b4954] px-2 py-0.5 text-xs">
                        {item.role || 'unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR') : '-'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminMembers;
