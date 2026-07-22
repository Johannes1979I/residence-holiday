# 🌴 Festa in piscina — Residence Holiday

Guida per usare e aggiornare il sito. Non serve saper programmare: si fa tutto da una
pagina web, cliccando.

**Il sito che vedono i condomini**
👉 https://johannes1979i.github.io/residence-holiday/

**La tua pagina per modificare tutto**
👉 https://johannes1979i.github.io/residence-holiday/admin.html — password: `holiday2026`

**La locandina da stampare**
👉 https://johannes1979i.github.io/residence-holiday/locandina.html

---

## 1. Che cosa c'è nel sito

| File | A che serve |
|---|---|
| `index.html` | Il sito pubblico: foto, conto alla rovescia, menù, regolamento e la prenotazione passo-passo |
| `locandina.html` | La locandina A4 con il QR code, da stampare e affiggere all'ingresso della piscina |
| `admin.html` | La tua pagina riservata per cambiare date, menù, prezzi, foto, testi |
| `contenuti.json` | Il file dove sono scritti tutti i contenuti. È quello che si aggiorna quando salvi dall'admin |
| `qr.js` | Il programmino che disegna i QR code (del voucher e della locandina) |
| `images/` | Le foto della piscina |

Non c'è nessun database e nessun costo: è un sito statico ospitato gratis da GitHub Pages.

---

## 2. Come prenota un condomino

Dal sito, sezione **«Prenota il tuo posto»**, in tre passaggi:

1. **I tuoi dati** — nome e cognome, cellulare, appartamento e quante persone siete
   (adulti e bambini, con i pulsanti + e −).
2. **Le pizze** — sceglie quante pizze vuole di ogni tipo. Il totale si aggiorna da solo.
   Se sceglie meno pizze che partecipanti, compare un avviso gentile, ma può proseguire.
3. **Riepilogo** — vede tutto quello che ha ordinato, il totale, può aggiungere una nota
   (allergie, intolleranze, richieste) e deve spuntare una casella per confermare.

> Bevande e dolce non si prenotano: se li rimetti nel menù dall'admin (una categoria di
> tipo *Bevanda*), il percorso torna automaticamente a quattro passaggi.

Poi il sito genera il **voucher**, che contiene:

- un **codice prenotazione** (per esempio `RH-0808-K7QA`),
- un **QR code** con il riepilogo,
- nome, telefono, appartamento, numero di partecipanti,
- l'elenco preciso dell'ordine e il **totale da pagare**,
- data, ora e luogo della festa,
- il riquadro con **a chi e entro quando consegnare i soldi**.

Il condomino ha tre pulsanti: **stampare il voucher**, **inviartelo su WhatsApp**,
**inviarlo su Telegram**. Il messaggio è già scritto: deve solo premere invio.

> La prenotazione resta salvata nel suo telefono: se riapre il sito ritrova il suo voucher
> con il pulsante «Rivedi il voucher».

### La sera della festa
All'ingresso fatti mostrare il voucher (stampato o sul telefono) e controlla il **codice**
e il **nome**. Se hai un elenco delle prenotazioni ricevute su WhatsApp, ti basta spuntare
il codice corrispondente.

---

## 3. Tenere sotto controllo le prenotazioni

Nell'admin, in cima, c'è la scheda **📒 Prenotazioni ricevute**: è il quadro completo
della serata.

In alto cinque numeri, sempre aggiornati: quante prenotazioni sono arrivate, quanti
partecipanti, quante pizze in tutto, quanto hai **incassato** e quanto ti resta **da
incassare**.

### Registrare una prenotazione
Quando ti arriva il messaggio su WhatsApp o Telegram:

1. Tienilo premuto e scegli **Copia**.
2. Nell'admin incollalo nel riquadro grande e premi **📥 Leggi il messaggio e aggiungi**.

Nome, telefono, appartamento, partecipanti, ordine, quota e totale vengono letti da soli.
Se qualcuno ti prenota a voce, usa **✍️ Aggiungi a mano**: scrivi il nome e l'ordine
(una riga per pizza, es. `2 x Margherita`) e i prezzi li mette lui dal menù.

Se incolli due volte lo stesso messaggio non si duplica: il codice viene riconosciuto.

### Segnare chi ha pagato
Sotto ogni prenotazione c'è **✅ Segna pagato**. La riga diventa verde e i totali
«incassato» e «da incassare» si aggiornano. Con la spunta **Solo chi non ha ancora
pagato** vedi al volo chi devi ancora sollecitare, e con **💬 Scrivi su WhatsApp** gli
mandi un messaggio già pronto con il suo codice e l'importo.

### Ordinare alla pizzeria
In fondo alla scheda c'è **🍕 Ordine complessivo per la pizzeria**: la somma di tutte le
pizze prenotate, tipo per tipo. Premi **📋 Copia l'ordine** e incollalo nel messaggio a
Oasi. Niente conti a mano.

### La sera della festa
Premi **🖨️ Stampa la lista per l'ingresso**: esce un foglio A4 con tutti i nomi in ordine
alfabetico, il codice, quante persone, quante pizze, il totale e una casella da spuntare.
Chi arriva ti mostra il voucher, tu spunti la casella.

### Backup — importante
Le prenotazioni restano **solo nel browser che stai usando**: nomi e numeri di telefono
dei condomini non vengono pubblicati online, perché il sito è pubblico e li leggerebbe
chiunque. Questo però vuol dire che se cancelli i dati del browser le perdi.

Ogni tanto premi **💾 Backup (file JSON)** e conserva il file. Serve anche per passare
l'elenco a un altro organizzatore: lui apre l'admin, preme **📂 Ripristina un backup** e
si ritrova tutto. Con **📊 Esporta per Excel (CSV)** invece apri l'elenco in un foglio di
calcolo.

---

## 4. Come cambiare i contenuti del sito

1. Apri **`.../admin.html`** e inserisci la password.
2. In alto ci sono i collegamenti alle varie sezioni: Residence, Tema, Evento, Menù,
   Pagamento, Prenotazione, Regolamento, Foto, Condivisione, Contatti, Locandina.
3. Modifica quello che ti serve. Sotto ogni campo c'è una spiegazione.
4. Quando hai finito premi **🚀 Pubblica online**: dopo circa un minuto il sito è aggiornato.

Se non hai ancora collegato GitHub (punto 5), usa **💾 Scarica file**: scarica il file
`contenuti.json` aggiornato, che poi carichi a mano su GitHub al posto del vecchio.

### Cose che vorrai cambiare più spesso
- **Data e ora della festa** → sezione *Evento*
- **Prezzi delle pizze** → sezione *Menù* (ogni voce ha nome, descrizione e prezzo)
- **Quota per la bagnina** → sezione *Menù*, campo «Quota a persona»: è quella che viene
  sommata automaticamente al totale di ogni prenotazione, moltiplicata per il numero
  di partecipanti
- **Entro quando pagare e a chi** → sezione *Pagamento*
- **Testi della locandina** → sezione *Locandina*

---

## 5. Collegare GitHub per il pulsante «Pubblica online»

Serve una volta sola e ti fa risparmiare un sacco di passaggi.

1. Su GitHub vai su **Settings** del tuo account (non del repository) → in fondo a sinistra
   **Developer settings**.
2. **Personal access tokens → Fine-grained tokens → Generate new token**.
3. Dai un nome (es. «sito festa»), scegli una scadenza.
   In **Repository access** scegli *Only select repositories* → `residence-holiday`.
4. In **Permissions → Repository permissions → Contents** metti **Read and write**.
5. Genera e **copia il token** (inizia con `github_pat_...`): lo vedi una volta sola.
6. Nell'admin apri in fondo **«Collegamento a GitHub»** e incolla utente, nome del
   repository, branch `main` e il token. Salva.

Il token resta **solo dentro il tuo browser**, su questo computer: non finisce online e
nessun altro può vederlo.

---

## 6. La locandina da affiggere

1. Apri **`.../locandina.html`**.
2. Premi **🖨️ Stampa / Salva PDF**.
3. Nelle impostazioni di stampa scegli: **A4 verticale**, **margini: nessuno**
   (oppure «Dimensioni reali / 100%») e attiva **«Grafica di sfondo»** o
   **«Stampa colori e immagini di sfondo»**, altrimenti esce tutta bianca.
4. Appendila all'ingresso della piscina.

La locandina si aggiorna da sola quando cambi i contenuti nell'admin: se sposti la data,
ristampala e basta. Il **QR code** porta direttamente al sito delle prenotazioni: chi passa
lo inquadra con la fotocamera del telefono e prenota in un minuto.

---

## 7. Avviso automatico sul gruppo Telegram

Ogni volta che aggiorni i contenuti, un messaggio può partire da solo nel gruppo.

1. Su Telegram cerca **@BotFather**, scrivi `/newbot` e segui le istruzioni.
   Alla fine ricevi un **token** del bot: copialo.
2. Apri il tuo **gruppo Telegram** e **aggiungi il bot** ai membri, dandogli il permesso
   di scrivere.
3. Per sapere l'**id del gruppo**: aggiungi temporaneamente al gruppo il bot
   **@RawDataBot** (o **@getidsbot**) e leggi il numero `id` del gruppo — inizia con
   `-100...`. Poi puoi rimuoverlo.
4. Su GitHub, nel repository `residence-holiday`:
   **Settings → Secrets and variables → Actions → New repository secret**.
   Crea due segreti:
   - `TELEGRAM_BOT_TOKEN` = il token del bot
   - `TELEGRAM_CHAT_ID` = l'id del gruppo (es. `-1001234567890`)

Fatto. Da quel momento ogni «Pubblica online» manda l'avviso al gruppo. Puoi anche
inviarlo a mano da **Actions → «Avviso Telegram festa» → Run workflow**.

> Finché non metti i due segreti non succede nulla di male: il sistema si accorge che
> mancano e non invia niente, senza dare errori.

### E su WhatsApp?
L'invio **automatico** su WhatsApp non è gratuito (serve la WhatsApp Business API).
Per un gruppo di condomini conviene il pulsante **«Passa parola → WhatsApp»** in fondo al
sito: apre il messaggio già pronto, lo mandi al gruppo con un tocco.

---

## 8. Cambiare la password dell'admin

Apri `admin.html`, cerca all'inizio della parte `<script>` la riga:

```js
const PASSWORD = "holiday2026";
```

e scrivi la tua password tra le virgolette. Salva il file su GitHub.

**Una precisazione onesta:** questa password tiene lontano il condomino curioso, ma chi se
ne intende può leggerla nel codice della pagina, perché il sito è pubblico. La vera
protezione è un'altra: **senza il tuo token GitHub nessuno può modificare il sito davvero**,
anche se entra nell'admin. Se vuoi più riservatezza, puoi tenere `admin.html` solo sul tuo
computer invece che online: dimmelo e lo sistemiamo.

---

## 9. Domande pratiche

**Un condomino non paga entro la scadenza.**
La prenotazione non è confermata: le pizze si ordinano in base a chi ha pagato. Il voucher
lo dice chiaramente, e nel riquadro «Come si paga» c'è scritto di avvisarti su WhatsApp se
non riesce in tempo. Puoi sempre spostare la scadenza dall'admin, sezione *Pagamento*.

**Qualcuno vuole cambiare l'ordine.**
Basta che rifaccia la prenotazione dal sito (pulsante «Nuova prenotazione») e ti mandi il
nuovo voucher: fa fede l'ultimo codice che ti arriva.

**Ha perso il voucher.**
Se riapre il sito dallo stesso telefono lo ritrova con «Rivedi il voucher». Altrimenti ce
l'hai tu nella chat WhatsApp.

**Piove.**
Decidi tu cosa fare e avvisa i condomini: puoi aggiungere una riga dall'admin, sezione
*Regolamento* (per esempio «in caso di maltempo la serata si sposta nell'area coperta
comune»), oppure cambiare la data dell'evento e ripubblicare. Il sito si aggiorna per
tutti in meno di un minuto, e se hai configurato il bot parte anche l'avviso su Telegram.

**Voglio rifare la festa il mese prossimo.**
Cambia data, tema e menù dall'admin e pubblica. Le prenotazioni vecchie salvate sui
telefoni dei condomini si azzerano da sole, perché il sito si accorge che la data è
cambiata. Ristampa la locandina e sei a posto.
