import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@components/common/Button';
import './CurrencyConverter.scss';

interface Currency {
  code: string;
  name: string;
  flag: string;
}

interface CurrencyConverterProps {
  onClose: () => void;
}

const currencies: Currency[] = [
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
  { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺' }
];

export const CurrencyConverter = ({ onClose }: CurrencyConverterProps) => {
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('PLN');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState('');
  const [exchangeRate, setExchangeRate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch exchange rates from NBP API
      const response = await fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      const rates = data[0].rates;

      // Create a map of rates (all in relation to PLN)
      const ratesMap = new Map<string, number>();
      ratesMap.set('PLN', 1);
      
      rates.forEach((rate: any) => {
        ratesMap.set(rate.code, rate.mid);
      });

      if (!ratesMap.has(fromCurrency) || !ratesMap.has(toCurrency)) {
        throw new Error('Unsupported currency');
      }

      const fromRate = ratesMap.get(fromCurrency)!;
      const toRate = ratesMap.get(toCurrency)!;

      // Convert: amount * fromRate gives PLN, then divide by toRate
      const amountValue = parseFloat(amount);
      const convertedAmount = (amountValue * fromRate) / toRate;
      const rate = fromRate / toRate;

      setResult(convertedAmount.toFixed(2));
      setExchangeRate(`1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`);
    } catch (err) {
      setError('Unable to fetch exchange rates. Please try again later.');
      console.error('Conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="currency-converter">
      <div className="currency-converter__form">
        <div className="currency-converter__row">
          <div className="currency-converter__field">
            <label className="currency-converter__label">From:</label>
            <select
              className="currency-converter__select"
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div className="currency-converter__field">
            <label className="currency-converter__label">To:</label>
            <select
              className="currency-converter__select"
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="currency-converter__row">
          <div className="currency-converter__field currency-converter__field--value">
            <label className="currency-converter__label">Amount:</label>
            <input
              type="number"
              className="currency-converter__input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              min="0"
              step="0.01"
            />
          </div>

          <div className="currency-converter__field currency-converter__field--result">
            <label className="currency-converter__label">Result:</label>
            <input
              type="text"
              className="currency-converter__input currency-converter__result"
              value={result}
              placeholder="Conversion result..."
              readOnly
            />
          </div>
        </div>

        {exchangeRate && (
          <div className="currency-converter__rate">
            {exchangeRate}
          </div>
        )}

        {error && (
          <div className="currency-converter__error">
            {error}
          </div>
        )}

        {loading && (
          <div className="currency-converter__loading">
            <div className="currency-converter__spinner" />
            <span>Converting...</span>
          </div>
        )}

        <div className="currency-converter__actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Back
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            loading={loading}
            onClick={(e) => handleConvert(e)}
          >
            Convert
          </Button>
        </div>
      </div>
    </div>
  );
};
