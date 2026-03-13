import { useState } from 'react';
import { TABS } from './constants/app';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './hooks/useAuth';
import { useCloudSync } from './hooks/useCloudSync';
import AppFooter from './components/layout/AppFooter';
import AppHeader from './components/layout/AppHeader';
import Dashboard from './components/dashboard/Dashboard';
import IncomeTracker from './components/income/IncomeTracker';
import ThingsPurchases from './components/things/ThingsPurchases';
import FoodOrders from './components/food/FoodOrders';
import ChartTab from './components/chart/ChartTab';
import LoginScreen from './components/auth/LoginScreen';

export default function App() {
  const { session, user, loading: authLoading } = useAuth();

  const [income,     setIncome]     = useLocalStorage('ldgr_income', []);
  const [things,     setThings]     = useLocalStorage('ldgr_things', []);
  const [foodOrders, setFoodOrders] = useLocalStorage('ldgr_food',   []);
  const [tab, setTab] = useState('income');

  const { status: syncStatus } = useCloudSync({
    session, income, things, foodOrders, setIncome, setThings, setFoodOrders,
  });

  if (authLoading) return <LoadingScreen />;
  if (!session)    return <LoginScreen />;

  return (
    <div className="app-shell">
      <AppHeader
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        income={income}
        things={things}
        foodOrders={foodOrders}
        setIncome={setIncome}
        setThings={setThings}
        setFoodOrders={setFoodOrders}
        syncStatus={syncStatus}
        user={user}
      />

      <main className="app-main">
        <Dashboard income={income} things={things} foodOrders={foodOrders} />

        {tab === 'income' ? <IncomeTracker income={income} setIncome={setIncome} /> : null}
        {tab === 'things' ? <ThingsPurchases things={things} setThings={setThings} /> : null}
        {tab === 'food'   ? <FoodOrders foodOrders={foodOrders} setFoodOrders={setFoodOrders} /> : null}
        {tab === 'chart'  ? <ChartTab things={things} foodOrders={foodOrders} /> : null}
      </main>

      <AppFooter />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: '#0c0c0a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#c9a84c', letterSpacing: '5px', textTransform: 'uppercase', fontFamily: 'Georgia, serif' }}>
        Ledger
      </div>
      <div style={{ fontSize: 11, color: '#504840', fontFamily: "'Courier New', monospace", letterSpacing: '2px' }}>
        loading…
      </div>
    </div>
  );
}
