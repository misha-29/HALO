/* HALO service worker: caches the app, Health Buddy's knowledge.md and the
   OCR pack so HALO keeps working with no network after the first visit. */
const CACHE='halo-v3';
const FILES=['./','index.html','css/fonts.css','css/styles.css','js/app.js','knowledge.md',
  'vendor/tesseract/tesseract.min.js','vendor/tesseract/worker.min.js','vendor/tesseract/tesseract-core-lstm.wasm.js','vendor/tesseract/lang/eng.traineddata.gz'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(f).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const fresh=req=>fetch(req).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(req,c))}return r});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  // app files and knowledge.md: network first so updates show, cache when offline
  if(!u.pathname.includes('/vendor/'))return e.respondWith(fresh(e.request).catch(()=>caches.match(e.request,{ignoreSearch:true})));
  // large OCR files: cache first
  e.respondWith(caches.match(e.request).then(hit=>hit||fresh(e.request)));
});
