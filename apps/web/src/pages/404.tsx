import React from 'react';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-blue-500 mb-2">404</h1>
        <p className="text-slate-400 mb-6">Page not found</p>
        <Link href="/" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
}
