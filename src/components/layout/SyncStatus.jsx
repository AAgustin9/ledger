import { Cloud, CloudOff, Loader } from 'lucide-react';

const LABELS = {
  idle:    null,
  loading: { icon: Loader,   text: 'Loading…', color: '#8a8070', spin: true  },
  saving:  { icon: Loader,   text: 'Saving…',  color: '#8a8070', spin: true  },
  saved:   { icon: Cloud,    text: 'Saved',     color: '#4a9e6a', spin: false },
  error:   { icon: CloudOff, text: 'Sync error',color: '#c0392b', spin: false },
};

export default function SyncStatus({ status }) {
  const cfg = LABELS[status];
  if (!cfg) return null;

  const Icon = cfg.icon;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 5,
      fontSize: 11, color: cfg.color,
      fontFamily: "'Courier New', monospace", letterSpacing: '0.5px',
    }}>
      <Icon size={12} style={cfg.spin ? { animation: 'spin 1s linear infinite' } : {}} />
      {cfg.text}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
