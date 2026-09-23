'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Issue {
  issueId: number;
  issueKey: string;
  subjectLine: string;
  problemDescription: string;
  currentState: string;
  severityLevel: string;
  reporterName: string;
  assignedToName?: string;
  createdAt: string;
  lastModifiedAt: string;
}

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = params.id;
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [newState, setNewState] = useState<string>('');

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const response = await fetch(`/api/issues/${issueId}`);
        if (response.ok) {
          const data = await response.json();
          setIssue(data);
          setNewState(data.currentState);
        }
      } catch (error) {
        console.error('Failed to fetch issue:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueId]);

  const handleStateChange = async () => {
    if (!issue || newState === issue.currentState) return;

    try {
      const response = await fetch(`/api/issues/${issueId}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetState: newState,
          transitionReason: 'Updated via UI',
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        setIssue(updated);
      }
    } catch (error) {
      console.error('Failed to update state:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading issue...</div>;
  }

  if (!issue) {
    return <div className="text-center py-8 text-red-500">Issue not found</div>;
  }

  const stateOptions = {
    NEWLY_OPENED: ['IN_WORK', 'WITHDRAWN'],
    IN_WORK: ['AWAITING_RESOLUTION', 'WITHDRAWN'],
    AWAITING_RESOLUTION: ['CLOSURE'],
    CLOSURE: [],
    WITHDRAWN: [],
  };

  const validTransitions = stateOptions[issue.currentState as keyof typeof stateOptions] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">{issue.issueKey}</p>
            <h1 className="text-3xl font-bold text-gray-900">{issue.subjectLine}</h1>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {issue.severityLevel}
          </span>
        </div>

        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{issue.problemDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Current State</p>
          <p className="text-lg font-semibold text-gray-900">
            {issue.currentState.replace(/_/g, ' ')}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Reporter</p>
          <p className="text-lg font-semibold text-gray-900">{issue.reporterName}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-1">Assigned To</p>
          <p className="text-lg font-semibold text-gray-900">
            {issue.assignedToName || 'Unassigned'}
          </p>
        </div>
      </div>

      {validTransitions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change State</h2>
          <div className="flex gap-3">
            <select
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value={issue.currentState}>-- No change --</option>
              {validTransitions.map((state) => (
                <option key={state} value={state}>
                  {state.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <button
              onClick={handleStateChange}
              disabled={newState === issue.currentState}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 transition-colors"
            >
              Update State
            </button>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>Created: {new Date(issue.createdAt).toLocaleDateString()}</p>
        <p>Last Modified: {new Date(issue.lastModifiedAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
