// server/routes/currencyRoutes.js
import express from 'express';
import { getCurrencyRates, detectCurrency } from '../controllers/currencyController.js';

const router = express.Router();

router.get('/rates', getCurrencyRates);
router.get('/detect', detectCurrency);

export default router;
