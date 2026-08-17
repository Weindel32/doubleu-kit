# doubleu-kit

App single-page (tutto in `index.html`, JS/CSS inline) per costruire kit e calcolare
prezzi/margini. `sw.js` è il service worker PWA.

## Convenzione: bump della versione a ogni modifica

Ogni volta che si modifica `index.html` (feature, fix, refactor — qualunque cambio
visibile all'utente), aggiornare la versione di build in **entrambi** i punti:

1. `index.html` — stringa mostrata in UI: `<span id="buildTxt">build vNN</span>`
2. `index.html` — costante JS: `const BUILD = "vNN";`
3. `sw.js` — nome cache del service worker: `const CACHE = "doubleu-kit-vNN";`
   (cambiare questo nome è ciò che invalida la cache vecchia lato client)

Incrementare NN di 1 rispetto alla versione precedente. Non modificare la versione
per cambi che non toccano `index.html`/`sw.js` (es. solo README).
