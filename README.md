# HexiTools website

Public static pages for HexiTools applications, hosted on GitHub Pages.

## HexiSweep privacy policy

https://art1shock.github.io/hexitools-site/hexisweep/

The `hexisweep/` folder contains the responsive privacy policy in English,
Russian, Spanish, German, French, and Brazilian Portuguese. The text is from
the developer-supplied policy dated October 18, 2026.

The page selects the first supported browser language, defaults to English,
supports explicit `?lang=en` / `?lang=ru` / `?lang=es` / `?lang=de` /
`?lang=fr` / `?lang=pt-BR` links, and remembers a manual choice locally.
Portuguese browser locales use the supplied Brazilian Portuguese translation.

No build step, analytics, external fonts, third-party scripts, or cookies.
The only browser storage is the explicitly selected language preference.
English remains readable without JavaScript, with a link to all six original
translations in plain text. All six policy translations are present in the HTML.

Serve the repository root with any static web server for local preview.
GitHub Pages publishes `main` from the repository root; `.nojekyll` keeps the
site as plain static files.
