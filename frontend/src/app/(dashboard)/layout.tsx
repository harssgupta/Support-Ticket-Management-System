'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-primary-900 text-white transition-all duration-300 overflow-hidden`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold">Ticket Hub</h2>
        </div>

        <nav className="space-y-4 px-6 py-4">
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded hover:bg-primary-700 transition-colors"
          >
            📊 Dashboard
          </Link>
          <Link
            href="/dashboard/issues"
            className="block px-4 py-2 rounded hover:bg-primary-700 transition-colors"
          >
            🎫 All Issues
          </Link>
          <Link
            href="/dashboard/my-issues"
            className="block px-4 py-2 rounded hover:bg-primary-700 transition-colors"
          >
            👤 My Issues
          </Link>
          <Link
            href="/dashboard/create-issue"
            className="block px-4 py-2 rounded hover:bg-primary-700 transition-colors"
          >
            ➕ Create Issue
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search issues..."
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut size={20} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
