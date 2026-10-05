// server/services/currencyService.js

// Pre-defined fallback rates against INR in case of API unavailability
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.0116,
  EUR: 0.0110,
  GBP: 0.0092,
  AUD: 0.0182,
  CAD: 0.0164,
  AED: 0.0427,
  SGD: 0.0156,
  JPY: 1.82
};

const EUROZONE_COUNTRIES = [
  'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT',
  'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'HR'
];

const COUNTRY_TO_CURRENCY = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  AE: 'AED',
  SG: 'SGD',
  JP: 'JPY'
};

// In-memory cache for exchange rates
let ratesCache = {
  base: 'INR',
  rates: { ...FALLBACK_RATES },
  lastFetched: 0,
  isFallback: false
};

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Fetch live exchange rates with fallback and caching
 */
export const getLiveRates = async () => {
  const now = Date.now();
  if (ratesCache.lastFetched && now - ratesCache.lastFetched < CACHE_DURATION_MS) {
    return ratesCache;
  }

  const primaryApi = 'https://open.er-api.com/v6/latest/INR';
  const secondaryApi = 'https://api.exchangerate-api.com/v4/latest/INR';

  for (const apiUrl of [primaryApi, secondaryApi]) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const incomingRates = data.rates || {};

        const extractedRates = {
          INR: 1,
          USD: incomingRates.USD || FALLBACK_RATES.USD,
          EUR: incomingRates.EUR || FALLBACK_RATES.EUR,
          GBP: incomingRates.GBP || FALLBACK_RATES.GBP,
          AUD: incomingRates.AUD || FALLBACK_RATES.AUD,
          CAD: incomingRates.CAD || FALLBACK_RATES.CAD,
          AED: incomingRates.AED || FALLBACK_RATES.AED,
          SGD: incomingRates.SGD || FALLBACK_RATES.SGD,
          JPY: incomingRates.JPY || FALLBACK_RATES.JPY
        };

        ratesCache = {
          base: 'INR',
          rates: extractedRates,
          lastFetched: now,
          isFallback: false,
          provider: apiUrl.includes('open.er-api.com') ? 'Open Exchange Rates' : 'ExchangeRate-API'
        };

        return ratesCache;
      }
    } catch (err) {
      console.warn(`[CurrencyService] Failed to fetch rates from ${apiUrl}:`, err.message);
    }
  }

  // If both failed, use fallback with updated timestamp
  ratesCache = {
    base: 'INR',
    rates: { ...FALLBACK_RATES },
    lastFetched: now,
    isFallback: true,
    provider: 'Built-in Reserve Fallback'
  };

  return ratesCache;
};

/**
 * Determine currency from ISO 3166-1 alpha-2 country code
 */
export const getCurrencyForCountry = (countryCode) => {
  if (!countryCode) return 'INR';
  const upper = countryCode.toUpperCase();
  if (COUNTRY_TO_CURRENCY[upper]) {
    return COUNTRY_TO_CURRENCY[upper];
  }
  if (EUROZONE_COUNTRIES.includes(upper)) {
    return 'EUR';
  }
  return 'INR';
};

/**
 * Detect client country from request IP or headers
 */
export const detectClientCountry = async (req) => {
  // 1. Check Cloudflare or reverse proxy country headers
  const cfCountry = req.headers['cf-ipcountry'] || req.headers['x-country-code'];
  if (cfCountry && cfCountry.length === 2) {
    const country = cfCountry.toUpperCase();
    return {
      country,
      currency: getCurrencyForCountry(country),
      detectedBy: 'proxy-header'
    };
  }

  // 2. Extract client IP
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // 3. Local/private IP check -> Default to India (INR) for local development
  const isLocal = !ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.');
  if (isLocal) {
    return {
      country: 'IN',
      currency: 'INR',
      detectedBy: 'local-environment'
    };
  }

  // 4. Try IP geolocation service with 2s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (geoRes.ok) {
      const geo = await geoRes.json();
      const country = geo.country_code || 'IN';
      return {
        country,
        currency: getCurrencyForCountry(country),
        detectedBy: 'ip-geolocation'
      };
    }
  } catch (err) {
    // Ignore and fallback gracefully
  }

  return {
    country: 'IN',
    currency: 'INR',
    detectedBy: 'fallback'
  };
};
