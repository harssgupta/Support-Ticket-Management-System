'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    localStorage.removeItem('auth_token');
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dashboard/issues', label: 'All Issues', icon: '🎫' },
    { href: '/dashboard/create-issue', label: 'Create Issue', icon: '➕' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 overflow-hidden shadow-lg flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold">🎫</span>
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="text-lg font-bold">TicketHub</h2>
                <p className="text-xs text-gray-400">Pro</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">JD</span>
            </div>
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full py-2 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-200 hover:text-red-100 transition-colors font-medium text-sm ${
              !sidebarOpen && 'text-center'
            }`}
          >
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-xl"
            >
              {sidebarOpen ? '▮▮' : '☰'}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Support Ticket Hub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search issues..."
                className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              🔔
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              ⚙️
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
