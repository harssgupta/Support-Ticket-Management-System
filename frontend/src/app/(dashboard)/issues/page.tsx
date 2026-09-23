'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface Issue {
  issueId: number;
  issueKey: string;
  subjectLine: string;
  currentState: string;
  severityLevel: string;
  assignedToName?: string;
  createdAt: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (state) params.append('state', state);
        if (severity) params.append('severity', severity);

        const response = await fetch(`/api/issues?${params}`);
        if (response.ok) {
          const data = await response.json();
          setIssues(data.content || []);
        }
      } catch (error) {
        console.error('Failed to fetch issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [state, severity]);

  const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-800',
    HIGH: 'bg-orange-100 text-orange-800',
    MODERATE: 'bg-yellow-100 text-yellow-800',
    LOW: 'bg-blue-100 text-blue-800',
    TRIVIAL: 'bg-green-100 text-green-800',
  };

  const stateColors: Record<string, string> = {
    NEWLY_OPENED: 'text-gray-600',
    IN_WORK: 'text-blue-600',
    AWAITING_RESOLUTION: 'text-orange-600',
    CLOSURE: 'text-green-600',
    WITHDRAWN: 'text-red-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">All Issues</h1>
        <Link
          href="/dashboard/create-issue"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Create Issue
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
        <select
          value={state || ''}
          onChange={(e) => setState(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All States</option>
          <option value="NEWLY_OPENED">Newly Opened</option>
          <option value="IN_WORK">In Work</option>
          <option value="AWAITING_RESOLUTION">Awaiting Resolution</option>
          <option value="CLOSURE">Closure</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>

        <select
          value={severity || ''}
          onChange={(e) => setSeverity(e.target.value || null)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Severity Levels</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MODERATE">Moderate</option>
          <option value="LOW">Low</option>
          <option value="TRIVIAL">Trivial</option>
        </select>
      </div>

      {/* Issues List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8">Loading issues...</div>
        ) : issues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No issues found</div>
        ) : (
          issues.map((issue) => (
            <Link
              key={issue.issueId}
              href={`/dashboard/issues/${issue.issueId}`}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-gray-600">
                      {issue.issueKey}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${severityColors[issue.severityLevel]}`}
                    >
                      {issue.severityLevel}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{issue.subjectLine}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {issue.assignedToName || 'Unassigned'}
                  </p>
                </div>
                <span
                  className={`font-medium text-sm ${stateColors[issue.currentState]}`}
                >
                  {issue.currentState.replace(/_/g, ' ')}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
