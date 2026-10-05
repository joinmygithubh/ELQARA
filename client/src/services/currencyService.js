// client/src/services/currencyService.js
import { currencyAPI } from './api';

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', decimals: 0, formatLocale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', decimals: 2, formatLocale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', decimals: 2, formatLocale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', decimals: 2, formatLocale: 'en-GB' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', decimals: 2, formatLocale: 'en-AU' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', decimals: 2, formatLocale: 'en-CA' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', decimals: 2, formatLocale: 'en-AE' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', decimals: 2, formatLocale: 'en-SG' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', decimals: 0, formatLocale: 'ja-JP' },
];

export const DEFAULT_RATES = {
  INR: 1,
  USD: 0.0104,
  EUR: 0.0092,
  GBP: 0.0079,
  AUD: 0.0149,
  CAD: 0.0148,
  AED: 0.0381,
  SGD: 0.0133,
  JPY: 1.638
};

const STORAGE_KEYS = {
  MANUAL_SELECTION: 'elqara_user_currency',
  AUTO_DETECTED: 'elqara_auto_currency',
  CACHED_RATES: 'elqara_exchange_rates',
  RATES_TIMESTAMP: 'elqara_rates_timestamp'
};

const RATES_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours cache

/**
 * Format currency amount with international formatting rules
 */
export const formatCurrency = (inrAmount, currencyCode = 'INR', rate = 1) => {
  if (inrAmount === null || inrAmount === undefined || isNaN(Number(inrAmount))) {
    return '—';
  }

  const code = (currencyCode || 'INR').toUpperCase();
  const config = SUPPORTED_CURRENCIES.find((c) => c.code === code) || {
    code,
    symbol: code,
    decimals: 2,
    formatLocale: 'en-US'
  };

  const numericInr = Number(inrAmount);
  const numericRate = Number(rate) || DEFAULT_RATES[code] || 1;
  const converted = code === 'INR' ? numericInr : numericInr * numericRate;

  // Decide decimal places: JPY has 0, INR has 0 for whole numbers, others usually 2
  let decimals = config.decimals;
  if (code === 'INR') {
    decimals = converted % 1 === 0 ? 0 : 2;
  }

  try {
    const formattedNum = new Intl.NumberFormat(config.formatLocale || 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(converted);

    // Prepend symbol according to standards
    if (code === 'AED') return `AED ${formattedNum}`;
    if (code === 'EUR') return `€${formattedNum}`;
    if (code === 'GBP') return `£${formattedNum}`;
    if (code === 'USD') return `$${formattedNum}`;
    if (code === 'INR') return `₹${formattedNum}`;
    if (code === 'JPY') return `¥${formattedNum}`;
    if (code === 'AUD') return `A$${formattedNum}`;
    if (code === 'CAD') return `C$${formattedNum}`;
    if (code === 'SGD') return `S$${formattedNum}`;

    return `${config.symbol}${formattedNum}`;
  } catch (err) {
    return `${config.symbol}${converted.toFixed(decimals)}`;
  }
};

/**
 * Convert numeric INR value to target currency number
 */
export const convertInrToCurrency = (inrAmount, currencyCode = 'INR', rate = 1) => {
  if (inrAmount === null || inrAmount === undefined || isNaN(Number(inrAmount))) {
    return 0;
  }
  const code = (currencyCode || 'INR').toUpperCase();
  if (code === 'INR') return Number(inrAmount);
  const numericRate = Number(rate) || DEFAULT_RATES[code] || 1;
  const converted = Number(inrAmount) * numericRate;
  return code === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
};

/**
 * Instant local guess based on browser timezone and language
 */
export const guessInitialCurrency = () => {
  try {
    // 1. Check if user already manually selected a currency in localStorage
    const savedManual = localStorage.getItem(STORAGE_KEYS.MANUAL_SELECTION);
    if (savedManual && SUPPORTED_CURRENCIES.some((c) => c.code === savedManual)) {
      return savedManual;
    }

    // 2. Check previously auto-detected currency
    const savedAuto = localStorage.getItem(STORAGE_KEYS.AUTO_DETECTED);
    if (savedAuto && SUPPORTED_CURRENCIES.some((c) => c.code === savedAuto)) {
      return savedAuto;
    }

    // 3. Timezone heuristic
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (timeZone.includes('Calcutta') || timeZone.includes('Kolkata') || timeZone.includes('India')) {
      return 'INR';
    }
    if (timeZone.startsWith('America/') || timeZone.includes('New_York') || timeZone.includes('Los_Angeles') || timeZone.includes('Chicago')) {
      return 'USD';
    }
    if (timeZone.includes('London')) {
      return 'GBP';
    }
    if (timeZone.includes('Paris') || timeZone.includes('Berlin') || timeZone.includes('Rome') || timeZone.includes('Madrid') || timeZone.includes('Amsterdam') || timeZone.includes('Vienna') || timeZone.includes('Dublin')) {
      return 'EUR';
    }
    if (timeZone.includes('Tokyo')) {
      return 'JPY';
    }
    if (timeZone.includes('Dubai')) {
      return 'AED';
    }
    if (timeZone.includes('Sydney') || timeZone.includes('Melbourne') || timeZone.includes('Brisbane')) {
      return 'AUD';
    }
    if (timeZone.includes('Toronto') || timeZone.includes('Vancouver') || timeZone.includes('Montreal')) {
      return 'CAD';
    }
    if (timeZone.includes('Singapore')) {
      return 'SGD';
    }
  } catch (e) {
    // ignore
  }

  return 'INR';
};

/**
 * Fetch latest rates from server or localStorage cache
 */
export const fetchRates = async () => {
  const now = Date.now();
  try {
    const cachedRatesStr = localStorage.getItem(STORAGE_KEYS.CACHED_RATES);
    const cachedTimestamp = Number(localStorage.getItem(STORAGE_KEYS.RATES_TIMESTAMP) || 0);

    if (cachedRatesStr && now - cachedTimestamp < RATES_TTL_MS) {
      const parsed = JSON.parse(cachedRatesStr);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    }
  } catch (e) {
    // Cache read failed, proceed to fetch
  }

  try {
    const res = await currencyAPI.getRates();
    if (res.data && res.data.success && res.data.rates) {
      const incoming = res.data.rates;
      const rates = { ...DEFAULT_RATES, ...incoming, INR: 1 };
      localStorage.setItem(STORAGE_KEYS.CACHED_RATES, JSON.stringify(rates));
      localStorage.setItem(STORAGE_KEYS.RATES_TIMESTAMP, String(now));
      return rates;
    }
  } catch (err) {
    console.warn('[CurrencyService] Server rate fetch failed, falling back to local defaults:', err.message);
  }

  return DEFAULT_RATES;
};

/**
 * Detect visitor currency from backend API
 */
export const detectVisitorCurrency = async () => {
  // If user already made a manual choice, respect it 100%
  const manual = localStorage.getItem(STORAGE_KEYS.MANUAL_SELECTION);
  if (manual) {
    return { currency: manual, isManual: true };
  }

  try {
    const res = await currencyAPI.detect();
    if (res.data && res.data.success && res.data.currency) {
      const detected = res.data.currency.toUpperCase();
      if (SUPPORTED_CURRENCIES.some((c) => c.code === detected)) {
        localStorage.setItem(STORAGE_KEYS.AUTO_DETECTED, detected);
        return { currency: detected, isManual: false, country: res.data.country };
      }
    }
  } catch (err) {
    console.warn('[CurrencyService] Geo-detection API failed, using timezone guess:', err.message);
  }

  const guessed = guessInitialCurrency();
  return { currency: guessed, isManual: false };
};

/**
 * Save manual user currency choice
 */
export const saveUserCurrencyPreference = (currencyCode) => {
  if (currencyCode) {
    localStorage.setItem(STORAGE_KEYS.MANUAL_SELECTION, currencyCode.toUpperCase());
  }
};
