'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';

const createIssueSchema = z.object({
  subjectLine: z.string().min(1, 'Subject is required').max(255),
  problemDescription: z.string().min(1, 'Description is required').max(5000),
  severityLevel: z.enum(['CRITICAL', 'HIGH', 'MODERATE', 'LOW', 'TRIVIAL']),
  assignedToUserId: z.number().optional(),
});

type CreateIssueFormData = z.infer<typeof createIssueSchema>;

export default function CreateIssuePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateIssueFormData>({
    resolver: zodResolver(createIssueSchema),
  });

  const onSubmit = async (data: CreateIssueFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create issue');
      }

      const result = await response.json();
      toast.success('Issue created successfully');
      router.push(`/dashboard/issues/${result.issueId}`);
    } catch (error) {
      toast.error('Failed to create issue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Issue</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Line *
          </label>
          <input
            {...register('subjectLine')}
            type="text"
            placeholder="Brief summary of the issue"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          {errors.subjectLine && (
            <p className="text-red-500 text-sm mt-1">{errors.subjectLine.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Problem Description *
          </label>
          <textarea
            {...register('problemDescription')}
            placeholder="Detailed description of the issue"
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          {errors.problemDescription && (
            <p className="text-red-500 text-sm mt-1">{errors.problemDescription.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level *
            </label>
            <select
              {...register('severityLevel')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select severity</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MODERATE">Moderate</option>
              <option value="LOW">Low</option>
              <option value="TRIVIAL">Trivial</option>
            </select>
            {errors.severityLevel && (
              <p className="text-red-500 text-sm mt-1">{errors.severityLevel.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign To (Optional)
            </label>
            <select
              {...register('assignedToUserId', { valueAsNumber: true })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select user</option>
              <option value="1">John Doe</option>
              <option value="2">Jane Smith</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Issue'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
