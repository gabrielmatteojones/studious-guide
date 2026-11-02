# Sito di Gabriel Jones – Jekyll + Netlify + Firebase

Build verificata con Jekyll 4.3 (23 pagine generate). Login, Identity e funzioni Netlify vanno provati dopo il deploy.

## Struttura
| Funzione | Dove |
|---|---|
| Login utenti (accesso chiuso, **senza registrazione**) | Firebase Auth → `/accedi/`, `/area-utenti/` |
| Admin | Netlify Identity (ruolo `admin`) → `/gestione/` |
| CMS (non Decap) | form in `/gestione/` + `netlify/functions/publish.js` → commit su GitHub → Netlify ricostruisce |
| Documenti, ognuno con la sua pagina e scheda | `_documents/*.md` → `/documenti/<nome>/` (layout `_layouts/document.html`) |
| Guide to use (wiki per progetto) | `_guides/<progetto>/NN-titolo.md` → `/guide/<progetto>/NN-titolo/` |
| PDF su carta intestata | `/gestione/` → tab Documenti (carta: `assets/img/carta-intestata.png`) |
| Presentazioni PPTX | `/gestione/` → tab Presentazioni (modello: `assets/js/pptx-template.js`, file vuoto: `assets/templates/presentazione-modello.pptx`) |

## Drive personale (`/drive/`)
Cartelle, **Documenti** (editor testo, export .doc / PDF su carta intestata), **Presentazioni** (editor, modalità presenta, export .pptx), **Fogli** (formule, CSV) e file. I dati stanno nel tuo spazio privato su Firestore: serve l'accesso Firebase.
1. Firebase → **Firestore Database** → *Create database* (modalità produzione), poi scheda *Rules* e incolla `firebase/firestore.rules` → Publish.
2. Modalità file in `_config.yml` → `drive.storage`:
   - `firestore` (predefinita, **gratuita**): file fino a 600 KB.
   - `firebase`: file fino a 25 MB su Cloud Storage. **Richiede il piano Blaze** (dal 2026 Cloud Storage non è più disponibile su Spark). Poi incolla `firebase/storage.rules` in Storage → Rules.
3. Ogni utente ha un Drive separato: nessuno vede i file degli altri.

## Messa online
1. Carica la cartella su GitHub e collegala a Netlify (build e publish sono in `netlify.toml`).
2. **Netlify Identity**: Site configuration → Identity → *Enable*; Registration: *Invite only*. Invita la tua email. Apri l'invito **dal link ricevuto**: ora porta sempre su `/gestione/` e ti fa scegliere la password. Poi, nella scheda dell'utente su Netlify, assegna il ruolo `admin`, esci e rientra.
3. **Variabili d'ambiente**: `GITHUB_TOKEN` (fine-grained, *Contents: Read and write* solo su questo repo), `GITHUB_REPO` (`utente/repo`), `GITHUB_BRANCH` (`main`).
4. **Firebase** (progetto `onlygabbyme`):
   - Authentication → Sign-in method: attiva **solo Email/Password** (lascia Google disattivato).
   - Authentication → Settings → **User actions**: togli la spunta a *Enable create (sign-up)*, così nessuno può registrarsi nemmeno usando la chiave pubblica.
   - Authentication → Settings → **Authorized domains**: aggiungi il dominio Netlify e quello definitivo.
   - Authentication → Users → **Add user**: crei tu gli utenti (email + password).
5. `_config.yml`: `url` e dati `legal:`. Questi dati finiscono anche nel piè di pagina dei PDF.
6. Fai verificare le pagine legali da un professionista (sono modelli).

## Se la build su Netlify fallisce con `eventmachine` / `Gemfile.lock`
Nel repository c'è un vecchio `Gemfile.lock` (non è quello di questo progetto). Cancellalo: su GitHub apri `Gemfile.lock` → icona cestino → *Commit changes*. Controlla anche che `Gemfile` e `netlify.toml` stiano nella **radice** del repository (non dentro una sottocartella) e che il `Gemfile` sia quello fornito. Poi su Netlify: *Deploys → Trigger deploy → Clear cache and deploy site*.

## Se il login non funziona
- **Firebase**: l'errore è mostrato sotto il form. Cause tipiche: Email/Password non attivo, dominio non autorizzato, utente non creato.
- **Netlify Identity**: il messaggio compare in `/gestione/`. Cause tipiche: Identity non attivo, sito aperto da un dominio diverso, utente senza ruolo `admin`, blocco di contenuti che impedisce di caricare `identity.netlify.com`. In locale imposta `identity_url` in `_config.yml`.

## Note
- La chiave API Firebase web è pubblica per progetto: la protezione sono domini autorizzati e sign-up disattivato.
- I documenti "riservati" nascondono il pulsante di download con JavaScript, ma il file resta raggiungibile se si conosce l'indirizzo: usali per materiali non sensibili.
- Upload dal CMS: massimo ~3 MB per file.
- Google Fonts è caricato da Google (IP trasmesso): per massima conformità scarica i font in `assets/`.
- Locale: `bundle install && bundle exec jekyll serve`; funzioni: `netlify dev`.
