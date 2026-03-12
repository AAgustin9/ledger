import { YEAR } from '../../constants/app';
import ExportButton from './ExportButton';
import DataPortability from './DataPortability';

export default function AppHeader({ tabs, activeTab, onTabChange, income, things, foodOrders, setIncome, setThings, setFoodOrders }) {
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

        <div className="header-actions" style={{ gap: 8 }}>
          <DataPortability
            income={income} things={things} foodOrders={foodOrders}
            setIncome={setIncome} setThings={setThings} setFoodOrders={setFoodOrders}
          />
          <ExportButton income={income} things={things} foodOrders={foodOrders} />
        </div>
      </div>
    </header>
  );
}
