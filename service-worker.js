/* Service worker de "Mis gastos".
   Al publicar una versión nueva de la app, cambia el número de VERSION. */
var VERSION="gastos-v2";
var ARCHIVOS=["./","index.html","manifest.json","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",function(ev){
  self.skipWaiting();
  ev.waitUntil(caches.open(VERSION).then(function(c){
    return Promise.all(ARCHIVOS.map(function(u){return c.add(u).catch(function(){})}));
  }));
});
self.addEventListener("activate",function(ev){
  ev.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==VERSION}).map(function(k){return caches.delete(k)}));
  }).then(function(){return self.clients.claim()}));
});
/* Con internet usa siempre la versión más nueva; sin internet usa la guardada. */
self.addEventListener("fetch",function(ev){
  if(ev.request.method!=="GET")return;
  var url=new URL(ev.request.url);
  if(url.origin!==location.origin)return;
  ev.respondWith(fetch(ev.request).then(function(r){
    var copia=r.clone();caches.open(VERSION).then(function(c){c.put(ev.request,copia)});return r;
  }).catch(function(){return caches.match(ev.request).then(function(r){return r||caches.match("index.html")})}));
});
