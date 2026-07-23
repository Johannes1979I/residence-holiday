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

  window.FB = {
    cfg: cfg, attivo: attivo,
    signIn: signIn, refresh: refresh,
    creaPrenotazione: creaPrenotazione, elenco: elenco, aggiorna: aggiorna, elimina: elimina
  };
})();
