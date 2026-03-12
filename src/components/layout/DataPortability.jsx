import { useRef, useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import Button from '../ui/Button';

export default function DataPortability({ income, things, foodOrders, setIncome, setThings, setFoodOrders }) {
  const fileInputRef = useRef(null);
  const [confirm, setConfirm] = useState(null); // holds parsed data waiting for confirmation
  const [error, setError] = useState(null);

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      income,
      things,
      foodOrders,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import ──────────────────────────────────────────────────────────────────
  const handleFileChange = (event) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.income || !parsed.things || !parsed.foodOrders) {
          throw new Error('File is missing required fields.');
        }
        setConfirm(parsed);
      } catch (err) {
        setError(err.message || 'Invalid file.');
      }
    };
    reader.readAsText(file);
    // reset input so the same file can be re-selected if needed
    event.target.value = '';
  };

  const applyImport = () => {
    setIncome(confirm.income);
    setThings(confirm.things);
    setFoodOrders(confirm.foodOrders);
    setConfirm(null);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 6 }}>
        <Button onClick={handleExport} variant="ghost" style={{ fontSize: 12 }}>
          <Download size={13} />
          Backup
        </Button>
        <Button onClick={() => { setError(null); fileInputRef.current?.click(); }} variant="ghost" style={{ fontSize: 12 }}>
          <Upload size={13} />
          Restore
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* ── Confirm modal ─────────────────────────────────────────────────── */}
      {confirm ? (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--color-card)', border: '1px solid var(--color-border)',
            borderRadius: 6, padding: '28px 32px', maxWidth: 420, width: '90%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--color-text)' }}>Restore backup?</div>
              <button onClick={() => setConfirm(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-dim)', padding: 2 }}>
                <X size={16} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: 8 }}>
              This will <strong style={{ color: 'var(--color-red)' }}>replace all current data</strong> with the backup from:
            </p>
            <div className="mono" style={{ fontSize: 13, color: 'var(--color-accent)', marginBottom: 6 }}>
              {new Date(confirm.exportedAt).toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text-dim)', marginBottom: 24 }}>
              {confirm.income.length} income entries · {confirm.things.length} purchases · {confirm.foodOrders.length} food orders
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
              <Button variant="danger" onClick={applyImport}>Yes, restore</Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Error toast ───────────────────────────────────────────────────── */}
      {error ? (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
          background: 'var(--color-red-bg)', border: '1px solid var(--color-red)',
          borderRadius: 4, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          color: 'var(--color-red)', fontSize: 13, fontFamily: 'var(--font-mono)',
        }}>
          {error}
          <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-red)', padding: 0 }}>
            <X size={14} />
          </button>
        </div>
      ) : null}
    </>
  );
}
