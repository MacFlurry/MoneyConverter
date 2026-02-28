export function toUSD(amount, sourceCurrency, ratesPerUSD) {
    if (sourceCurrency === 'USD') return amount;
    return amount / ratesPerUSD[sourceCurrency];
}

export function fromUSD(usd, ratesPerUSD) {
    return {
        USD: usd,
        EUR: usd * ratesPerUSD.EUR,
        XAF: usd * ratesPerUSD.XAF,
        CDF: usd * ratesPerUSD.CDF
    };
}
