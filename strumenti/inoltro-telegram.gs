/* =========================================================================
   Inoltro Telegram per il sito della festa (Google Apps Script)

   Il sito NON conosce più il token del bot: manda il testo della prenotazione
   a questo script, che lo gira al bot. Token e chat stanno solo qui, nelle
   «Proprietà script» del progetto Apps Script (privato, sul tuo account Google):

     TELEGRAM_BOT_TOKEN   il token che ti dà @BotFather
     TELEGRAM_CHAT_ID     dove arrivano le prenotazioni (es. 1992022292)

   La chat è fissata qui: chi conosce l'indirizzo dell'inoltro può al massimo
   mandare messaggi a te, non usare il bot per altro. C'è anche un tetto di
   messaggi all'ora, per non farti riempire la chat.

   Messa in funzione (una volta sola):
   1. script.google.com → Nuovo progetto → incolla questo file al posto di Code.gs
   2. Impostazioni progetto (ingranaggio) → Proprietà script → aggiungi le due sopra
   3. Esegui la funzione «prova» e concedi l'autorizzazione: deve arrivarti un messaggio
   4. Esegui deployment → Nuovo deployment → tipo «App web»
        Esegui come: Me · Chi ha accesso: Chiunque
   5. Copia l'URL che finisce con /exec e incollalo nell'admin del sito (🔔 Avvisi)
   ========================================================================= */

var MAX_TESTO = 4096;        // limite di Telegram per un messaggio
var MAX_ALL_ORA = 60;        // tetto di messaggi inoltrati in un'ora

function doPost(e) {
  var testo = '';
  try {
    var dati = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    testo = String(dati.testo || '').trim();
  } catch (err) {
    return risposta({ ok: false, errore: 'richiesta non valida' });
  }
  if (!testo) return risposta({ ok: false, errore: 'testo vuoto' });
  if (testo.length > MAX_TESTO) testo = testo.slice(0, MAX_TESTO - 1) + '…';

  if (!contaEControlla()) {
    return risposta({ ok: false, errore: 'troppi messaggi in questa ora, riprova più tardi' });
  }
  return risposta(inviaATelegram(testo));
}

/* Risponde a chi apre l'indirizzo nel browser: serve solo a vedere che è vivo. */
function doGet() {
  return risposta({ ok: true, servizio: 'inoltro prenotazioni festa' });
}

/* Da eseguire dall'editor: chiede l'autorizzazione e manda un messaggio di prova. */
function prova() {
  var esito = inviaATelegram('✅ Inoltro della festa attivo: da qui arriveranno le prenotazioni.');
  Logger.log(JSON.stringify(esito));
}

function inviaATelegram(testo) {
  var p = PropertiesService.getScriptProperties();
  var token = (p.getProperty('TELEGRAM_BOT_TOKEN') || '').trim();
  var chat  = (p.getProperty('TELEGRAM_CHAT_ID') || '').trim();
  if (!token || !chat) return { ok: false, errore: 'inoltro non configurato (mancano le proprietà script)' };

  var r = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    payload: JSON.stringify({ chat_id: chat, text: testo, disable_web_page_preview: true })
  });
  var j = {};
  try { j = JSON.parse(r.getContentText()); } catch (err) {}
  if (j && j.ok) return { ok: true };
  return { ok: false, errore: (j && j.description) || ('Telegram ha risposto ' + r.getResponseCode()) };
}

/* Conta i messaggi dell'ora in corso; false se il tetto è già raggiunto. */
function contaEControlla() {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var cache = CacheService.getScriptCache();
    var chiave = 'n_' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMddHH');
    var n = Number(cache.get(chiave) || 0);
    if (n >= MAX_ALL_ORA) return false;
    cache.put(chiave, String(n + 1), 3700);
    return true;
  } finally {
    lock.releaseLock();
  }
}

function risposta(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
