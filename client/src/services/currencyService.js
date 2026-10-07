import { currencyAPI } from './api.js';

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', decimals: 0, formatLocale: 'en-IN' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', decimals: 2, formatLocale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', decimals: 2, formatLocale: 'en-IE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧', decimals: 2, formatLocale: 'en-GB' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: '🇨🇦', decimals: 2, formatLocale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', decimals: 2, formatLocale: 'en-AU' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪', decimals: 2, formatLocale: 'en-AE' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', decimals: 2, formatLocale: 'en-SA' },
];

export const DEFAULT_RATES = {
  INR: 1,
  USD: 0.0104,
  EUR: 0.0092,
  GBP: 0.0078,
  CAD: 0.0148,
  AUD: 0.0149,
  AED: 0.0381,
  SAR: 0.0389
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

  // Decide decimal places: INR has 0 for integer prices, others standard 2
  let decimals = config.decimals;
  if (code === 'INR') {
    decimals = converted % 1 === 0 ? 0 : 2;
  }

  try {
    const formattedNum = new Intl.NumberFormat(config.formatLocale || 'en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(converted);

    // Explicit currency prefix according to luxury standards
    if (code === 'INR') return `₹${formattedNum}`;
    if (code === 'USD') return `$${formattedNum}`;
    if (code === 'EUR') return `€${formattedNum}`;
    if (code === 'GBP') return `£${formattedNum}`;
    if (code === 'CAD') return `C$${formattedNum}`;
    if (code === 'AUD') return `A$${formattedNum}`;
    if (code === 'AED') return `AED ${formattedNum}`;
    if (code === 'SAR') return `SAR ${formattedNum}`;

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
  return Math.round(converted * 100) / 100;
};

/**
 * Instant initial guess based on previously auto-detected cache or timezone heuristic
 */
export const guessInitialCurrency = () => {
  try {
    // 1. Check previously auto-detected currency for zero layout shift
    const savedAuto = localStorage.getItem(STORAGE_KEYS.AUTO_DETECTED);
    if (savedAuto && SUPPORTED_CURRENCIES.some((c) => c.code === savedAuto)) {
      return savedAuto;
    }

    // 2. Pre-render timezone heuristic while API resolves
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
    if (timeZone.includes('Paris') || timeZone.includes('Berlin') || timeZone.includes('Rome') || timeZone.includes('Madrid') || timeZone.includes('Amsterdam') || timeZone.includes('Vienna') || timeZone.includes('Dublin') || timeZone.includes('Brussels')) {
      return 'EUR';
    }
    if (timeZone.includes('Dubai')) {
      return 'AED';
    }
    if (timeZone.includes('Riyadh')) {
      return 'SAR';
    }
    if (timeZone.includes('Sydney') || timeZone.includes('Melbourne') || timeZone.includes('Brisbane')) {
      return 'AUD';
    }
    if (timeZone.includes('Toronto') || timeZone.includes('Vancouver') || timeZone.includes('Montreal')) {
      return 'CAD';
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
 * Automatically detect visitor currency from backend API based on country
 */
export const detectVisitorCurrency = async () => {
  // Purge any old manual preference to guarantee pure automatic detection
  try {
    localStorage.removeItem(STORAGE_KEYS.MANUAL_SELECTION);
  } catch {}

  try {
    let params;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const testCountry = urlParams.get('country') || sessionStorage.getItem('elqara_test_country');
      if (testCountry) params = { country: testCountry };
    }

    const res = await currencyAPI.detect(params);
    if (res.data && res.data.success && res.data.currency) {
      const detected = res.data.currency.toUpperCase();
      if (SUPPORTED_CURRENCIES.some((c) => c.code === detected)) {
        localStorage.setItem(STORAGE_KEYS.AUTO_DETECTED, detected);
        return { currency: detected, country: res.data.country };
      }
    }
  } catch (err) {
    console.warn('[CurrencyService] Geo-detection API failed, using timezone guess:', err.message);
  }

  const guessed = guessInitialCurrency();
  return { currency: guessed };
};

/**
 * Legacy preference cleanup helper
 */
export const saveUserCurrencyPreference = () => {
  // Manual currency selection is disabled - automatic detection only
};
