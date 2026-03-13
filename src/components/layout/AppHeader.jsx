import { LogOut } from 'lucide-react';
import { YEAR } from '../../constants/app';
import { supabase } from '../../lib/supabase';
import ExportButton from './ExportButton';
import DataPortability from './DataPortability';
import SyncStatus from './SyncStatus';

export default function AppHeader({ tabs, activeTab, onTabChange, income, things, foodOrders, setIncome, setThings, setFoodOrders, syncStatus, user }) {
  const handleSignOut = () => supabase.auth.signOut();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="wordmark">
          <div className="wordmark-title">Ledger</div>
          <div className="mono wordmark-year">{YEAR}</div>
        </div>

        <nav className="app-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn mono ${activeTab === tab.id ? 'is-active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="header-actions" style={{ gap: 12 }}>
          <SyncStatus status={syncStatus} />
          <DataPortability
            income={income} things={things} foodOrders={foodOrders}
            setIncome={setIncome} setThings={setThings} setFoodOrders={setFoodOrders}
          />
          <ExportButton income={income} things={things} foodOrders={foodOrders} />
          <button
            onClick={handleSignOut}
            title={user?.email}
            style={{
              background: 'none', border: '1px solid #272522', borderRadius: 3,
              color: '#8a8070', cursor: 'pointer', padding: '6px 8px',
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontFamily: "'Courier New', monospace',",
              transition: 'border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#c0392b'; e.currentTarget.style.color = '#c0392b'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#272522'; e.currentTarget.style.color = '#8a8070'; }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}
