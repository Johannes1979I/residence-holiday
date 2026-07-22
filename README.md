# residence-holiday

Mini-sito per le feste in piscina del **Residence Holiday** di Montalto di Castro:
informazioni sull'evento, menù, prenotazione guidata con voucher stampabile e QR code,
locandina A4 da affiggere, pannello di modifica per l'amministrazione.

Sito pubblico: <https://johannes1979i.github.io/residence-holiday/>
Guida per l'uso quotidiano: [GUIDA.md](GUIDA.md)

## Caratteristiche tecniche

- **Sito statico puro.** HTML, CSS e JavaScript vanilla. Nessun build step, nessun
  framework, nessun package manager.
- **Zero dipendenze esterne.** Nessun CDN, nessun font remoto, nessuna chiamata di rete
  verso domini terzi. Dopo il primo caricamento funziona anche offline.
- **Encoder QR scritto nel progetto** (`qr.js`), conforme a ISO/IEC 18004: byte mode UTF-8,
  livelli L/M/Q/H, versioni 1–40, Reed–Solomon su GF(256), tutte e 8 le maschere.
- I contenuti vivono in un solo file JSON, modificabile da interfaccia.

## Struttura

```
index.html                    sito pubblico + prenotazione passo-passo + voucher
locandina.html                locandina A4 stampabile con QR code
admin.html                    pannello di modifica (gate password + push su GitHub)
qr.js                         libreria QR code (window.QR)
contenuti.json                tutti i contenuti del sito
images/                       foto della piscina
.github/workflows/telegram.yml  avviso automatico al gruppo Telegram
.nojekyll                     disattiva Jekyll su GitHub Pages
```

### API di `qr.js`

```js
QR.matrix(testo, ecc)        // -> array 2D di booleani (true = modulo scuro)
QR.svg(testo, opzioni)       // -> stringa SVG; {ecc, margin, size, dark, light}
QR.draw(canvas, testo, opz)  // disegna su un <canvas>
QR._selfTest()               // -> true se i controlli interni passano
```

`matrix` e `svg` non usano il DOM.

## Schema di `contenuti.json`

```jsonc
{
  "versione": 2,
  "residence":   { "nome", "localita", "emoji" },
  "tema":        { "titoloFesta", "sottotitolo", "nomeTema",
                   "colorePrimario", "coloreSecondario", "coloreAccento" },
  "evento":      { "data" /* ISO AAAA-MM-GG */, "orario", "orarioFine",
                   "luogo", "descrizione", "dressCode", "postiTotali" },
  "menu": {
    "descrizione", "avviso",
    "copertoPersona",      // quota fissa a persona, sommata al totale (es. bagnina)
    "copertoEtichetta",    // come si chiama nel sito e nel voucher
    "copertoEmoji",
    "copertoNota",         // spiegazione estesa mostrata nella sezione menù
    "categorie": [
      { "id", "nome", "emoji",
        "tipo": "cibo" | "bevanda",   // decide in quale passo compare
        "voci": [ { "nome", "descrizione", "prezzo" } ] }
    ]
  },
  "pagamento":   { "attivo", "titolo", "referente", "scadenza",
                   "orari", "istruzioni", "nota" },
  "prenotazione":{ "whatsappNumero" /* con prefisso, es. 39... */, "messaggioBase",
                   "scadenza", "chiediAppartamento", "prefissoCodice" },
  "regolamento": [ "riga", "riga" ],
  "foto":        [ "images/..." ],      // la prima e' lo sfondo dell'hero
  "condivisione":{ "urlSito", "linkGruppoTelegram", "linkGruppoWhatsApp" },
  "contatti":    { "organizzatore", "telefono", "email" },
  "locandina":   { "claim", "istruzioniQr", "nota" }
}
```

Il totale di una prenotazione è:
`somma(prezzo × quantità)` + `copertoPersona × (adulti + bambini)`.

Il codice prenotazione ha forma `{prefissoCodice}-{GGMM}-{4 caratteri}`, con un alfabeto
privo di caratteri ambigui (niente `0`/`O`, niente `1`/`I`).

## Provare in locale

Serve un server HTTP: le pagine leggono `contenuti.json` con `fetch`, che con `file://`
viene bloccata dal browser.

```bash
cd residence-holiday && python3 -m http.server 8100
```

Poi apri <http://localhost:8100/>.

## Pubblicazione

Il sito è servito da GitHub Pages sul branch `main`, cartella root. Ogni push aggiorna il
sito in circa un minuto. Il pulsante «Pubblica online» dell'admin scrive `contenuti.json`
via API GitHub usando un token fine-grained che resta nel browser dell'amministratore.

## Nota sulle foto

Le immagini pubblicate sono state scelte e ritagliate per non mostrare persone
riconoscibili: il sito è pubblico e le foto originali `piscina-1.jpg` e `piscina-2.jpg`
ritraggono condomini e minori. Restano nel repository come archivio ma non sono
referenziate in `contenuti.json`.
