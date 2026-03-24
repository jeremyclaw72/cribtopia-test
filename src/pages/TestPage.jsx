import React from 'react';

export default function TestPage() {
  return (
    <div style={{ padding: 40, color: 'white', background: '#1a4a7a', minHeight: '100vh' }}>
      <h1>Test Page Works!</h1>
      <p>If you see this, routing is working.</p>
      <p><a href="/" style={{ color: '#10b981' }}>← Back to Home</a></p>
    </div>
  );
}