import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>VillageCircle360</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        UK group savings and loan circle management — MVP
      </p>
      <nav aria-label="App areas" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link href="/member" style={{ display: 'block', padding: '1rem', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1d4ed8', fontWeight: 500 }}>
          Member app
        </Link>
        <Link href="/treasurer" style={{ display: 'block', padding: '1rem', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#15803d', fontWeight: 500 }}>
          Treasurer / Chair
        </Link>
        <Link href="/admin" style={{ display: 'block', padding: '1rem', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#b45309', fontWeight: 500 }}>
          Admin support
        </Link>
      </nav>
      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
        Backend API docs: <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener">http://localhost:3000/api/docs</a> (when backend is running).
      </p>
    </main>
  );
}
