// server/services/currencyService.js

// Pre-defined fallback rates against INR in case of API unavailability
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.0104,
  EUR: 0.0092,
  GBP: 0.0078,
  CAD: 0.0148,
  AUD: 0.0149,
  AED: 0.0381,
  SAR: 0.0389,
  SGD: 0.0133,
  JPY: 1.64
};

// All 27 European Union Member States + official Euro microstates
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // Official European microstates using EUR
  'AD', 'MC', 'SM', 'VA', 'ME', 'XK'
];

// Direct ISO country code to currency mapping
const COUNTRY_TO_CURRENCY = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  AE: 'AED',
  SA: 'SAR'
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
          CAD: incomingRates.CAD || FALLBACK_RATES.CAD,
          AUD: incomingRates.AUD || FALLBACK_RATES.AUD,
          AED: incomingRates.AED || FALLBACK_RATES.AED,
          SAR: incomingRates.SAR || FALLBACK_RATES.SAR,
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
 * - India -> INR (₹)
 * - United States -> USD ($)
 * - United Kingdom -> GBP (£)
 * - European Union countries -> EUR (€)
 * - Canada -> CAD (C$)
 * - Australia -> AUD (A$)
 * - UAE -> AED
 * - Saudi Arabia -> SAR
 * - Other countries -> USD ($) (sensible global fallback)
 * - Missing/unresolvable -> INR (base currency)
 */
export const getCurrencyForCountry = (countryCode) => {
  if (!countryCode || typeof countryCode !== 'string') return 'INR';
  const upper = countryCode.trim().toUpperCase();
  if (COUNTRY_TO_CURRENCY[upper]) {
    return COUNTRY_TO_CURRENCY[upper];
  }
  if (EU_COUNTRIES.includes(upper)) {
    return 'EUR';
  }
  // Standard international fallback for all other countries
  return 'USD';
};

/**
 * Detect client country from Cloudflare headers, reverse proxy headers, or IP geolocation
 */
export const detectClientCountry = async (req) => {
  // 1. Allow testing header/param for QA and test validation
  const testCountry = req.headers['x-test-country'] || req.query?.country;
  if (testCountry && typeof testCountry === 'string' && testCountry.trim().length === 2) {
    const country = testCountry.trim().toUpperCase();
    return {
      country,
      currency: getCurrencyForCountry(country),
      detectedBy: 'test-override'
    };
  }

  // 2. Check Cloudflare or reverse proxy country headers
  // Cloudflare automatically provides 'cf-ipcountry' on all incoming requests
  const cfCountry = req.headers['cf-ipcountry'] || req.headers['x-country-code'] || req.headers['x-geo-country'] || req.headers['x-vercel-ip-country'];
  if (cfCountry && typeof cfCountry === 'string') {
    const cleanCountry = cfCountry.trim().toUpperCase();
    if (cleanCountry.length === 2 && cleanCountry !== 'XX' && cleanCountry !== 'T1') {
      return {
        country: cleanCountry,
        currency: getCurrencyForCountry(cleanCountry),
        detectedBy: 'cloudflare-header'
      };
    }
  }

  // 3. Extract client IP
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  if (typeof ip === 'string' && ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }
  if (ip.startsWith('::ffff:')) {
    ip = ip.replace('::ffff:', '');
  }

  // 4. Local/private IP check -> Default to India (INR) for local development
  const isLocal = !ip || ip === '127.0.0.1' || ip === '::1' || ip === 'localhost' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.');
  if (isLocal) {
    return {
      country: 'IN',
      currency: 'INR',
      detectedBy: 'local-environment'
    };
  }

  // 5. Try IP geolocation service with 2s timeout for non-Cloudflare production setups
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (geoRes.ok) {
      const geo = await geoRes.json();
      const country = geo.country_code ? geo.country_code.toUpperCase() : null;
      if (country && country.length === 2) {
        return {
          country,
          currency: getCurrencyForCountry(country),
          detectedBy: 'ip-geolocation'
        };
      }
    }
  } catch (err) {
    // Ignore and fallback gracefully
  }

  // 6. Safe store base fallback
  return {
    country: 'IN',
    currency: 'INR',
    detectedBy: 'fallback'
  };
};
