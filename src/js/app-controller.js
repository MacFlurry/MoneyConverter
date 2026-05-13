import {
    FALLBACK_RATES_PER_USD,
    REFRESH_INTERVAL_MS,
    SUPPORTED_CURRENCIES
} from './config.js';
import { parseLocaleNumber, formatNumber } from './formatters.js';
import { toUSD, fromUSD } from './converter.js';
import {
    setStatus,
    setUpdatedAtLabel,
    clearOtherFields,
    bindFieldEvents,
    setFieldValidity
} from './ui.js';

export function createMoneyConverterApp({
    fields,
    statusEl,
    updatedAtEl,
    refreshBtn,
    fetchRates,
    now = () => new Date(),
    setTimer = setInterval
}) {
    let ratesPerUSD = { ...FALLBACK_RATES_PER_USD };
    let isUpdating = false;
    let activeCurrency = null;

    function handleInput(sourceCurrency) {
        if (isUpdating) return;

        setFieldValidity(fields[sourceCurrency], false);

        const raw = fields[sourceCurrency].value.trim();
        if (raw === '') {
            activeCurrency = null;
            isUpdating = true;
            clearOtherFields(fields, sourceCurrency);
            SUPPORTED_CURRENCIES.forEach((currency) => {
                setFieldValidity(fields[currency], false);
            });
            isUpdating = false;
            return;
        }

        activeCurrency = sourceCurrency;
        const amount = parseLocaleNumber(raw);
        if (Number.isNaN(amount)) {
            setFieldValidity(fields[sourceCurrency], true);
            return;
        }

        const usd = toUSD(amount, sourceCurrency, ratesPerUSD);
        const converted = fromUSD(usd, ratesPerUSD);

        isUpdating = true;
        SUPPORTED_CURRENCIES.forEach((currency) => {
            if (currency === sourceCurrency) return;
            fields[currency].value = formatNumber(converted[currency]);
            setFieldValidity(fields[currency], false);
        });
        isUpdating = false;
    }

    async function refreshRates() {
        setStatus(statusEl, 'loading', 'Mise a jour des taux...');
        refreshBtn.disabled = true;

        const result = await fetchRates();
        ratesPerUSD = result.rates;

        if (result.ok) {
            setStatus(statusEl, 'ok', 'Taux live actifs');
            setUpdatedAtLabel(updatedAtEl, now(), false);
        } else {
            setStatus(statusEl, 'error', 'API indisponible: taux de secours actifs');
            setUpdatedAtLabel(updatedAtEl, now(), true);
            console.error('Impossible de recuperer les taux live:', result.error);
        }

        refreshBtn.disabled = false;

        if (activeCurrency) {
            handleInput(activeCurrency);
        }
    }

    function start() {
        bindFieldEvents(fields, handleInput);
        refreshBtn.addEventListener('click', refreshRates);
        refreshRates();
        setTimer(refreshRates, REFRESH_INTERVAL_MS);
    }

    return {
        handleInput,
        refreshRates,
        start
    };
}
