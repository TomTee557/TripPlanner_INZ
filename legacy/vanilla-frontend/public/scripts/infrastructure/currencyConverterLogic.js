// Supported currencies from NBP API
export const currencies = [
  { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱' },
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰' },
  { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', flag: '🇺🇦' },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷' }
];

// Currency converter class
export class CurrencyConverter {
  constructor() {
    this.exchangeRates = new Map();
    this.lastUpdate = null;
  }

  // Get exchange rates from NBP API
  async getExchangeRates() {
    try {
      // NBP API provides rates in relation to PLN
      const response = await fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rates = data[0].rates;

      // Clear previous rates
      this.exchangeRates.clear();
      
      // Add PLN as base currency (1 PLN = 1 PLN)
      this.exchangeRates.set('PLN', 1);

      // Add other currencies
      rates.forEach(rate => {
        this.exchangeRates.set(rate.code, rate.mid);
      });

      this.lastUpdate = new Date();
      return true;

    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw new Error('Unable to fetch current exchange rates. Please try again later.');
    }
  }

  // Convert currency
  async convert(fromCurrency, toCurrency, amount) {
    // fresh exchange rates
    if (!this.lastUpdate || this.isDataStale()) {
      await this.getExchangeRates();
    }

    if (!this.exchangeRates.has(fromCurrency) || !this.exchangeRates.has(toCurrency)) {
      throw new Error('Unsupported currency');
    }

    const fromRate = this.exchangeRates.get(fromCurrency);
    const toRate = this.exchangeRates.get(toCurrency);

    const convertedAmount = (amount * fromRate) / toRate;
    const exchangeRate = fromRate / toRate;

    return {
      originalAmount: amount,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      fromCurrency,
      toCurrency,
      exchangeRate: parseFloat(exchangeRate.toFixed(6)),
      lastUpdate: this.lastUpdate
    };
  }

  // Check if data is older than 1 hour
  isDataStale() {
    if (!this.lastUpdate) return true;
    const oneHour = 60 * 60 * 1000;
    return Date.now() - this.lastUpdate.getTime() > oneHour;
  }

  // Get supported currencies
  getSupportedCurrencies() {
    return currencies;
  }
}

// Export singleton instance
export const currencyConverter = new CurrencyConverter();
