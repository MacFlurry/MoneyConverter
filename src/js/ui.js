import { formatUpdatedAt } from './formatters.js';

export function setStatus(statusEl, type, text) {
    statusEl.className = `status ${type}`;
    statusEl.textContent = text;
}

export function setUpdatedAtLabel(updatedAtEl, date, fallbackUsed = false) {
    const when = formatUpdatedAt(date);
    updatedAtEl.textContent = fallbackUsed
        ? `Derniere mise a jour locale: ${when}`
        : `Derniere mise a jour live: ${when}`;
}

export function clearOtherFields(fields, sourceCurrency) {
    Object.keys(fields).forEach((currency) => {
        if (currency !== sourceCurrency) {
            fields[currency].value = '';
        }
    });
}

export function setFieldValidity(field, isInvalid) {
    if (isInvalid) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
        return;
    }

    field.classList.remove('invalid');
    field.removeAttribute('aria-invalid');
}

export function bindFieldEvents(fields, onInput) {
    Object.keys(fields).forEach((currency) => {
        fields[currency].addEventListener('input', () => onInput(currency));
        fields[currency].addEventListener('focus', () => fields[currency].select());
    });
}
