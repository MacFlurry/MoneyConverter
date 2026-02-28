(() => {
    const FALLBACK_RATES_PER_USD = {
        USD: 1,
        EUR: 0.92,
        XAF: 600,
        CDF: 2270
    };

    const SUPPORTED_CURRENCIES = ['CDF', 'XAF', 'EUR', 'USD'];
    const REFRESH_INTERVAL_MS = 15 * 60 * 1000;
    const REQUEST_TIMEOUT_MS = 7000;
    const API_URL = 'https://open.er-api.com/v6/latest/USD';

    const numberFormatter = new Intl.NumberFormat('fr-FR', {
        useGrouping: true,
        maximumFractionDigits: 4
    });

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

    function parseLocaleNumber(text) {
        const normalized = text.replace(/\s/g, '').replace(',', '.');
        const value = Number.parseFloat(normalized);
        return Number.isFinite(value) ? value : NaN;
    }

    function formatNumber(value) {
        if (!Number.isFinite(value)) return '';
        const rounded = Math.round((value + Number.EPSILON) * 10000) / 10000;
        return numberFormatter.format(rounded);
    }

    function formatUpdatedAt(date) {
        return new Intl.DateTimeFormat('fr-FR', {
            dateStyle: 'short',
            timeStyle: 'medium'
        }).format(date);
    }

    function toUSD(amount, sourceCurrency) {
        if (sourceCurrency === 'USD') return amount;
        return amount / ratesPerUSD[sourceCurrency];
    }

    function fromUSD(usd) {
        return {
            USD: usd,
            EUR: usd * ratesPerUSD.EUR,
            XAF: usd * ratesPerUSD.XAF,
            CDF: usd * ratesPerUSD.CDF
        };
    }

    function setStatus(type, text) {
        statusEl.className = `status ${type}`;
        statusEl.textContent = text;
    }

    function setUpdatedAtLabel(date, fallbackUsed = false) {
        const when = formatUpdatedAt(date);
        updatedAtEl.textContent = fallbackUsed
            ? `Dernière mise à jour locale: ${when}`
            : `Dernière mise à jour live: ${when}`;
    }

    function clearOtherFields(sourceCurrency) {
        SUPPORTED_CURRENCIES.forEach((currency) => {
            if (currency !== sourceCurrency) {
                fields[currency].value = '';
            }
        });
    }

    function handleInput(sourceCurrency) {
        if (isUpdating) return;

        const raw = fields[sourceCurrency].value.trim();
        if (raw === '') {
            isUpdating = true;
            clearOtherFields(sourceCurrency);
            isUpdating = false;
            return;
        }

        const amount = parseLocaleNumber(raw);
        if (Number.isNaN(amount)) return;

        const usd = toUSD(amount, sourceCurrency);
        const converted = fromUSD(usd);

        isUpdating = true;
        SUPPORTED_CURRENCIES.forEach((currency) => {
            if (currency !== sourceCurrency) {
                fields[currency].value = formatNumber(converted[currency]);
            }
        });
        isUpdating = false;
    }

    async function fetchRatesPerUSD() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const response = await fetch(API_URL, { signal: controller.signal });

            if (!response.ok) {
                throw new Error(`Erreur HTTP ${response.status}`);
            }

            const data = await response.json();
            const apiRates = data && data.rates ? data.rates : {};
            const required = ['EUR', 'XAF', 'CDF'];
            const hasAllRates = required.every(
                (code) => Number.isFinite(apiRates[code]) && apiRates[code] > 0
            );

            if (!hasAllRates) {
                throw new Error("Taux incomplets recus depuis l'API");
            }

            return {
                ok: true,
                rates: {
                    USD: 1,
                    EUR: apiRates.EUR,
                    XAF: apiRates.XAF,
                    CDF: apiRates.CDF
                }
            };
        } catch (error) {
            return {
                ok: false,
                rates: { ...FALLBACK_RATES_PER_USD },
                error
            };
        } finally {
            clearTimeout(timeout);
        }
    }

    async function refreshRates() {
        setStatus('loading', 'Mise à jour des taux...');
        refreshBtn.disabled = true;

        const result = await fetchRatesPerUSD();
        ratesPerUSD = result.rates;

        if (result.ok) {
            setStatus('ok', 'Taux live actifs');
            setUpdatedAtLabel(new Date(), false);
        } else {
            setStatus('error', 'API indisponible: taux de secours actifs');
            setUpdatedAtLabel(new Date(), true);
            console.error('Impossible de recuperer les taux live:', result.error);
        }

        refreshBtn.disabled = false;
    }

    SUPPORTED_CURRENCIES.forEach((currency) => {
        fields[currency].addEventListener('input', () => handleInput(currency));
        fields[currency].addEventListener('focus', () => fields[currency].select());
    });

    refreshBtn.addEventListener('click', refreshRates);

    refreshRates();
    setInterval(refreshRates, REFRESH_INTERVAL_MS);
})();
