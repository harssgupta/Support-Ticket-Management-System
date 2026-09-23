'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Issue {
  issueId: string;
  issueKey: string;
  subjectLine: string;
  currentState: string;
  severityLevel: string;
  createdAt: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchIssues();
  }, [stateFilter, severityFilter]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (stateFilter) params.append('state', stateFilter);
      if (severityFilter) params.append('severity', severityFilter);
      params.append('size', '100');

      const response = await fetch(`http://localhost:8080/api/v1/issues?${params.toString()}`);
      if (response.ok) {
        const page = await response.json();
        const data = Array.isArray(page) ? page : (page.content || []);
        setIssues(data);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter(issue =>
    issue.subjectLine.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.issueKey.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      TRIVIAL: 'bg-gray-100 text-gray-800 border-gray-200',
      LOW: 'bg-blue-100 text-blue-800 border-blue-200',
      MODERATE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
      CRITICAL: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStateColor = (state: string) => {
    const colors: Record<string, string> = {
      NEWLY_OPENED: 'bg-green-100 text-green-800 border-green-200',
      IN_WORK: 'bg-blue-100 text-blue-800 border-blue-200',
      AWAITING_RESOLUTION: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CLOSURE: 'bg-gray-100 text-gray-800 border-gray-200',
      WITHDRAWN: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[state] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">All Issues</h1>
          <p className="text-gray-500 mt-2">Manage and track all support tickets</p>
        </div>
        <Link
          href="/dashboard/create-issue"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
        >
          + Create Issue
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All States</option>
            <option value="NEWLY_OPENED">Newly Opened</option>
            <option value="IN_WORK">In Work</option>
            <option value="AWAITING_RESOLUTION">Awaiting Resolution</option>
            <option value="CLOSURE">Closure</option>
            <option value="WITHDRAWN">Withdrawn</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="TRIVIAL">Trivial</option>
            <option value="LOW">Low</option>
            <option value="MODERATE">Moderate</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 text-blue-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading issues...
                    </div>
                  </td>
                </tr>
              ) : filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <p className="text-lg mb-2">No issues found</p>
                    <Link href="/dashboard/create-issue" className="text-blue-600 hover:text-blue-700 font-medium">
                      Create your first issue →
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr key={issue.issueId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/issues/${issue.issueId}`}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {issue.issueKey}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/issues/${issue.issueId}`}
                        className="text-sm text-gray-900 hover:text-blue-600 font-medium"
                      >
                        {issue.subjectLine}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStateColor(issue.currentState)}`}>
                        {issue.currentState.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severityLevel)}`}>
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
