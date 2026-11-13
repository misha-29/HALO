/* HALO service worker: caches the app and the OCR pack so HALO
   keeps working with no network after the first visit. */
const CACHE='halo-v2';
const FILES=['./','index.html','vendor/tesseract/tesseract.min.js','vendor/tesseract/worker.min.js','vendor/tesseract/tesseract-core-lstm.wasm.js','vendor/tesseract/lang/eng.traineddata.gz'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})));
});
