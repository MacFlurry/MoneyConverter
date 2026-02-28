# MoneyConverter

Application web statique de conversion de devises (CDF, XAF, EUR, USD) avec taux live et fallback local.

## Structure

- `convert.html` : shell HTML (vue + points d'ancrage DOM)
- `src/styles/main.css` : styles UI
- `src/js/config.js` : constantes (API, timeout, devises supportees)
- `src/js/formatters.js` : parsing/formatage des nombres et dates
- `src/js/converter.js` : logique pure de conversion
- `src/js/rates-service.js` : recuperation des taux avec fallback
- `src/js/ui.js` : helpers UI (statut, label date, events)
- `src/js/main.js` : orchestration modulaire (source)
- `src/js/app.bundle.js` : script autonome charge par `convert.html` (compatibilite ouverture locale)
- `tests/*.test.mjs` : tests TDD (logique + chargement HTML)
- `package.json` : config projet et script de test

## Usage

1. Ouvrir `convert.html` dans un navigateur moderne.
2. Entrer un montant dans une devise pour obtenir la conversion des autres.
3. Cliquer sur `Rafraichir les taux` pour forcer une mise a jour.

## Tests

- Lancer `npm test`.

## Evolution recommandees

- Introduire un bundler (Vite) si l'application grossit.
- Ajouter une couche de persistence (cache local des derniers taux).
