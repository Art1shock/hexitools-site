# HexiTools website

Public static pages for HexiTools applications, hosted on GitHub Pages.

## HexiSweep privacy policy

https://art1shock.github.io/hexitools-site/hexisweep/privacy/

The `hexisweep/privacy/` folder contains the responsive privacy policy in English,
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

## HexiSweep data deletion instructions

`hexisweep/delete-data/` contains a six-language instruction page with an explicit
email request link. It uses only GitHub Pages and the existing developer mailbox,
as requested by the owner. It is not a web submission form. No captcha provider,
server, new credentials or third-party form processor is connected.

See [setup, limitations and request handling](docs/data-deletion.md).
Publication of this new page requires owner approval of the email-only approach.
GitHub Pages publishes `main` from the repository root; `.nojekyll` keeps the
site as plain static files.

The former `/hexisweep/` URL redirects to `/hexisweep/privacy/`, preserving language query parameters and section fragments. Brand images come from the supplied HexiTools developer banner and `hexi_onboarding_team.png`. External document links open in a new tab.
