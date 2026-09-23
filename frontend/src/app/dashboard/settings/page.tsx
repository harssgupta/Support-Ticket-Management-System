'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: '', login: '', role: '' });

  useEffect(() => {
    setProfile({
      name: localStorage.getItem('user_name') || '',
      login: localStorage.getItem('user_login') || '',
      role: (localStorage.getItem('user_role') || '').replace(/_/g, ' '),
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_login');
    localStorage.removeItem('user_role');
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">Settings</h1>
        <p className="text-gray-500">Your account information</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {profile.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{profile.name}</p>
            <p className="text-sm text-gray-500">@{profile.login}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-sm">
          <div>
            <span className="text-gray-500 block">Username</span>
            <span className="text-gray-900 font-medium">{profile.login}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Role</span>
            <span className="text-gray-900 font-medium">{profile.role}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
