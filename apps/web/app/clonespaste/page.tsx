'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function PastePage() {
  const [content, setContent] = useState('');
  const [viewsAllowed, setViewsAllowed] = useState(1);
  const [ttlSeconds, setTtlSeconds] = useState(60);
  const [createdPaste, setCreatedPaste] = useState<any>(null);
  const [pasteId, setPasteId] = useState('');
  const [viewedPaste, setViewedPaste] = useState<any>(null);
  const [error, setError] = useState('');

  const createPaste = async () => {
    try {
      const res = await api.post('/clones/paste/pastes', {
        content,
        viewsAllowed,
        ttlSeconds,
      });
      setCreatedPaste(res);
      setPasteId(res.id);
      setError('');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to create paste');
    }
  };

  const viewPaste = async () => {
    try {
      const res = await api.get(`/pastes/${pasteId}`);
      setViewedPaste(res);
      setError('');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to view paste');
      setViewedPaste(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Paste Clone (View-Once)</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <h2 className="text-xl font-semibold">Create a Paste</h2>
        <textarea
          className="w-full p-2 border rounded"
          placeholder="Enter content..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium">Views Allowed</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={viewsAllowed}
              onChange={(e) => setViewsAllowed(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">TTL (seconds)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={ttlSeconds}
              onChange={(e) => setTtlSeconds(parseInt(e.target.value))}
            />
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={createPaste}
        >
          Create Paste
        </button>
      </div>

      {createdPaste && (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 space-y-2">
          <p className="font-medium text-green-800">Paste Created!</p>
          <p className="text-sm text-green-700">ID: {createdPaste.id}</p>
          <p className="text-sm text-green-700">Expires At: {createdPaste.expiresAt || 'Never'}</p>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <h2 className="text-xl font-semibold">View a Paste</h2>
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Enter Paste ID..."
          value={pasteId}
          onChange={(e) => setPasteId(e.target.value)}
        />
        <button
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
          onClick={viewPaste}
        >
          View Paste
        </button>
      </div>

      {viewedPaste && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-2">
          <p className="font-medium text-blue-800">Paste Content:</p>
          <pre className="bg-white p-4 rounded border text-sm overflow-x-auto">
            {viewedPaste.content}
          </pre>
          <p className="text-xs text-blue-600">Remaining Views: {viewedPaste.viewsRemaining}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 text-sm">
          Error: {error}
        </div>
      )}
    </div>
  );
}
