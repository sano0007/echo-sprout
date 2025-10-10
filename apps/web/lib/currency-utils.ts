/**
 * Currency Conversion Utility Functions
 *
 * Pure TypeScript functions for currency conversion without React components
 */

// Exchange rates (typically these would come from an API, but using static rates for now)
// Base currency: USD
const EXCHANGE_RATES = {
  USD_TO_INR: 83.25, // 1 USD = 83.25 INR (approximate rate)
  USD_TO_LKR: 326.50, // 1 USD = 326.50 LKR (approximate rate)
  INR_TO_LKR: 3.92, // 1 INR = 3.92 LKR (approximate rate)
} as const;

export type Currency = 'USD' | 'INR' | 'LKR';

export interface CurrencyAmount {
  amount: number;
  currency: Currency;
}

export interface MultiCurrencyDisplay {
  primary: CurrencyAmount;
  secondary: CurrencyAmount;
}

/**
 * Convert amount from one currency to another
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  // Convert to USD first if needed
  let usdAmount = amount;

  if (fromCurrency === 'INR') {
    usdAmount = amount / EXCHANGE_RATES.USD_TO_INR;
  } else if (fromCurrency === 'LKR') {
    usdAmount = amount / EXCHANGE_RATES.USD_TO_LKR;
  }

  // Convert from USD to target currency
  if (toCurrency === 'INR') {
    return usdAmount * EXCHANGE_RATES.USD_TO_INR;
  } else if (toCurrency === 'LKR') {
    return usdAmount * EXCHANGE_RATES.USD_TO_LKR;
  }

  return usdAmount; // Target is USD
}

/**
 * Format currency amount with appropriate symbol and formatting
 */
export function formatCurrency(amount: number, currency: Currency): string {
  const roundedAmount = Math.round(amount);

  switch (currency) {
    case 'USD':
      return `$${roundedAmount.toLocaleString()}`;
    case 'INR':
      return `₹${roundedAmount.toLocaleString('en-IN')}`;
    case 'LKR':
      return `Rs. ${roundedAmount.toLocaleString()}`;
    default:
      return `${roundedAmount.toLocaleString()}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  switch (currency) {
    case 'USD':
      return '$';
    case 'INR':
      return '₹';
    case 'LKR':
      return 'Rs.';
    default:
      return '';
  }
}

/**
 * Convert USD amount to LKR for display
 */
export function getLKRDisplay(usdAmount: number): CurrencyAmount {
  const lkrAmount = convertCurrency(usdAmount, 'USD', 'LKR');
  return { amount: lkrAmount, currency: 'LKR' };
}

/**
 * Utility to get exchange rate info for display
 */
export function getExchangeRateInfo() {
  return {
    usdToInr: EXCHANGE_RATES.USD_TO_INR,
    usdToLkr: EXCHANGE_RATES.USD_TO_LKR,
    inrToLkr: EXCHANGE_RATES.INR_TO_LKR,
    lastUpdated: 'Static rates - typically updated daily from forex APIs'
  };
}

/**
 * Calculate total amounts in LKR
 */
export function calculateTotalLKR(amounts: number[]): CurrencyAmount {
  const totalUSD = amounts.reduce((sum, amount) => sum + amount, 0);
  return getLKRDisplay(totalUSD);
}

/**
 * Format large amounts with appropriate units (K, M, B)
 */
export function formatLargeCurrency(amount: number, currency: Currency): string {
  const symbol = getCurrencySymbol(currency);

  if (amount >= 1_000_000_000) {
    return `${symbol}${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (amount >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toFixed(1)}M`;
  } else if (amount >= 1_000) {
    return `${symbol}${(amount / 1_000).toFixed(1)}K`;
  } else {
    return formatCurrency(amount, currency);
  }
}

/**
 * Simple function to get LKR formatting for display
 */
export function formatUSDToLKR(usdAmount: number): string {
  const lkrAmount = convertCurrency(usdAmount, 'USD', 'LKR');
  return formatCurrency(lkrAmount, 'LKR');
}