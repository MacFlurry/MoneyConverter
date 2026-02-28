# MoneyConverter

Application web statique de conversion de devises (CDF, XAF, EUR, USD) avec taux live et fallback local.

## Structure

- `convert.html` : shell HTML (vue + points d'ancrage DOM)
- `src/styles/main.css` : styles UI
- `src/fonts/` : polices locales self-hosted (WOFF2)
- `src/js/config.js` : constantes (API, timeout, devises supportees)
- `src/js/formatters.js` : parsing/formatage des nombres et dates
- `src/js/converter.js` : logique pure de conversion
- `src/js/rates-service.js` : recuperation des taux avec fallback
- `src/js/ui.js` : helpers UI (statut, label date, events)
- `src/js/main.js` : orchestration modulaire (source)
- `src/js/app.bundle.js` : script autonome charge par `convert.html` (compatibilite ouverture locale)
- `scripts/build.mjs` : build JS et preparation d'artefact deployable
- `tests/*.test.mjs` : tests TDD (logique + chargement HTML + securite/build)
- `package.json` : scripts npm

## Usage

1. Ouvrir `convert.html` dans un navigateur moderne.
2. Entrer un montant dans une devise pour obtenir la conversion des autres.
3. Cliquer sur `Rafraichir les taux` pour forcer une mise a jour.

## Tests

- Lancer `npm test`.

## Build

- Generer le bundle navigateur (dev): `npm run build`
- Mode watch (dev): `npm run build:watch`
- Build production (artefact deployable): `npm run build:prod`

Le fichier `src/js/app.bundle.js` est genere depuis `src/js/main.js` via `scripts/build.mjs`.

Le build production genere un dossier `dist/` autonome:

- `dist/convert.html`
- `dist/src/js/app.bundle.js` (minifie)
- `dist/src/styles/`
- `dist/src/fonts/`

## Workflow de deploiement

1. Lancer `npm run build:prod`.
2. Publier uniquement le dossier `dist/`.
3. Ne jamais exposer `scripts/`, `tests/` ou les sources modulaires `src/js/*.js` (hors bundle final).

## Polices locales

Le projet n'utilise plus Google Fonts en runtime. Les references CSS pointent vers `src/fonts/`.

Fichiers attendus:

- `src/fonts/Manrope-400.woff2`
- `src/fonts/Manrope-600.woff2`
- `src/fonts/Manrope-700.woff2`
- `src/fonts/Manrope-800.woff2`

Les fichiers actuellement presents servent de placeholders techniques. Remplace-les par les binaires Manrope reelles avant publication.

## Headers de securite (infra)

Recommandes cote serveur/CDN:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (legacy)
- CSP avec `frame-ancestors 'none'` (prioritaire contre clickjacking)

### Exemples de configuration

Netlify (`_headers`):

```txt
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
```

Vercel (`vercel.json`):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

Nginx:

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
```
