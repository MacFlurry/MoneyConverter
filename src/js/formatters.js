const numberFormatter = new Intl.NumberFormat('fr-FR', {
    useGrouping: true,
    maximumFractionDigits: 4
});

export function parseLocaleNumber(text) {
    const normalized = text.replace(/\s/g, '').replace(',', '.');
    const value = Number.parseFloat(normalized);
    return Number.isFinite(value) ? value : NaN;
}

export function formatNumber(value) {
    if (!Number.isFinite(value)) return '';
    const rounded = Math.round((value + Number.EPSILON) * 10000) / 10000;
    return numberFormatter.format(rounded);
}

export function formatUpdatedAt(date) {
    return new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'short',
        timeStyle: 'medium'
    }).format(date);
}
