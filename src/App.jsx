import { useState } from 'react';
import { TABS } from './constants/app';
import { useLocalStorage } from './hooks/useLocalStorage';
import AppFooter from './components/layout/AppFooter';
import AppHeader from './components/layout/AppHeader';
import Dashboard from './components/dashboard/Dashboard';
import IncomeTracker from './components/income/IncomeTracker';
import ThingsPurchases from './components/things/ThingsPurchases';
import FoodOrders from './components/food/FoodOrders';
import ChartTab from './components/chart/ChartTab';

export default function App() {
  const [income, setIncome] = useLocalStorage('ldgr_income', []);
  const [things, setThings] = useLocalStorage('ldgr_things', []);
  const [foodOrders, setFoodOrders] = useLocalStorage('ldgr_food', []);
  const [tab, setTab] = useState('income');

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
      />

      <main className="app-main">
        <Dashboard income={income} things={things} foodOrders={foodOrders} />

        {tab === 'income' ? <IncomeTracker income={income} setIncome={setIncome} /> : null}
        {tab === 'things' ? <ThingsPurchases things={things} setThings={setThings} /> : null}
        {tab === 'food' ? <FoodOrders foodOrders={foodOrders} setFoodOrders={setFoodOrders} /> : null}
        {tab === 'chart' ? <ChartTab things={things} foodOrders={foodOrders} /> : null}
      </main>

      <AppFooter />
    </div>
  );
}
