import {
    API_URL,
    FALLBACK_RATES_PER_USD,
    REQUEST_TIMEOUT_MS
} from './config.js';

export async function fetchRatesPerUSD() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(API_URL, {
            signal: controller.signal
        });

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
