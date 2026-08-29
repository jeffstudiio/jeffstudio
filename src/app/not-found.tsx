import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist on JEFF studio.',
};

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090b',
          color: '#a1a1aa',
          fontFamily: 'var(--font-inter), sans-serif',
          flexDirection: 'column',
          gap: '16px',
          textAlign: 'center',
          padding: '24px',
        }}>
          <div style={{ fontSize: '72px', fontWeight: '800', color: '#fff' }}>404</div>
          <p style={{ fontSize: '16px', color: '#a1a1aa' }}>Page not found</p>
          <a
            href="/"
            style={{
              marginTop: '16px',
              padding: '12px 32px',
              border: '1px solid #3f3f46',
              borderRadius: '4px',
              color: '#a1a1aa',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Return to Home
          </a>
        </div>
      </body>
    </html>
  );
}
