'use client';

import { useEffect, useState } from 'react';

interface DashboardStats {
  totalIssues: number;
  newlyOpened: number;
  inWork: number;
  awaitingResolution: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    newlyOpened: 0,
    inWork: 0,
    awaitingResolution: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Total Issues</p>
          <p className="text-3xl font-bold text-primary-600 mt-2">
            {stats.totalIssues}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Newly Opened</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {stats.newlyOpened}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">In Work</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {stats.inWork}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600 text-sm font-medium">Awaiting Resolution</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {stats.awaitingResolution}
          </p>
        </div>
      </div>

      {/* Recent Issues */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Issues</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-center py-8">No recent issues</p>
        </div>
      </div>
    </div>
  );
}
