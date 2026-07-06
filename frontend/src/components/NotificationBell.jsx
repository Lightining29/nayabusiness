import { useState } from 'react';
import { Bell, BellOff, BellRing, X } from 'lucide-react';
import { usePushNotifications } from '../utils/usePushNotifications';
import Swal from 'sweetalert2';

export default function NotificationBell() {
  const { permission, loading, subscribe, unsubscribe, isSupported } = usePushNotifications();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isSupported) return null;

  const handleClick = async () => {
    if (permission === 'granted') { setShowTooltip(v => !v); return; }

    if (permission === 'denied') {
      Swal.fire({
        icon: 'info',
        title: 'Notifications Blocked',
        html: 'To enable notifications, click the <b>🔒 lock icon</b> in your browser address bar and allow notifications for this site.',
        confirmButtonColor: '#0ea5e9',
        confirmButtonText: 'Got it'
      });
      return;
    }

    const ok = await subscribe();
    if (ok) {
      Swal.fire({
        icon: 'success',
        title: '🔔 Subscribed!',
        text: "You'll now receive job alerts and updates from Rancom Technologies.",
        timer: 2500,
        showConfirmButton: false,
        timerProgressBar: true
      });
    }
  };

  const handleUnsubscribe = async () => {
    setShowTooltip(false);
    const result = await Swal.fire({
      title: 'Turn off notifications?',
      text: "You won't receive job alerts or updates anymore.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, turn off',
      cancelButtonText: 'Keep enabled'
    });
    if (!result.isConfirmed) return;
    await unsubscribe();
    Swal.fire({
      icon: 'success', title: 'Unsubscribed',
      text: 'Notifications turned off.',
      timer: 2000, showConfirmButton: false
    });
  };

  const iconColor = permission === 'granted' ? '#10b981'
    : permission === 'denied' ? '#94a3b8' : 'var(--primary)';

  const bgColor = permission === 'granted'
    ? 'rgba(16,185,129,0.12)' : 'rgba(14,165,233,0.08)';

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>

      {/* Bell button */}
      <button
        onClick={handleClick}
        disabled={loading}
        title={
          permission === 'granted' ? 'Notifications on – click to manage'
          : permission === 'denied' ? 'Notifications blocked in browser settings'
          : 'Get notified about jobs & updates'
        }
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '38px', height: '38px', borderRadius: '50%', border: 'none',
          cursor: loading ? 'wait' : permission === 'denied' ? 'not-allowed' : 'pointer',
          background: bgColor, color: iconColor,
          transition: 'all 0.2s', opacity: loading ? 0.6 : 1, position: 'relative'
        }}
        aria-label="Push notifications"
      >
        {loading
          ? <span style={{ fontSize:'0.65rem', fontWeight:800, display:'inline-block', animation:'spin 1s linear infinite' }}>⏳</span>
          : permission === 'granted' ? <BellRing size={18} />
          : permission === 'denied'  ? <BellOff size={18} />
          : <Bell size={18} />
        }
        {permission === 'granted' && (
          <span style={{
            position:'absolute', top:'5px', right:'5px',
            width:'7px', height:'7px', borderRadius:'50%',
            background:'#10b981', border:'1.5px solid white'
          }} />
        )}
      </button>

      {/* Manage dropdown */}
      {showTooltip && permission === 'granted' && (
        <>
          <div onClick={() => setShowTooltip(false)}
            style={{ position:'fixed', inset:0, zIndex:998 }} />
          <div style={{
            position:'absolute', top:'calc(100% + 10px)', right:0, zIndex:999,
            background:'white', border:'1px solid rgba(14,165,233,0.2)',
            borderRadius:'16px', padding:'1.25rem', minWidth:'230px',
            boxShadow:'0 16px 50px rgba(0,0,0,0.14)'
          }}>
            <button onClick={() => setShowTooltip(false)} style={{
              position:'absolute', top:'0.65rem', right:'0.65rem',
              border:'none', background:'none', cursor:'pointer', color:'#94a3b8',
              display:'flex', alignItems:'center'
            }}><X size={15} /></button>

            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.5rem' }}>
              <div style={{ width:'32px', height:'32px', borderRadius:'8px', flexShrink:0,
                background:'rgba(16,185,129,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <BellRing size={16} style={{ color:'#10b981' }} />
              </div>
              <div>
                <div style={{ fontSize:'0.88rem', fontWeight:800, color:'#0f172a' }}>Notifications On</div>
                <div style={{ fontSize:'0.72rem', color:'#10b981', fontWeight:600 }}>● Active</div>
              </div>
            </div>

            <p style={{ fontSize:'0.78rem', color:'#64748b', marginBottom:'1rem', lineHeight:1.5 }}>
              You'll receive job alerts and updates from Rancom Technologies.
            </p>

            <button onClick={handleUnsubscribe} style={{
              width:'100%', padding:'0.55rem',
              border:'1px solid #fca5a5', borderRadius:'9px',
              background:'rgba(239,68,68,0.06)', color:'#dc2626',
              fontSize:'0.82rem', fontWeight:700, cursor:'pointer',
              fontFamily:'inherit', transition:'all 0.2s'
            }}>
              🔕 Turn off notifications
            </button>
          </div>
        </>
      )}
    </div>
  );
}
