'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

const commentSchema = z.object({
  messageText: z.string().min(1, 'Comment is required').max(5000),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  issueId: number;
  onCommentAdded: () => void;
}

export function CommentForm({ issueId, onCommentAdded }: CommentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/issues/${issueId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: data.messageText,
          parentMessageId: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      toast.success('Comment added');
      reset();
      onCommentAdded();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Add a Comment</h3>

      <textarea
        {...register('messageText')}
        placeholder="Type your comment here..."
        rows={4}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 resize-none"
      />
      {errors.messageText && (
        <p className="text-red-500 text-sm mt-1">{errors.messageText.message}</p>
      )}

      <div className="flex justify-end gap-2 mt-3">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  );
}
