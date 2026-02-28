import {
    FALLBACK_RATES_PER_USD,
    REFRESH_INTERVAL_MS,
    SUPPORTED_CURRENCIES
} from './config.js';
import { parseLocaleNumber, formatNumber } from './formatters.js';
import { toUSD, fromUSD } from './converter.js';
import { fetchRatesPerUSD } from './rates-service.js';
import {
    setStatus,
    setUpdatedAtLabel,
    clearOtherFields,
    bindFieldEvents
} from './ui.js';

const fields = {
    CDF: document.getElementById('cdf'),
    XAF: document.getElementById('xaf'),
    EUR: document.getElementById('eur'),
    USD: document.getElementById('usd')
};

const statusEl = document.getElementById('status');
const updatedAtEl = document.getElementById('updatedAt');
const refreshBtn = document.getElementById('refreshBtn');

let ratesPerUSD = { ...FALLBACK_RATES_PER_USD };
let isUpdating = false;

function handleInput(sourceCurrency) {
    if (isUpdating) return;

    const raw = fields[sourceCurrency].value.trim();
    if (raw === '') {
        isUpdating = true;
        clearOtherFields(fields, sourceCurrency);
        isUpdating = false;
        return;
    }

    const amount = parseLocaleNumber(raw);
    if (Number.isNaN(amount)) return;

    const usd = toUSD(amount, sourceCurrency, ratesPerUSD);
    const converted = fromUSD(usd, ratesPerUSD);

    isUpdating = true;
    SUPPORTED_CURRENCIES.forEach((currency) => {
        if (currency === sourceCurrency) return;
        fields[currency].value = formatNumber(converted[currency]);
    });
    isUpdating = false;
}

async function refreshRates() {
    setStatus(statusEl, 'loading', 'Mise a jour des taux...');
    refreshBtn.disabled = true;

    const result = await fetchRatesPerUSD();
    ratesPerUSD = result.rates;

    if (result.ok) {
        setStatus(statusEl, 'ok', 'Taux live actifs');
        setUpdatedAtLabel(updatedAtEl, new Date(), false);
    } else {
        setStatus(statusEl, 'error', 'API indisponible: taux de secours actifs');
        setUpdatedAtLabel(updatedAtEl, new Date(), true);
        console.error('Impossible de recuperer les taux live:', result.error);
    }

    refreshBtn.disabled = false;
}

bindFieldEvents(fields, handleInput);
refreshBtn.addEventListener('click', refreshRates);

refreshRates();
setInterval(refreshRates, REFRESH_INTERVAL_MS);
