// UTZLINE Dropbox Test service worker -- the app opens offline (cache-first, refreshed from the network). Dropbox's own addresses are
// never touched here (other origins pass straight through). Bump CACHE_NAME whenever a file in this folder changes.
// v1 (2026-11-18): RC 1.0 -- first trial build: PKCE sign-in, shared folder by namespace, local-first saving, self-test.
var CACHE_NAME = "utzline-dropbox-test-v4";
var FILES = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-192-maskable.png", "./icons/icon-512-maskable.png"];
self.addEventListener("install", function(e){ e.waitUntil(caches.open(CACHE_NAME).then(function(c){ return c.addAll(FILES); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener("activate", function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener("fetch", function(e){
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== self.location.origin) return; // Dropbox and everything else: not ours
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function(hit){
    var net = fetch(e.request).then(function(r){ if (r && r.ok){ var cp = r.clone(); caches.open(CACHE_NAME).then(function(c){ c.put(e.request, cp); }); } return r; }, function(){ return hit; });
    return hit || net;
  }));
});
