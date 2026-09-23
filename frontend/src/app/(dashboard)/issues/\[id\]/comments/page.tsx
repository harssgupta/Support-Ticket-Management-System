'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CommentList } from '@/components/CommentList';
import { CommentForm } from '@/components/CommentForm';

interface Comment {
  msgId: number;
  messageText: string;
  authorUser: {
    recordId: number;
    loginName: string;
    displayName: string;
  };
  postedAt: string;
  updatedAt: string;
  replies: Comment[];
}

export default function CommentsPage() {
  const params = useParams();
  const issueId = params.id;
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/issues/${issueId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [issueId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Comments</h1>

      {loading ? (
        <div className="text-center py-8">Loading comments...</div>
      ) : (
        <>
          <CommentForm issueId={Number(issueId)} onCommentAdded={fetchComments} />
          <CommentList
            issueId={Number(issueId)}
            comments={comments}
            onReplyAdded={fetchComments}
            onCommentDeleted={fetchComments}
          />
        </>
      )}
    </div>
  );
}
