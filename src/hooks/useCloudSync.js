import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

// Status: 'idle' | 'loading' | 'saving' | 'saved' | 'error'
export function useCloudSync({ session, income, things, foodOrders, setIncome, setThings, setFoodOrders }) {
  const [status, setStatus] = useState('idle');
  const ready = useRef(false);   // true once initial load from Supabase is done
  const saveTimer = useRef(null);

  // ── Load from Supabase on login ───────────────────────────────────────────
  useEffect(() => {
    if (!session) {
      ready.current = false;
      setStatus('idle');
      return;
    }

    const load = async () => {
      setStatus('loading');
      const { data, error } = await supabase
        .from('backups')
        .select('data')
        .eq('user_id', session.user.id)
        .maybeSingle(); // returns null instead of error when no row exists

      if (error) {
        setStatus('error');
        ready.current = true; // still allow local edits
        return;
      }

      if (data?.data) {
        setIncome(data.data.income   ?? []);
        setThings(data.data.things   ?? []);
        setFoodOrders(data.data.foodOrders ?? []);
      }
      // if no row yet, keep whatever is in localStorage

      ready.current = true;
      setStatus('saved');
    };

    load();
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Debounced save whenever data changes ──────────────────────────────────
  useEffect(() => {
    if (!session || !ready.current) return;

    setStatus('saving');
    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase
        .from('backups')
        .upsert(
          { user_id: session.user.id, data: { income, things, foodOrders }, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );

      setStatus(error ? 'error' : 'saved');
    }, 1500);

    return () => clearTimeout(saveTimer.current);
  }, [income, things, foodOrders]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status };
}
