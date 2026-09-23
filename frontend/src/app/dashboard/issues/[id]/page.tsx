'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { authHeaders, getUserId } from '@/lib/api';

interface Issue {
  issueId: string;
  issueKey: string;
  subjectLine: string;
  problemDescription: string;
  currentState: string;
  severityLevel: string;
  reporterName: string;
  assignedToName: string | null;
  createdAt: string;
  lastModifiedAt: string;
  concurrencyVersion: number;
}

interface Message {
  msgId: string;
  authorName: string;
  messageText: string;
  postedAt: string;
  parentMsgId: string | null;
}

interface UserOption {
  userId: number;
  loginName: string;
  displayName: string;
  accountType: string;
}

const STATE_TRANSITIONS: Record<string, string[]> = {
  NEWLY_OPENED: ['IN_WORK', 'WITHDRAWN'],
  IN_WORK: ['AWAITING_RESOLUTION', 'WITHDRAWN'],
  AWAITING_RESOLUTION: ['CLOSURE'],
  CLOSURE: [],
  WITHDRAWN: [],
};

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = params.id as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [changingState, setChangingState] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState('');

  useEffect(() => {
    fetchIssue();
    fetchMessages();
    fetch('http://localhost:8080/api/v1/users')
      .then((res) => (res.ok ? res.json() : []))
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [issueId]);

  const fetchIssue = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/issues/${issueId}`);
      if (response.ok) {
        const data = await response.json();
        setIssue(data);
        setSelectedState('');
      }
    } catch (error) {
      console.error('Failed to fetch issue:', error);
      toast.error('Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/issues/${issueId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleStateChange = async () => {
    if (!selectedState) return;

    setChangingState(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/issues/${issueId}/state`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ targetState: selectedState, transitionReason: null }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid state transition');
      }

      toast.success(`Status updated to ${selectedState.replace(/_/g, ' ')}`);
      fetchIssue();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update state');
    } finally {
      setChangingState(false);
    }
  };

  const handleAssign = async (targetUserId: number) => {
    if (!issue) return;

    setAssigning(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/issues/${issueId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          subjectLine: issue.subjectLine,
          problemDescription: issue.problemDescription,
          severityLevel: issue.severityLevel,
          assignedToUserId: targetUserId,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Failed to assign issue');
      }

      toast.success('Issue assigned');
      setSelectedAssignee('');
      fetchIssue();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign issue');
    } finally {
      setAssigning(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`http://localhost:8080/api/v1/issues/${issueId}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ messageText: newComment, parentMessageId: null }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      setNewComment('');
      toast.success('Comment added');
      fetchMessages();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

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
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-500 mb-4">Issue not found</p>
        <Link href="/dashboard/issues" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Issues
        </Link>
      </div>
    );
  }

  const availableTransitions = STATE_TRANSITIONS[issue.currentState] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard/issues" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Issues
        </Link>
      </div>

      {/* Issue Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-mono text-gray-500">{issue.issueKey}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStateColor(issue.currentState)}`}>
                {issue.currentState.replace(/_/g, ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(issue.severityLevel)}`}>
                {issue.severityLevel}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{issue.subjectLine}</h1>
          </div>
        </div>

        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{issue.problemDescription}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 text-sm">
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2 text-gray-900">{formatDate(issue.createdAt)}</span>
          </div>
          <div>
            <span className="text-gray-500">Last Updated:</span>
            <span className="ml-2 text-gray-900">{formatDate(issue.lastModifiedAt)}</span>
          </div>
          <div>
            <span className="text-gray-500">Reporter:</span>
            <span className="ml-2 text-gray-900">{issue.reporterName}</span>
          </div>
          <div>
            <span className="text-gray-500">Assigned To:</span>
            <span className="ml-2 text-gray-900">
              {issue.assignedToName || 'Unassigned'}
            </span>
            <button
              onClick={() => handleAssign(Number(getUserId()))}
              disabled={assigning}
              className="ml-3 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Assign to me'}
            </button>
          </div>
        </div>

        {/* Reassign to anyone */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 mb-2">Reassign to</label>
          <div className="flex gap-3">
            <select
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select a person...</option>
              {users.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.displayName} ({user.accountType.replace(/_/g, ' ')})
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedAssignee && handleAssign(Number(selectedAssignee))}
              disabled={!selectedAssignee || assigning}
              className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-5 rounded-lg disabled:opacity-50 transition-all text-sm"
            >
              Assign
            </button>
          </div>
        </div>

        {/* State Transition */}
        {availableTransitions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Change Status</label>
            <div className="flex gap-3">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select new status...</option>
                {availableTransitions.map((state) => (
                  <option key={state} value={state}>
                    {state.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStateChange}
                disabled={!selectedState || changingState}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 transition-all"
              >
                {changingState ? 'Updating...' : 'Update State'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Comments ({messages.length})
        </h2>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-24 resize-none"
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={!newComment.trim() || submittingComment}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 transition-all"
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
          ) : (
            messages.map((message) => (
              <div key={message.msgId} className="border-l-4 border-blue-200 pl-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    {message.authorName}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(message.postedAt)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{message.messageText}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
