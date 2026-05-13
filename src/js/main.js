import { createMoneyConverterApp } from './app-controller.js';
import { fetchRatesPerUSD } from './rates-service.js';

const fields = {
    CDF: document.getElementById('cdf'),
    XAF: document.getElementById('xaf'),
    EUR: document.getElementById('eur'),
    USD: document.getElementById('usd')
};

const statusEl = document.getElementById('status');
const updatedAtEl = document.getElementById('updatedAt');
const refreshBtn = document.getElementById('refreshBtn');

createMoneyConverterApp({
    fields,
    statusEl,
    updatedAtEl,
    refreshBtn,
    fetchRates: fetchRatesPerUSD
}).start();
