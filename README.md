# forkify

Applicazione web per la ricerca di ricette, costruita in JavaScript vanilla con architettura MVC e bundling con Parcel.

### [Demo live →](https://antoniods1-forkify.netlify.app/)

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e)
![Sass](https://img.shields.io/badge/Sass-SCSS-cc6699)
![Parcel](https://img.shields.io/badge/Parcel-2-e5a663)
![Netlify](https://img.shields.io/badge/deploy-Netlify-00c7b7)

---

## Panoramica

Forkify permette di cercare tra oltre un milione di ricette, consultarne gli ingredienti e le istruzioni, adattare le quantità al numero di porzioni, salvare i preferiti e caricare ricette personali.

Il progetto nasce dal corso *The Complete JavaScript Course* di Jonas Schmedtmann ed è stato riscritto da zero, con alcune funzionalità aggiuntive rispetto alla versione originale.

## Funzionalità

- **Ricerca** di ricette per ingrediente o nome, con risultati paginati
- **Paginazione a indici numerici**, navigabile direttamente e non solo con avanti/indietro
- **Ordinamento** dei risultati di ricerca
- **Dettaglio ricetta** con ingredienti, tempo di preparazione e link alle istruzioni originali
- **Scalatura delle porzioni**: le quantità degli ingredienti si ricalcolano in tempo reale
- **Bookmark** persistenti tra le sessioni tramite `localStorage`
- **Caricamento di ricette personali**, con form a ingredienti dinamici (aggiunta e rimozione delle righe)
- Le ricette caricate dall'utente sono visibili solo a chi possiede la relativa API key

## Architettura MVC

L'applicazione segue il pattern **Model–View–Controller** con un'implementazione del **publisher–subscriber** per la gestione degli eventi. L'obiettivo è mantenere una separazione netta: il Model non conosce il DOM, le View non conoscono la logica di business, e il Controller è l'unico punto in cui i due mondi si incontrano.

```
                    ┌─────────────────────────────┐
                    │        controller.js        │
                    │                             │
                    │   orchestra il flusso,      │
                    │   non contiene stato né     │
                    │   manipolazione del DOM     │
                    └──────┬───────────────▲──────┘
                           │               │
              chiama       │               │   notifica
              metodi       │               │   (callback)
                           ▼               │
        ┌──────────────────────┐   ┌───────┴────────────────┐
        │       model.js       │   │        views/          │
        │                      │   │                        │
        │  stato applicativo   │   │  rendering del DOM     │
        │  chiamate all'API    │   │  ascolto degli eventi  │
        │  localStorage        │   │  nessuna logica di     │
        │                      │   │  business              │
        └──────────┬───────────┘   └────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │      helpers.js      │
        │   fetch, timeout     │
        └──────────────────────┘
```

### Il flusso di un'interazione

Prendendo come esempio il caricamento di una ricetta:

1. La View intercetta l'evento del DOM (il cambio di `hash` nell'URL) e invoca la callback che il Controller le ha passato in fase di inizializzazione.
2. Il Controller chiede al Model di caricare i dati.
3. Il Model esegue la chiamata HTTP tramite `helpers.js`, normalizza la risposta e aggiorna il proprio oggetto `state`.
4. Il Controller legge lo stato aggiornato e lo passa alla View.
5. La View genera il markup e lo inserisce nella pagina.

Il punto chiave è il **passaggio 1**: la View non chiama direttamente il Controller, riceve una funzione da eseguire. Questo tiene il flusso delle dipendenze in una sola direzione — è il Controller a dipendere dalle View, mai il contrario.

### Il Model

`model.js` espone un unico oggetto `state` che contiene la ricetta corrente, i risultati di ricerca, la pagina attiva e i bookmark. Tutte le funzioni che modificano lo stato vivono qui, insieme alla persistenza su `localStorage` e alla comunicazione con l'API.

Il Model è completamente agnostico rispetto all'interfaccia: potrebbe essere riutilizzato in un'app React o in un contesto Node senza modifiche.

### Le View

Ogni porzione dell'interfaccia ha la propria View. Tutte ereditano da una classe base `View.js`, che centralizza il comportamento comune:

- `render(data)` — genera e inserisce il markup
- `update(data)` — confronta il DOM esistente con il nuovo markup e aggiorna solo i nodi effettivamente cambiati, invece di ridisegnare tutto (usato ad esempio per il ricalcolo delle porzioni)
- `renderSpinner()`, `renderError()`, `renderMessage()` — stati di caricamento ed errore

Le sottoclassi implementano solo `_generateMarkup()` e i propri handler. Questo è il punto in cui il pattern paga di più: aggiungere una nuova View significa scrivere un metodo, non riscrivere il rendering.

### Il Controller

`controller.js` non contiene stato né codice che tocchi il DOM. La funzione `init()` in fondo al file registra tutti gli handler sulle rispettive View: leggendo quelle poche righe si ottiene la mappa completa delle interazioni possibili nell'applicazione.

## Struttura del progetto

```
js-forkify/
├── src/
│   ├── js/
│   │   ├── controller.js         # orchestrazione, registrazione degli handler
│   │   ├── model.js              # stato, API, localStorage
│   │   ├── helpers.js            # utility di fetch con timeout
│   │   ├── config.js             # costanti (URL API, key, paginazione)
│   │   └── views/
│   │       ├── View.js           # classe base con render/update/spinner
│   │       ├── recipeView.js     # dettaglio della ricetta
│   │       ├── searchView.js     # campo di ricerca
│   │       ├── resultsView.js    # lista dei risultati
│   │       ├── previewView.js    # singola anteprima (condivisa)
│   │       ├── paginationView.js # navigazione tra le pagine
│   │       ├── bookmarksView.js  # elenco dei preferiti
│   │       └── addRecipeView.js  # modale di caricamento ricetta
│   ├── sass/                     # fogli di stile SCSS
│   └── img/                      # logo, favicon, sprite delle icone
├── index.html
├── package.json
├── .parcelrc                     # configurazione del bundler
├── svgo.config.json              # configurazione dell'ottimizzatore SVG
└── .prettierrc
```

`previewView.js` è condivisa tra `resultsView` e `bookmarksView`: entrambe mostrano lo stesso tipo di card, quindi il markup della singola anteprima vive in un solo posto.

## Stack

| Ambito | Tecnologia |
|---|---|
| Linguaggio | JavaScript ES6+ (moduli, classi, async/await) |
| Stili | Sass (SCSS) |
| Build | Parcel 2 |
| Dati | [forkify API v2](https://forkify-api.jonas.io/) |
| Persistenza | localStorage |
| Hosting | Netlify |

## Avvio in locale

```bash
git clone https://github.com/AntonioDS1/js-forkify.git
cd js-forkify
npm install
npm start
```

L'applicazione sarà disponibile su `http://localhost:1234`.

Per generare il build di produzione:

```bash
npm run build
```

## Note tecniche

**Ottimizzazione degli SVG.** Le icone sono uno sprite unico referenziato via `<use href="icons.svg#icon-nome">`. In fase di build, SVGO rimuove di default gli `id` che non risultano referenziati all'interno dello stesso file, rompendo i riferimenti esterni. Il `svgo.config.json` disattiva questo comportamento.

**API key.** Trattandosi di un'applicazione interamente client-side, la key finisce nel bundle scaricato dal browser: non è un segreto e non può esserlo. Quella di forkify è gratuita e non dà accesso a dati sensibili. In un progetto con credenziali reali la chiamata andrebbe fatta transitare da una funzione serverless.

## Crediti

Progetto didattico basato su [The Complete JavaScript Course](https://www.udemy.com/course/the-complete-javascript-course/) di **Jonas Schmedtmann**, autore del design originale e dell'API. Realizzato a scopo di apprendimento e portfolio.
