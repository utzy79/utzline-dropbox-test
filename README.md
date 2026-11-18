# UTZLINE Dropbox Test

Current version: v2 (RC 1.0)

A separate test app. It proves Dropbox can replace SharePoint as the UTZLINE cloud store.
It does not touch the 18 apps or any SharePoint code. It is not in `native-trial/apps.json`, `build_apps.py` or the installers: a PWA zip is enough.
The audit of every SharePoint call and its Dropbox equivalent is in `../DROPBOX-AUDIT.md`.

## Dropbox App Console (once, by Andrew)

App key: `fshim7tsxbhw4d7` (public; sign-in uses PKCE, so there is no secret anywhere).

1. **Settings**
   - **OAuth 2 → Allow public clients (Implicit Grant & PKCE): Allow.**
   - **Redirect URIs.** Add the exact page address. The page shows it under "1 · Sign in" ("This page sends Dropbox back to …").
     - Run on the PC: `http://localhost:8765/index.html` (port as you start it, below).
     - Hosted for the phone (https needed): `https://<host>/<path>/index.html`. For GitHub Pages, for example: `https://utzy79.github.io/utzline-source/dropbox-test-pwa/index.html`.
     - Electron (later): `http://localhost`. Dropbox accepts any port on a localhost redirect. Electron sign-in needs a small shell hook (`window.utzDropboxAuth.authorize`), which is not built in this round.
2. **Permissions:** tick `account_info.read`, `files.metadata.read`, `files.metadata.write`, `files.content.read`, `files.content.write` and `sharing.read`, then **Submit**.
3. **Users:** while the app is in Development, each person who signs in must be added under "Development users", or the app applies for Production.

## Run it

On a PC, from this folder:

```
python3 -m http.server 8765
```

Open `http://localhost:8765/index.html` in Chrome.

For a phone: GitHub Pages (`.github/workflows/dropbox-test-pages.yml` publishes only this folder).
1. Once only: in the repo, go to Settings → Pages → Source: **GitHub Actions**.
2. Settings → Environments → **github-pages** → Deployment branches: add `claude/youthful-lovelace-6bb2yq`. By default only `main` may publish.
3. Actions → **Dropbox Test on GitHub Pages** → Run workflow (on that branch). After that it runs by itself when this folder changes.
4. Dropbox App Console redirect URI: `https://utzy79.github.io/utzline-source/index.html`.
5. On the phone, open `https://utzy79.github.io/utzline-source/index.html`.

GitHub Pages from a private repo needs a paid GitHub plan (Pro or Team). The published page is public, but it holds no secrets.

## Trial checklist (acceptance)

1. Sign in as the owner. Choose the folder: pick the shared **UTZLINE** folder (you choose it once).
2. **Run self-test.** Every row should be PASS. Note the "Speed with Dropbox" table.
3. On a second account (invited to the shared folder), sign in on another device, choose the same folder and run the self-test.
4. Run the self-test on desktop Chrome, Electron (later), and a phone browser.
5. Offline: turn the network off, save a note, close the browser and open it again. It should show "1 save waiting". Turn the network on and the save goes up.
6. Conflict: open the same note on two devices, save on one, then save on the other. The second save is held as a conflict. Choose "Keep both" or "Replace theirs with mine".
7. A refused upload shows Dropbox's full answer, the X-Dropbox-Request-Id and a one-line summary.

## Still to confirm on real Dropbox

- An invited member reaches the shared folder through `Dropbox-API-Path-Root` with the folder's id.
- `X-Dropbox-Request-Id` can be read by the page. If it can't, the page shows "(not given to the browser)".
- The Standard plan allows API apps for every member.

## Tests

`tests/pdftest-dropbox/run_dropbox_test.js` runs the page against a stand-in Dropbox (`mock_dropbox.js`). It covers:

- sign-in and refresh;
- the shared folder and Path-Root;
- paging;
- chunked upload;
- conflict detection;
- the offline queue surviving a restart;
- 429 / too_many_write_operations with Retry-After;
- the full error shown with its request id;
- the self-test.
