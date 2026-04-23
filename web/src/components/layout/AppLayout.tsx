import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/guides" style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>
            MargFlow
          </Link>
          <nav style={{ display: 'flex', gap: 16 }}>
            <Link to="/guides" style={{ color: 'var(--text-muted)' }}>My Guides</Link>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</span>
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </header>
      <main style={{ padding: 24 }}>
        {children}
      </main>
    </div>
  );
}