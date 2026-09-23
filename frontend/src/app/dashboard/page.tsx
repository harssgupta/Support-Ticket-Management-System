'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface StatCard {
  label: string;
  count: number;
  icon: string;
  color: string;
  trend?: number;
}

interface Issue {
  issueId: string;
  issueKey: string;
  subjectLine: string;
  currentState: string;
  severityLevel: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { label: 'Total Issues', count: 0, icon: '🎫', color: 'from-blue-500 to-blue-600', trend: 5 },
    { label: 'Newly Opened', count: 0, icon: '🆕', color: 'from-green-500 to-green-600' },
    { label: 'In Work', count: 0, icon: '⚙️', color: 'from-yellow-500 to-yellow-600' },
    { label: 'Awaiting Resolution', count: 0, icon: '⏳', color: 'from-orange-500 to-orange-600' },
  ]);

  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch issues from backend (Spring returns a Page wrapper: { content: [...] })
        const response = await fetch('http://localhost:8080/api/v1/issues?size=100');
        if (response.ok) {
          const page = await response.json();
          const data = Array.isArray(page) ? page : (page.content || []);
          setRecentIssues(data.slice(0, 5));

          // Calculate stats from issues
          const newlyOpened = data.filter((i: any) => i.currentState === 'NEWLY_OPENED').length;
          const inWork = data.filter((i: any) => i.currentState === 'IN_WORK').length;
          const awaiting = data.filter((i: any) => i.currentState === 'AWAITING_RESOLUTION').length;

          setStats([
            { label: 'Total Issues', count: data.length, icon: '🎫', color: 'from-blue-500 to-blue-600' },
            { label: 'Newly Opened', count: newlyOpened, icon: '🆕', color: 'from-green-500 to-green-600' },
            { label: 'In Work', count: inWork, icon: '⚙️', color: 'from-yellow-500 to-yellow-600' },
            { label: 'Awaiting Resolution', count: awaiting, icon: '⏳', color: 'from-orange-500 to-orange-600' },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      TRIVIAL: 'bg-gray-100 text-gray-800',
      LOW: 'bg-blue-100 text-blue-800',
      MODERATE: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-orange-100 text-orange-800',
      CRITICAL: 'bg-red-100 text-red-800',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      NEWLY_OPENED: 'bg-green-100 text-green-800',
      IN_WORK: 'bg-blue-100 text-blue-800',
      AWAITING_RESOLUTION: 'bg-yellow-100 text-yellow-800',
      CLOSURE: 'bg-gray-100 text-gray-800',
      WITHDRAWN: 'bg-red-100 text-red-800',
    };
    return colors[state] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-2">Welcome back! Here's your ticket overview</p>
        </div>
        <Link
          href="/dashboard/create-issue"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95"
        >
          + Create New Issue
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`text-3xl bg-gradient-to-br ${stat.color} rounded-lg p-3 text-white`}>
                  {stat.icon}
                </div>
                {stat.trend && (
                  <span className="text-green-600 text-sm font-semibold">↑ {stat.trend}%</span>
                )}
              </div>
              <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Issues */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Issues</h2>
            <p className="text-sm text-gray-500 mt-1">Latest tickets from your system</p>
          </div>
          <Link
            href="/dashboard/issues"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading issues...
                  </td>
                </tr>
              ) : recentIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <p className="text-lg">No issues yet</p>
                    <Link href="/dashboard/create-issue" className="text-blue-600 hover:text-blue-700 text-sm mt-2 block">
                      Create your first issue
                    </Link>
                  </td>
                </tr>
              ) : (
                recentIssues.map((issue) => (
                  <tr key={issue.issueId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/issues/${issue.issueId}`}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {issue.issueKey}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{issue.subjectLine}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStateColor(issue.currentState)}`}>
                        {issue.currentState.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severityLevel)}`}>
                        {issue.severityLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(issue.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
