// HALO proxy: keeps the Anthropic API key on a server (ground or on-board),
// never on crew devices. HALO talks to it in the OpenAI chat format.
//   ANTHROPIC_API_KEY=sk-... node proxy.mjs
// Then in Health Buddy settings choose "HALO proxy" (http://localhost:8787/v1/chat/completions).
import http from 'node:http';
const KEY=process.env.ANTHROPIC_API_KEY,PORT=+process.env.PORT||8787,MODEL=process.env.MODEL||'claude-sonnet-5-5';
const ALLOW=process.env.ALLOW_ORIGIN||'*';
if(!KEY){console.error('Set ANTHROPIC_API_KEY');process.exit(1)}
const send=(res,code,obj)=>{res.writeHead(code,{'content-type':'application/json','access-control-allow-origin':ALLOW,'access-control-allow-headers':'content-type','access-control-allow-methods':'GET,POST,OPTIONS'});res.end(JSON.stringify(obj))};
http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS')return send(res,204,{});
  if(req.method==='GET'&&req.url.startsWith('/v1/models'))return send(res,200,{data:[{id:MODEL}]});
  if(req.method!=='POST'||!req.url.startsWith('/v1/chat/completions'))return send(res,404,{error:'not found'});
  let body='';for await(const c of req)body+=c;
  try{
    const j=JSON.parse(body),system=j.messages.filter(m=>m.role==='system').map(m=>m.content).join('\n');
    const messages=j.messages.filter(m=>m.role!=='system').map(m=>({role:m.role,content:m.content}));
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':KEY,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:MODEL,max_tokens:500,temperature:j.temperature??0.2,system,messages})});
    const a=await r.json();if(!r.ok)return send(res,r.status,a);
    send(res,200,{choices:[{message:{role:'assistant',content:a.content.map(x=>x.text||'').join('')}}]});
  }catch(e){send(res,500,{error:String(e)})}
}).listen(PORT,()=>console.log(`HALO proxy on http://localhost:${PORT}, model ${MODEL}`));
