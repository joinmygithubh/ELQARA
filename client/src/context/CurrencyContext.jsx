// client/src/context/CurrencyContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  SUPPORTED_CURRENCIES,
  DEFAULT_RATES,
  formatCurrency,
  convertInrToCurrency,
  guessInitialCurrency,
  fetchRates,
  detectVisitorCurrency,
  saveUserCurrencyPreference
} from '../services/currencyService';

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  // Initialize with previously auto-detected currency or pre-render timezone heuristic
  const [currency, setCurrencyState] = useState(() => guessInitialCurrency());
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(true);

  // Initialize rates and automated visitor country detection
  useEffect(() => {
    let isMounted = true;

    const initializeCurrency = async () => {
      try {
        // 1. Fetch latest exchange rates from backend API
        const fetchedRates = await fetchRates();
        if (isMounted && fetchedRates) {
          setRates(fetchedRates);
        }

        // 2. Automatically detect visitor country and update localized currency
        const detected = await detectVisitorCurrency();
        if (isMounted && detected?.currency) {
          setCurrencyState(detected.currency);
        }
      } catch (err) {
        console.warn('[CurrencyContext] Initialization error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeCurrency();

    return () => {
      isMounted = false;
    };
  }, []);

  // Programmatic currency setter (for test/simulation harnesses if needed)
  const setCurrency = useCallback((newCurrencyCode) => {
    if (!newCurrencyCode) return;
    const code = newCurrencyCode.toUpperCase();
    if (!SUPPORTED_CURRENCIES.some((c) => c.code === code)) return;
    setCurrencyState(code);
  }, []);

  // Current rate for the selected currency against base INR
  const currentRate = useMemo(() => {
    if (currency === 'INR') return 1;
    return rates[currency] || DEFAULT_RATES[currency] || 1;
  }, [currency, rates]);

  // Current currency metadata (symbol, name, flag, etc.)
  const currencyConfig = useMemo(() => {
    return (
      SUPPORTED_CURRENCIES.find((c) => c.code === currency) ||
      SUPPORTED_CURRENCIES[0]
    );
  }, [currency]);

  // Format an INR base amount into the detected display currency
  const formatPrice = useCallback(
    (inrAmount, overrideCurrency = null) => {
      const targetCurrency = (overrideCurrency || currency).toUpperCase();
      const rate = targetCurrency === 'INR' ? 1 : rates[targetCurrency] || DEFAULT_RATES[targetCurrency] || 1;
      return formatCurrency(inrAmount, targetCurrency, rate);
    },
    [currency, rates]
  );

  // Convert an INR base amount into numeric value in the detected display currency
  const convertPrice = useCallback(
    (inrAmount, overrideCurrency = null) => {
      const targetCurrency = (overrideCurrency || currency).toUpperCase();
      const rate = targetCurrency === 'INR' ? 1 : rates[targetCurrency] || DEFAULT_RATES[targetCurrency] || 1;
      return convertInrToCurrency(inrAmount, targetCurrency, rate);
    },
    [currency, rates]
  );

  const value = useMemo(
    () => ({
      currency,
      rates,
      currentRate,
      currencyConfig,
      supportedCurrencies: SUPPORTED_CURRENCIES,
      setCurrency,
      formatPrice,
      convertPrice,
      loading
    }),
    [currency, rates, currentRate, currencyConfig, setCurrency, formatPrice, convertPrice, loading]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
