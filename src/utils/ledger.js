export const uid = () => Math.random().toString(36).slice(2, 9);

export const fmt = (value) => `$${parseFloat(value || 0).toFixed(2)}`;

export const today = () => new Date().toISOString().split('T')[0];

export const daysSince = (date) => Math.floor((Date.now() - new Date(date)) / 86400000);
