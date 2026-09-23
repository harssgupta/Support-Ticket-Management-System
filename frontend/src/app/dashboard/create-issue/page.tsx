'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { authHeaders } from '@/lib/api';

export default function CreateIssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjectLine: '',
    problemDescription: '',
    severityLevel: 'MODERATE',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjectLine.trim()) {
      toast.error('Subject is required');
      return;
    }
    if (!formData.problemDescription.trim()) {
      toast.error('Description is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/issues', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || `Server returned ${response.status}`);
      }

      const result = await response.json();
      toast.success('Issue created successfully!');
      router.push('/dashboard/issues');
      router.refresh();
    } catch (error: any) {
      console.error('Error creating issue:', error);
      toast.error(error.message || 'Failed to create issue. Please check the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4 mb-2">Create New Issue</h1>
        <p className="text-gray-500">Fill out the form below to report a new support ticket</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject Line */}
          <div>
            <label htmlFor="subjectLine" className="block text-sm font-semibold text-gray-700 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              id="subjectLine"
              type="text"
              name="subjectLine"
              value={formData.subjectLine}
              onChange={handleChange}
              placeholder="Brief description of the issue"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              maxLength={255}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.subjectLine.length}/255</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="problemDescription" className="block text-sm font-semibold text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="problemDescription"
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleChange}
              placeholder="Provide detailed information about the issue, steps to reproduce, and any relevant context"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-40 resize-none"
              maxLength={5000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{formData.problemDescription.length}/5000</p>
          </div>

          {/* Severity Level */}
          <div>
            <label htmlFor="severityLevel" className="block text-sm font-semibold text-gray-700 mb-2">
              Severity Level <span className="text-red-500">*</span>
            </label>
            <select
              id="severityLevel"
              name="severityLevel"
              value={formData.severityLevel}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="TRIVIAL">🟢 Trivial - Minor inconvenience</option>
              <option value="LOW">🔵 Low - Affects some functionality</option>
              <option value="MODERATE">🟡 Moderate - Significant impact</option>
              <option value="HIGH">🟠 High - Major impact</option>
              <option value="CRITICAL">🔴 Critical - System down or severe</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>✓ Create Issue</>
              )}
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
