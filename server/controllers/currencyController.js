// server/controllers/currencyController.js
import { getLiveRates, detectClientCountry } from '../services/currencyService.js';

// @desc    Get live exchange rates against base currency INR
// @route   GET /api/currency/rates
// @access  Public
export const getCurrencyRates = async (req, res, next) => {
  try {
    const rateData = await getLiveRates();
    res.json({
      success: true,
      base: rateData.base,
      rates: rateData.rates,
      lastFetched: rateData.lastFetched,
      provider: rateData.provider,
      isFallback: rateData.isFallback
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Detect client's country and recommended currency
// @route   GET /api/currency/detect
// @access  Public
export const detectCurrency = async (req, res, next) => {
  try {
    const detection = await detectClientCountry(req);
    res.json({
      success: true,
      country: detection.country,
      currency: detection.currency,
      detectedBy: detection.detectedBy
    });
  } catch (error) {
    next(error);
  }
};
