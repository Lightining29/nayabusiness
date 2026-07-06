import { useState } from 'react';
import { Bell, BellOff, BellRing, X, Check } from 'lucide-react';
import { usePushNotifications } from '../utils/usePushNotifications';

export default function NotificationBell() {
  const { permission, loading, subscribe, unsubscribe, isSupported } = usePushNotifications();
  const [showTooltip, setShowTooltip] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);

  if (!isSupported) return null;

  const handleClick = async () => {
    if (permission === 'granted') {
      setShowTooltip(true);
      return;
    }
    const ok = await subscribe();
    if (ok) {
      setJustSubscribed(true);
      setTimeout(() => setJustSubscribed(false), 3000);
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribe();
    setShowTooltip(false);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        onClick={handleClick}
        disabled={loading || permission === 'denied'}
        title={
          permission === 'granted' ? 'Notifications on – click to manage'
          : permission === 'denied' ? 'Notifications blocked in browser settings'
          : 'Get notified about jobs & updates'
        }
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '38px', height: '38px', borderRadius: '50%', border: 'none',
          cursor: permission === 'denied' ? 'not-allowed' : 'pointer',
          background: permission === 'granted'
            ? 'rgba(16,185,129,0.12)'
            : 'rgba(14,165,233,0.08)',
          color: permission === 'granted' ? '#10b981'
            : permission === 'denied' ? '#94a3b8'
            : 'var(--primary)',
          transition: 'all 0.2s',
          opacity: loading ? 0.6 : 1,
          position: 'relative'
        }}
        aria-label="Push notifications"
      >
        {loading ? (
          <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>...</span>
        ) : permission === 'granted' ? (
          <BellRing size={18} />
        ) : permission === 'denied' ? (
          <BellOff size={18} />
        ) : (
          <Bell size={18} />
        )}

        {/* Green dot when subscribed */}
        {permission === 'granted' && (
          <span style={{
            position: 'absolute', top: '5px', right: '5px',
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#10b981', border: '1.5px solid white'
          }} />
        )}
      </button>

      {/* Just subscribed toast */}
      {justSubscribed && (
        <div style={{
          position: 'absolute', top: '110%', right: 0,
          background: '#10b981', color: 'white', borderRadius: '8px',
          padding: '0.5rem 0.85rem', fontSize: '0.8rem', fontWeight: 600,
          whiteSpace: 'nowrap', zIndex: 1000,
          boxShadow: '0 4px 15px rgba(16,185,129,0.35)',
          display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <Check size={13} /> Subscribed!
        </div>
      )}

      {/* Manage tooltip */}
      {showTooltip && permission === 'granted' && (
        <>
          <div
            onClick={() => setShowTooltip(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          />
          <div style={{
            position: 'absolute', top: '110%', right: 0, zIndex: 1000,
            background: 'white', border: '1px solid rgba(14,165,233,0.2)',
            borderRadius: '12px', padding: '1rem', minWidth: '200px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
          }}>
            <button
              onClick={() => setShowTooltip(false)}
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem',
                border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
            <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
              🔔 Notifications enabled
            </p>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.75rem' }}>
              You'll receive job alerts and updates from Rancom Technologies.
            </p>
            <button
              onClick={handleUnsubscribe}
              style={{
                width: '100%', padding: '0.45rem', border: '1px solid #fca5a5',
                borderRadius: '7px', background: 'rgba(239,68,68,0.06)',
                color: '#dc2626', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Turn off notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
}
