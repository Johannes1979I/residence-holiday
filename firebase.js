/* =========================================================================
   firebase.js — collegamento al database Firebase (Firestore + Login)
   Senza SDK: solo chiamate REST con fetch, così il sito resta leggero e
   senza dipendenze esterne caricate da CDN.

   Le prenotazioni vivono nella collezione "prenotazioni". Ogni documento:
     nome     (stringa)  — nome di chi prenota (serve alle regole di sicurezza)
     codice   (stringa)  — codice del voucher
     stato    (stringa)  — "attiva" oppure "cestino"
     creatoIl (stringa)  — data/ora ISO
     json     (stringa)  — TUTTA la prenotazione serializzata in JSON

   Regole: chiunque può CREARE una prenotazione; solo chi fa il LOGIN
   (l'organizzatore) può leggerle, modificarle, cancellarle.
   ========================================================================= */
(function () {
  var API = '', PROJ = '', BASE = '';

  function cfg(apiKey, projectId) {
    API = String(apiKey || '');
    PROJ = String(projectId || '');
    BASE = 'https://firestore.googleapis.com/v1/projects/' + PROJ + '/databases/(default)/documents';
  }
  function attivo() { return !!(API && PROJ); }

  /* ---- conversione valori <-> formato tipizzato di Firestore ---- */
  function toFields(obj) {
    var f = {};
    Object.keys(obj).forEach(function (k) {
      var v = obj[k];
      if (v === null || v === undefined) return;
      f[k] = { stringValue: String(v) };
    });
    return { fields: f };
  }
  function fromDoc(doc) {
    var f = (doc && doc.fields) || {};
    var o = { _id: doc && doc.name ? doc.name.split('/').pop() : null };
    Object.keys(f).forEach(function (k) {
      var v = f[k];
      o[k] = (v.stringValue !== undefined) ? v.stringValue
           : (v.integerValue !== undefined) ? v.integerValue
           : (v.booleanValue !== undefined) ? v.booleanValue : '';
    });
    return o;
  }

  function jget(r) { return r.json().catch(function () { return {}; }); }

  /* ---- LOGIN (email + password dell'organizzatore) ---- */
  function signIn(email, password) {
    return fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password, returnSecureToken: true })
    }).then(jget).then(function (d) {
      if (d.error) throw new Error(d.error.message || 'login fallito');
      return {
        idToken: d.idToken, refreshToken: d.refreshToken, email: d.email,
        scadenza: Date.now() + (Number(d.expiresIn || 3600) * 1000)
      };
    });
  }
  function refresh(refreshToken) {
    return fetch('https://securetoken.googleapis.com/v1/token?key=' + API, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(refreshToken)
    }).then(jget).then(function (d) {
      if (d.error) throw new Error(d.error.message || 'sessione scaduta');
      return {
        idToken: d.id_token, refreshToken: d.refresh_token,
        scadenza: Date.now() + (Number(d.expires_in || 3600) * 1000)
      };
    });
  }

  /* ---- CREA una prenotazione (usata dal sito, senza login) ---- */
  function creaPrenotazione(obj) {
    return fetch(BASE + '/prenotazioni?key=' + API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toFields(obj))
    }).then(jget).then(function (d) {
      if (d.error) throw new Error(d.error.message || 'scrittura fallita');
      return fromDoc(d);
    });
  }

  /* ---- ELENCO di tutte le prenotazioni (richiede login) ---- */
  function elenco(idToken) {
    var out = [];
    function pagina(tok) {
      var url = BASE + '/prenotazioni?key=' + API + '&pageSize=300' + (tok ? '&pageToken=' + tok : '');
      return fetch(url, { headers: { 'Authorization': 'Bearer ' + idToken } })
        .then(jget).then(function (d) {
          if (d.error) throw new Error(d.error.message || 'lettura fallita');
          (d.documents || []).forEach(function (doc) { out.push(fromDoc(doc)); });
          if (d.nextPageToken) return pagina(d.nextPageToken);
          return out;
        });
    }
    return pagina(null);
  }

  /* ---- AGGIORNA i campi indicati di una prenotazione (richiede login) ---- */
  function aggiorna(idToken, id, obj) {
    var mask = Object.keys(obj).map(function (k) {
      return 'updateMask.fieldPaths=' + encodeURIComponent(k);
    }).join('&');
    return fetch(BASE + '/prenotazioni/' + id + '?key=' + API + '&' + mask, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
      body: JSON.stringify(toFields(obj))
    }).then(jget).then(function (d) {
      if (d.error) throw new Error(d.error.message || 'aggiornamento fallito');
      return fromDoc(d);
    });
  }

  /* ---- ELIMINA definitivamente una prenotazione (richiede login) ---- */
  function elimina(idToken, id) {
    return fetch(BASE + '/prenotazioni/' + id + '?key=' + API, {
      method: 'DELETE', headers: { 'Authorization': 'Bearer ' + idToken }
    }).then(function (r) {
      if (r.ok) return true;
      return jget(r).then(function (d) { throw new Error((d.error && d.error.message) || ('HTTP ' + r.status)); });
    });
  }

  /* ================== CONTATORE PUBBLICO DEI POSTI ==================
     Documento "pubblico/contatore" con un solo campo numerico:
       partecipanti = quante persone hanno gia' prenotato.
     E' l'unico dato leggibile senza password: nessun nome, nessun telefono.
     Serve al sito per mostrare quanti posti restano.                     */
  var DOC_POSTI = 'pubblico/contatore';

  function leggiPosti(){
    return fetch(BASE + '/' + DOC_POSTI + '?key=' + API + '&_=' + Date.now(), { cache:'no-store' })
      .then(jget).then(function(d){
        if(d.error) return null;                       /* non esiste o non leggibile */
        var f = (d.fields && d.fields.partecipanti) || {};
        var n = Number(f.integerValue !== undefined ? f.integerValue : f.doubleValue);
        return isFinite(n) ? n : 0;
      })
      .catch(function(){ return null; });
  }

  /* Incremento atomico: due persone che prenotano insieme non si sovrascrivono. */
  function incrementaPosti(quante){
    var n = Math.max(0, Math.round(Number(quante) || 0));
    if(!n) return Promise.resolve(true);
    var nomeDoc = 'projects/' + PROJ + '/databases/(default)/documents/' + DOC_POSTI;
    var corpo = { writes: [{ transform: { document: nomeDoc,
      fieldTransforms: [{ fieldPath:'partecipanti', increment:{ integerValue: String(n) } }] } }] };

    function commit(){
      return fetch('https://firestore.googleapis.com/v1/projects/' + PROJ +
                   '/databases/(default)/documents:commit?key=' + API, {
        method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(corpo)
      }).then(jget);
    }
    return commit().then(function(d){
      if(!d.error) return true;
      /* la prima volta il documento non esiste: lo creo e riprovo una volta */
      if(String(d.error.status || '') === 'NOT_FOUND'){
        return scriviPosti(null, n).then(function(ok){ return ok; });
      }
      return false;
    }).catch(function(){ return false; });
  }

  /* Scrive il valore esatto. Con idToken lo fa l'organizzatore (ricalcolo dal
     registro, che resta la fonte di verita'); senza, serve alla prima creazione. */
  function scriviPosti(idToken, valore){
    var n = Math.max(0, Math.round(Number(valore) || 0));
    var headers = { 'Content-Type':'application/json' };
    if(idToken) headers['Authorization'] = 'Bearer ' + idToken;
    return fetch(BASE + '/' + DOC_POSTI + '?key=' + API +
                 '&updateMask.fieldPaths=partecipanti', {
      method:'PATCH', headers: headers,
      body: JSON.stringify({ fields: { partecipanti: { integerValue: String(n) } } })
    }).then(jget).then(function(d){ return !d.error; })
      .catch(function(){ return false; });
  }

  /* ========================= PRENOTAZIONI CHIUSE ========================
     Quando l'ordine e' partito per la pizzeria non si prenota piu'. Il dato
     sta in un documento pubblico: cosi' anche chi ha la pagina gia' aperta
     se ne accorge entro un minuto, senza dover ricaricare. */
  var DOC_CHIUSURA = 'pubblico/chiusura';

  function leggiChiusura(){
    return fetch(BASE + '/' + DOC_CHIUSURA + '?key=' + API + '&_=' + Date.now(),
                 { cache:'no-store' })
      .then(jget).then(function(d){
        if(d.error) return null;                  /* non esiste: nulla di chiuso */
        var f = d.fields || {};
        var chiuse = !!(f.chiuse && f.chiuse.booleanValue);
        return {
          chiuse: chiuse,
          /* «stato» e' il campo nuovo a tre posizioni; se manca si ricava
             dal vecchio interruttore aperto/chiuso */
          stato: (f.stato && f.stato.stringValue) || (chiuse ? 'chiusa' : 'aperta'),
          messaggio: (f.messaggio && f.messaggio.stringValue) || ''
        };
      })
      .catch(function(){ return null; });
  }

  /* stato: 'aperta' | 'chiusa' | 'conclusa'. Si scrive anche il vecchio
     campo booleano, cosi' una pagina non ancora aggiornata capisce lo
     stesso che non si prenota piu'. */
  function scriviChiusura(idToken, stato, messaggio){
    if(idToken === null || idToken === undefined || idToken === '') return Promise.resolve(false);
    var s = (stato === true) ? 'chiusa' : (stato === false) ? 'aperta' : String(stato || 'aperta');
    return fetch(BASE + '/' + DOC_CHIUSURA + '?key=' + API +
                 '&updateMask.fieldPaths=chiuse&updateMask.fieldPaths=stato' +
                 '&updateMask.fieldPaths=messaggio&updateMask.fieldPaths=aggiornatoIl', {
      method:'PATCH',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + idToken },
      body: JSON.stringify({ fields: {
        chiuse:       { booleanValue: (s !== 'aperta') },
        stato:        { stringValue: s },
        messaggio:    { stringValue: String(messaggio || '') },
        aggiornatoIl: { stringValue: new Date().toISOString() }
      }})
    }).then(jget).then(function(d){
      if(d.error) throw new Error(d.error.message || 'salvataggio stato fallito');
      return true;
    });
  }

  /* ============================== ALBUM =================================
     Le foto della serata. Il file dell'immagine sta su GitHub; qui viaggiano
     solo l'elenco degli indirizzi e le didascalie, in un documento pubblico:
     lo legge chiunque apra il sito, lo scrive solo l'organizzatore collegato.
     Cosi' una foto scattata durante la festa si vede subito, senza dover
     ripubblicare il sito. */
  var DOC_ALBUM = 'pubblico/album';

  function leggiAlbum(){
    return fetch(BASE + '/' + DOC_ALBUM + '?key=' + API + '&_=' + Date.now(),
                 { cache:'no-store' })
      .then(jget).then(function(d){
        if(d.error) return null;                 /* non esiste ancora, o bloccato */
        var f = d.fields || {};
        var testo = (f.json && f.json.stringValue) || '';
        if(!testo) return null;
        try{
          var o = JSON.parse(testo);
          if(Array.isArray(o)) return { attivo: o.length > 0, foto: o };   /* formato vecchio */
          return { attivo: o.attivo !== false, foto: Array.isArray(o.foto) ? o.foto : [] };
        }catch(e){ return null; }
      })
      .catch(function(){ return null; });
  }

  /* Serve alla diagnosi: dice se l'album e' bloccato dalle regole, cosa che
     leggiAlbum() nasconde apposta per non disturbare chi guarda il sito. */
  function provaAlbum(){
    return fetch(BASE + '/' + DOC_ALBUM + '?key=' + API + '&_=' + Date.now(),
                 { cache:'no-store' })
      .then(jget).then(function(d){
        if(d.error && /PERMISSION_DENIED/i.test(String(d.error.status || d.error.message || ''))) return 'bloccato';
        if(d.error && String(d.error.status || '') === 'NOT_FOUND') return 'vuoto';
        if(d.error) return 'errore';
        return 'ok';
      }).catch(function(){ return 'errore'; });
  }

  function scriviAlbum(idToken, album){
    if(!idToken) return Promise.resolve(false);
    var o = Array.isArray(album) ? { attivo: album.length > 0, foto: album } : (album || {});
    return fetch(BASE + '/' + DOC_ALBUM + '?key=' + API +
                 '&updateMask.fieldPaths=json&updateMask.fieldPaths=aggiornatoIl', {
      method:'PATCH',
      headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + idToken },
      body: JSON.stringify({ fields: {
        json:         { stringValue: JSON.stringify({ attivo: o.attivo !== false, foto: o.foto || [] }) },
        aggiornatoIl: { stringValue: new Date().toISOString() }
      }})
    }).then(jget).then(function(d){
      if(d.error) throw new Error(d.error.message || 'salvataggio album fallito');
      return true;
    });
  }

  window.FB = {
    cfg: cfg, attivo: attivo,
    signIn: signIn, refresh: refresh,
    creaPrenotazione: creaPrenotazione, elenco: elenco, aggiorna: aggiorna, elimina: elimina,
    leggiPosti: leggiPosti, incrementaPosti: incrementaPosti, scriviPosti: scriviPosti,
    leggiAlbum: leggiAlbum, scriviAlbum: scriviAlbum, provaAlbum: provaAlbum,
    leggiChiusura: leggiChiusura, scriviChiusura: scriviChiusura
  };
})();
