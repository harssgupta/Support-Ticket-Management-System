'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Reply } from 'lucide-react';

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

interface CommentListProps {
  issueId: number;
  comments: Comment[];
  onReplyAdded: () => void;
  onCommentDeleted: () => void;
}

export function CommentList({
  issueId,
  comments,
  onReplyAdded,
  onCommentDeleted,
}: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async (parentMsgId: number) => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/issues/${issueId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: replyText,
          parentMessageId: parentMsgId,
        }),
      });

      if (response.ok) {
        setReplyText('');
        setReplyingTo(null);
        onReplyAdded();
      }
    } catch (error) {
      console.error('Failed to add reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (msgId: number) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const response = await fetch(
        `/api/issues/${issueId}/messages/${msgId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        onCommentDeleted();
      }
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.msgId}
      className={`${
        isReply ? 'ml-8 border-l-2 border-gray-300 pl-4' : ''
      } bg-white rounded-lg p-4 mb-3`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-medium text-gray-900">
            {comment.authorUser.displayName}
          </p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(comment.postedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
        <button
          onClick={() => handleDeleteComment(comment.msgId)}
          className="text-red-500 hover:text-red-700"
          title="Delete comment"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <p className="text-gray-700 mb-3">{comment.messageText}</p>

      <button
        onClick={() => setReplyingTo(comment.msgId)}
        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
      >
        <Reply size={14} />
        Reply
      </button>

      {replyingTo === comment.msgId && (
        <div className="mt-3 flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            rows={2}
          />
          <div className="flex gap-2 flex-col justify-end">
            <button
              onClick={() => handleReplySubmit(comment.msgId)}
              disabled={isSubmitting}
              className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
            <button
              onClick={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No comments yet</p>
      ) : (
        comments.map((comment) => renderComment(comment))
      )}
    </div>
  );
}
