/* =========================================================
   HALO: simulated history plus whatever the crew logs.
   Assessment, protocols and Health Buddy's on-board library
   run fully offline. Each record is encrypted on board with
   the astronaut's passcode.
   ========================================================= */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fx=(v,d=0)=>Number(v).toFixed(d);
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const pad2=n=>String(n).padStart(2,'0');
const hm=d=>{d=new Date(d);return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`};
const dayKey=d=>{d=new Date(d);return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`};
const MIN=6e4,HOUR=36e5,DAY=864e5;
const median=a=>{const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return !s.length?0:s.length%2?s[m]:(s[m-1]+s[m])/2};

/* ---------- icons (one stroke set) ---------- */
const P={
 pulse:'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
 heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
 gauge:'<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/>',
 drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
 thermo:'<path d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
 moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
 smile:'<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4 4 0 0 0 7 0"/><path d="M9 9.5h.01M15 9.5h.01"/>',
 bell:'<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
 brain:'<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 3h0a3 3 0 0 1-3-3"/>',
 shield:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
 flame:'<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.8 1.6-4.2 2.2-6.4C10.6 8 11.6 8.6 12 10c.7-2.3.6-4.6 0-7z"/>',
 dumbbell:'<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
 bone:'<path d="M8.5 6.5a2.5 2.5 0 1 0-3.4 3.4 2.5 2.5 0 1 0 3.4 3.4l6.6-6.6a2.5 2.5 0 1 0 3.4-3.4 2.5 2.5 0 1 0-3.4-3.4"/><path d="M15.5 17.5a2.5 2.5 0 1 0 3.4-3.4"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 down:'<path d="M6 9l6 6 6-6"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
 box:'<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="12" cy="10" r="2.5"/><path d="M8 17a4 4 0 0 1 8 0"/>',
 globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
 grav:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
 air:'<path d="M3 9h11a3 3 0 1 0-3-3"/><path d="M3 15h14a3 3 0 1 1-3 3"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 star:'<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
 doc:'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 logout:'<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10"/>',
 sat:'<path d="M5 12a7 7 0 0 1 14 0"/><path d="M8.5 12a3.5 3.5 0 0 1 7 0"/><circle cx="12" cy="15" r="1.2"/>',
 ok:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.8 2.8L16 9.8"/>',
 warn:'<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2h.01"/>',
 stop:'<path d="M8.3 3h7.4L21 8.3v7.4L15.7 21H8.3L3 15.7V8.3z"/><path d="M12 7.5v5.5M12 16.3h.01"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',
 send:'<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 eye:'<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
 pill:'<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M9.5 9.5l5 5"/>',
 scale:'<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8.5 9.5a5 5 0 0 1 7 0L12 12.5z"/>',
 camera:'<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
 bt:'<path d="M7 7l10 10-5 4V3l5 4L7 17"/>',
 lock:'<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
 users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
 play:'<path d="M7 4.5v15l12-7.5z"/>',
 food:'<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 21V3c-2.5 1.5-3.5 4-3.5 7.5H17"/>'
};
const I=(n,c='')=>`<svg class="ico ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;
const LOGO=`<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><ellipse cx="16" cy="8" rx="10" ry="3.2" stroke="currentColor" stroke-width="1.8"/><path d="M6 21h5l2.5-5 3.5 9 2.5-5H26" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>HALO</span>`;

/* ---------- metrics ----------
   dir: which way is worse (+1 up, -1 down); fl: smallest spread used
   for the personal baseline; guide: guided measurement timer.
   Thresholds are prototype values for review against NASA-STD-3001. */
const RADLIM=250;
const M={
 hr:{n:'Heart rate',u:'bpm',d:0,norm:'50 to 100 bpm at rest',band:[50,100],ico:'pulse',st:v=>v>120||v<40?'r':v>100||v<50?'a':'g',lim:[25,230],tool:'Wearable, chest strap, cuff or pulse oximeter',call:'Alert the CMO if your resting rate is above 120 or below 40, feels irregular, or comes with chest pain or fainting.',
   why:'With less gravity the heart does less work and can lose fitness. A rising resting rate can also mean stress, illness or poor sleep.',how:'Rest seated for 5 minutes, then read your wearable or pulse oximeter.',dir:1,fl:4,guide:{sec:300,cue:'Sit still and quiet with your feet braced. Breathe normally and do not talk.'},src:'NASA Human Research Program, cardiovascular adaptations risk'},
 bp:{n:'Blood pressure',u:'mmHg',d:0,norm:'90 to 129 over 60 to 84',band:[90,129],ico:'gauge',lim:[60,260],tool:'Automatic cuff',call:'Alert the CMO at 160/100 or higher, a top number below 80, or if you feel faint.',
   why:'Fluids shift toward the head in microgravity, which changes blood pressure. Low pressure after landing can cause fainting.',how:'Bare arm resting at heart level. Sit still and silent for 5 minutes before the cuff inflates.',dir:1,fl:6,guide:{sec:300,cue:'Cuff on a bare arm at heart level. Sit still and silent until the timer ends.'},src:'NASA Human Research Program, cardiovascular adaptations risk'},
 glu:{n:'Blood glucose',u:'mg/dL',d:0,norm:'70 to 99 mg/dL fasting',band:[70,99],ico:'drop',st:v=>v>=180||v<55?'r':v>=100||v<70?'a':'g',lim:[20,600],tool:'Finger-prick glucometer',call:'Alert the CMO at 180 mg/dL or higher, or below 55 mg/dL.',
   why:'Less activity, stress hormones and a changed diet make blood sugar harder to control.',how:'Fasting, clean dry fingertip, use the second drop of blood.',dir:1,fl:6,src:'NASA Human Research Program, food and nutrition risk'},
 temp:{n:'Temperature',u:'°C',d:1,norm:'36.1 to 37.2 °C',band:[36.1,37.2],ico:'thermo',st:v=>v>=38.1||v<35?'r':v>37.2||v<36.1?'a':'g',lim:[30,43],tool:'Oral or skin thermometer',call:'Alert the CMO at 38.1 °C or higher, or below 35 °C.',
   why:'Immunity drops in space and germs spread easily in a closed cabin, so a fever is an early sign of infection.',how:'Under the tongue with mouth closed. No drinks for 15 minutes before.',dir:1,fl:.25,guide:{sec:60,cue:'Thermometer under your tongue, mouth closed. Breathe through your nose.'},src:'NASA Human Research Program, altered immune response risk'},
 sleep:{n:'Sleep',u:'h',d:1,norm:'7 to 9 h',band:[7,9],ico:'moon',st:v=>v<5?'r':v<7?'a':'g',lim:[0,20],tool:'Sleep band and a morning self-rating',call:'Tell the CMO if you sleep under 5 hours for 3 nights in a row.',
   why:'Sixteen sunrises a day, noise and shift work disrupt sleep, and poor sleep affects almost every other reading.',how:'Wear your sleep band overnight and add a quick rating when you wake.',dir:-1,fl:.6,src:'NASA Human Research Program, sleep loss and circadian desynchronisation risk'},
 mood:{n:'Mood',u:'of 5',d:1,norm:'4 to 5',band:[4,5],ico:'smile',st:v=>v<2.5?'r':v<3.5?'a':'g',lim:[1,5],tool:'Daily self-rating',call:'Tell the CMO if your mood is 2 or lower for 3 days, and at once if you have thoughts of harming yourself.',
   why:'Months of isolation and distance from home wear on mood. Changes are easier to turn around early.',how:'Rate how you feel from 1 to 5 each evening. The CMO sees it only if you allow it in Routine, Privacy.',dir:-1,fl:.5,src:'NASA Human Research Program, behavioural health and performance risk'},
 spo2:{n:'Blood oxygen',u:'%',d:1,norm:'95% or higher',band:[95,100],ico:'air',st:v=>v<92?'r':v<95?'a':'g',lim:[50,100],tool:'Pulse oximeter',call:'Alert the CMO below 92%, or at once if you are short of breath.',
   why:'Cabin air is made by machines. Low oxygen can point to a life support problem or a lung issue.',how:'Warm finger, clip on, hold still for 30 seconds.',dir:-1,fl:.8,guide:{sec:30,cue:'Warm finger in the clip. Hold your hand still at heart level.'},src:'NASA-STD-3001 Vol. 2, cabin atmosphere; HRP hostile closed environment'},
 water:{n:'Hydration',u:'L',d:1,norm:'2.5 L a day or more',band:[2.5,4],ico:'drop',st:v=>v<2?'r':v<2.5?'a':'g',lim:[0,10],tool:'Drink pouch log',call:'Tell the CMO about side pain, very dark urine or blood in your urine.',
   why:'Thirst is weaker in microgravity, and low fluid raises the risk of kidney stones.',how:'Log each drink pouch, or let the dispenser count for you.',dir:-1,fl:.3,src:'NASA Human Research Program, renal stone risk'},
 ex:{n:'Exercise',u:'min',d:0,norm:'120 min a day or more',band:[120,180],ico:'dumbbell',st:v=>v<60?'r':v<120?'a':'g',lim:[0,400],tool:'Exercise device logs and HALO workouts',call:'Tell the flight surgeon if you manage under 60 minutes for 3 days.',
   why:'Daily resistance and cardio training is the main defence against muscle and bone loss in space.',how:'Exercise devices log sessions automatically.',dir:-1,fl:15,src:'NASA Human Research Program, reduced muscle mass, strength and endurance risk'},
 bone:{n:'Bone density change',u:'%',d:2,norm:'above -1.5% since launch',band:[-1.5,0],ico:'bone',st:v=>v<-2.5?'r':v<-1.5?'a':'g',lim:[-20,5],tool:'Scans and blood markers',call:'The ground team reviews your scans. Keep up resistance training.',
   why:'Bones that carry no weight can lose about 1% of their density each month in space (NASA).',how:'Estimated from scans and blood markers reviewed on the ground.',src:'NASA Human Research Program, bone fracture risk from spaceflight bone changes'},
 vis:{n:'Near vision',u:'',d:0,norm:'N5 to N6 at 40 cm, Amsler grid clear',band:[5,6],ico:'eye',st:v=>v>=10?'r':v>=8?'a':'g',lim:[4,24],tool:'HALO vision check: near-vision card and Amsler grid',call:'Alert the CMO at once if lines on the grid look wavy, bent or missing, or if your vision changes suddenly.',
   why:'Fluid shifts toward the head can swell the back of the eye and the optic nerve (SANS). Near vision often blurs first, and the changes can build up over a long mission.',how:'Do the HALO vision check weekly from the Train tab. Same device, same light, screen 40 cm away, usual glasses, one eye at a time.',dir:1,fl:1,src:'NASA Human Research Program, spaceflight associated neuro-ocular syndrome (SANS) risk'},
 pvt:{n:'Vigilance lapses',u:'lapses',d:0,norm:'0 to 2 in a 3 minute check',band:[0,2],ico:'clock',st:v=>v>=6?'r':v>=3?'a':'g',lim:[0,90],tool:'HALO vigilance check (PVT-B, 3 minutes)',call:'Tell the CMO at 6 or more lapses, and do not start an EVA or critical task until you test again.',
   why:'Sleep loss and a shifted body clock slow your attention before you notice it yourself. The vigilance test measures it objectively.',how:'Take the 3 minute check from the Train tab in a quiet spot, on the same device each time.',dir:1,fl:1.2,src:'NASA Cognition test battery, PVT-B (Basner and Dinges)'},
 fat:{n:'Fatigue',u:'of 7',d:0,norm:'1 to 4 on the Samn-Perelli scale',band:[1,4],ico:'brain',st:v=>v>=6?'r':v>=5?'a':'g',lim:[1,7],tool:'Samn-Perelli 7 point self-rating',call:'Tell the CMO if you rate 6 or 7, and avoid critical tasks until you have rested.',
   why:'Fatigue builds from short sleep, long shifts and stress, and it raises the chance of mistakes.',how:'Pick the line that fits: 1 fully alert, 4 a little tired, 7 completely exhausted.',dir:1,fl:.8,src:'Samn-Perelli fatigue scale, used in aviation and spaceflight analogue studies'},
 mass:{n:'Body mass',u:'kg',d:1,norm:'within 5% of pre-flight',band:id=>{const b=BASE[id].mass.m;return [b*.95,b*1.05]},ico:'scale',st:()=>'g',lim:[30,200],tool:'Mass measurement device',call:'Tell the CMO if you lose more than 5% of your pre-flight mass.',
   why:'Many astronauts eat less than they need in space, and losing mass speeds up muscle and bone loss.',how:'Same time each day, before breakfast and after using the toilet.',src:'NASA Human Research Program, food and nutrition risk'},
 kcal:{n:'Food energy',u:'kcal',d:0,norm:'2,500 kcal a day or more',band:[2500,3200],ico:'food',st:v=>v<1600?'r':v<2200?'a':'g',lim:[0,8000],tool:'Food log from meal packet labels',call:'Tell the CMO if you eat under 1,600 kcal a day for 3 days.',
   why:'Appetite and taste change in space, and eating too little speeds up muscle and bone loss.',how:'Log the energy on each meal packet. HALO adds up the day.',dir:-1,fl:200,src:'NASA Human Research Program, food and nutrition risk'},
 co2:{n:'Cabin CO2',u:'ppm',d:0,norm:'under 3,000 ppm',band:[400,3000],ico:'air',st:v=>v>=5000?'r':v>=3000?'a':'g',lim:[300,20000],tool:'Cabin CO2 monitor or personal sensor',call:'Tell the crew and the CMO above 5,000 ppm, or if several people have headaches.',
   why:'CO2 builds up in a sealed cabin. Even moderate levels can cause headaches and slower thinking.',how:'Read the cabin monitor in the module where you work and sleep.',src:'NASA-STD-3001 Vol. 2, cabin atmosphere; HRP hostile closed environment'},
 rad:{n:'Radiation dose',u:'mSv',d:1,norm:`under 60% of the ${RADLIM} mSv mission limit`,band:[0,RADLIM*.6],ico:'sun',st:v=>v>=RADLIM*.9?'r':v>=RADLIM*.6?'a':'g',lim:[0,2000],tool:'Personal dosimeter',call:'Follow the shelter procedure in a solar storm. Tell the CMO if your dose jumps.',
   why:'Outside Earth\'s magnetic field crews absorb more radiation, which adds to long-term cancer and other health risks.',how:'Wear your dosimeter at all times and log the total from its display.',src:'NASA Human Research Program, space radiation risk; dose limits in NASA-STD-3001'}
};
const VITALS=['hr','bp','glu','temp','sleep','mood'];
const LV={g:'Normal',a:'Watch',r:'Urgent'};
const SAY={g:'That is in the normal range.',a:'That is worth watching.',r:'That needs attention now.'};
const LVTXT={g:'All readings are in range.',a:'Some readings need a closer look.',r:'Something needs medical attention now.'};
const RANK={g:0,a:1,r:2};
const STI={g:'ok',a:'warn',r:'stop'};
const worst=a=>a.reduce((w,s)=>RANK[s]>RANK[w]?s:w,'g');
const stTag=(s,cls='')=>`<span class="st ${s} ${cls}">${I(STI[s],'sm')}${LV[s]}</span>`;
const stChip=s=>`<span class="chip st ${s}">${I(STI[s],'sm')}${LV[s]}</span>`;
const stWord=(s,w)=>`<span class="st ${s}">${I(STI[s],'sm')}${w}</span>`;

/* ---------- crew & history ---------- */
const CREW=[
 {id:'AR',first:'Ana',name:'Ana Reyes',role:'Commander',seed:3,xp:1840,
  s:{hr:[61,77,2,2.2],sys:[118,124,3,1],dia:[76,80,2,1],glu:[92,96,4,1],temp:[36.7,36.8,.12,1],sleep:[7.6,6.1,.25,2.2],mood:[4.4,3.1,.2,2.2],spo2:[98.2,97.6,.4,1],water:[2.8,2.6,.2,1],ex:[122,96,10,1],bone:[-0.9,-1.2,.02,1],mass:[62,61.3,.25,1],pvt:[1,3.6,.5,2.2],fat:[2.4,4.4,.3,2.2]}},
 {id:'KT',first:'Kai',name:'Kai Tan',role:'Flight Engineer',seed:7,xp:1520,
  s:{hr:[64,67,2,1],sys:[120,126,3,1],dia:[78,82,2,1],glu:[97,126,4,1.4],temp:[36.6,36.7,.12,1],sleep:[7.2,7.3,.25,1],mood:[4.1,4.0,.2,1],spo2:[98,98,.4,1],water:[2.7,2.2,.15,1],ex:[118,74,8,1],bone:[-0.7,-1.0,.02,1],mass:[74,71.9,.3,1.4],kcal:[2700,2300,110,1.4],vis:[5,8,.2,1.6]}},
 {id:'LO',first:'Lena',name:'Lena Okafor',role:'Mission Specialist',seed:11,xp:2260,
  s:{hr:[56,55,2,1],sys:[114,116,3,1],dia:[72,73,2,1],glu:[88,90,4,1],temp:[36.6,36.6,.1,1],sleep:[7.6,7.8,.25,1],mood:[4.4,4.5,.15,1],spo2:[98.5,98.6,.3,1],water:[3.0,3.1,.15,1],ex:[124,132,8,1],bone:[-0.6,-0.8,.02,1],mass:[66,65.8,.25,1]}},
 {id:'MV',first:'Marco',name:'Marco Varga',role:'Crew Medical Officer',seed:19,xp:1190,
  s:{hr:[66,99,2,10],sys:[121,131,3,6],dia:[78,84,2,4],glu:[94,104,4,3],temp:[36.7,38.4,.1,12],sleep:[7.1,6.6,.25,3],mood:[4.0,3.5,.2,3],spo2:[97.9,96.4,.3,6],water:[2.7,2.3,.15,1],ex:[120,64,8,4],bone:[-1.0,-1.3,.02,1],mass:[80,78.9,.3,1],fat:[2.6,5.2,.3,6],pvt:[1,2.4,.5,6]}}
];
const isCMO=c=>c&&c.role==='Crew Medical Officer';
const DAYS=30;
const DEF={vis:[5,5,.3,1],pvt:[1,1,.7,1],fat:[2.5,2.8,.5,1],co2:[2300,2500,180,1],rad:[40.2,51,0,1],kcal:[2750,2650,120,1]};
const specOf=c=>{const s=Object.assign({},c.s);for(const k in DEF)if(!(k in s))s[k]=DEF[k];return s};
function gen(c){
  const r=rng(c.seed),out=[],sp=specOf(c);
  for(let i=0;i<DAYS;i++){
    const t=i/(DAYS-1),d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(DAYS-1-i));
    const e={d,cid:c.id,ams:0};
    for(const k in sp){const[s0,s1,n,p]=sp[k];const noise=i===DAYS-1?0:(r()-.5)*2*n;e[k]=s0+(s1-s0)*Math.pow(t,p)+noise}
    e.mood=clamp(e.mood,1,5);e.spo2=Math.min(e.spo2,99.6);
    e.vis=clamp(Math.round(e.vis),4,24);e.pvt=Math.max(0,Math.round(e.pvt));e.fat=clamp(Math.round(e.fat),1,7);e.kcal=Math.round(e.kcal);e.co2=Math.round(e.co2);
    out.push(e);
  }
  return out;
}
/* personal pre-flight baseline: mean and spread per astronaut */
const BASE={};
function baseOf(c){const b={},sp=specOf(c);for(const k in sp){const mk=k==='sys'||k==='dia'?'bp':k,fl=(M[mk]&&M[mk].fl)||0;b[k]={m:sp[k][0],sd:Math.max(sp[k][2],fl)}}return b}

const S={env:'transit',crew:null,tab:'today',region:null,view:DAYS-1,launch:0,
  hist:{},xp:{},missions:{},rem:{},al:{},queued:{},sent:{},lastSync:{},images:{},chat:{},log:{},pain:{},meds:{},vision:{},ortho:{},rechecks:{},consent:{},disagree:{},logged:{},fired:{},cmoNotes:{},
  online:false,blackoutUntil:0,recKey:'sleep',recN:30,cat:'sleep',modalKey:null,modalN:14,logMood:4,logFat:3,openPat:null,crewSel:null,
  speak:false,listening:false,showCfg:false,kb:null,kbErr:false,
  key:null,cmoPriv:null,cmoPkcs8:null,shares:{},store:'memory'};
S.launch=(()=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-141);return d.getTime()})();
const mday=e=>Math.round((e.d.getTime()-S.launch)/DAY)+1;
const MISSIONS=[['Log morning vitals',20,'doc'],['Resistance session',40,'dumbbell'],['Drink 2.5 L of water',25,'drop'],['10 min breathing session',20,'smile'],['Lights out by 22:30',25,'moon']];
const REMS=[['08:00','Morning vitals'],['11:00','Hydration check, 1 L by now'],['14:00','Resistance session'],['19:00','Vigilance check'],['22:00','Wind down, dim lights']];

/* ---------- mission environments (FR-8) ---------- */
const LIFT0=['Squat','Deadlift','Heel raise','Bench press'];
const ENV={
 transit:{n:'Mars transit',long:'Spacecraft in transit to Mars',g:'Microgravity',delay:'about 20 minutes each way',delayMin:20,esc:'cmo',cardio:'cycle ergometer',res:'resistance device',lift:LIFT0,micro:true},
 station:{n:'Space station',long:'Space station in low Earth orbit',g:'Microgravity',delay:'under a second each way',delayMin:.01,esc:'ground',cardio:'treadmill with harness',res:'resistance device',lift:LIFT0,micro:true},
 rover:{n:'Rover',long:'Pressurised rover on Mars',g:'Mars gravity, 3/8 g',delay:'3 to 22 minutes each way',delayMin:12,esc:'cmo',cardio:'step-ups',res:'resistance bands',lift:['Band squat','Band row','Heel raise','Push-up'],short:true},
 moon:{n:'Lunar base',long:'Surface base on the Moon',g:'Moon gravity, 1/6 g',delay:'about 1.3 seconds each way',delayMin:.022,esc:'ground',cardio:'treadmill',res:'resistance device',lift:LIFT0},
 mars:{n:'Mars base',long:'Surface base on Mars',g:'Mars gravity, 3/8 g',delay:'3 to 22 minutes each way',delayMin:12,esc:'cmo',cardio:'treadmill',res:'resistance device',lift:LIFT0}
};
const env=()=>ENV[S.env]||ENV.transit;
const replyMin=()=>2*env().delayMin+15;
const replyText=()=>{const m=replyMin();return m<60?`${Math.round(m)} minutes`:`${fx(m/60,1)} hours`};
const escText=()=>env().esc==='ground'?`Call the ground flight surgeon now as well. The link delay is ${env().delay}.`:`The CMO decides on board. The ground is told and can reply in about ${replyText()}.`;
const boneNote=()=>env().micro?'In microgravity, expect about 1% a month without exercise (NASA).':'Partial gravity may slow bone loss, but by how much is not yet known, so keep training as prescribed.';

/* ---------- training game state (FR-9) ---------- */
const KM_PER_MIN=40000;
const STOPS=[[384400,'The Moon','384,400 km away. Apollo crews took about 3 days to get there.'],[1.5e6,'Earth-Sun L2','1.5 million km out, where the James Webb Space Telescope works.'],[38e6,'Venus at its closest','38 million km. Venus is the closest planet to Earth.'],[54.6e6,'Mars at its closest','54.6 million km, the nearest Mars can ever come.'],[112.5e6,'Halfway to Mars','112.5 million km along the average distance.'],[225e6,'Mars','225 million km, the average distance to Mars. Season complete.']];
const QUESTS={cardio:['Ride 60 interval minutes',60,'min',40],lifts:['Finish 5 lift sessions',5,'sessions',60],reflex:['Do 3 vigilance checks',3,'checks',20]};
const G={};
function initCrew(c){
  const id=c.id,r=rng(c.seed*31);
  S.hist[id]=gen(c);BASE[id]=baseOf(c);S.xp[id]=c.xp;S.missions[id]=MISSIONS.map((m,i)=>i===0);S.rem[id]=[true,true,false,true,true];
  S.al[id]={};S.queued[id]=1;S.sent[id]=[];S.lastSync[id]=(()=>{const d=new Date();d.setHours(6,40,0,0);return d.getTime()})();
  S.chat[id]=[];S.images[id]=[];S.log[id]=[];S.pain[id]=[];S.meds[id]=[];S.vision[id]=[];S.ortho[id]=[];S.rechecks[id]=[];
  S.consent[id]={mood:id!=='AR',cog:true};S.disagree[id]=[];S.fired[id]={};S.cmoNotes[id]={};
  const miss=id==='AR'?.18:id==='MV'?.12:.06,set=new Set([dayKey(new Date())]);
  for(let i=1;i<DAYS;i++){if(r()>miss){const d=new Date();d.setDate(d.getDate()-i);set.add(dayKey(d))}}
  S.logged[id]=set;
  const h=S.hist[id];
  G[id]={min:Math.round(h.reduce((a,e)=>a+e.ex,0)*0.62),cardio:18+c.seed%3*8,lifts:1+c.seed%3,reflex:c.seed%2,qDone:{},sessions:{intervals:0,lifts:0,reflex:0,vision:0},base:270+c.seed*3,best:null,lastReact:null,lastPvtT:null,lastLapses:null};
}
CREW.forEach(initCrew);
const fmtKm=km=>km>=1e6?`${fx(km/1e6,1)} million`:Math.round(km).toLocaleString('en-GB');
const crew=()=>CREW.find(c=>c.id===S.crew);
const replaying=()=>S.view!==DAYS-1;
const H=(id=S.crew)=>S.hist[id].slice(0,S.view+1);
const now=id=>S.hist[id||S.crew][S.view];
const series=(k,n=DAYS,id)=>H(id).slice(-n).map(e=>e[k==='bp'?'sys':k]);
function val(k,e){return k==='bp'?`${Math.round(e.sys)}/${Math.round(e.dia)}`:k==='vis'?'N'+Math.round(e.vis):fx(e[k],M[k].d)}
const massPct=e=>(e.mass/BASE[e.cid].mass.m-1)*100;
function personal(k,e){const m=M[k];if(!m.dir||!e.cid)return null;const kk=k==='bp'?'sys':k,b=BASE[e.cid][kk];if(!b)return null;const z=(e[kk]-b.m)/b.sd;return m.dir*z>=2.5?{z,b,dl:e[kk]-b.m}:null}
function rawStat(k,e){
  if(k==='bp')return e.sys>=160||e.dia>=100||e.sys<80?'r':e.sys>=130||e.dia>=85||e.sys<90?'a':'g';
  if(k==='vis')return e.ams?'r':M.vis.st(e.vis);
  if(k==='mass'){const p=massPct(e);return p<=-10?'r':p<=-5?'a':'g'}
  return M[k].st(e[k]);
}
function stat(k,e){let s=rawStat(k,e);if(s==='r'&&e._unc&&e._unc[k])s='a';else if(s==='g'&&personal(k,e))s='a';return s}
function statNote(k,e){
  if(e._unc&&e._unc[k]&&rawStat(k,e)==='r')return 'Unconfirmed reading. Measure again to confirm it.';
  if(k==='vis'&&e.ams)return 'The Amsler grid showed wavy or missing lines.';
  if(k==='mass')return `${massPct(e)>=0?'+':''}${fx(massPct(e),1)}% since launch.`;
  const p=personal(k,e);
  if(p&&rawStat(k,e)==='g')return `Unusual for you. Your pre-flight baseline is ${k==='bp'?Math.round(p.b.m)+' systolic':k==='vis'?'N'+p.b.m:fx(p.b.m,M[k].d)+' '+M[k].u}.`;
  return '';
}
const bandOf=(k,id)=>typeof M[k].band==='function'?M[k].band(id||S.crew):M[k].band;
function wk(k,id){const h=H(id),kk=k==='bp'?'sys':k;return{last:avg(h.slice(-7).map(e=>e[kk])),prev:avg(h.slice(-14,-7).map(e=>e[kk]))}}

/* ---------- body regions ---------- */
const REG={
 mind:{n:'Brain and mind',ico:'brain',keys:['mood','sleep','fat','pvt'],haz:['Isolation and confinement','Distance from Earth'],x:100,y:19,glow:[[100,24,22,18]],
   space:'Months of confinement, distance from home and a broken day and night cycle can lower mood, sleep quality and attention.',
   rec:{g:['Keep your current sleep and wind-down routine.','Plan one shared activity with the crew this week.'],
        a:['Protect an 8 hour sleep window and dim cabin lights an hour before bed.','Book a private family call in the next comms window.'],
        r:['Speak with the Crew Medical Officer today.','Request a behavioural health check-in with the ground team.']}},
 eyes:{n:'Eyes',ico:'eye',keys:['vis'],haz:['Altered gravity','Space radiation'],x:100,y:39,glow:[[92,39,7,5],[108,39,7,5]],
   space:'In microgravity fluid shifts toward the head and can swell the back of the eye and the optic nerve (SANS). Near vision often blurs first.',
   rec:{g:['Do the vision check once a week.','Wear your space anticipation glasses for close work if prescribed.'],
        a:['Repeat the vision check in 2 days.','Tell the CMO. An eye ultrasound can check the back of the eye.'],
        r:['Alert the Crew Medical Officer today.','Avoid an EVA until the CMO has checked your eyes.']}},
 immune:{n:'Immune system',ico:'shield',keys:['temp'],haz:['Space radiation','Closed environment'],x:100,y:72,glow:[[100,72,12,8]],
   space:'Radiation and stress weaken immunity, and a shared cabin lets germs spread. Dormant viruses can wake up.',
   rec:{g:['Keep up hand hygiene and surface wipe-downs.','Keep sleep regular to support immunity.'],
        a:['Re-check your temperature in 4 hours.','Drink more and keep exercise light today.'],
        r:['Alert the Crew Medical Officer now.','Rest in your quarters and re-check temperature every 2 hours.']}},
 heart:{n:'Heart and lungs',ico:'heart',keys:['hr','bp','spo2'],haz:['Altered gravity','Closed environment'],x:111,y:108,glow:[[100,113,36,24]],
   space:'Fluids shift toward the head and the heart works less, so it can lose conditioning. Cabin air quality sets your oxygen level.',
   rec:{g:['Keep 30 min of cardio on the cycle daily.','Keep up your hydration.'],
        a:['Rest seated for 10 minutes, then measure again.','Cut caffeine today and add 500 ml of water.'],
        r:['Stop hard activity and measure again in 15 minutes.','Alert the Crew Medical Officer if readings stay high.']}},
 metab:{n:'Metabolism',ico:'flame',keys:['glu','water','mass','kcal'],haz:['Distance from Earth'],x:100,y:168,glow:[[100,168,28,26]],
   space:'Appetite and taste change in space, and less movement makes blood sugar harder to manage.',
   rec:{g:['Keep protein in every meal.','Keep fluids at 2.5 L or more a day.'],
        a:['Swap one sugary snack for nuts or protein.','Add one extra snack a day if your mass is dropping.'],
        r:['Re-test glucose before your next meal.','Ask the Crew Medical Officer about diet changes.']}},
 muscle:{n:'Muscles',ico:'dumbbell',keys:['ex'],haz:['Altered gravity'],x:47,y:138,glow:[[48,140,11,36],[152,140,11,36]],
   space:'Muscles that hold you up on Earth have little to do in microgravity and shrink within weeks without training.',
   rec:{g:['Keep about 2 hours of resistance and cardio daily.','Add 10 minutes of mobility after workouts.'],
        a:['Play a Train session now. Every minute counts toward your 120.','Book exercise slots so they survive schedule changes.'],
        r:['Exercise is too low to protect muscle.','Review your plan with the flight surgeon.']}},
 bones:{n:'Bones',ico:'bone',keys:['bone'],haz:['Altered gravity','Space radiation'],x:83,y:318,glow:[[84,320,13,82],[116,320,13,82]],
   space:'Bones that carry no weight can lose about 1% of their density each month in space (NASA).',
   rec:{g:['Keep heavy squats and deadlifts at the prescribed load.','Keep vitamin D and calcium on target.'],
        a:['Raise resistance load toward your prescription.','Check vitamin D with the flight surgeon.'],
        r:['Bone loss is faster than expected.','Book a bone health review with the ground team.']}}
};
const PAINLOC=[['Head','mind'],['Eyes','eyes'],['Teeth or jaw','immune'],['Throat','immune'],['Skin','immune'],['Chest','heart'],['Belly','metab'],['Side or kidney area','metab'],['Arms','muscle'],['Legs','muscle'],['Back','bones'],['Joints','bones']];
const painFor=(r,id=S.crew)=>replaying()?null:(S.pain[id]||[]).filter(p=>p.region===r&&Date.now()-p.t<DAY).at(-1)||null;
const painStat=(r,id)=>{const p=painFor(r,id);return !p?'g':p.score>=8?'r':p.score>=4?'a':'g'};
const lastOrtho=(id=S.crew)=>replaying()?null:(S.ortho[id]||[]).filter(o=>Date.now()-o.t<2*DAY).at(-1)||null;
const regStat=(r,id=S.crew)=>worst([...REG[r].keys.map(k=>stat(k,now(id))),painStat(r,id),r==='heart'&&lastOrtho(id)?lastOrtho(id).lvl:'g']);

/* ---------- pattern detection (rules, on board) ---------- */
function detect(id=S.crew){
  const e=now(id),R=[],d=k=>{const w=wk(k,id);return w.last-w.prev};
  const sl=d('sleep'),hr=d('hr'),md=d('mood');
  if(sl<-.3&&hr>3&&md<-.3){
    const red=e.sleep<6&&e.mood<2.8;
    R.push({id:'fatigue',lvl:red?'r':'a',title:'Early fatigue and stress',region:'mind',
      why:'Sleep is shrinking, resting heart rate is rising and mood is dropping. Each is close to normal alone, but together they often come before burnout or illness. Your vigilance check shows the same trend.',
      sig:[['sleep',sl],['hr',hr],['pvt',d('pvt')]],
      acts:['Protect an 8 hour sleep window for the next 3 nights','Swap one hard session for mobility work','Book a private family call in the next comms window']});
  }
  if(e.temp>=37.8&&e.hr>=90){
    R.push({id:'infection',lvl:'r',title:'Possible infection',region:'immune',
      why:`Temperature is ${fx(e.temp,1)} °C with a resting heart rate of ${fx(e.hr)} bpm and slightly lower oxygen. This combination needs prompt medical review.`,
      sig:[['temp',d('temp')],['hr',hr],['spo2',d('spo2')]],
      acts:['Alert the Crew Medical Officer now','Rest in your quarters and limit contact with crew','Re-check temperature every 2 hours and drink 500 ml of water']});
  }
  const g=wk('glu',id);
  if(g.last>110&&g.last>g.prev){
    R.push({id:'glucose',lvl:g.last>=140?'r':'a',title:'Blood sugar drifting up',region:'metab',
      why:`Your 7 day average glucose is ${fx(g.last)} mg/dL, up from ${fx(g.prev)}. Exercise has also dropped, which lowers how well muscles use sugar.`,
      sig:[['glu',g.last-g.prev],['ex',d('ex')],['water',d('water')]],
      acts:['Cycle for 10 minutes after your two main meals','Swap one sugary snack for protein','Re-test fasting glucose tomorrow morning']});
  }
  const pv=personal('vis',e);
  if(e.ams||pv){
    R.push({id:'sans',lvl:e.ams?'r':'a',title:e.ams?'Distortion on the Amsler grid':'Near vision drifting',region:'eyes',
      why:e.ams?'Lines on the grid looked wavy, bent or missing. This can be a sign of swelling at the back of the eye and needs the CMO today.':`Your smallest readable line is N${e.vis}, worse than your pre-flight N${pv.b.m}. In space this can be an early sign of SANS, swelling at the back of the eye.`,
      sig:[['vis',d('vis')],['bp',d('bp')],['co2',d('co2')]],
      acts:['Tell the CMO. An eye ultrasound can check the back of the eye','Repeat the vision check in 2 days','Use your space anticipation glasses for close work']});
  }
  const mp=massPct(e),kc=wk('kcal',id);
  if(mp<=-2.5&&kc.last<2500){
    R.push({id:'intake',lvl:mp<=-5?'r':'a',title:'Eating less than you need',region:'metab',
      why:`Body mass is ${fx(mp,1)}% since launch and you averaged ${fx(kc.last)} kcal a day this week. Eating too little speeds up muscle and bone loss.`,
      sig:[['mass',d('mass')],['kcal',kc.last-kc.prev],['ex',d('ex')]],
      acts:['Add one extra snack with protein each day','Ask the CMO to review your food choices','Weigh yourself before breakfast for the next 3 days']});
  }
  return R;
}
function overall(id=S.crew){return worst([...Object.keys(REG).map(r=>regStat(r,id)),...detect(id).map(r=>r.lvl)])}
function readinessParts(id=S.crew){
  const e=now(id),parts=[];
  Object.keys(M).forEach(k=>{const x=stat(k,e);if(x!=='g')parts.push([M[k].n,x==='r'?14:6,x])});
  detect(id).forEach(r=>parts.push([r.title,r.lvl==='r'?10:5,r.lvl]));
  return parts.sort((a,b)=>b[1]-a[1]);
}
function readiness(id=S.crew){return clamp(100-readinessParts(id).reduce((s,p)=>s+p[1],0),0,100)}

/* ---------- alerts with a lifecycle ---------- */
function conditions(id=S.crew){
  const e=now(id),A=[];
  detect(id).forEach(r=>A.push({id:r.id,lvl:r.lvl,t:r.title,d:r.acts[0]}));
  Object.keys(M).forEach(k=>{const s=stat(k,e);if(s!=='g'){const n=statNote(k,e);A.push({id:'m-'+k,lvl:s,t:`${M[k].n} ${val(k,e)} ${M[k].u}`.trim(),d:n||`Normal is ${M[k].norm}.`})}});
  if(!replaying()){
    Object.keys(REG).forEach(r=>{const p=painFor(r,id);if(p&&p.score>=4)A.push({id:'pain-'+r,lvl:p.score>=8?'r':'a',t:`Pain ${p.score} of 10, ${p.loc.toLowerCase()}`,d:p.score>=8?'Pain of 8 or more needs the CMO now.':'Rest the area and tell the CMO if it gets worse.'})});
    const o=lastOrtho(id);if(o&&o.lvl!=='g')A.push({id:'ortho',lvl:o.lvl,t:'Stand test: '+o.title,d:o.advice});
  }
  return A.sort((a,b)=>RANK[b.lvl]-RANK[a.lvl]);
}
const ALVIS=['open','recheck','escalated'];
const ALSTATE={open:'Open',recheck:'Re-check due',escalated:'Escalated',ack:'Acknowledged',cleared:'Cleared by CMO',resolved:'Resolved'};
function alertsList(id=S.crew){
  const C=conditions(id);if(replaying())return C;
  const L=S.al[id],t=Date.now(),seen=new Set(),ev=(r,x)=>{r.hist.push({t,ev:x,lvl:r.lvl,title:r.title});if(r.hist.length>30)r.hist.shift()};
  C.forEach(c=>{seen.add(c.id);let r=L[c.id];
    if(!r||r.state==='resolved'){r=L[c.id]={state:'open',lvl:c.lvl,t0:t,title:c.t,hist:[]};ev(r,'Opened')}
    else if(RANK[c.lvl]>RANK[r.lvl]){r.lvl=c.lvl;r.title=c.t;r.state='open';r.t0=t;ev(r,'Got worse, reopened')}
    r.lvl=c.lvl;r.title=c.t;
    if(r.state==='ack'&&t>=r.due){r.state='recheck';ev(r,'Re-check due')}
    c.state=r.state});
  Object.entries(L).forEach(([k,r])=>{if(!seen.has(k)&&r.state!=='resolved'){r.state='resolved';ev(r,'Resolved, back in range')}});
  return C.filter(c=>ALVIS.includes(c.state));
}
function alEvent(id,aid,state,ev){const r=S.al[id][aid];if(!r)return;r.state=state;r.hist.push({t:Date.now(),ev,lvl:r.lvl,title:r.title})}
function ackAlert(aid,id=S.crew){
  const r=S.al[id][aid];if(!r)return;const mins=r.lvl==='r'?30:240;r.due=Date.now()+mins*MIN;
  alEvent(id,aid,'ack',`Acknowledged, re-check at ${hm(r.due)}`);
  addRecheck(id,{aid,k:aid.startsWith('m-')?aid.slice(2):null,due:r.due,t:`Re-check: ${r.title}`});
}
const ESC_MS=10*MIN;
function addRecheck(id,x){const L=S.rechecks[id],i=L.findIndex(r=>(x.k&&r.k===x.k)||(x.aid&&r.aid===x.aid));if(i>=0)L.splice(i,1);L.push(Object.assign({c:Date.now()},x))}
function doneRecheck(id,k){S.rechecks[id]=S.rechecks[id].filter(r=>r.k!==k)}
function priorities(){
  const id=S.crew,out=[],seen=new Set(),add=(t,why)=>{if(!seen.has(t)&&out.length<4){seen.add(t);out.push([t,why])}};
  if(!replaying()){
    S.rechecks[id]=S.rechecks[id].filter(r=>!(r.aid&&S.al[id][r.aid]&&S.al[id][r.aid].state==='resolved'));
    S.rechecks[id].slice().sort((a,b)=>a.due-b.due).forEach(r=>add(r.t,Date.now()>=r.due?`Overdue since ${hm(r.due)}`:`Due at ${hm(r.due)} ship time`));
    if(new Date().getHours()>=10&&!S.missions[id][0])add('Log your morning vitals','Missed. It was due at 08:00');
  }
  detect().sort((a,b)=>RANK[b.lvl]-RANK[a.lvl]).forEach(r=>add(r.acts[0],r.title));
  const riskRegs=new Set(detect().map(r=>r.region));
  Object.keys(REG).filter(k=>regStat(k)!=='g'&&!riskRegs.has(k)).sort((a,b)=>RANK[regStat(b)]-RANK[regStat(a)]).forEach(k=>add(REG[k].rec[regStat(k)][0],REG[k].n));
  if(out.length<3)add('Log your evening mood and sleep','Daily routine');
  if(out.length<3)add('Drink 2.5 L of water today','Daily routine');
  return out;
}
/* logging streak with one grace day per week, and data completeness */
function streak(id=S.crew){
  const L=S.logged[id];let n=0,missW=0,graceLeft=1;
  for(let i=0;i<120;i++){const d=new Date();d.setDate(d.getDate()-i);const k=dayKey(d);
    if(i===0&&!L.has(k))continue;
    const w=Math.floor(i/7);if(w>0&&i%7===0)missW=0;
    if(L.has(k))n++;else{missW++;if(w===0)graceLeft=0;if(missW>1)break}}
  let c=0;for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()-i);if(L.has(dayKey(d)))c++}
  return {n,graceLeft,complete:c};
}

let tt;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),3200)}

/* =========================================================
   STORAGE: IndexedDB, encrypted per astronaut (AES-GCM, key
   from the passcode with PBKDF2). Each crew record also writes
   a summary encrypted to the CMO's public key (RSA-OAEP), so
   only the CMO can read the crew roster.
   ========================================================= */
const CRYPTO_OK=!!(window.crypto&&crypto.subtle&&window.indexedDB);
const te=new TextEncoder(),td=new TextDecoder();
const b64=u=>{u=new Uint8Array(u);let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const DB={db:null,
  open(){return new Promise((res,rej)=>{const q=indexedDB.open('halo',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{this.db=q.result;res()};q.onerror=()=>rej(q.error)})},
  get(k){return new Promise((res,rej)=>{if(!this.db)return res(undefined);const q=this.db.transaction('kv').objectStore('kv').get(k);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)})},
  put(k,v){return new Promise((res,rej)=>{if(!this.db)return res();const tx=this.db.transaction('kv','readwrite');tx.objectStore('kv').put(v,k);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)})}};
async function deriveKey(pin,salt){const base=await crypto.subtle.importKey('raw',te.encode(pin),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:unb64(salt),iterations:150000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function encBytes(key,bytes){const iv=crypto.getRandomValues(new Uint8Array(12));return {iv:b64(iv),ct:b64(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,bytes))}}
async function decBytes(key,b){return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(b.iv)},key,unb64(b.ct)))}
const encJSON=(key,o)=>encBytes(key,te.encode(JSON.stringify(o)));
const decJSON=async(key,b)=>JSON.parse(td.decode(await decBytes(key,b)));
async function shareEnc(pub,o){const k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt','decrypt']);const raw=await crypto.subtle.exportKey('raw',k);return Object.assign({wk:b64(await crypto.subtle.encrypt({name:'RSA-OAEP'},pub,raw))},await encJSON(k,o))}
async function shareDec(priv,b){const raw=await crypto.subtle.decrypt({name:'RSA-OAEP'},priv,unb64(b.wk));const k=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);return decJSON(k,b)}
let META={salt:{},check:{}},cmoPub=null;
const newSalt=()=>b64(crypto.getRandomValues(new Uint8Array(16)));
async function saveMeta(){
  if(S.store==='encrypted'){META.env=S.env;delete META.ai;await DB.put('meta',META).catch(()=>{})}
  else try{localStorage.setItem('halo.meta',JSON.stringify({env:S.env}))}catch(e){}
}
async function initStore(){
  if(!CRYPTO_OK){S.store='memory';try{const m=JSON.parse(localStorage.getItem('halo.meta')||'{}');if(m.env)S.env=m.env}catch(e){}return}
  try{
    await DB.open();META=(await DB.get('meta'))||{salt:{},check:{}};
    CREW.forEach(c=>{if(!META.salt[c.id])META.salt[c.id]=newSalt()});
    if(META.env&&ENV[META.env])S.env=META.env;
    const cmo=CREW.find(isCMO);
    if(!META.cmoPub){
      const kp=await crypto.subtle.generateKey({name:'RSA-OAEP',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['encrypt','decrypt']);
      META.cmoPub=b64(await crypto.subtle.exportKey('spki',kp.publicKey));
      const k=await deriveKey('1969',META.salt[cmo.id]);
      META.cmoPriv=await encBytes(k,new Uint8Array(await crypto.subtle.exportKey('pkcs8',kp.privateKey)));
      if(!META.check[cmo.id])META.check[cmo.id]=await encJSON(k,'HALO');
    }
    cmoPub=await crypto.subtle.importKey('spki',unb64(META.cmoPub),{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt']);
    S.store='encrypted';await DB.put('meta',META);
  }catch(err){console.warn('HALO storage',err);S.store='memory'}
}
async function unlock(code){
  const id=S.crew;
  if(S.store!=='encrypted')return code==='1969';
  const key=await deriveKey(code,META.salt[id]);
  if(META.check[id]){try{if(await decJSON(key,META.check[id])!=='HALO')return false}catch(e){return false}}
  else{if(code!=='1969')return false;META.check[id]=await encJSON(key,'HALO');await DB.put('meta',META)}
  S.key=key;
  try{const b=await DB.get('crew:'+id);if(b)applyCrewData(id,await decJSON(key,b))}catch(e){console.warn(e);toast('Your saved record could not be read.')}
  if(isCMO(crew())){
    try{S.cmoPkcs8=await decBytes(key,META.cmoPriv);S.cmoPriv=await crypto.subtle.importKey('pkcs8',S.cmoPkcs8,{name:'RSA-OAEP',hash:'SHA-256'},false,['decrypt']);await loadShares()}catch(e){console.warn(e)}
  }
  return true;
}
async function loadShares(){
  S.shares={};
  for(const c of CREW){if(c.id===S.crew)continue;const b=await DB.get('share:'+c.id);if(b){try{S.shares[c.id]=await shareDec(S.cmoPriv,b)}catch(e){}}}
}
const PERSIST=['log','al','images','rem','pain','meds','vision','ortho','rechecks','consent','disagree','sent','lastSync','queued','xp','cmoNotes','fired'];
function collectCrewData(id){
  const o={v:2,day:dayKey(new Date()),missions:S.missions[id],logged:[...S.logged[id]],chat:S.chat[id].filter(m=>m.who!=='typing').slice(-40),G:G[id]};
  PERSIST.forEach(k=>o[k]=S[k][id]);return o;
}
function applyCrewData(id,d){
  PERSIST.forEach(k=>{if(d[k]!==undefined&&d[k]!==null)S[k][id]=d[k]});
  if(d.day===dayKey(new Date())&&d.missions)S.missions[id]=d.missions;
  if(d.logged)d.logged.forEach(x=>S.logged[id].add(x));
  if(d.chat)S.chat[id]=d.chat;if(d.G)Object.assign(G[id],d.G);
  applyLog(id);
}
/* replay every logged reading onto the day it was taken */
function applyLog(id){
  const byDay={};S.hist[id].forEach(e=>byDay[dayKey(e.d)]=e);
  S.log[id].slice().sort((a,b)=>a.t-b.t).forEach(x=>{const e=byDay[dayKey(x.t)];if(!e)return;
    if(x.k==='bp'){e.sys=x.v;e.dia=x.v2}else e[x.k]=x.v;
    e._unc=e._unc||{};if(x.unc)e._unc[x.k]=true;else delete e._unc[x.k]});
}
function crewSummary(id){
  const e=now(id),con=S.consent[id];
  return {id,t:Date.now(),env:S.env,status:overall(id),ready:readiness(id),
    alerts:alertsList(id).map(a=>({id:a.id,lvl:a.lvl,t:a.t,d:a.d,state:a.state||'open'})),
    vit:['hr','bp','glu','temp','spo2','sleep','ex','vis','mass'].map(k=>[k,val(k,e),stat(k,e)]),
    mood:con.mood?[val('mood',e),stat('mood',e)]:null,
    cog:con.cog?{fat:[val('fat',e),stat('fat',e)],pvt:[val('pvt',e),stat('pvt',e)]}:null,
    pain:Object.keys(REG).map(r=>painFor(r,id)).filter(Boolean).map(p=>({loc:p.loc,score:p.score,t:p.t})),
    meds:S.meds[id].slice(-3),lastLog:(S.log[id].at(-1)||{}).t||null};
}
let saveT=null;
function scheduleSave(){if(S.store!=='encrypted'||!S.key||!S.crew)return;clearTimeout(saveT);saveT=setTimeout(saveNow,700)}
async function saveNow(){
  clearTimeout(saveT);saveT=null;if(S.store!=='encrypted'||!S.key||!S.crew)return;const id=S.crew;
  try{await DB.put('crew:'+id,await encJSON(S.key,collectCrewData(id)));
    if(cmoPub&&!isCMO(crew())&&!replaying())await DB.put('share:'+id,await shareEnc(cmoPub,crewSummary(id)))}catch(e){console.warn(e)}
}
async function wipeSession(){
  await saveNow();
  if(S.store==='encrypted'){const c=crew();if(c)initCrew(c)}
  S.key=null;S.cmoPriv=null;S.cmoPkcs8=null;S.shares={};S.crewSel=null;
}
async function changePin(oldp,newp){
  const id=S.crew;if(S.store!=='encrypted')return 'nostore';
  const k0=await deriveKey(oldp,META.salt[id]);
  try{if(await decJSON(k0,META.check[id])!=='HALO')return 'wrong'}catch(e){return 'wrong'}
  META.salt[id]=newSalt();const k=await deriveKey(newp,META.salt[id]);META.check[id]=await encJSON(k,'HALO');
  if(isCMO(crew())&&S.cmoPkcs8)META.cmoPriv=await encBytes(k,S.cmoPkcs8);
  S.key=k;await DB.put('meta',META);await saveNow();return 'ok';
}

/* ---------- recording a reading ---------- */
const CONFIRM=['hr','bp','glu','temp','spo2','mass','co2','water','kcal'];
const CRIT={hr:v=>v>=150||v<35,bp:(s,d)=>s>=180||d>=120||s<70,glu:v=>v<45||v>=300,temp:v=>v>=39.5||v<34,spo2:v=>v<88};
const SRC={manual:'Typed in',wearable:'Wearable',bt:'Bluetooth strap',cam:'Camera estimate',ocr:'Photo of the device',self:'Self-rating',halo:'HALO test',game:'HALO workout',buddy:'Health Buddy'};
function needsConfirm(id,k,v,v2){
  if(!CONFIRM.includes(k))return false;
  const e=Object.assign({},now(id));if(k==='bp'){e.sys=v;e.dia=v2}else e[k]=v;
  if(rawStat(k,e)!=='r')return false;
  if(CRIT[k]&&CRIT[k](v,v2))return false;
  const prev=S.log[id].filter(x=>x.k===k&&Date.now()-x.t<2*HOUR).at(-1);
  if(prev){const pe=Object.assign({},e);if(k==='bp'){pe.sys=prev.v;pe.dia=prev.v2}else pe[k]=prev.v;if(rawStat(k,pe)==='r')return false}
  return true;
}
function recordReading(k,v,v2,src,opt={}){
  const id=opt.id||S.crew,e=now(id),t=Date.now(),unc=!!opt.unc;
  if(k==='bp'){e.sys=v;e.dia=v2}else e[k]=v;
  e._unc=e._unc||{};if(unc)e._unc[k]=true;else delete e._unc[k];
  S.log[id].push({t,k,v,v2:v2==null?null:v2,src,unc,by:(CREW.find(c=>c.id===id)||{}).name});
  if(S.log[id].length>3000)S.log[id].shift();
  doneRecheck(id,k);
  if(unc)addRecheck(id,{k,due:t+10*MIN,t:`Measure ${M[k].n.toLowerCase()} again to confirm`});
  if(src!=='wearable')S.logged[id].add(dayKey(t));
}

/* =========================================================
   LOGIN
   ========================================================= */
function renderLogin(){
  $('#logo1').innerHTML=LOGO;
  $('#profiles').innerHTML=CREW.map(c=>`<button class="profile" data-act="pick" data-id="${c.id}"><span class="av">${c.id}</span><span style="flex:1"><span style="display:block;font-weight:500">${c.name}</span><span class="muted small">${c.role}</span></span>${I('arrow','sm')}</button>`).join('');
}
function showCode(){
  const c=crew();$('#step1').hidden=true;$('#step2').hidden=false;
  $('#selProfile').innerHTML=`<span class="av">${c.id}</span><div><div style="font-weight:500">${c.name}</div><div class="muted small">${c.role}</div></div>`;
  const ins=$$('#code input');ins.forEach(i=>{i.value='';i.dataset.v=''});ins[0].focus();
  $('#codeMsg').textContent='Enter your passcode. Demo: 1969';$('#codeMsg').style.color='';
}
$$('#code input').forEach((inp,i,all)=>{
  // several digits at once (fast typing, paste, autofill) spread over the next boxes
  inp.addEventListener('input',()=>{let d=inp.value.replace(/\D/g,'');const prev=inp.dataset.v||'';inp.value='';
    if(prev&&d.length===2)d=d[0]===prev?d[1]:d[0]; // typed over a filled box: keep only the new digit
    let j=i;for(const ch of d.slice(0,4-i)){all[j].value=ch;all[j].dataset.v=ch;j++}
    if(!d)inp.dataset.v='';
    if(d)all[Math.min(j,3)].focus();
    const code=all.map(x=>x.value).join('');if(code.length===4)checkCode(code)});
  inp.addEventListener('keydown',e=>{if(e.key==='Backspace'&&!inp.value&&i>0)all[i-1].focus()});
});
async function checkCode(code){
  const box=$('#code');$('#codeMsg').textContent='Checking';$('#codeMsg').style.color='';
  let ok=false;try{ok=await unlock(code)}catch(e){console.warn(e)}
  if(!ok){box.className='code err shake';$('#codeMsg').textContent='That passcode is not right. The demo default is 1969.';$('#codeMsg').style.color='var(--st-r)';
    setTimeout(()=>{box.className='code';$$('#code input').forEach(x=>{x.value='';x.dataset.v=''});$('#code input').focus()},500);return}
  $('#codeMsg').textContent=S.store==='encrypted'?'Unlocking your encrypted on-board record':'Loading your on-board record';$('#codeMsg').style.color='var(--st-g)';
  setTimeout(enter,300);
}
function enter(){
  $('#login').hidden=true;$('#app').hidden=false;$('#buddyFab').hidden=false;
  S.tab='today';S.region=null;S.view=DAYS-1;render();
  const red=alertsList().filter(a=>a.lvl==='r').length;
  if(red)toast(`${red} urgent alert${red>1?'s':''} need${red>1?'':'s'} your attention`);
  else if(S.store!=='encrypted')toast('On-board storage is not available here, so this session is not saved.');
  loadKB();
}

/* =========================================================
   SHELL
   ========================================================= */
const TABS=[['today','Today'],['body','Body'],['trends','Trends'],['train','Train'],['routine','Routine']];
const tabs=()=>isCMO(crew())?[...TABS,['crew','Crew']]:TABS;
const linkState=()=>S.blackoutUntil>Date.now()?'blackout':S.online?'up':'offline';
const LINKTXT={up:'link up',offline:'offline',blackout:'blackout'};
function render(){
  const c=crew(),al=alertsList();
  if(S.tab==='crew'&&!isCMO(c))S.tab='today';
  $('#logo2').innerHTML=LOGO;
  $('#nav').innerHTML=tabs().map(([k,l])=>`<button role="tab" aria-selected="${S.tab===k}" data-act="tab" data-v="${k}">${l}</button>`).join('');
  $('#logBtn').innerHTML=`${I('plus','sm')}Log reading`;$('#logBtn').disabled=replaying();
  $('#linkBtn').innerHTML=`${I('sat','sm')}<b>${env().n}</b><span class="hide">${LINKTXT[linkState()]}</span>`;
  $('#linkBtn').setAttribute('aria-label',`Mission: ${env().long}, ground link ${LINKTXT[linkState()]}`);
  $('#bell').innerHTML=I('bell')+(al.length?`<span class="count ${al.some(a=>a.lvl==='r')?'':'a'}">${al.length}</span>`:'');
  $('#bell').setAttribute('aria-label',`Alerts, ${al.length} open`);
  $('#me').innerHTML=`<span class="av" style="width:36px;height:36px">${c.id}</span>`;
  $('#me').setAttribute('aria-label',`${c.name}, log out`);
  $('#buddyFab').innerHTML=`${I('chat')}<span class="lbl">Health Buddy</span>`;
  const v=$('#view');v.className='';void v.offsetWidth;v.className='view';
  v.innerHTML=replayBar()+({today:vToday,body:vBody,trends:vTrends,train:vTrain,routine:vRoutine,crew:vCrew}[S.tab]||vToday)();
  requestAnimationFrame(()=>$$('.chart').forEach(drawChart));
  scheduleSave();
}
function replayBar(){
  if(!replaying())return '';const e=now();
  return `<div class="panel row spread" style="margin-bottom:var(--space-lg);padding:var(--space-md) var(--space-lg);flex-wrap:wrap" role="status"><span class="row">${I('play','sm')}<span>Replay: mission day <span class="measure">${mday(e)}</span>, ${e.d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}. Logging is paused.</span></span><span class="row" style="gap:var(--space-xs)"><button class="btn btn--sm" data-act="replayTog">${RP.int?'Pause':'Play'}</button><button class="btn btn--sm btn--primary" data-act="replayEnd">Back to today</button></span></div>`;
}

/* =========================================================
   TODAY: status, why, what to do
   ========================================================= */
function vToday(){
  const c=crew(),e=now(),ov=overall(),risks=detect().sort((a,b)=>RANK[b.lvl]-RANK[a.lvl]),hr=new Date().getHours();
  const greet=hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  const red=alertsList().find(a=>a.lvl==='r');
  const worstVital=VITALS.map(k=>[k,stat(k,e)]).sort((a,b)=>RANK[b[1]]-RANK[a[1]])[0];
  const reason=risks[0]?risks[0].title+'.':ov==='g'?LVTXT.g:`${M[worstVital[0]].n} is outside its usual range.`;
  const date=e.d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  const parts=readinessParts();
  return `
  ${red?`<div class="urgent" role="alert">${I('stop','lg')}<div class="t"><b>${esc(red.t)}</b><div class="small" style="color:var(--color-ink-2)">${esc(red.d)}${red.state==='escalated'?' Escalated to the CMO because it was not acknowledged.':''}</div><div class="small" style="color:var(--color-ink-2)">${esc(escText())}</div></div><button class="btn btn--sm" data-act="ack" data-v="${red.id}">Acknowledge</button><button class="btn btn--sm btn--primary" data-act="cmo">Alert the CMO</button></div>`:''}
  <div class="today">
    <section class="panel" aria-labelledby="hello">
      <div class="row spread"><time class="muted small">${date}, mission day ${mday(e)}</time></div>
      <h1 class="hello" id="hello">${greet}, ${c.first}</h1>
      <div class="statusBlock ${ov}">${I(STI[ov])}<span class="statusWord">${LV[ov]}</span>
        <span class="ready"><span class="measure">${readiness()}</span><span class="muted small">readiness<br>estimate</span></span></div>
      <p class="reason">${esc(reason)}</p>
      <div class="row" style="flex-wrap:wrap">
        ${risks[0]?`<button class="btn btn--primary" data-act="openPattern" data-v="${risks[0].id}">See why</button>`:`<button class="btn btn--primary" data-act="tab" data-v="body">Check your body map</button>`}
        <button class="btn btn--ai" data-act="buddy">${I('chat','sm')}Ask Health Buddy</button>
        <button class="btn" data-act="eva">${I('ok','sm')}EVA go/no-go</button>
      </div>
      <details class="more"><summary>How the readiness estimate is worked out ${I('down','sm')}</summary><div class="inner">
        <p class="small">It starts at 100. Each reading on Watch takes off 6, each Urgent reading 14, and each pattern 5 or 10.</p>
        <div style="margin-top:var(--space-sm)">${parts.length?parts.map(([n,p,s])=>`<div class="kv"><span class="row" style="gap:var(--space-xs)">${stTag(s,'small')}<span>${esc(n)}</span></span><span class="measure">-${p}</span></div>`).join(''):`<div class="kv"><span>No deductions</span><span class="measure">0</span></div>`}
        <div class="kv"><span style="color:var(--color-ink)">Readiness estimate</span><span class="measure" style="color:var(--color-ink)">${readiness()}</span></div></div>
      </div></details>
    </section>
    <section class="panel" aria-labelledby="prioH">
      <h2 id="prioH">Do today</h2>
      <ol class="prio">${priorities().map(([t,w],i)=>`<li><span class="n">${i+1}</span><span>${esc(t)}<span class="why">${esc(w)}</span></span></li>`).join('')}</ol>
    </section>
  </div>
  <section aria-label="Core vitals">
    <div class="vitals">${VITALS.map(k=>{const s=stat(k,e);
      return `<button class="vital" data-act="vital" data-v="${k}" aria-label="${M[k].n} ${val(k,e)} ${M[k].u}, ${LV[s]}"><span class="lbl">${M[k].n}</span><span><span class="val">${val(k,e)}</span><span class="u">${M[k].u}</span></span>${stTag(s)}</button>`}).join('')}</div>
  </section>`;
}

/* =========================================================
   BODY
   ========================================================= */
function bodySVG(sel,id){
  const L=`M68 228 C66 262 70 292 74 318 C75 342 72 372 76 400 C73 410 66 418 71 424 L92 424 C95 415 92 405 90 398 C92 370 96 344 95 318 C97 290 100 262 99 234 Z`;
  const A=`M62 84 C50 90 46 110 46 132 C44 152 42 166 40 182 C38 198 36 212 34 224 C31 234 30 241 34 247 C38 251 43 245 43 236 C45 224 49 210 53 196 C57 180 59 165 61 150 C62 130 63 112 66 96 Z`;
  const T=`M92 70 C80 74 67 76 60 84 C54 93 56 110 60 128 C64 150 66 170 70 190 C66 204 66 216 68 230 L132 230 C134 216 134 204 130 190 C134 170 136 150 140 128 C144 110 146 93 140 84 C133 76 120 74 108 70 Z`;
  const glow=sel?REG[sel].glow.map(([x,y,rx,ry])=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#glow-${regStat(sel,id)})"/>`).join(''):'';
  const hots=Object.entries(REG).map(([k,r])=>{const s=regStat(k,id);return `<g class="hot ${s}" data-act="region" data-v="${k}" role="button" tabindex="0" aria-label="${r.n}, ${LV[s]}">
    <circle cx="${r.x}" cy="${r.y}" r="12" fill="transparent"/>
    ${k===sel?`<circle class="ring" cx="${r.x}" cy="${r.y}" r="10"/>`:''}
    <circle class="core" cx="${r.x}" cy="${r.y}" r="${s==='g'?5:6.5}"/></g>`}).join('');
  return `<svg viewBox="0 0 200 450" class="diagram" role="group" aria-label="Body map diagram">
  <defs>${['g','a','r'].map(s=>`<radialGradient id="glow-${s}"><stop offset="0" class="glow-${s}" stop-opacity=".45"/><stop offset="1" class="glow-${s}" stop-opacity="0"/></radialGradient>`).join('')}</defs>
  <g class="body-fill">
    <path d="${A}"/><path d="${A}" transform="translate(200 0) scale(-1 1)"/>
    <path d="${L}"/><path d="${L}" transform="translate(200 0) scale(-1 1)"/>
    <path d="${T}"/><path d="M91 56 L109 56 L110 74 L90 74 Z"/><ellipse cx="100" cy="36" rx="18.5" ry="23"/>
  </g>
  <g class="body-line"><path d="M100 92 V188"/><path d="M78 118 C88 124 96 124 100 120 C104 124 112 124 122 118"/><path d="M80 228 C88 236 96 238 100 236 C104 238 112 236 120 228"/></g>
  ${glow}${hots}</svg>`;
}
const HAZ=[
  ['sun','Space radiation',id=>{const e=now(id);return [stat('rad',e),`Dose ${fx(e.rad,1)} of ${RADLIM} mSv mission limit`]}],
  ['box','Isolation and confinement',id=>{const e=now(id);return [worst([stat('mood',e),stat('fat',e)]),`Mood ${fx(e.mood,1)} of 5, fatigue ${e.fat} of 7, sleep ${fx(e.sleep,1)} h`]}],
  ['globe','Distance from Earth',()=>[linkState()==='blackout'?'a':'g',`Records and protocols work offline. Ground link ${LINKTXT[linkState()]}, replies take about ${replyText()}.`]],
  ['grav','Altered gravity',id=>{const e=now(id);return [worst([stat('bone',e),stat('ex',e),stat('vis',e)]),`${env().g}. Bone ${fx(e.bone,1)}%, exercise ${fx(e.ex)} min, near vision ${val('vis',e)}`]}],
  ['air','Closed environment',id=>{const e=now(id);return [worst([stat('spo2',e),stat('co2',e)]),`Oxygen ${fx(e.spo2,1)}%, cabin CO2 ${Math.round(e.co2).toLocaleString('en-GB')} ppm`]}]];
function readingRow(k,e){const s=stat(k,e),n=statNote(k,e);
  return `<button class="reading" data-act="vital" data-v="${k}"><span class="st ${s}">${I(STI[s])}</span><span>${M[k].n}<span class="muted small" style="display:block">Normal ${M[k].norm}${n?'. '+esc(n):''}</span></span><span class="rv">${val(k,e)}<small>${M[k].u}</small></span></button>`}
function vBody(){
  const e=now();
  if(!S.region){S.region=Object.keys(REG).sort((a,b)=>RANK[regStat(b)]-RANK[regStat(a)])[0]}
  const r=REG[S.region],rs=regStat(S.region),p=painFor(S.region),o=S.region==='heart'?lastOrtho():null;
  return `<div class="bodyGrid">
    <section class="figure" aria-label="Body map">
      ${bodySVG(S.region,S.crew)}
      <div class="regions" role="group" aria-label="Choose a body area">${Object.entries(REG).map(([k,x])=>{const s=regStat(k);return `<button aria-pressed="${k===S.region}" data-act="region" data-v="${k}"><span class="st ${s}">${I(STI[s])}</span>${x.n}</button>`}).join('')}</div>
    </section>
    <section class="panel" aria-labelledby="regH">
      <div class="row spread" style="flex-wrap:wrap"><h1 id="regH" style="font-size:var(--text-2xl)">${r.n}</h1>${stChip(rs)}</div>
      <div style="margin-top:var(--space-lg)">${r.keys.map(k=>readingRow(k,e)).join('')}
        ${p?(()=>{const ps=painStat(S.region);return `<button class="reading" data-act="pain" data-v="${S.region}"><span class="st ${ps}">${I(STI[ps])}</span><span>Pain, ${esc(p.loc.toLowerCase())}<span class="muted small" style="display:block">Logged ${hm(p.t)} ship time, started ${esc(p.onset.toLowerCase())}${p.note?'. '+esc(p.note):''}</span></span><span class="rv">${p.score}<small>of 10</small></span></button>`})():''}
        ${o?`<button class="reading" data-act="ortho"><span class="st ${o.lvl}">${I(STI[o.lvl])}</span><span>Stand test<span class="muted small" style="display:block">${esc(o.title)}, ${hm(o.t)} ship time</span></span><span class="rv">${o.dSys>0?'-':'+'}${Math.abs(o.dSys)}<small>mmHg</small></span></button>`:''}
      </div>
      <h2 class="sub">What to do</h2>
      <ul class="todo">${r.rec[rs].map(t=>`<li>${I('check','sm')}<span>${t}</span></li>`).join('')}</ul>
      <div class="row" style="margin-top:var(--space-lg);flex-wrap:wrap">
        <button class="btn btn--ai btn--sm" data-act="buddyAbout" data-v="${S.region}">${I('chat','sm')}Report a symptom here</button>
        <button class="btn btn--sm" data-act="pain" data-v="${S.region}">Log pain here</button>
        ${S.region==='eyes'?`<button class="btn btn--sm" data-act="game" data-v="vision">${I('eye','sm')}Vision check</button>`:''}
        ${S.region==='heart'?`<button class="btn btn--sm" data-act="ortho">${I('grav','sm')}Stand test</button>`:''}
        ${S.region==='mind'?`<button class="btn btn--sm" data-act="game" data-v="reflex">${I('clock','sm')}Vigilance check</button>`:''}
      </div>
      <details class="more"><summary>Why it matters in space ${I('down','sm')}</summary><div class="inner"><p>${r.space}</p>${S.region==='bones'?`<p style="margin-top:var(--space-xs)">${boneNote()}</p>`:''}<p class="muted small" style="margin-top:var(--space-sm)">Hazards: ${r.haz.join(', ')}</p></div></details>
      <details class="more"><summary>The five space hazards today ${I('down','sm')}</summary><div class="inner">
        ${HAZ.map(([ic,n,f])=>{const[s,t]=f(S.crew);return `<div class="haz">${I(ic)}<div style="flex:1"><div style="color:var(--color-ink)">${n}</div><div class="muted small">${t}</div></div>${stTag(s,'small')}</div>`}).join('')}
      </div></details>
    </section>
  </div>`;
}

/* =========================================================
   TRENDS: patterns and history
   ========================================================= */
function spark(vals,cls=''){const mn=Math.min(...vals),mx=Math.max(...vals),r=mx-mn||1;
  return `<svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline class="spark ${cls}" points="${vals.map((v,i)=>`${i/(vals.length-1)*100},${27-(v-mn)/r*24}`).join(' ')}"/></svg>`}
function vTrends(){
  const risks=detect().sort((a,b)=>RANK[b.lvl]-RANK[a.lvl]),k=S.recKey,vals=series(k,S.recN),imgs=S.images[S.crew];
  return `<div class="trends">
    <section class="panel" aria-labelledby="patH">
      <h1 id="patH" style="font-size:var(--text-2xl)">${risks.length?`${risks.length} pattern${risks.length>1?'s':''} found`:'No patterns found'}</h1>
      <p class="muted small" style="margin:var(--space-xs) 0 var(--space-md)">From 30 days of readings, compared with your own pre-flight baseline, checked on board.</p>
      ${risks.length?risks.map(r=>`<details class="pattern" id="pat-${r.id}" ${S.openPat===r.id?'open':''}>
        <summary>${stTag(r.lvl,'small')}<h2>${r.title}</h2></summary>
        <div class="inner">
          <p>${r.why}</p>
          <div class="signals">${r.sig.map(([kk,dl])=>{const m=M[kk],bad=m.dir?m.dir*dl>0:dl<0;return `<div class="sig">${m.n}<b>${dl>=0?'+':'-'}${fx(Math.abs(dl),m.d||1)} ${m.u}</b>${spark(series(kk,14),bad?r.lvl:'')}</div>`}).join('')}</div>
          <h3 class="sub" style="margin:0">What to do</h3>
          <ol class="steps">${r.acts.map((a,i)=>`<li><span class="n">${i+1}</span><span>${a}</span></li>`).join('')}</ol>
          <div class="row" style="flex-wrap:wrap"><button class="btn btn--sm" data-act="goRegion" data-v="${r.region}">Show on body map</button>${S.al[S.crew][r.id]&&ALVIS.includes(S.al[S.crew][r.id].state)?`<button class="btn btn--sm btn--quiet" data-act="ack" data-v="${r.id}">Acknowledge</button>`:''}</div>
        </div></details>`).join(''):`<p>${LVTXT.g} Keep logging daily so HALO can spot changes early.</p>`}
      <details class="more"><summary>Photos and scans for ground review (${imgs.length}) ${I('down','sm')}</summary><div class="inner">${imgs.length?`<div class="thumbs">${imgs.map(im=>{const t=new Date(im.t);return `<figure><img src="${im.src}" alt="${esc(im.tag)}, ${t.toLocaleString('en-GB')}"><figcaption>${esc(im.tag)}<br>${hm(t)} ship time</figcaption></figure>`}).join('')}</div>`:`<p class="small">None yet. Add one from Log reading.</p>`}</div></details>
    </section>
    <section class="panel" aria-labelledby="histH">
      <div class="row spread" style="flex-wrap:wrap;gap:var(--space-sm)">
        <h2 id="histH" class="visually-hidden">History</h2>
        <label class="visually-hidden" for="recKey">Reading</label>
        <select class="pick" id="recKey" data-change="recKey">${Object.keys(M).map(x=>`<option value="${x}" ${x===k?'selected':''}>${M[x].n}</option>`).join('')}</select>
        <div class="seg" role="group" aria-label="Range">${[7,14,30].map(n=>`<button aria-pressed="${S.recN===n}" data-act="recN" data-v="${n}">${n} days</button>`).join('')}</div>
      </div>
      <div class="chart" data-key="${k}" data-n="${S.recN}" role="img" aria-label="${M[k].n} over ${S.recN} days, shaded band is the normal range"></div>
      <div class="stats">${[['Average',avg(vals)],['Lowest',Math.min(...vals)],['Highest',Math.max(...vals)]].map(([l,v])=>`<div><span class="muted small">${l}</span><span class="measure">${k==='vis'?'N'+fx(v):fx(v,M[k].d)} <span class="small muted">${M[k].u}</span></span></div>`).join('')}</div>
      <p class="muted small" style="margin-top:var(--space-md)">${M[k].why}</p>
      <p class="muted xs" style="margin-top:var(--space-xs)">Source: ${M[k].src}</p>
    </section>
  </div>`;
}

/* =========================================================
   ROUTINE: checklist, progress, the rest on request
   ========================================================= */
const CATS={
 sleep:['Sleep',e=>[[e.sleep<7?'Recover lost sleep':'Keep your rhythm',e.sleep<7?`You slept ${fx(e.sleep,1)} h last night. Aim for 8 h for the next 3 nights.`:`${fx(e.sleep,1)} h last night. Keep a steady wake time.`],['Light','Set cabin lights to warm an hour before sleep.'],['Caffeine','None after 13:00 mission time.']]],
 exercise:['Exercise',e=>[['Resistance first',`Aim for 60 min of resistance work. You averaged ${fx(wk('ex').last)} min a day this week.`],['Cardio intervals','30 min on the cycle: 6 rounds of 2 min hard, 2 min easy.'],[e.hr>80?'Go lighter today':'Mobility',e.hr>80?'Resting heart rate is up, so keep effort moderate.':'10 min of hip and spine mobility.']]],
 food:['Food and water',e=>[[e.kcal<2500?'Eat a little more':'Protein at every meal',e.kcal<2500?`You logged ${fx(e.kcal)} kcal. Aim for 2,500 or more, with protein at every meal.`:'It helps protect muscle in microgravity.'],[e.water<2.5?'Drink more today':'On target',e.water<2.5?`You logged ${fx(e.water,1)} L. Aim for 2.5 L or more.`:`${fx(e.water,1)} L logged yesterday.`],['Drink on a schedule','Thirst is weaker in space. One pouch every 90 minutes.']]],
 mind:['Mind',e=>[[e.mood<3.8?'Reach out':'Stay connected',e.mood<3.8?'Your mood has dipped. Book a private call home or a check-in.':'Keep regular calls with family and friends.'],['Earth view','Ten minutes at the window can lower stress.'],['Breathing reset','In 4 seconds, hold 4, out 4, hold 4. Repeat 4 times.']]]
};
function vRoutine(){
  const id=S.crew,ms=S.missions[id],done=ms.filter(Boolean).length,e=now(),st=streak(id),meds=S.meds[id].slice().reverse(),con=S.consent[id];
  return `<div class="routine">
    <section class="panel" aria-labelledby="rtH">
      <h1 id="rtH" style="font-size:var(--text-2xl)">Today's routine</h1>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${ms.length}" aria-valuenow="${done}" aria-label="Tasks done"><i style="transform:scaleX(${done/ms.length})"></i></div>
      <p class="muted small" style="margin-bottom:var(--space-2xs)">${done} of ${ms.length} done</p>
      <p class="muted small" style="margin-bottom:var(--space-md)">Logging streak <span class="measure">${st.n}</span> day${st.n===1?'':'s'}, ${st.graceLeft} grace day left this week. Data logged on <span class="measure">${st.complete}</span> of the last 7 days.</p>
      ${MISSIONS.map(([t,x,ic],i)=>`<button class="task" role="checkbox" aria-checked="${!!ms[i]}" data-act="mission" data-v="${i}"><span class="box">${ms[i]?I('check','sm'):''}</span><span class="t">${t}</span><span class="xp">+${x} pts</span></button>`).join('')}
      <p class="muted xs" style="margin-top:var(--space-md)">Points reward logging and doing the routine, never the values themselves, so there is no reason to round a reading.</p>
    </section>
    <div class="stack">
      <section class="panel" aria-labelledby="remH">
        <h2 id="remH">Reminders</h2>
        <div>${REMS.map(([t,n],i)=>`<div class="rem"><div><div style="color:var(--color-ink)">${n}</div><div class="muted small measure">${t} ship time</div></div><button class="switch" role="switch" aria-checked="${!!S.rem[id][i]}" aria-label="${n} reminder" data-act="rem" data-v="${i}"></button></div>`).join('')}</div>
        <button class="btn btn--sm" data-act="tab" data-v="train" style="margin-top:var(--space-md)">${I('dumbbell','sm')}Open Train for points and badges</button>
        <details class="more"><summary>Medication log (${meds.length}) ${I('down','sm')}</summary><div class="inner">
          ${meds.length?meds.slice(0,8).map(m=>`<div class="kv"><span><span style="color:var(--color-ink)">${esc(m.drug)}</span><span class="muted small" style="display:block">${esc(m.amount)}${m.reason?', '+esc(m.reason):''}</span></span><span class="muted small measure">${new Date(m.t).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} ${hm(m.t)}</span></div>`).join(''):`<p class="small">Nothing logged yet.</p>`}
          <button class="btn btn--sm" data-act="meds" style="margin-top:var(--space-sm)">${I('pill','sm')}Log medication</button></div></details>
        <details class="more"><summary>Privacy ${I('down','sm')}</summary><div class="inner">
          <p class="small">Vital signs and alerts always go to the CMO. Your record is encrypted on board with your passcode.</p>
          ${[['mood','Share my mood with the CMO'],['cog','Share fatigue and vigilance with the CMO']].map(([k,l])=>`<div class="rem"><div style="color:var(--color-ink)">${l}</div><button class="switch" role="switch" aria-checked="${!!con[k]}" aria-label="${l}" data-act="consent" data-v="${k}"></button></div>`).join('')}</div></details>
        <details class="more"><summary>Guides ${I('down','sm')}</summary><div class="inner">
          <div class="seg" role="group" aria-label="Guide topic" style="flex-wrap:wrap;margin-bottom:var(--space-sm)">${Object.entries(CATS).map(([k,v])=>`<button aria-pressed="${S.cat===k}" data-act="cat" data-v="${k}">${v[0]}</button>`).join('')}</div>
          ${CATS[S.cat][1](e).map(([t,p])=>`<div class="tip-card"><h3>${t}</h3><p>${p}</p></div>`).join('')}
        </div></details>
      </section>
    </div>
  </div>`;
}

/* =========================================================
   TRAIN: exercise games and checks (FR-9, AF-5, AF-10)
   ========================================================= */
const kmOf=id=>G[id||S.crew].min*KM_PER_MIN;
function routeSVG(km){
  const lo=5,hi=Math.log10(225e6),X=v=>24+552*clamp((Math.log10(Math.max(v,1e5))-lo)/(hi-lo),0,1),x=X(km);
  return `<svg class="route diagram" viewBox="0 0 600 92" role="img" aria-label="Route diagram from Earth to Mars, log scale. You are ${fmtKm(km)} km along.">
    <circle class="planet" cx="12" cy="40" r="9"/><text x="2" y="80">Earth</text>
    <line class="trk" x1="24" y1="40" x2="576" y2="40"/><line class="done" x1="24" y1="40" x2="${x}" y2="40"/>
    ${STOPS.slice(0,-1).map(([v,n])=>`<circle class="stop ${km>=v?'past':''}" cx="${X(v)}" cy="40" r="5"/>`).join('')}
    <text x="${X(STOPS[0][0])}" y="80" text-anchor="middle">Moon</text><text x="${X(STOPS[1][0])}" y="80" text-anchor="middle">L2</text>
    <circle class="planet" cx="586" cy="40" r="9"/><text x="598" y="80" text-anchor="end">Mars</text>
    <path class="ship" d="M${x+9} 40 L${x-6} 31 L${x-2} 40 L${x-6} 49 Z"/></svg>`;
}
function badgesFor(id){
  const g=G[id],km=kmOf(id),L=S.logged[id];
  const days7=[...Array(7)].every((_,i)=>{const d=new Date();d.setDate(d.getDate()-i-1);return L.has(dayKey(d))});
  return [['star','First orbit','Finish an interval session',g.sessions.intervals>0],['bone','Bone guardian','Finish the lift quest',!!g.qDone.lifts],['pulse','Steady watch','Complete 3 vigilance checks',g.reflex>=3],
    ['globe','Past the Moon','Train 10 minutes',km>=STOPS[0][0]],['eye','Clear sight','Do a vision check',(g.sessions.vision||0)>0],['moon','Faithful logger','Log 7 days in a row',days7]];
}
const GAMES={
 intervals:{n:'Orbit intervals',ico:'pulse',kind:'Cardio',desc:()=>`Push and recover on the ${env().cardio}. Each round fuels your ship.`,dur:()=>env().short?'12 min':'24 min',pts:'+2 per min'},
 lifts:{n:'Gravity lifts',ico:'dumbbell',kind:'Resistance',desc:()=>`Sets on the ${env().res} charge your bone shield.`,dur:()=>env().short?'8 sets':'12 sets',pts:'+2 per min'},
 reflex:{n:'Vigilance check',ico:'clock',kind:'Fit for EVA',desc:()=>'Tap the moment the counter starts. The 3 minute PVT-B from NASA\'s Cognition battery.',dur:()=>'3 min',pts:'+15'},
 vision:{n:'Vision check',ico:'eye',kind:'Eyes',desc:()=>'Near-vision card and Amsler grid, one eye at a time. Weekly, for SANS.',dur:()=>'2 min',pts:'+20'}
};
const CHECKS=['reflex','vision'];
function vTrain(){
  const id=S.crew,g=G[id],km=kmOf(id),next=STOPS.find(x=>x[0]>km)||STOPS[STOPS.length-1],minsTo=Math.max(0,Math.ceil((next[0]-km)/KM_PER_MIN));
  const xp=S.xp[id],lvl=Math.floor(xp/500)+1,urgent=overall()==='r',e=now();
  const crewMin=Math.round(CREW.reduce((a,c)=>a+S.hist[c.id].slice(-7).reduce((b,x)=>b+x.ex,0),0)),crewGoal=3600;
  return `<div class="train">
    <section class="panel" aria-labelledby="roadH">
      <h1 id="roadH" style="font-size:var(--text-2xl)">Road to Mars</h1>
      <p class="muted small" style="margin-top:var(--space-2xs)">Every minute you train moves your ship 40,000 km.</p>
      <div class="kmFig"><span class="measure">${fmtKm(km)}</span><span class="muted">km travelled</span></div>
      ${routeSVG(km)}
      <p>${km>=STOPS[STOPS.length-1][0]?'You reached Mars. Season complete.':`Next stop, ${next[1]}: ${minsTo.toLocaleString('en-GB')} more minutes of training.`}</p>
      <h2 class="sub" style="margin-top:var(--space-xl)">This week's quests</h2>
      <ul class="quests">${Object.entries(QUESTS).map(([k,[t,goal,u,pts]])=>{const v=Math.min(g[k],goal),d=g[k]>=goal;return `<li><div class="row spread"><span>${t}</span><span class="small ${d?'done-q':'muted'}">${d?`${I('check','sm')}`:''}${d?'Done':`+${pts} pts`}</span></div>
        <div class="bar crew" role="progressbar" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${v}" aria-label="${t}"><i style="transform:scaleX(${v/goal})"></i></div><span class="muted small measure">${v} of ${goal} ${u}</span></li>`}).join('')}</ul>
    </section>
    <section class="panel" aria-labelledby="pickH">
      <h2 id="pickH">Pick a workout or check</h2>
      <div class="row spread" style="flex-wrap:wrap;margin-top:var(--space-2xs)"><p class="muted small">Today: <span class="measure">${fx(e.ex)}</span> of 120 minutes.</p><button class="btn btn--sm" data-act="eva">${I('ok','sm')}EVA go/no-go</button></div>
      ${urgent?`<div class="rest-note">${I('stop')}<p class="small">Your status is Urgent, so workouts are paused until the CMO clears you. The vigilance and vision checks are still open.</p></div>`:''}
      ${Object.entries(GAMES).map(([k,x])=>`<button class="game" data-act="game" data-v="${k}" ${(urgent&&!CHECKS.includes(k))||replaying()?'disabled':''}>${I(x.ico)}<span class="gt"><b>${x.n}</b><span class="small muted">${x.desc()}</span></span><span class="gm">${x.dur()}<br>${x.pts}</span></button>`).join('')}
      ${g.lastReact?`<p class="small muted" style="margin-top:var(--space-sm)">Last vigilance check: median <span class="measure">${g.lastReact} ms</span>${g.lastLapses!=null?`, <span class="measure">${g.lastLapses}</span> lapse${g.lastLapses===1?'':'s'}`:''}, ${LV[pvtStat(g.lastReact,g.lastLapses||0,g.base)].toLowerCase()}.</p>`:''}
      <details class="more"><summary><span>Level <span class="measure">${lvl}</span>, ${xp.toLocaleString('en-GB')} points</span> ${I('down','sm')}</summary><div class="inner">
        <div class="bar crew" role="progressbar" aria-valuemin="0" aria-valuemax="500" aria-valuenow="${xp%500}" aria-label="Level progress"><i style="transform:scaleX(${(xp%500)/500})"></i></div>
        <p class="small muted">${500-xp%500} points to level ${lvl+1}. Routine tasks, checks and workouts earn points. Results never do.</p></div></details>
      <details class="more"><summary>Crew relay: power the greenhouse lights ${I('down','sm')}</summary><div class="inner">
        <p>Every crew member's training minutes this week count toward one shared goal. Nobody is ranked.</p>
        <div class="bar crew" role="progressbar" aria-valuemin="0" aria-valuemax="${crewGoal}" aria-valuenow="${crewMin}" aria-label="Crew relay"><i style="transform:scaleX(${Math.min(1,crewMin/crewGoal)})"></i></div>
        <p class="muted small"><span class="measure">${crewMin.toLocaleString('en-GB')}</span> of <span class="measure">${crewGoal.toLocaleString('en-GB')}</span> minutes together</p></div></details>
      <details class="more"><summary>Badges ${I('down','sm')}</summary><div class="inner"><div class="badges">${badgesFor(id).map(([ic,n,d,ok])=>`<div class="badge ${ok?'':'lock'}">${I(ic)}<span style="${ok?'color:var(--color-ink)':''}">${n}</span><span class="xs muted">${ok?'Earned':d}</span></div>`).join('')}</div></div></details>
    </section>
  </div>`;
}

/* =========================================================
   CREW: CMO view (EIMO: decision support on board)
   ========================================================= */
function crewData(cid){
  if(cid===S.crew)return Object.assign(crewSummary(cid),{src:'live'});
  if(S.shares[cid])return Object.assign({},S.shares[cid],{src:'share'});
  return Object.assign(crewSummary(cid),{src:'sim'});
}
function vCrew(){
  const list=CREW.map(c=>[c,crewData(c.id)]),notes=S.cmoNotes[S.crew];
  if(!S.crewSel||!CREW.find(c=>c.id===S.crewSel))S.crewSel=list.slice().sort((a,b)=>RANK[b[1].status]-RANK[a[1].status])[0][0].id;
  const [sc,sd]=list.find(x=>x[0].id===S.crewSel);
  const hidden=(cid,a)=>{const n=notes[cid+'|'+a.id];return n&&RANK[a.lvl]<=RANK[n.lvl]};
  const inbox=list.flatMap(([c,d])=>d.alerts.filter(a=>!hidden(c.id,a)).map(a=>Object.assign({cid:c.id,who:c.first},a))).sort((a,b)=>(b.state==='escalated')-(a.state==='escalated')||RANK[b.lvl]-RANK[a.lvl]);
  const srcTxt={live:'Live, your own record',share:`Encrypted crew record, updated ${sd.t?hm(sd.t):''} ship time`,sim:'Simulated. No on-board record from this crew member yet'};
  const VN={hr:'Heart rate',bp:'Blood pressure',glu:'Glucose',temp:'Temperature',spo2:'Oxygen',sleep:'Sleep',ex:'Exercise',vis:'Near vision',mass:'Body mass'};
  return `<div class="today">
    <section class="panel" aria-labelledby="crewH">
      <h1 id="crewH" style="font-size:var(--text-2xl)">Crew</h1>
      <p class="muted small" style="margin-top:var(--space-2xs)">Crew records are encrypted to the CMO key. Mood, fatigue and vigilance appear only with each person's consent.</p>
      <div class="stack" style="gap:var(--space-xs);margin-top:var(--space-lg)">${list.map(([c,d])=>`<button class="profile" data-act="crewSel" data-v="${c.id}" aria-pressed="${c.id===S.crewSel}" style="${c.id===S.crewSel?'background:var(--color-paper-4)':''}"><span class="av">${c.id}</span><span style="flex:1"><span style="display:block;font-weight:500">${c.name}</span><span class="muted small">Readiness <span class="measure">${d.ready}</span>${d.alerts.length?`, ${d.alerts.length} open`:''}</span></span>${stTag(d.status,'small')}</button>`).join('')}</div>
      <h2 class="sub" style="margin-top:var(--space-xl)">Alert inbox (${inbox.length})</h2>
      ${(()=>{const card=a=>`<div class="alertI"><div class="row spread" style="flex-wrap:wrap">${stTag(a.lvl,'small')}<span class="muted small">${a.who}, ${ALSTATE[a.state]||'Open'}</span></div><div style="margin-top:var(--space-2xs);font-weight:500">${esc(a.t)}</div><div class="muted small">${esc(a.d)}</div>
        <div class="row" style="margin-top:var(--space-sm);flex-wrap:wrap"><button class="btn btn--sm" data-act="crewClear" data-v="${a.cid}|${a.id}|${a.lvl}">Reviewed, clear</button><button class="btn btn--sm btn--quiet" data-act="crewGround" data-v="${a.cid}|${a.id}|${a.lvl}">Send to ground</button></div></div>`;
        const top=inbox.filter(a=>a.lvl==='r'||a.state==='escalated'||!a.id.startsWith('m-')),rest=inbox.filter(a=>!top.includes(a));
        return (top.length?top.map(card).join(''):`<div class="alertI">${stTag('g','small')}<p style="margin-top:var(--space-2xs)">No urgent alerts or patterns.</p></div>`)
          +(rest.length?`<details class="more"><summary>Single readings on Watch (${rest.length}) ${I('down','sm')}</summary><div class="inner">${rest.map(card).join('')}</div></details>`:'')})()}
    </section>
    <section class="panel" aria-labelledby="crewD">
      <div class="row spread" style="flex-wrap:wrap"><h2 id="crewD" style="font-size:var(--text-xl)">${sc.name}</h2>${stChip(sd.status)}</div>
      <p class="muted small" style="margin-top:var(--space-2xs)">${sc.role}. ${srcTxt[sd.src]}.</p>
      <div style="margin-top:var(--space-md)">
        <div class="kv"><span class="muted">Readiness estimate</span><span class="measure">${sd.ready}</span></div>
        ${sd.vit.map(([k,v,s])=>`<div class="kv"><span class="muted">${VN[k]}</span><span class="row" style="gap:var(--space-sm)"><span class="measure">${v} <span class="muted small">${M[k].u}</span></span>${stTag(s,'small')}</span></div>`).join('')}
        <div class="kv"><span class="muted">Mood</span>${sd.mood?`<span class="row" style="gap:var(--space-sm)"><span class="measure">${sd.mood[0]} <span class="muted small">of 5</span></span>${stTag(sd.mood[1],'small')}</span>`:`<span class="muted small">Not shared</span>`}</div>
        <div class="kv"><span class="muted">Fatigue and vigilance</span>${sd.cog?`<span class="row" style="gap:var(--space-sm)"><span class="measure">${sd.cog.fat[0]}/7, ${sd.cog.pvt[0]} lapses</span>${stTag(worst([sd.cog.fat[1],sd.cog.pvt[1]]),'small')}</span>`:`<span class="muted small">Not shared</span>`}</div>
        <div class="kv"><span class="muted">Pain</span><span class="small">${sd.pain&&sd.pain.length?sd.pain.map(p=>`${esc(p.loc)} ${p.score}/10`).join(', '):'None logged'}</span></div>
        <div class="kv"><span class="muted">Medication</span><span class="small">${sd.meds&&sd.meds.length?sd.meds.map(m=>esc(m.drug)).join(', '):'None logged'}</span></div>
        <div class="kv"><span class="muted">Mission</span><span class="small">${ENV[sd.env]?ENV[sd.env].n:env().n}</span></div>
      </div>
      <div class="row" style="margin-top:var(--space-lg);flex-wrap:wrap"><button class="btn btn--sm" data-act="report" data-v="${sc.id}">${I('doc','sm')}Health report for ${sc.first}</button></div>
    </section>
  </div>`;
}

/* ---------- game engine ---------- */
let GT=null,actx=null;
function beep(f=660,d=0.18){try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();const o=actx.createOscillator(),g=actx.createGain();o.frequency.value=f;g.gain.value=0.08;o.connect(g);g.connect(actx.destination);o.start();g.gain.exponentialRampToValueAtTime(0.0001,actx.currentTime+d);o.stop(actx.currentTime+d)}catch(e){}}
function cue(t){if(S.speak&&window.speechSynthesis){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(t))}}
const mmss=sec=>`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(Math.floor(sec%60)).padStart(2,'0')}`;
function stopTimer(){if(GT&&GT.int){clearInterval(GT.int);GT.int=null}if(GT&&GT.to){clearTimeout(GT.to);GT.to=null}if(GT&&GT.raf){cancelAnimationFrame(GT.raf);GT.raf=null}if(GT&&GT.tick){clearInterval(GT.tick);GT.tick=null}}
function stopGame(){stopTimer();GT=null;$('#modal').classList.remove('wide')}
const speedSeg=(cur=GT.speed,act='gSpeed')=>`<div><span class="small muted" id="spdL" style="display:block;margin-bottom:var(--space-2xs)">Timer</span><div class="seg" role="group" aria-labelledby="spdL">${[[1,'Real time'],[30,'Demo, 30 times faster']].map(([v,l])=>`<button aria-pressed="${cur===v}" data-act="${act}" data-v="${v}">${l}</button>`).join('')}</div></div>`;
const safety=`<p class="safety">Stop at once if you feel chest pain, dizziness or unusual breathlessness, then <button class="btn btn--sm btn--quiet" data-act="gBuddy" style="min-height:32px;padding:0 var(--space-xs);text-decoration:underline">ask Health Buddy</button></p>`;
const pvtStat=(med,lapses,base)=>worst([M.pvt.st(lapses),med<=base*1.1?'g':med<=base*1.2?'a':'r']);
function openGame(k){
  if(replaying()){toast('Replay is on. Go back to today to train or test.');return}
  stopGame();closeBuddy(true);
  const short=env().short;
  GT=k==='intervals'?{k,phase:'setup',rounds:short?3:6,push:120,easy:120,speed:1,round:1,left:0,elapsed:0,paused:false}
    :k==='lifts'?{k,phase:'setup',ex:env().lift.slice(0,short?2:4),sets:short?4:3,reps:10,rest:60,speed:1,cur:0,set:1,done:0,left:0,elapsed:0}
    :k==='vision'?{k,phase:'setup',eye:'left',res:{left:{},right:{}}}
    :{k,phase:'setup',dur:180,rts:[],fs:0,start:0,t0:0,last:null};
  $('#modal').classList.add('wide');openModal('<div id="gameBox"></div>');paintGame();
}
function gameHead(t){return `<div class="row spread"><h2 id="modalTitle" style="font-size:var(--text-xl)">${t}</h2>${closeBtn}</div>`}
const NLINES=[24,18,14,12,10,8,6,5];
const WORDS='orbit window module crew lunar signal oxygen garden rover crater comet dawn hatch cargo beacon summit harbour meadow river pebble lantern'.split(' ');
const amslerSVG=()=>`<svg viewBox="0 0 200 200" style="width:min(300px,100%);height:auto;color:var(--color-ink-2);background:var(--color-paper);border-radius:var(--radius-pill)" role="img" aria-label="Amsler grid with a dot in the centre">${[...Array(21)].map((_,i)=>`<line x1="${i*10}" y1="0" x2="${i*10}" y2="200" stroke="currentColor" stroke-width="${i%10===0?1.2:.6}"/><line x1="0" y1="${i*10}" x2="200" y2="${i*10}" stroke="currentColor" stroke-width="${i%10===0?1.2:.6}"/>`).join('')}<circle cx="100" cy="100" r="3.5" fill="var(--color-ink)"/></svg>`;
function paintGame(){
  const b=$('#gameBox');if(!b||!GT)return;const g=GT,x=GAMES[g.k];
  if(g.phase==='summary'){b.innerHTML=g.summary;return}
  if(g.k==='intervals'){
    if(g.phase==='setup'){b.innerHTML=`${gameHead(x.n)}<div class="setup">
      <p class="cue">${g.rounds} rounds on the ${env().cardio}: 2 minutes hard, then 2 minutes easy. HALO counts you through each phase with a tone.</p>
      <div><span class="small muted" id="rdL" style="display:block;margin-bottom:var(--space-2xs)">Rounds</span><div class="seg" role="group" aria-labelledby="rdL">${[3,6,8].map(n=>`<button aria-pressed="${g.rounds===n}" data-act="gRounds" data-v="${n}">${n} rounds, ${n*4} min</button>`).join('')}</div></div>
      ${speedSeg()}${safety}<button class="btn btn--primary bigBtn" data-act="gStart" autofocus>Start</button></div>`;return}
    const len=g.phase==='push'?g.push:g.easy,C=2*Math.PI*104,frac=g.left/len;
    b.innerHTML=`${gameHead(x.n)}<div class="stage">
      <span class="muted">Round <span class="measure">${g.round}</span> of <span class="measure">${g.rounds}</span></span>
      <div class="ringBox"><svg viewBox="0 0 240 240" aria-hidden="true"><circle class="rt" cx="120" cy="120" r="104"/><circle class="rp ${g.phase}" cx="120" cy="120" r="104" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-frac)}"/></svg>
        <div class="c"><div><div class="phase">${g.phase==='push'?'Push':'Easy'}</div><div class="clock" role="timer" aria-live="off">${mmss(g.left)}</div></div></div></div>
      <p class="cue">${g.phase==='push'?`Fast pace on the ${env().cardio}. You can only say a few words at a time.`:'Slow right down and breathe. Get ready for the next push.'}</p>
      <div class="row" style="justify-content:center;flex-wrap:wrap"><button class="btn" data-act="gPause">${g.paused?'Resume':'Pause'}</button><button class="btn btn--primary" data-act="gFinish">Finish and log</button></div>
      <p class="muted small">Fuel so far: <span class="measure">${fmtKm(Math.floor(g.elapsed/60)*KM_PER_MIN)}</span> km</p>${safety}</div>`;return}
  if(g.k==='lifts'){
    const total=g.ex.length*g.sets;
    if(g.phase==='setup'){b.innerHTML=`${gameHead(x.n)}<div class="setup">
      <p class="cue">On the ${env().res}, ${g.reps} slow reps a set. Tap the big button after each set and HALO times your rest.</p>
      <ol class="plan">${g.ex.map(n=>`<li><span>${n}</span><span class="measure muted">${g.sets} × ${g.reps}</span></li>`).join('')}</ol>
      ${speedSeg()}${safety}<button class="btn btn--primary bigBtn" data-act="gStart" autofocus>Start</button></div>`;return}
    const shield=g.done/total;
    b.innerHTML=`${gameHead(x.n)}<div class="stage">
      <span class="muted">Bone shield <span class="measure">${Math.round(shield*100)}%</span></span>
      <div class="bar" style="width:min(420px,100%);height:10px;margin:0"><i style="transform:scaleX(${shield})"></i></div>
      ${g.phase==='lift'?`<div class="phase">${g.ex[g.cur]}</div><p class="cue">Set <span class="measure">${g.set}</span> of <span class="measure">${g.sets}</span>, ${g.reps} reps. ${LIFTCUE[g.ex[g.cur]]||'Slow and controlled.'}</p>
        <button class="btn btn--primary bigBtn" data-act="gSet" autofocus>Set done</button>`
      :`<div class="phase">Rest</div><div class="clock" role="timer">${mmss(g.left)}</div><p class="cue">Next: ${g.ex[g.cur]}, set ${g.set}.</p><button class="btn bigBtn" data-act="gSkip">Skip rest</button>`}
      <button class="btn btn--quiet btn--sm" data-act="gFinish">Finish and log</button>${safety}</div>`;return}
  if(g.k==='vision'){
    const eyeN=g.eye==='left'?'Left':'Right',other=g.eye==='left'?'right':'left';
    if(g.phase==='setup'){b.innerHTML=`${gameHead(x.n)}<div class="setup">
      <p class="cue">Two short tests for each eye. Hold the screen about 40 cm away, an arm's length bent at the elbow, in good light. Wear the glasses you use for close work.</p>
      <ol class="plan"><li><span>Near-vision card</span><span class="muted">tap the smallest line you can read</span></li><li><span>Amsler grid</span><span class="muted">look at the centre dot</span></li></ol>
      <p class="safety">Screen text sizes are approximate. Use the same device each week so HALO compares like with like. Sudden vision loss is urgent: alert the CMO, do not wait for this check.</p>
      <button class="btn btn--primary bigBtn" data-act="gStart" autofocus>Start with the left eye</button></div>`;return}
    if(g.phase==='near'){const r=rng(Date.now()>>12);
      b.innerHTML=`${gameHead(x.n)}<div class="setup"><p class="cue"><b style="font-weight:500;color:var(--color-ink)">${eyeN} eye.</b> Cover your ${other} eye with your palm. Tap the smallest line you can read clearly.</p>
      <div>${NLINES.map(n=>`<button class="reading" data-act="vNear" data-v="${n}" style="font-family:var(--font-body);font-size:${(n*1.333).toFixed(1)}px;line-height:1.25;color:var(--color-ink)"><span>${[0,1,2].map(()=>WORDS[Math.floor(r()*WORDS.length)]).join(' ')}</span><span class="rv" style="font-size:var(--text-sm);color:var(--color-muted)">N${n}</span></button>`).join('')}</div>
      <button class="btn btn--sm btn--quiet" data-act="vNear" data-v="24">I cannot read any of these</button></div>`;return}
    if(g.phase==='amsler'){
      b.innerHTML=`${gameHead(x.n)}<div class="stage"><p class="cue"><b style="font-weight:500;color:var(--color-ink)">${eyeN} eye.</b> Keep your ${other} eye covered and look only at the centre dot. Are any lines wavy, bent, blurred or missing?</p>
      ${amslerSVG()}
      <div class="row" style="justify-content:center;flex-wrap:wrap"><button class="btn btn--primary" data-act="vAms" data-v="0" autofocus>All lines look straight</button><button class="btn" data-act="vAms" data-v="1">Some look wrong</button></div></div>`;return}
  }
  // vigilance check (PVT-B)
  if(g.phase==='setup'){b.innerHTML=`${gameHead(x.n)}<div class="setup">
    <p class="cue">A counter appears on the pad at random moments. Tap it, or press the space bar, as fast as you can. Do not tap before it appears. HALO compares you with your own baseline of <span class="measure">${G[S.crew].base} ms</span>.</p>
    <div><span class="small muted" id="durL" style="display:block;margin-bottom:var(--space-2xs)">Length</span><div class="seg" role="group" aria-labelledby="durL">${[[180,'3 minutes, PVT-B'],[30,'Demo, 30 seconds']].map(([v,l])=>`<button aria-pressed="${g.dur===v}" data-act="gDur" data-v="${v}">${l}</button>`).join('')}</div></div>
    <p class="safety">Slow reactions can come from poor sleep, high cabin CO2 or radiation. It helps decide if you are fit for an EVA. A lapse is a response of 355 ms or slower.</p>
    <button class="btn btn--primary bigBtn" data-act="gStart" autofocus>Start</button></div>`;return}
  const left=Math.max(0,g.dur-(performance.now()-g.start)/1000);
  b.innerHTML=`${gameHead(x.n)}<div class="stage">
    <span class="muted"><span class="measure" id="pvtLeft">${mmss(left)}</span> left, <span class="measure">${g.rts.length}</span> responses${g.fs?`, <span class="measure">${g.fs}</span> too soon`:''}</span>
    <button class="pad ${g.phase==='go'?'go':g.phase==='early'?'early':''}" autofocus><span id="padT">${g.phase==='go'?'0 ms':g.phase==='early'?'Too soon':g.phase==='shown'&&g.last!=null?g.last+' ms':'Wait for the counter'}</span></button></div>`;
  const pad=$('.pad');pad&&pad.focus();
}
const LIFTCUE={'Squat':'Feet under the shoulder pads, sit back and drive up.','Deadlift':'Flat back, push the floor away.','Heel raise':'Rise high, pause, lower slowly.','Bench press':'Elbows at 45 degrees, full range.','Band squat':'Stand on the band, sit back and drive up.','Band row':'Squeeze your shoulder blades together.','Push-up':'Body in one straight line.'};
function runTimer(){
  stopTimer();
  GT.int=setInterval(()=>{const g=GT;if(!g||g.paused)return;
    g.left--;g.elapsed++;
    if(g.k==='intervals'&&g.left<=3&&g.left>0)beep(520,0.08);
    if(g.left<=0){
      if(g.k==='intervals'){
        if(g.phase==='push'){g.phase='easy';g.left=g.easy;beep(440,0.3);cue('Easy')}
        else if(g.round<g.rounds){g.round++;g.phase='push';g.left=g.push;beep(880,0.3);cue('Push')}
        else{finishGame(true);return}
      }else if(g.k==='lifts'){g.phase='lift';stopTimer();beep(880,0.25);cue(g.ex[g.cur]);paintGame();return}
    }
    paintGame();
  },1000/GT.speed);
}
/* PVT-B: 1 to 4 s random waits, lapse at 355 ms or slower, false start under 100 ms */
function reflexArm(){const g=GT;if(!g)return;
  if((performance.now()-g.start)/1000>=g.dur){finishGame(true);return}
  if(g.phase!=='shown'&&g.phase!=='early')g.phase='wait';paintGame();
  g.to=setTimeout(()=>{if(!GT||GT!==g)return;g.phase='wait';paintGame();
    g.to=setTimeout(()=>{if(!GT||GT!==g||g.phase!=='wait')return;g.phase='go';g.t0=performance.now();paintGame();
      const run=()=>{if(!GT||GT!==g||g.phase!=='go')return;const t=$('#padT');if(t)t.textContent=Math.round(performance.now()-g.t0)+' ms';
        if(performance.now()-g.t0>10000){g.rts.push(10000);g.last=10000;g.phase='shown';reflexArm();return}
        g.raf=requestAnimationFrame(run)};g.raf=requestAnimationFrame(run)},1000+Math.random()*3000)},g.phase==='shown'||g.phase==='early'?700:0);
}
function reflexTap(){
  const g=GT;if(!g||g.k!=='reflex')return;
  if(g.phase==='wait'){clearTimeout(g.to);g.fs++;g.phase='early';beep(300,.1);reflexArm();return}
  if(g.phase==='go'){const rt=Math.round(performance.now()-g.t0);cancelAnimationFrame(g.raf);if(rt<100)g.fs++;else g.rts.push(rt);g.last=rt;g.phase='shown';reflexArm()}
}
function finishGame(complete){
  const g=GT;if(!g)return;stopTimer();
  const id=S.crew,st=G[id],kmBefore=kmOf(id),badBefore=badgesFor(id).filter(x=>x[3]).map(x=>x[1]);
  let min=0,pts=0,title='',lines=[];
  if(g.k==='reflex'){
    if(g.rts.length<5){stopGame();closeAll();toast('Too few responses to score. Try the full check again.');return}
    if(!st.baseFromTest){st.base=Math.round(median(g.rts.filter(r=>r<355)))||st.base;st.baseFromTest=true;lines.push('This is your first check on this device, so HALO uses it as your personal baseline.')}
    const med=Math.round(median(g.rts)),lapT=Math.max(355,Math.round(st.base*1.3)),lapses=g.rts.filter(r=>r>=lapT).length,rs=pvtStat(med,lapses,st.base),pct=Math.round((med/st.base-1)*100);
    st.lastReact=med;st.lastLapses=lapses;st.lastPvtT=Date.now();st.best=st.best==null?med:Math.min(st.best,med);st.reflex++;st.sessions.reflex++;pts=15;
    recordReading('pvt',lapses,null,'halo');
    title=`${med} ms`;lines.unshift(`${stTag(rs)}`,`Median ${pct<=0?`${-pct}% faster than`:`${pct}% slower than`} your baseline of ${st.base} ms. ${lapses} lapse${lapses===1?'':'s'}, ${g.fs} too soon, ${g.rts.length} responses.`,
      rs==='g'?'Fit for EVA on vigilance.':rs==='a'?'Get some rest before critical tasks, then test again.':'Not fit for EVA today. Tell the CMO and check your sleep and cabin CO2.');
  }else{
    min=Math.floor(g.elapsed/60);
    if(g.k==='lifts')min=Math.max(min,Math.round(g.done*2.5));
    if(min<1&&!(g.k==='lifts'&&g.done)){stopGame();closeAll();toast('Nothing logged. Sessions under a minute do not count.');return}
    pts=min*2+(complete?20:0);st.min+=min;recordReading('ex',now().ex+min,null,'game');st.sessions[g.k]++;
    if(g.k==='intervals')st.cardio+=min;
    if(g.k==='lifts'){st.lifts++;if(!S.missions[id][1]){S.missions[id][1]=true;pts+=MISSIONS[1][1]}}
    title=`${min} minutes logged`;lines=[`Your ship moved ${fmtKm(min*KM_PER_MIN)} km.`,`Exercise today: ${fx(now().ex)} of 120 minutes, ${LV[stat('ex',now())].toLowerCase()}.`];
    if(g.k==='lifts')lines.push(`Bone shield ${Math.round(g.done/(g.ex.length*g.sets)*100)}% charged.`);
  }
  summarise(g,pts,title,lines,kmBefore,badBefore);
}
function summarise(g,pts,title,lines,kmBefore,badBefore){
  const id=S.crew,st=G[id];
  Object.entries(QUESTS).forEach(([k,q])=>{if(!st.qDone[k]&&st[k]>=q[1]){st.qDone[k]=true;pts+=q[3];lines.push(`Quest done: ${q[0]}, +${q[3]} points.`)}});
  S.xp[id]+=pts;
  STOPS.filter(x=>x[0]>kmBefore&&x[0]<=kmOf(id)).forEach(x=>lines.push(`You reached ${x[1]}. ${x[2]}`));
  badgesFor(id).filter(x=>x[3]&&!badBefore.includes(x[1])).forEach(x=>lines.push(`New badge: ${x[1]}.`));
  beep(990,0.35);
  g.phase='summary';
  g.summary=`${gameHead(GAMES[g.k].n)}<div class="stage"><div class="clock">${title}</div><span class="muted">+${pts} points</span>
    <ul class="stack" style="gap:var(--space-xs);text-align:left;max-width:46ch">${lines.map(l=>`<li>${l}</li>`).join('')}</ul>
    <button class="btn btn--primary" data-act="gDone" autofocus>Done</button></div>`;
  render();paintGame();setTimeout(()=>{const d=$('[data-act="gDone"]');d&&d.focus()},30);
}
function finishVision(){
  const g=GT,id=S.crew,st=G[id],kmBefore=kmOf(id),badBefore=badgesFor(id).filter(x=>x[3]).map(x=>x[1]);
  const L=g.res.left,R=g.res.right,worse=Math.max(L.near,R.near),ams=L.ams||R.ams?1:0;
  recordReading('vis',worse,null,'halo');recordReading('ams',ams,null,'halo');
  S.vision[id].push({t:Date.now(),left:L,right:R});st.sessions.vision=(st.sessions.vision||0)+1;
  const s=stat('vis',now()),n=statNote('vis',now());
  summarise(g,20,`N${L.near} left, N${R.near} right`,[stTag(s),
    `Amsler grid: ${ams?`distortion seen with the ${L.ams&&R.ams?'both eyes':L.ams?'left eye':'right eye'}`:'clear in both eyes'}.`,
    n||`Normal is ${M.vis.norm}.`,
    ams?'Alert the CMO today. An eye ultrasound can check the back of the eye.':s==='a'?'Tell the CMO and repeat the check in 2 days.':'Do the check again next week.'],kmBefore,badBefore);
}

/* ---------- photos and scans (FR-1.4, FR-1.5) ---------- */
const IMGTAGS=['Device display','Skin or wound','Eye','Ultrasound','Other'];
let camStream=null;
function stopCam(){if(camStream){camStream.getTracks().forEach(t=>t.stop());camStream=null}}
function addImage(src){
  const tag=($('#imgTag')||{}).value||'Other';
  S.images[S.crew].unshift({src,tag,t:Date.now()});S.queued[S.crew]++;
  const m=$('#imgMsg');if(m)m.textContent=`${tag} photo saved and queued for the flight surgeon.`;scheduleSave();
}
function shrink(srcEl,w,h){const k=Math.min(1,800/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);c.getContext('2d').drawImage(srcEl,0,0,c.width,c.height);return c.toDataURL('image/jpeg',0.82)}
document.addEventListener('change',e=>{
  if(e.target.id==='ocrFile'&&e.target.files[0]){readDisplay(e.target.files[0]);e.target.value='';return}
  if(e.target.id!=='imgFile'||!e.target.files[0])return;
  const f=e.target.files[0];if(!f.type.startsWith('image/')){$('#imgMsg').textContent='That file is not an image.';return}
  const img=new Image();img.onload=()=>{addImage(shrink(img,img.naturalWidth,img.naturalHeight));URL.revokeObjectURL(img.src)};img.onerror=()=>{$('#imgMsg').textContent='That image could not be read.'};img.src=URL.createObjectURL(f);
});

/* ---------- measurement capture: Bluetooth, camera pulse, display reading ---------- */
let FS={},BT=null,PPG=null,OCRW=null;
async function connectHR(){
  const m=$('#capMsg');
  if(!navigator.bluetooth){m.textContent='Bluetooth is not available in this browser. Chrome or Edge on a computer or Android supports it.';return}
  try{
    const dev=await navigator.bluetooth.requestDevice({filters:[{services:['heart_rate']}]});m.textContent=`Connecting to ${dev.name||'the strap'}`;
    const srv=await dev.gatt.connect(),ch=await (await srv.getPrimaryService('heart_rate')).getCharacteristic('heart_rate_measurement');
    await ch.startNotifications();BT=dev;
    ch.addEventListener('characteristicvaluechanged',ev=>{const d=ev.target.value,f=d.getUint8(0),bpm=f&1?d.getUint16(1,true):d.getUint8(1);
      const i=$('#f-hr');if(i){i.value=bpm;FS.hr='bt'}const mm=$('#capMsg');if(mm)mm.textContent=`${dev.name||'Strap'} connected: ${bpm} bpm. Save when it settles.`});
  }catch(err){m.textContent=err&&err.name==='NotFoundError'?'No strap was chosen.':'Could not connect to the strap. Check it is on and close by, then try again.'}
}
function stopBT(){try{if(BT&&BT.gatt&&BT.gatt.connected)BT.gatt.disconnect()}catch(e){}BT=null}
async function camHR(){
  const m=$('#capMsg');if(PPG)return;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){m.textContent='No camera here.';return}
  try{
    const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:320},height:{ideal:240}}});
    const tr=st.getVideoTracks()[0];try{await tr.applyConstraints({advanced:[{torch:true}]})}catch(e){}
    const v=$('#ppgV');v.srcObject=st;await v.play();$('#ppgBox').hidden=false;
    const c=document.createElement('canvas');c.width=40;c.height=30;const x=c.getContext('2d',{willReadFrequently:true});
    PPG={st,t:[],r:[],t0:performance.now(),dur:20000};
    const step=()=>{const p=PPG;if(!p)return;const tn=performance.now();x.drawImage(v,0,0,40,30);const d=x.getImageData(10,8,20,14).data;let rs=0,gs=0;for(let i=0;i<d.length;i+=4){rs+=d[i];gs+=d[i+1]}const n=d.length/4;p.t.push(tn);p.r.push(rs/n);
      const mm=$('#capMsg');if(mm)mm.textContent=rs/n<80||rs<gs*1.3?'Cover the lens and the light fully with your fingertip.':`Measuring, ${Math.max(0,Math.ceil((p.dur-(tn-p.t0))/1000))} s left. Keep your fingertip still.`;
      if(tn-p.t0>=p.dur){finishPPG();return}requestAnimationFrame(step)};
    requestAnimationFrame(step);
  }catch(err){m.textContent='The camera is not available.'}
}
function stopPPG(){if(PPG){PPG.st.getTracks().forEach(t=>t.stop());PPG=null}const b=$('#ppgBox');if(b)b.hidden=true}
function finishPPG(){
  const p=PPG,bpm=ppgBpm(p.t,p.r);stopPPG();const m=$('#capMsg');if(!m)return;
  if(!bpm){m.textContent='The signal was too noisy. Rest your fingertip lightly over the lens and the light, then try again.';return}
  const i=$('#f-hr');if(i){i.value=bpm;FS.hr='cam'}m.textContent=`Camera estimate: ${bpm} bpm. Check it against a pulse oximeter if you can.`;
}
function ppgBpm(t,r){
  const n=t.length;if(n<60)return null;const fps=n/((t[n-1]-t[0])/1000),w=Math.max(3,Math.round(fps/2));
  const det=r.map((v,i)=>{let s=0,c=0;for(let j=Math.max(0,i-w);j<=Math.min(n-1,i+w);j++){s+=r[j];c++}return v-s/c});
  const sm=det.map((v,i)=>(i?det[i-1]:v)*.25+v*.5+(i<n-1?det[i+1]:v)*.25),sd=Math.sqrt(avg(sm.map(v=>v*v)));if(sd<.03)return null;
  const pk=[];for(let i=1;i<n-1;i++){if(sm[i]>sm[i-1]&&sm[i]>=sm[i+1]&&sm[i]>sd*.3&&t[i]-t[0]>2000&&(!pk.length||t[i]-t[pk[pk.length-1]]>300))pk.push(i)}
  if(pk.length<6)return null;
  const ints=pk.slice(1).map((p,i)=>t[p]-t[pk[i]]),mi=median(ints),good=ints.filter(x=>Math.abs(x-mi)<mi*.3);if(good.length<5)return null;
  const bpm=Math.round(60000/avg(good));return bpm>=35&&bpm<=200?bpm:null;
}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
async function ocrText(img){
  const k=Math.min(1,1400/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*k);c.height=Math.round(img.height*k);
  const x=c.getContext('2d');x.drawImage(img,0,0,c.width,c.height);
  const d=x.getImageData(0,0,c.width,c.height),p=d.data,px=p.length/4;let sum=0;
  for(let i=0;i<p.length;i+=4){const g=.3*p[i]+.59*p[i+1]+.11*p[i+2];p[i]=p[i+1]=p[i+2]=g;sum+=g}
  const mean=sum/px;let dark=0;for(let i=0;i<p.length;i+=4){const b=p[i]<mean*.85?0:255;p[i]=p[i+1]=p[i+2]=b;if(!b)dark++}
  if(dark>px/2)for(let i=0;i<p.length;i+=4)p[i]=p[i+1]=p[i+2]=255-p[i];
  x.putImageData(d,0,0);
  if(!window.Tesseract){try{await loadScript('vendor/tesseract/tesseract.min.js')}catch(e){}}
  if(window.Tesseract){
    if(!OCRW){OCRW=await Tesseract.createWorker('eng',1,{workerPath:'vendor/tesseract/worker.min.js',corePath:'vendor/tesseract/tesseract-core-lstm.wasm.js',langPath:'vendor/tesseract/lang',gzip:true});await OCRW.setParameters({tessedit_char_whitelist:'0123456789./ '})}
    return (await OCRW.recognize(c)).data.text;
  }
  if('TextDetector' in window)return (await new TextDetector().detect(c)).map(t=>t.rawValue).join(' ');
  throw new Error('noocr');
}
async function readDisplay(file){
  const m=$('#capMsg'),k=($('#ocrKey')||{}).value||'hr';m.textContent='Reading the display';
  const img=new Image();img.src=URL.createObjectURL(file);
  try{await img.decode()}catch(e){m.textContent='That image could not be read.';return}
  let txt='';try{txt=await ocrText(img)}catch(e){m.textContent=e.message==='noocr'?'Display reading needs the OCR pack in the vendor folder, served over http. Please type the number.':'The display could not be read. Please type the number.';return}
  finally{URL.revokeObjectURL(img.src)}
  const nums=(txt.match(/\d+(?:\.\d+)?/g)||[]).map(Number);
  if(k==='bp'){const s=nums.find(v=>v>=60&&v<=260),di=nums.find((v,i)=>i>nums.indexOf(s)&&v>=30&&v<=160);
    if(s&&di){$('#f-sys').value=s;$('[name="dia"]').value=di;FS.bp='ocr';m.textContent=`Read ${s}/${di} mmHg from the photo. Check it matches the display.`}else m.textContent='Could not find two blood pressure numbers. Please type them.';return}
  let v=nums.map(x=>k==='temp'&&x>100&&x<450?x/10:x).find(x=>x>=M[k].lim[0]&&x<=M[k].lim[1]);
  if(v==null){m.textContent=`Could not find a ${M[k].n.toLowerCase()} in the photo. Please type it.`;return}
  const i=$('#f-'+k);if(i){i.value=v;FS[k]='ocr'}m.textContent=`Read ${v} ${M[k].u} from the photo. Check it matches the display.`;
}

/* ---------- chart (SVG, offline) ---------- */
function smooth(p){let d=`M${p[0].x},${p[0].y}`;for(let i=0;i<p.length-1;i++){const a=p[i-1]||p[i],b=p[i],c=p[i+1],e=p[i+2]||c;d+=` C${b.x+(c.x-a.x)/6},${b.y+(c.y-a.y)/6} ${c.x-(e.x-b.x)/6},${c.y-(e.y-b.y)/6} ${c.x},${c.y}`}return d}
function drawChart(el){
  if(!S.crew||!el||!el.isConnected)return;
  const k=el.dataset.key,n=+el.dataset.n,h=H().slice(-n),vals=h.map(e=>e[k==='bp'?'sys':k]),dia=k==='bp'?h.map(e=>e.dia):null,band=bandOf(k);
  const W=el.clientWidth,Ht=el.clientHeight,pl=44,pr=10,pt=14,pb=28;
  if(W<pl+pr+40||Ht<pt+pb+20||vals.length<2)return;
  const all=[...vals,...(dia||[]),...band];let mn=Math.min(...all),mx=Math.max(...all);const pad=(mx-mn)*.12||1;mn-=pad;mx+=pad;
  const X=i=>pl+i/(vals.length-1)*(W-pl-pr),Y=v=>pt+(1-(v-mn)/(mx-mn))*(Ht-pt-pb);
  const pts=vals.map((v,i)=>({x:X(i),y:Y(v)})),line=smooth(pts);
  const ticks=[0,.5,1].map(t=>mn+(mx-mn)*t),step=Math.max(1,Math.round(vals.length/5));
  const fmtD=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
  el.innerHTML=`<svg width="${W}" height="${Ht}" aria-hidden="true">
    <rect class="band" x="${pl}" y="${Y(band[1])}" width="${W-pl-pr}" height="${Math.max(0,Y(band[0])-Y(band[1]))}"/>
    ${ticks.map(v=>`<line class="grid" x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}"/><text class="axis" x="0" y="${Y(v)+4}">${k==='co2'||k==='kcal'?Math.round(v):fx(v,M[k].d)}</text>`).join('')}
    ${h.map((e,i)=>i%step===0?`<text class="axis" x="${X(i)}" y="${Ht-6}" text-anchor="middle">${fmtD(e.d)}</text>`:'').join('')}
    ${dia?`<path class="ln2" d="${smooth(dia.map((v,i)=>({x:X(i),y:Y(v)})))}"/>`:''}
    <path class="ln" d="${line}"/>
    <g class="mk" style="display:none"><line y1="${pt}" y2="${Ht-pb}"/><circle r="5"/></g>
  </svg><div class="tip" hidden></div>`;
  const mk=el.querySelector('.mk'),tip=el.querySelector('.tip');
  el.onpointermove=ev=>{const r=el.getBoundingClientRect(),x=ev.clientX-r.left;let i=Math.round((x-pl)/(W-pl-pr)*(vals.length-1));i=clamp(i,0,vals.length-1);
    mk.style.display='';const ln=mk.querySelector('line');ln.setAttribute('x1',pts[i].x);ln.setAttribute('x2',pts[i].x);
    mk.querySelector('circle').setAttribute('cx',pts[i].x);mk.querySelector('circle').setAttribute('cy',pts[i].y);
    tip.hidden=false;tip.style.left=clamp(pts[i].x,60,W-60)+'px';tip.style.top=pts[i].y+'px';
    tip.textContent=`${fmtD(h[i].d)}: ${val(k,h[i])} ${M[k].u}`};
  el.onpointerleave=()=>{mk.style.display='none';tip.hidden=true};
}
addEventListener('resize',()=>$$('.chart').forEach(drawChart));

/* ---------- overlays ---------- */
let lastFocus=null;
function openModal(html){lastFocus=document.activeElement;$('#modal').innerHTML=html;$('#scrim').classList.add('show');$('#modal').classList.add('show');setTimeout(()=>{const f=$('#modal [autofocus]')||$('#modal .close');f&&f.focus()},30)}
function openDrawer(html){lastFocus=document.activeElement;$('#drawer').innerHTML=html;$('#scrim').classList.add('show');$('#drawer').classList.add('show');setTimeout(()=>$('#drawer .close').focus(),30)}
function closeAll(){
  if(GT&&!CHECKS.includes(GT.k)&&GT.elapsed>=60&&GT.phase!=='summary'&&GT.phase!=='setup'){finishGame(false);return}
  stopGame();stopGuide();stopOrtho();stopCam();stopPPG();stopBT();
  ['#scrim','#modal','#drawer'].forEach(s=>$(s).classList.remove('show'));$('#modal').classList.remove('wide');S.modalKey=null;closeBuddy(true);if(lastFocus&&lastFocus.isConnected)lastFocus.focus();
}
const closeBtn=`<button class="close" data-act="closeAll" aria-label="Close">${I('close','sm')}</button>`;
const mHead=t=>`<div class="row spread"><h2 id="modalTitle" style="font-size:var(--text-xl)">${t}</h2>${closeBtn}</div>`;
const seg2=(act,cur,opts)=>`<div class="seg" role="group">${opts.map(([v,l])=>`<button type="button" aria-pressed="${cur===v}" data-act="${act}" data-v="${v}">${l}</button>`).join('')}</div>`;

function openVital(k){
  S.modalKey=k;const e=now(),s=stat(k,e),note=statNote(k,e);
  const recent=S.log[S.crew].filter(x=>x.k===k).slice(-8).reverse();
  openModal(`${mHead(M[k].n)}
   <div class="row spread" style="margin-top:var(--space-lg);align-items:flex-end;flex-wrap:wrap"><div><span class="measure" style="font-size:var(--text-4xl);line-height:1">${val(k,e)}</span><span class="muted" style="margin-left:var(--space-xs)">${M[k].u}</span></div>${stChip(s)}</div>
   <p class="muted small" style="margin-top:var(--space-xs)">Normal is ${M[k].norm}.${note?' '+esc(note):''}</p>
   <div class="chart" data-key="${k}" data-n="${S.modalN}" style="height:200px" role="img" aria-label="${M[k].n} over ${S.modalN} days"></div>
   <div class="row" style="justify-content:center;margin-top:var(--space-sm)"><div class="seg" role="group" aria-label="Range">${[7,14,30].map(n=>`<button aria-pressed="${S.modalN===n}" data-act="modalN" data-v="${n}">${n} days</button>`).join('')}</div></div>
   <details class="more"><summary>Recent readings (${recent.length}) ${I('down','sm')}</summary><div class="inner">${recent.length?recent.map(x=>`<div class="kv"><span><span class="measure" style="color:var(--color-ink)">${k==='bp'?x.v+'/'+x.v2:k==='vis'?'N'+x.v:x.v} ${M[k].u}</span><span class="muted small" style="display:block">${SRC[x.src]||x.src}${x.unc?', waiting for a repeat to confirm':''}</span></span><span class="muted small measure">${new Date(x.t).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} ${hm(x.t)}</span></div>`).join(''):`<p class="small">No readings logged by hand yet. Daily values come from the wearable summary.</p>`}</div></details>
   <details class="more"><summary>Why it matters in space ${I('down','sm')}</summary><div class="inner"><p>${M[k].why}</p>${k==='bone'?`<p style="margin-top:var(--space-xs)">${boneNote()}</p>`:''}<p class="muted small" style="margin-top:var(--space-sm)">Source: ${M[k].src}</p></div></details>
   <details class="more"><summary>How to measure in space ${I('down','sm')}</summary><div class="inner"><p style="color:var(--color-ink)">${M[k].tool}</p><p style="margin-top:var(--space-2xs)">${M[k].how}</p>
     ${M[k].guide?`<button class="btn btn--sm" data-act="guide" data-v="${k}" style="margin-top:var(--space-sm)">${I('clock','sm')}Start guided measurement</button>`:''}
     ${k==='vis'?`<button class="btn btn--sm" data-act="game" data-v="vision" style="margin-top:var(--space-sm)">${I('eye','sm')}Start the vision check</button>`:''}
     ${k==='pvt'?`<button class="btn btn--sm" data-act="game" data-v="reflex" style="margin-top:var(--space-sm)">${I('clock','sm')}Start the vigilance check</button>`:''}</div></details>
   <details class="more"><summary>When to get help ${I('down','sm')}</summary><div class="inner"><p>${M[k].call}</p><p class="muted small" style="margin-top:var(--space-xs)">${esc(escText())}</p></div></details>`);
  requestAnimationFrame(()=>drawChart($('#modal .chart')));
}
function openAlerts(){
  const A=alertsList(),L=S.al[S.crew],hist=Object.values(L).flatMap(r=>r.hist).sort((a,b)=>b.t-a.t).slice(0,20);
  openDrawer(`<div class="row spread"><h2 style="font-size:var(--text-xl)">Alerts</h2>${closeBtn}</div>
   <div style="margin-top:var(--space-md)">${A.length?A.map(a=>`<div class="alertI"><div class="row spread" style="flex-wrap:wrap">${stTag(a.lvl,'small')}${a.state&&a.state!=='open'?`<span class="muted small">${ALSTATE[a.state]}</span>`:''}</div><div style="margin-top:var(--space-2xs);font-weight:500">${esc(a.t)}</div><div class="muted small">${esc(a.d)}</div>
     <div class="row" style="margin-top:var(--space-sm);flex-wrap:wrap">${a.lvl==='r'?`<button class="btn btn--sm btn--primary" data-act="cmo">Alert the CMO</button>`:''}<button class="btn btn--sm" data-act="ack" data-v="${a.id}">Acknowledge</button></div></div>`).join('')
   :`<div class="alertI">${stTag('g','small')}<p style="margin-top:var(--space-2xs)">No open alerts.</p></div>`}</div>
   <p class="muted small" style="margin-top:var(--space-md)">Acknowledging sets a re-check: 30 minutes for Urgent, 4 hours for Watch. An Urgent alert left open for 10 minutes is escalated to the CMO.</p>
   <details class="more"><summary>Alert history (${hist.length}) ${I('down','sm')}</summary><div class="inner">${hist.length?hist.map(h=>`<div class="kv"><span><span style="color:var(--color-ink)">${esc(h.title)}</span><span class="muted small" style="display:block">${esc(h.ev)}</span></span><span class="muted small measure">${hm(h.t)}</span></div>`).join(''):`<p class="small">Nothing yet.</p>`}</div></details>`);
}
function openGround(){
  const id=S.crew,q=S.queued[id],ls=linkState(),sent=S.sent[id].slice(-5).reverse(),grav=!env().micro;
  openDrawer(`<div class="row spread"><h2 style="font-size:var(--text-xl)">Mission</h2>${closeBtn}</div>
   <h3 class="sub">Where you are</h3>
   <div role="radiogroup" aria-label="Mission environment">${Object.entries(ENV).map(([k,v])=>`<button class="envOpt" role="radio" aria-checked="${S.env===k}" data-act="env" data-v="${k}"><span><span style="display:block">${v.long}</span><span class="muted small">${v.g}. Earth is ${v.delay}. ${v.esc==='ground'?'Urgent care: CMO with the ground.':'Urgent care: the CMO decides on board.'}</span></span>${S.env===k?I('check','sm'):''}</button>`).join('')}</div>
   ${grav?`<button class="btn btn--sm" data-act="ortho" style="margin-top:var(--space-sm)">${I('grav','sm')}Gravity change check (stand test)</button>`:''}
   <h3 class="sub" style="margin-top:var(--space-xl)">Ground link</h3>
   <p class="muted small">${ls==='up'?`Reports send straight away. A reply takes about ${replyText()}.`:ls==='blackout'?`Communications blackout until ${hm(S.blackoutUntil)} ship time. Everything on board keeps working. Reports send when the link returns.`:`Reports wait on board and send at the next comms window. Messages take ${env().delay}.`}</p>
   <div style="margin-top:var(--space-lg)">
     <div class="kv"><span class="muted">Status</span><span>${ls==='up'?'Connected':ls==='blackout'?'Blackout':'Offline'}</span></div>
     <div class="kv"><span class="muted">Last sync</span><span class="measure">${hm(S.lastSync[id])} ship time</span></div>
     <div class="kv"><span class="muted">Reports waiting</span><span class="measure">${q}</span></div>
     ${sent.map(s=>`<div class="kv"><span class="muted">Sent ${hm(s.t)}, ${esc(s.what)}</span><span class="small">${Date.now()>=s.eta?'Reply may be waiting':`Reply by ${hm(s.eta)}`}</span></div>`).join('')}
   </div>
   <div class="stack" style="margin-top:var(--space-lg);gap:var(--space-xs)">
     <button class="btn" data-act="report">${I('doc','sm')}Create health report</button>
     ${ls==='up'&&q?`<button class="btn btn--primary" data-act="send">Send ${q} now</button>`:''}
     <button class="btn btn--quiet" data-act="link">${ls==='up'?'Simulate link loss':'Simulate link up'}</button>
     ${ls!=='blackout'?`<button class="btn btn--quiet" data-act="blackout">Simulate a 40 minute blackout, like Artemis II behind the Moon</button>`:''}
   </div>
   <h3 class="sub" style="margin-top:var(--space-xl)">Demo</h3>
   <button class="btn btn--sm" data-act="replayStart">${I('play','sm')}Replay the last 30 days</button>
   <h3 class="sub" style="margin-top:var(--space-xl)">Security</h3>
   <p class="muted small">${S.store==='encrypted'?'Your record is encrypted on this device with your passcode. Crew summaries are encrypted so only the CMO can read them.':'On-board storage is not available in this browser, so nothing is saved after you log out.'}</p>
   ${S.store==='encrypted'?`<button class="btn btn--sm" data-act="pin" style="margin-top:var(--space-sm)">${I('lock','sm')}Change passcode</button>`:''}`);
}

/* ---------- log a reading ---------- */
const LOGF=[['hr','Heart rate, bpm',1],['glu','Glucose, mg/dL',1],['temp','Temperature, °C',.1],['spo2','Blood oxygen, %',.1],['sleep','Sleep, hours',.1],['water','Fluids, litres',.1],['mass','Body mass, kg',.1],['kcal','Food energy, kcal',10]];
const LOGC=[['co2','Cabin CO2, ppm',10],['rad','Dosimeter total, mSv',.1]];
let LOGORIG={};
function openLog(focusK){
  if(replaying()){toast('Replay is on. Go back to today to log.');return}
  const e=now();S.logMood=Math.round(e.mood);S.logFat=Math.round(e.fat);FS={};
  const f=(n,l,v,step=1)=>`<div class="field"><label for="f-${n}">${l}</label><input id="f-${n}" name="${n}" type="number" inputmode="decimal" step="${step}" value="${v}"><div class="err" id="e-${n}"></div></div>`;
  const fv=k=>k==='co2'||k==='kcal'?Math.round(e[k]):fx(e[k],M[k].d);
  LOGORIG={sys:Math.round(e.sys),dia:Math.round(e.dia)};[...LOGF,...LOGC].forEach(([k])=>LOGORIG[k]=+fv(k));
  openModal(`${mHead('Log a reading')}
   <p class="muted small" style="margin-top:var(--space-2xs)">Wearable readings sync on their own. Change any value you measured yourself, then save. Only changed values are logged as new readings.</p>
   <form id="logForm" class="form" novalidate>
     ${f('hr',LOGF[0][1],fv('hr'))}
     <div class="field"><label for="f-sys">Blood pressure, mmHg</label><div class="bp"><input id="f-sys" name="sys" type="number" inputmode="numeric" value="${Math.round(e.sys)}" aria-label="Systolic"><span class="muted">/</span><input name="dia" type="number" inputmode="numeric" value="${Math.round(e.dia)}" aria-label="Diastolic"></div><div class="err" id="e-sys"></div></div>
     ${LOGF.slice(1).map(([k,l,s])=>f(k,l,fv(k),s)).join('')}
     <div class="field"><span class="small muted" style="display:block;margin-bottom:var(--space-2xs)" id="moodL">Mood, 1 to 5</span><div class="moods" role="group" aria-labelledby="moodL">${[1,2,3,4,5].map(v=>`<button type="button" aria-pressed="${S.logMood===v}" data-act="logMood" data-v="${v}">${v}</button>`).join('')}</div></div>
     <div class="field"><span class="small muted" style="display:block;margin-bottom:var(--space-2xs)" id="fatL">Fatigue, 1 fully alert to 7 exhausted</span><div class="moods" role="group" aria-labelledby="fatL">${[1,2,3,4,5,6,7].map(v=>`<button type="button" aria-pressed="${S.logFat===v}" data-act="logFat" data-v="${v}">${v}</button>`).join('')}</div></div>
     <details class="more" style="grid-column:1/-1;margin-top:0"><summary>Measure with a device ${I('down','sm')}</summary><div class="inner stack" style="gap:var(--space-sm)">
       <div class="row" style="flex-wrap:wrap"><button type="button" class="btn btn--sm" data-act="btHR">${I('bt','sm')}Connect heart rate strap</button><button type="button" class="btn btn--sm" data-act="camHR">${I('camera','sm')}Heart rate by camera</button></div>
       <p class="small muted">Camera: cover the back camera and its light with a fingertip for 20 seconds. It is an estimate, so check it against a pulse oximeter.</p>
       <div id="ppgBox" hidden><video id="ppgV" playsinline muted aria-label="Camera preview" style="width:120px;height:90px;border-radius:var(--radius-pill);background:var(--color-paper-3)"></video></div>
       <div class="row" style="flex-wrap:wrap;align-items:flex-end"><div class="field" style="flex:1;min-width:180px"><label for="ocrKey">Read a device display</label><select id="ocrKey">${['hr','bp','glu','temp','spo2','mass'].map(k=>`<option value="${k}">${M[k].n}</option>`).join('')}</select></div><button type="button" class="btn btn--sm" data-act="ocr">${I('camera','sm')}Photo of the display</button><input type="file" id="ocrFile" accept="image/*" capture="environment" class="visually-hidden" tabindex="-1" aria-hidden="true"></div>
       <p id="capMsg" class="small muted" role="status"></p>
     </div></details>
     <details class="more" style="grid-column:1/-1;margin-top:0"><summary>Cabin air and radiation dose ${I('down','sm')}</summary><div class="inner"><div class="form" style="margin-top:0">${LOGC.map(([k,l,s])=>f(k,l,fv(k),s)).join('')}</div></div></details>
     <details class="more" style="grid-column:1/-1;margin-top:0"><summary>Add a photo or scan ${I('down','sm')}</summary><div class="inner stack" style="gap:var(--space-sm)">
       <p class="small muted">A wound or rash, an eye photo, or an ultrasound image. It is stored on board and queued for the flight surgeon.</p>
       <div class="field"><label for="imgTag">What is it?</label><select id="imgTag">${IMGTAGS.map(t=>`<option>${t}</option>`).join('')}</select></div>
       <div class="row" style="flex-wrap:wrap"><button type="button" class="btn btn--sm" data-act="camOn">Use camera</button><button type="button" class="btn btn--sm" data-act="pickFile">Choose image</button><input type="file" id="imgFile" accept="image/*" class="visually-hidden" tabindex="-1" aria-hidden="true"></div>
       <div id="camBox" class="stack" style="gap:var(--space-xs)" hidden><video id="camV" playsinline muted aria-label="Camera preview"></video><button type="button" class="btn btn--sm" data-act="camSnap">Take photo</button></div>
       <p id="imgMsg" class="small muted" role="status"></p>
     </div></details>
     <button class="btn btn--primary" type="submit" style="grid-column:1/-1">Save and update status</button>
   </form>`);
  if(focusK){setTimeout(()=>{const i=$(focusK==='bp'?'#f-sys':'#f-'+focusK);if(i){const d=i.closest('details');if(d)d.open=true;i.focus();i.select&&i.select()}},60)}
}
function submitLog(form){
  const f=new FormData(form),id=S.crew,before=overall();let bad=false;
  const lim={hr:M.hr.lim,sys:[60,260],dia:[30,160],glu:M.glu.lim,temp:M.temp.lim,spo2:M.spo2.lim,sleep:M.sleep.lim,water:M.water.lim,mass:M.mass.lim,kcal:M.kcal.lim,co2:M.co2.lim,rad:M.rad.lim};
  $$('#logForm .err').forEach(x=>x.textContent='');$$('#logForm input').forEach(x=>x.removeAttribute('aria-invalid'));
  const v={};
  Object.keys(lim).forEach(k=>{const x=parseFloat(f.get(k)),el=form.querySelector(`[name="${k}"]`);
    if(isNaN(x)||x<lim[k][0]||x>lim[k][1]){bad=true;el.setAttribute('aria-invalid','true');const d=el.closest('details');if(d)d.open=true;const er=$('#e-'+(k==='dia'?'sys':k));if(er)er.textContent='Not a possible value. Measure again.'}else v[k]=x});
  if(bad)return;
  let n=0,unc=0;
  const changed=k=>FS[k]||Math.abs(v[k]-LOGORIG[k])>1e-9;
  if(FS.bp||changed('sys')||changed('dia')){const u=needsConfirm(id,'bp',v.sys,v.dia);recordReading('bp',v.sys,v.dia,FS.bp||'manual',{unc:u});n++;unc+=u}
  [...LOGF,...LOGC].forEach(([k])=>{if(changed(k)){const u=needsConfirm(id,k,v[k]);recordReading(k,v[k],null,FS[k]||'manual',{unc:u});n++;unc+=u}});
  recordReading('mood',S.logMood,null,'self');recordReading('fat',S.logFat,null,'self');
  if(!S.missions[id][0]){S.missions[id][0]=true;S.xp[id]+=MISSIONS[0][1]}
  S.region=null;const after=overall();closeAll();render();
  toast(`Saved ${n+2} reading${n?'s':''}. Status is ${LV[after]}${after!==before?`, was ${LV[before]}`:''}.${unc?` ${unc} high reading${unc>1?'s need':' needs'} a repeat in 10 minutes to confirm.`:''}`);
}

/* ---------- pain, medication, passcode ---------- */
let PN={};
function openPain(region){
  const loc=(PAINLOC.find(p=>p[1]===region)||PAINLOC[0])[0];PN={score:null,loc};
  openModal(`${mHead('Log pain')}
   <p class="muted small" style="margin-top:var(--space-2xs)">HALO adds it to the body map and tells the CMO if it is 8 or more.</p>
   <form id="painForm" class="form" novalidate>
     <div class="field"><label for="pLoc">Where</label><select id="pLoc">${PAINLOC.map(([l])=>`<option ${l===loc?'selected':''}>${l}</option>`).join('')}</select></div>
     <div class="field"><label for="pOn">When did it start?</label><select id="pOn">${['Just now','Under an hour ago','Earlier today','Yesterday or before'].map(o=>`<option>${o}</option>`).join('')}</select></div>
     <div class="field" style="grid-column:1/-1"><span class="small muted" style="display:block;margin-bottom:var(--space-2xs)" id="pS">How bad, 0 none to 10 worst</span><div class="moods" role="group" aria-labelledby="pS">${[...Array(11)].map((_,v)=>`<button type="button" aria-pressed="false" data-act="painScore" data-v="${v}">${v}</button>`).join('')}</div><div class="err" id="e-pain"></div></div>
     <div class="field" style="grid-column:1/-1"><label for="pNote">What makes it better or worse? (optional)</label><input id="pNote" type="text" style="font-family:var(--font-body);font-size:var(--text-md)" maxlength="140"></div>
     <button class="btn btn--primary" type="submit" style="grid-column:1/-1">Save pain</button>
   </form>`);
}
function submitPain(){
  if(PN.score==null){$('#e-pain').textContent='Choose a number from 0 to 10.';return}
  const loc=$('#pLoc').value,region=(PAINLOC.find(p=>p[0]===loc)||PAINLOC[0])[1];
  S.pain[S.crew].push({t:Date.now(),loc,region,score:PN.score,onset:$('#pOn').value,note:$('#pNote').value.trim()});S.logged[S.crew].add(dayKey(new Date()));
  S.region=region;closeAll();if(S.tab!=='body')S.tab='body';render();
  toast(PN.score>=8?'Pain of 8 or more: alert the CMO now.':`Pain ${PN.score} of 10 logged on the body map.`);
}
const KIT=['Paracetamol','Ibuprofen','Aspirin','Anti-nausea medicine','Antihistamine','Sleep aid','Decongestant','Antibiotic','Eye drops','Other'];
function openMeds(){
  openModal(`${mHead('Log medication')}
   <p class="muted small" style="margin-top:var(--space-2xs)">Record what you took from the medical kit. HALO never suggests doses: follow the kit protocol and the CMO.</p>
   <form id="medForm" class="form" novalidate>
     <div class="field"><label for="mDrug">Medicine</label><select id="mDrug">${KIT.map(k=>`<option>${k}</option>`).join('')}</select></div>
     <div class="field"><label for="mAmt">Amount, as on the pack</label><input id="mAmt" type="text" style="font-family:var(--font-body);font-size:var(--text-md)" placeholder="1 tablet" maxlength="40"><div class="err" id="e-med"></div></div>
     <div class="field" style="grid-column:1/-1"><label for="mWhy">Why (optional)</label><input id="mWhy" type="text" style="font-family:var(--font-body);font-size:var(--text-md)" maxlength="80"></div>
     <button class="btn btn--primary" type="submit" style="grid-column:1/-1">Save</button>
   </form>`);
}
function submitMeds(){
  const amt=$('#mAmt').value.trim();if(!amt){$('#e-med').textContent='Add the amount you took.';return}
  S.meds[S.crew].push({t:Date.now(),drug:$('#mDrug').value,amount:amt,reason:$('#mWhy').value.trim()});closeAll();render();toast('Medication logged.');
}
function openPin(){
  const f=(id,l)=>`<div class="field"><label for="${id}">${l}</label><input id="${id}" type="password" inputmode="numeric" maxlength="4" autocomplete="off"></div>`;
  openModal(`${mHead('Change passcode')}
   <p class="muted small" style="margin-top:var(--space-2xs)">Four digits. Your record is re-encrypted with the new passcode.</p>
   <form id="pinForm" class="form" novalidate>${f('pOld','Current passcode')}<div></div>${f('pNew','New passcode')}${f('pNew2','New passcode again')}
     <p id="pinMsg" class="small" role="status" style="grid-column:1/-1;color:var(--st-r)"></p>
     <button class="btn btn--primary" type="submit" style="grid-column:1/-1">Change passcode</button></form>`);
}
async function submitPin(){
  const o=$('#pOld').value,n=$('#pNew').value,n2=$('#pNew2').value,m=$('#pinMsg');
  if(!/^\d{4}$/.test(n)){m.textContent='The new passcode must be 4 digits.';return}if(n!==n2){m.textContent='The two new passcodes do not match.';return}
  m.style.color='';m.textContent='Re-encrypting';
  const r=await changePin(o,n);if(r==='wrong'){m.style.color='var(--st-r)';m.textContent='The current passcode is not right.';return}
  closeAll();toast('Passcode changed. Your record is re-encrypted.');
}

/* ---------- EVA go/no-go ---------- */
let EV={dcs:null,sym:null};
function evaChecks(){
  const e=now(),g=G[S.crew],pvtRecent=g.lastPvtT&&Date.now()-g.lastPvtT<DAY,red=conditions().filter(a=>a.lvl==='r');
  return [
    ['Sleep last night',e.sleep>=6?'g':e.sleep>=5?'a':'r',`${fx(e.sleep,1)} h`],
    ['Vigilance check in the last 24 hours',pvtRecent?pvtStat(g.lastReact,g.lastLapses||0,g.base):'a',pvtRecent?`${g.lastReact} ms, ${g.lastLapses} lapses`:'Not done yet'],
    ['Heart rate',stat('hr',e),`${val('hr',e)} bpm`],['Blood pressure',stat('bp',e),`${val('bp',e)} mmHg`],['Temperature',stat('temp',e),`${val('temp',e)} °C`],['Blood oxygen',stat('spo2',e),`${val('spo2',e)}%`],
    ['Fatigue',stat('fat',e),`${e.fat} of 7`],['Near vision',stat('vis',e),val('vis',e)],
    ['Open urgent alerts',red.length?'r':'g',red.length?red.map(a=>a.t).join(', '):'None'],
    ['Tingling, numbness or joint pain since the last EVA',EV.dcs===true?'r':EV.dcs===false?'g':'a',EV.dcs==null?'Answer below':EV.dcs?'Yes':'No'],
    ['Headache, nausea or a vision change today',EV.sym===true?'a':EV.sym===false?'g':'a',EV.sym==null?'Answer below':EV.sym?'Yes':'No']];
}
function openEva(){
  const C=evaChecks(),v=worst(C.map(c=>c[1])),W={g:'Go',a:'Check with CMO',r:'No go'},g=G[S.crew];
  openModal(`${mHead('EVA go/no-go')}
   <div class="statusBlock ${v}" style="margin-top:var(--space-lg)">${I(STI[v])}<span class="statusWord" style="font-size:var(--text-3xl)">${W[v]}</span></div>
   <p class="muted small" style="margin-top:var(--space-sm)">${v==='g'?'Every check is in range. The final call is the commander\'s and the CMO\'s.':v==='a'?'Something needs a closer look or an answer. Talk to the CMO before suiting up.':'Do not start the EVA. Tell the CMO.'}</p>
   <div style="margin-top:var(--space-md)">${C.map(([n,s,t])=>`<div class="kv"><span><span style="color:var(--color-ink)">${n}</span><span class="muted small" style="display:block">${esc(t)}</span></span>${stTag(s,'small')}</div>`).join('')}</div>
   <div class="stack" style="margin-top:var(--space-lg);gap:var(--space-sm)">
     <div><span class="small muted" style="display:block;margin-bottom:var(--space-2xs)">Any tingling, numbness or joint pain since your last EVA?</span>${seg2('evaDcs',EV.dcs,[[true,'Yes'],[false,'No']])}</div>
     <div><span class="small muted" style="display:block;margin-bottom:var(--space-2xs)">Any headache, nausea or vision change today?</span>${seg2('evaSym',EV.sym,[[true,'Yes'],[false,'No']])}</div>
   </div>
   <div class="row" style="margin-top:var(--space-lg);flex-wrap:wrap">${!(g.lastPvtT&&Date.now()-g.lastPvtT<DAY)?`<button class="btn btn--sm" data-act="game" data-v="reflex">${I('clock','sm')}Start vigilance check</button>`:''}<button class="btn btn--sm btn--primary" data-act="evaSend">Send to the CMO</button></div>`);
}

/* ---------- gravity change check (stand test) ---------- */
let OT=null;
function stopOrtho(){if(OT&&OT.int){clearInterval(OT.int);OT.int=null}}
function openOrtho(){if(replaying()){toast('Replay is on. Go back to today to test.');return}stopOrtho();const e=now();OT={step:1,lie:{hr:Math.round(e.hr),sys:Math.round(e.sys),dia:Math.round(e.dia)},stand:{},left:180,speed:1,sym:null};openModal('<div id="orthoBox"></div>');paintOrtho()}
function paintOrtho(){
  const b=$('#orthoBox');if(!b||!OT)return;const o=OT;
  const trio=(p,v)=>`<div class="form" style="margin-top:var(--space-md)"><div class="field"><label for="${p}hr">Heart rate, bpm</label><input id="${p}hr" type="number" inputmode="numeric" value="${v.hr??''}"></div><div class="field"><label for="${p}sys">Blood pressure, mmHg</label><div class="bp"><input id="${p}sys" type="number" inputmode="numeric" value="${v.sys??''}" aria-label="Systolic"><span class="muted">/</span><input id="${p}dia" type="number" inputmode="numeric" value="${v.dia??''}" aria-label="Diastolic"></div></div></div><p id="oErr" class="small" style="color:var(--st-r);margin-top:var(--space-xs)"></p>`;
  if(o.step===1){b.innerHTML=`${mHead('Gravity change check')}<div class="setup"><p class="cue">After arriving in ${env().g.toLowerCase()}, your circulation needs time to adjust and standing up can make you faint. This test checks how your heart and blood pressure respond.</p>
    <p><b style="font-weight:500">Step 1.</b> Lie or sit still for 5 minutes with the cuff on, then measure.</p>${trio('l',o.lie)}${speedSeg(o.speed,'oSpeed')}
    <p class="safety">Have a crewmate nearby. Sit down at once if you feel faint.</p><button class="btn btn--primary bigBtn" data-act="oStart">Stand up and start 3 minutes</button></div>`;return}
  if(o.step===2){const C=2*Math.PI*104,frac=o.left/180;b.innerHTML=`${mHead('Gravity change check')}<div class="stage"><span class="muted">Step 2. Stand still</span>
    <div class="ringBox"><svg viewBox="0 0 240 240" aria-hidden="true"><circle class="rt" cx="120" cy="120" r="104"/><circle class="rp" cx="120" cy="120" r="104" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-frac)}"/></svg><div class="c"><div><div class="phase">Stand</div><div class="clock" role="timer">${mmss(o.left)}</div></div></div></div>
    <p class="cue">Stand upright and hold on to something. Keep the cuff arm relaxed at heart level. Measure again when the timer ends.</p><button class="btn btn--quiet btn--sm" data-act="oSkip">I am ready to measure now</button></div>`;return}
  if(o.step===3){b.innerHTML=`${mHead('Gravity change check')}<div class="setup"><p><b style="font-weight:500">Step 3.</b> Still standing, measure again.</p>${trio('s',o.stand)}
    <div><span class="small muted" style="display:block;margin-bottom:var(--space-2xs)">Did you feel dizzy, faint or have blurred vision while standing?</span>${seg2('oSym',o.sym,[[true,'Yes'],[false,'No']])}</div>
    <button class="btn btn--primary" data-act="oSave">See the result</button></div>`;return}
  const r=o.result;b.innerHTML=`${mHead('Gravity change check')}<div class="stage">${stChip(r.lvl)}<div class="phase" style="font-size:var(--text-2xl)">${r.title}</div>
    <p class="cue">Top number ${r.dSys>=0?'fell':'rose'} ${Math.abs(r.dSys)} mmHg, bottom ${r.dDia>=0?'fell':'rose'} ${Math.abs(r.dDia)}, heart rate ${r.dHr>=0?'rose':'fell'} ${Math.abs(r.dHr)} bpm on standing.</p><p class="cue">${r.advice}</p>
    <button class="btn btn--primary" data-act="closeAll" autofocus>Done</button></div>`;
}
function readTrio(p){const g=id=>parseFloat(($('#'+p+id)||{}).value);const v={hr:g('hr'),sys:g('sys'),dia:g('dia')};
  if([v.hr,v.sys,v.dia].some(isNaN)||v.hr<25||v.hr>230||v.sys<60||v.sys>260||v.dia<30||v.dia>160){$('#oErr').textContent='Check the three numbers.';return null}return v}

/* ---------- guided measurement ---------- */
let GM=null;
function stopGuide(){if(GM&&GM.int){clearInterval(GM.int)}GM=null}
function openGuide(k){stopGuide();GM={k,total:M[k].guide.sec,left:M[k].guide.sec,speed:1,int:null,run:false};openModal('<div id="guideBox"></div>');paintGuide()}
function paintGuide(){
  const b=$('#guideBox');if(!b||!GM)return;const g=GM,C=2*Math.PI*104,frac=g.left/g.total,done=g.left<=0;
  b.innerHTML=`${mHead('Guided '+M[GM.k].n.toLowerCase())}<div class="stage">
    <div class="ringBox"><svg viewBox="0 0 240 240" aria-hidden="true"><circle class="rt" cx="120" cy="120" r="104"/><circle class="rp easy" cx="120" cy="120" r="104" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-frac)}"/></svg><div class="c"><div><div class="phase">${done?'Measure':g.run?'Rest':'Ready'}</div><div class="clock" role="timer">${mmss(Math.max(0,g.left))}</div></div></div></div>
    <p class="cue">${done?`Take the reading now with the ${M[g.k].tool.toLowerCase()}.`:M[g.k].guide.cue}</p>
    ${done?`<button class="btn btn--primary bigBtn" data-act="guideLog" autofocus>Log the reading</button>`:g.run?`<button class="btn" data-act="guideStop">Pause</button>`:`${speedSeg(g.speed,'guideSpeed')}<button class="btn btn--primary bigBtn" data-act="guideGo" autofocus>Start</button>`}</div>`;
}

/* ---------- health report (small file for a slow link) ---------- */
function makeReport(id){
  const c=CREW.find(x=>x.id===id),live=id===S.crew||!S.shares[id];
  if(!live)return {halo:'report',v:2,made:new Date().toISOString(),by:crew().name,crew:{id,name:c.name,role:c.role},summary:S.shares[id]};
  const e=now(id),w=k=>{const x=wk(k,id);return {last7:+fx(x.last,2),prev7:+fx(x.prev,2)}};
  return {halo:'report',v:2,made:new Date().toISOString(),missionDay:mday(e),mission:ENV[S.env].long,crew:{id,name:c.name,role:c.role},
    status:overall(id),readiness:readiness(id),readinessParts:readinessParts(id).map(p=>({item:p[0],minus:p[1]})),
    today:Object.fromEntries(Object.keys(M).map(k=>[k,{value:val(k,e),unit:M[k].u,status:LV[stat(k,e)],note:statNote(k,e)||undefined}])),
    trend7d:Object.fromEntries(['hr','sys','glu','temp','sleep','mood','spo2','ex','fat','pvt','kcal','mass'].map(k=>[k,w(k)])),
    patterns:detect(id).map(r=>({title:r.title,level:LV[r.lvl],why:r.why})),
    alerts:Object.entries(S.al[id]).map(([k,r])=>({id:k,title:r.title,level:LV[r.lvl],state:ALSTATE[r.state],history:r.hist.slice(-5).map(h=>({t:new Date(h.t).toISOString(),ev:h.ev}))})),
    readingsLogged24h:S.log[id].filter(x=>Date.now()-x.t<DAY).map(x=>({t:new Date(x.t).toISOString(),k:x.k,v:x.v,v2:x.v2||undefined,src:SRC[x.src]||x.src,unconfirmed:x.unc||undefined})),
    pain:S.pain[id].slice(-5),meds:S.meds[id].slice(-10),vision:S.vision[id].slice(-3),standTests:S.ortho[id].slice(-3),
    images:S.images[id].length,
    consent:S.consent[id],mood:S.consent[id].mood?val('mood',e):'not shared'};
}
function downloadReport(id){
  const rep=makeReport(id),txt=JSON.stringify(rep),blob=new Blob([txt],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download=`halo-report-${id}-day${rep.missionDay||''}-${dayKey(new Date())}.json`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);
  return blob.size;
}
function sendQueued(what){
  const id=S.crew,q=S.queued[id],t=Date.now();if(!q)return 0;
  S.queued[id]=0;S.lastSync[id]=t;S.sent[id].push({t,what:what||`${q} report${q>1?'s':''}`,eta:t+replyMin()*MIN});if(S.sent[id].length>20)S.sent[id].shift();return q;
}

/* =========================================================
   HEALTH BUDDY
   On-board library: triage protocols that always run locally,
   so urgent advice never waits on a network. Questions about
   spaceflight hazards and risks are answered from knowledge.md
   (NASA Human Research Program material). No AI model is used.
   ========================================================= */
const CMO='the Crew Medical Officer (CMO)';
const PROTO=[
 {id:'mind-crisis',lvl:'r',re:/suicid|kill (my|him|her)self|end (my|it all)|self[- ]?harm|hurt(ing)? myself|want to die|no reason to live/i,title:'You do not have to handle this alone',
  steps:['Tell the CMO or a crewmate now, and stay with someone.','Move away from anything you could use to hurt yourself.','Breathe with me: in for 4, hold for 4, out for 4.','A private call with the ground psychologist will be set up at the next link.'],
  help:'This is urgent. HALO has flagged it for the CMO only, not the whole crew.'},
 {id:'chest',lvl:'r',re:/chest (pain|tight|pressure|hurt|discomfort|ache)|chest feels? (tight|heavy|crushed|like)|tight(ness)? (in|across) (my )?chest|pain in (my )?chest|crushing|heart attack|pain.*(left arm|jaw)/i,title:'Chest pain',
  steps:['Stop all activity. Secure yourself and rest.','Alert '+CMO+' now.','Measure heart rate, blood pressure and oxygen, and log them.','The CMO may give aspirin from the kit per protocol if you are not allergic.','If someone collapses or stops breathing normally, start CPR and use the defibrillator.'],
  help:'Treat chest pain as urgent until the CMO says otherwise.'},
 {id:'breath',lvl:'r',re:/can'?t breathe|cannot breathe|short(ness)? of breath|trouble breathing|struggling to breathe|choking|breathless|wheez/i,title:'Trouble breathing',
  steps:['Stop and sit or brace upright.','If there is smoke, fumes or an alarm, put on your emergency mask first.','Check oxygen with the pulse oximeter. Below 92% is urgent.','Alert '+CMO+' now. Oxygen is in the medical kit.'],
  help:'Urgent if lips turn blue, speech is difficult, or oxygen stays below 92%.'},
 {id:'toxic',lvl:'r',re:/smoke|fumes|ammonia|burning smell|toxic|gas leak|co2 alarm|scrubber/i,title:'Possible toxic exposure',
  steps:['Put on your emergency mask now.','Leave the module and close the hatch if the procedure allows.','Alert the crew and the CMO.','Once safe, check oxygen and note any headache, cough or eye irritation.'],
  help:'Follow the emergency procedure first. Health checks come after you are safe.'},
 {id:'faint',lvl:'r',re:/faint(ed)?|passed out|black(ed)? ?out|unconscious|collapsed|not respond|not breathing/i,title:'Fainting or collapse',
  steps:['Secure the person so they cannot drift or fall.','Check that they respond and breathe normally. If not, start CPR and call the CMO.','If breathing, lie them flat. On a planet, raise the legs.','Once stable, check glucose and blood pressure.','Alert the CMO even if they recover quickly.'],
  help:'Any loss of consciousness needs the CMO to review.'},
 {id:'dcs',lvl:'r',re:/(eva|spacewalk|space walk|suit|depress).*(tingl|numb|pins and needles|joint (pain|ache)|aching joint|itch|skin rash|blotch|bends)|(tingl|numb|pins and needles|joint (pain|ache)|aching joint|itch|blotch).*(eva|spacewalk|space walk|suit)/i,title:'Possible decompression sickness',
  steps:['Stop activity and stay still. Do not start another EVA.','Alert '+CMO+' now and say it followed an EVA.','Breathe 100% oxygen from the medical kit as soon as possible.','Drink water if you are alert and not vomiting.','The CMO decides on repressurisation per the decompression sickness protocol.'],
  help:'Tingling, numbness, joint pain or blotchy itchy skin after an EVA is treated as decompression sickness until ruled out.'},
 {id:'stroke',lvl:'r',re:/hit (my|his|her|their) head|head injury|concuss|confus|slurred|can'?t speak|face droop|weak(ness)? on one side|numb on one side/i,title:'Head injury or confusion',
  steps:['Stop work and stay still. Do not go on an EVA.','Alert '+CMO+' now.','Note the time it started. This matters for treatment.','Check face, arm and speech: is one side weak, or is speech slurred?','Someone stays with you until the CMO arrives.'],
  help:'Urgent: one-sided weakness, slurred speech, repeated vomiting or worsening headache.'},
 {id:'vision-loss',lvl:'r',re:/sudden(ly)?.*(vision|see)|lost (my )?vision|can'?t see|went blind|curtain over/i,title:'Sudden vision change',
  steps:['Stop what you are doing and stay still.','Alert '+CMO+' now.','Cover each eye in turn and note what you can and cannot see.','The CMO may run an eye ultrasound and send images to Earth.'],
  help:'Sudden vision loss is urgent. Slow blurring is less urgent: log it with the HALO vision check.'},
 {id:'bleed',lvl:'a',re:/bleed|blood everywhere|deep cut|cut (my|his|her)|laceration|wound/i,up:/won'?t stop|spurt|heavy|a lot|soak|everywhere/i,title:'Bleeding',
  steps:['Press firmly on the wound with a clean pad for 10 minutes without lifting.','Raise the area above the heart if you can.','Wear gloves and contain droplets. Blood floats in microgravity.','If blood soaks through or spurts, keep pressing and alert the CMO now.','Once it stops, clean, dress and photo-log the wound.'],
  help:'Urgent if bleeding does not slow after 10 minutes of firm pressure.'},
 {id:'hypo',lvl:'a',re:/low (blood )?sugar|hypo(glyc)?|shaky|sweaty|glucose (is )?(low|[2-5]\d\b)/i,up:/confus|drows|can'?t swallow|unconscious/i,title:'Low blood sugar',
  steps:['If you can swallow safely, take 15 g of fast-acting glucose from the kit.','Re-check glucose in 15 minutes. Repeat if it is still under 70 mg/dL.','When it is above 70, eat a snack with protein.','Log the readings so HALO can track them.'],
  help:'Urgent if drowsy, confused or unable to swallow. The CMO has glucagon in the kit.'},
 {id:'fever',lvl:'a',re:/fever|temperature|chills|feverish|feel hot/i,up:/39|40|stiff neck|rash|breath/i,title:'Fever',
  steps:['Measure and log your temperature now.','Rest in your quarters and limit contact with the crew.','Drink 500 ml of water and keep sipping.','Paracetamol from the kit can help, per the kit protocol.','Re-check every 2 hours.'],
  help:'Alert the CMO at 38.1 °C or more, or with a fast heart rate, stiff neck, rash or trouble breathing.'},
 {id:'flank',lvl:'a',re:/flank|kidney|side pain|pain in my side|blood in (my )?urine|(pee|peeing|urine).*blood/i,up:/severe|worst|unbearable|vomit|fever/i,title:'Side or kidney pain',
  steps:['Drink water steadily unless you are vomiting.','Use Log pain on the body map and rate it from 1 to 10.','Tell the CMO. An ultrasound can check for a kidney stone.','Pain relief and anti-nausea medicine are in the kit. The CMO decides.'],
  help:'Urgent with fever, vomiting that will not stop, or pain you cannot bear.'},
 {id:'radiation',lvl:'a',re:/radiation|solar (flare|particle|storm)|\bspe\b/i,title:'Radiation event',
  steps:['If an alert is active, go to the storm shelter now.','Keep your personal dosimeter on.','Afterwards, log your dosimeter total and any nausea, tiredness or skin changes.','The CMO can give anti-nausea medicine.'],
  help:'Follow the shelter procedure first. HALO logs your dose for the long term.'},
 {id:'injury',lvl:'a',re:/sprain|strain|twist|fractur|broke|broken|swollen|shoulder|wrist|ankle|knee|back pain|pulled a muscle/i,up:/deform|numb|can'?t move|bone (is )?(out|showing)/i,title:'Strain or injury',
  steps:['Stop the task and rest the area.','Cold pack for 15 minutes, a few times a day.','Support it with a sling or splint from the kit if it hurts to move.','Use Log pain on the body map to record it.'],
  help:'Tell the CMO if it looks deformed, feels numb, or you cannot move it. Ultrasound can check for a fracture.'},
 {id:'dental',lvl:'a',re:/tooth|teeth|dental|filling|gum/i,title:'Tooth pain',
  steps:['Rinse with warm water.','Use the temporary filling material from the dental kit if a filling fell out.','Pain relief from the kit, per protocol.','Tell the CMO, especially if your face swells.'],
  help:'Swelling or fever may mean an abscess. The CMO may start antibiotics.'},
 {id:'nausea',lvl:'a',re:/nause|vomit|throw(ing)? up|threw up|motion sick|space sick|queasy/i,up:/blood|day(s)?/i,title:'Nausea',
  steps:['Keep your head still and fix your eyes on one stable point.','Sip small amounts of water. Keep a sick bag close.','Anti-nausea medicine is in the kit, per protocol.','Log it so HALO can spot a pattern.'],
  help:'Tell the CMO if vomiting lasts more than 24 hours or there is blood.'},
 {id:'blur',lvl:'a',re:/blurr?(y|ed)? vision|vision (is )?blurr|can'?t read|hard to read|near vision|eyes? (feel|are) (strained|blurry)/i,title:'Blurred near vision',
  steps:['Do the HALO vision check now: near-vision card and Amsler grid.','Use your space anticipation glasses for close work if you have them.','Tell the CMO. An eye ultrasound can check the back of the eye.'],
  help:'Slow blurring in space can be an early sign of SANS. Sudden vision loss is urgent.'},
 {id:'headache',lvl:'a',re:/headache|head hurts|migraine/i,up:/sudden|worst|stiff neck|vision/i,title:'Headache',
  steps:['Check the cabin CO2 reading. High CO2 causes headaches.','Drink 500 ml of water.','Rest with lights low for 30 minutes.','Pain relief from the kit, per protocol.'],
  help:'Urgent if sudden and severe, or with vision change, confusion or a stiff neck.'},
 {id:'dizzy',lvl:'a',re:/dizz|light.?headed|vertigo|spinning/i,title:'Dizziness',
  steps:['Stop, hold on to something, and sit or brace.','Breathe slowly. It often passes within a minute.','Drink water, then check blood pressure and glucose.','After a landing, do the gravity change check from the Mission panel.'],
  help:'Urgent if you faint, or have chest pain or weakness on one side.'},
 {id:'mood',lvl:'a',re:/\bsad\b|lonely|depress|anxious|anxiety|stress|homesick|feel(ing)? down|can'?t cope|conflict|argument/i,title:'Feeling low or stressed',
  steps:['Thank you for saying it. This is common on long missions.','Try a 4 minute breathing reset: in 4, hold 4, out 4, hold 4.','Book a private call home or with the ground psychologist.','Ten minutes at the window or some music can help.'],
  help:'Talk to the CMO if it lasts more than a few days. Your mood data is shared only if you allow it.'},
 {id:'sleep',lvl:'a',re:/can'?t sleep|insomnia|tired|fatigue|exhaust|no energy|sleepy/i,title:'Tiredness and poor sleep',
  steps:['Protect an 8 hour sleep window tonight.','Warm, dim cabin light an hour before bed. Eye mask and earplugs.','No caffeine after 13:00.','Before a critical task, take the 3 minute vigilance check.'],
  help:'Tell the CMO if you are under 5 hours for 3 nights. Sleep aids are in the kit.'}
];
const ALIAS={hr:/heart ?rate|\bhr\b|pulse/i,bp:/blood pressure|\bbp\b/i,glu:/glucose|blood sugar|\bsugar\b/i,temp:/temp(erature)?/i,sleep:/sleep/i,mood:/mood/i,spo2:/oxygen|spo2|o2 sat/i,water:/hydrat|water|fluid/i,ex:/exercise|workout|training/i,bone:/bone/i,
  vis:/near vision|eyesight|vision check|amsler/i,pvt:/vigilance|reaction time|\bpvt\b|lapses/i,fat:/fatigue score|fatigue/i,mass:/body mass|weight|\bmass\b/i,kcal:/calorie|kcal|food energy/i,co2:/\bco2\b|carbon dioxide/i,rad:/radiation dose|\bdose\b|dosimeter/i};
const GLOSS={sans:['SANS','Spaceflight associated neuro-ocular syndrome. Fluid shifts toward the head and can swell the back of the eye, blurring near vision. HALO tracks it with the weekly vision check.'],
  'bone loss':['Bone loss','Bones that carry no weight lose density in space. Daily resistance exercise, vitamin D and enough calcium slow it down.'],
  'pvt':['Vigilance check (PVT)','The psychomotor vigilance test measures how quickly and reliably you respond. NASA\'s Cognition battery uses a 3 minute version, PVT-B, because it picks up the effects of sleep loss.'],
  radiation:['Space radiation','Outside Earth\'s magnetic field, crews absorb more radiation. Solar storms can spike the dose, so the crew shelters behind water and food stores.'],
  circadian:['Circadian rhythm','Your body clock. On a spacecraft the sun does not set the day, so lighting and a steady schedule keep it on track.']};
function metricOf(t){return Object.keys(ALIAS).find(k=>ALIAS[k].test(t))}
function protoCard(p,lvl){return {kind:'proto',lvl,title:p.title,steps:p.steps,help:lvl==='r'?`${p.help} ${escText()}`:p.help,id:p.id}}
/* remove negated clauses ("no chest pain", "I don't have a fever") up to the next but/and */
const NEG_RE=/\b(?:no|without|denies|deny|never had|don'?t have|do not have|haven'?t had|have not had|not having|no longer have|free of)\b(?:(?!\b(?:but|and|though|although|however|except|yet|now)\b)[^.,;!?])*/gi;
const stripNeg=t=>t.replace(NEG_RE,' ');
function localReply(text){
  const t=text.trim(),tn=stripNeg(t),c=crew(),e=now();
  // 1. crisis on the full text, other red flags on the text without negated clauses
  const crisis=PROTO[0];if(crisis.re.test(t))return protoCard(crisis,'r');
  for(const p of PROTO.filter(p=>p.lvl==='r'&&p!==crisis))if(p.re.test(tn))return protoCard(p,'r');
  // 2. log command
  const lm=t.match(/^(?:log|record|add)\s+(?:my\s+)?([a-z0-9 ]+?)(?:\s*(?:is|of|at|:)\s*|\s+)(\d+(?:\.\d+)?)(?:\s*(?:\/|over)\s*(\d+))?/i);
  if(lm){const k=metricOf(lm[1]);if(k)return logValue(k,parseFloat(lm[2]),lm[3]?parseFloat(lm[3]):null)}
  if(/\b(workout|exercise|train|training|work out)\b/i.test(t)&&/\?|what|which|suggest|should|recommend|game/i.test(t)&&!/hurt|pain|dizz|breath/i.test(t)){
    const ex=now().ex,urg=overall()==='r';
    return {kind:'text',lvl:null,title:urg?'Rest first':'Try a Train session',train:!urg,paras:[urg?'Your status is Urgent, so hold off on workouts until the CMO clears you.':`${ex<120?`You have ${fx(ex)} of 120 minutes today. `:`You have trained ${fx(ex)} minutes today, past your 120 target. `}${ex<120?`About ${Math.ceil((120-ex)/24)} interval session${Math.ceil((120-ex)/24)>1?'s':''} would close the gap.`:'A light session still counts toward your quests.'}`],
      steps:urg?[]:['Orbit intervals: cardio for your heart.','Gravity lifts: protects bones and muscle.','Vigilance check: before an EVA or a critical task.']};
  }
  // 3. questions about readings
  const k=metricOf(t);
  if(k&&/^(why|what|how|is|are|explain|show|tell)|flag|yellow|orange|red|watch|urgent|normal|high|low/i.test(t)&&!/\bi (have|feel|am)\b/i.test(t)&&!/\b(risks?|hazards?|nasa|astronauts?|space ?flight|in space)\b/i.test(t)){
    const s=stat(k,e),w=wk(k),dd=w.last-w.prev,n=statNote(k,e);
    return {kind:'text',lvl:s,title:`${M[k].n}: ${val(k,e)} ${M[k].u}`.trim(),
      paras:[`${SAY[s]} Normal is ${M[k].norm}.${n?' '+n:''} Over the last week it moved ${dd>=0?'up':'down'} ${fx(Math.abs(dd),M[k].d||1)} ${M[k].u}.`,M[k].why],
      steps:s==='g'?[]:(Object.values(REG).find(r=>r.keys.includes(k))||REG.heart).rec[s]};
  }
  if(/how am i|my status|overview|summary|readiness|today/i.test(t)&&!/hazard|risk|nasa/i.test(t)){
    const ov=overall(),r=detect();
    return {kind:'text',lvl:ov,title:`Overall: ${LV[ov]}`,paras:[`Readiness estimate ${readiness()} of 100. ${r.length?r.map(x=>x.title).join('. ')+'.':LVTXT.g}`],steps:priorities().map(p=>p[0])};
  }
  // 4. knowledge.md: questions about spaceflight hazards and risks.
  // A described symptom ("I feel dizzy?") still gets its protocol unless the question asks for information.
  const kb=kbSearch(t),sym=PROTO.find(p=>p.lvl!=='r'&&p.re.test(tn));
  const infoQ=/^(what|whats|why|tell|explain|describe|define|list)\b|\b(about|risk|risks|hazard|hazards|nasa|mean|means)\b/i.test(t);
  if(kb&&(infoQ||KB_Q.test(t)&&!sym))return kbCard(kb);
  const g=Object.keys(GLOSS).find(x=>t.toLowerCase().includes(x));
  if(g)return {kind:'text',lvl:null,title:GLOSS[g][0],paras:[GLOSS[g][1]],steps:[],gloss:true,src:'lib'};
  // 5. symptom protocols
  if(sym)return protoCard(sym,sym.up&&sym.up.test(tn)?'r':'a');
  const sev=tn.match(/(\d{1,2})\s*(?:\/|out of)\s*10/);
  if(sev&&+sev[1]>=8)return {kind:'text',lvl:'r',title:'Severe pain',paras:['Pain of 8 or more out of 10 needs the CMO now. Stop what you are doing and rest while you wait.'],steps:['Alert the CMO.','Use Log pain on the body map to show where it hurts.','Note when it started and what makes it worse.']};
  const neg=PROTO.find(p=>p.re.test(t)&&!p.re.test(tn));
  if(neg)return {kind:'text',lvl:null,title:`Noted: no ${neg.title.toLowerCase()}`,paras:['I am not treating this as a problem because you said you do not have it. If it starts, tell me straight away.'],steps:[]};
  if(/^(hi|hello|hey|good (morning|afternoon|evening))/i.test(t))return {kind:'text',lvl:null,title:`Hi ${c.first}`,paras:['Tell me what you feel, ask about any reading, or ask about a spaceflight hazard or risk. You can type or use the microphone.'],steps:[]};
  if(kb)return kbCard(kb);
  return {kind:'text',lvl:null,title:'Tell me a little more',paras:['Where is the problem, how bad is it from 1 to 10, and when did it start?','If someone is not responding, not breathing normally, or bleeding heavily, alert the CMO now.'],steps:[]};
}
function logValue(k,v,v2){
  if(replaying())return {kind:'text',lvl:null,title:'Replay is on',paras:['Go back to today to log readings.'],steps:[]};
  const m=M[k],id=S.crew;
  if(k==='bp'){if(!v2)return {kind:'text',lvl:null,title:'Blood pressure needs two numbers',paras:['Say it like "log blood pressure 122 over 80".'],steps:[]};
    if(v<60||v>260||v2<30||v2>160)return {kind:'text',lvl:null,title:'That reading looks wrong',paras:[`${v}/${v2} mmHg is outside what a cuff can read. Please measure again.`],steps:[]}}
  else if(v<m.lim[0]||v>m.lim[1])return {kind:'text',lvl:null,title:'That reading looks wrong',paras:[`${v} ${m.u} is not a possible ${m.n.toLowerCase()}. Please measure again.`],steps:[]};
  const u=needsConfirm(id,k,v,v2);recordReading(k,v,v2,'buddy',{unc:u});
  const e=now(),s=stat(k,e);
  if(s!=='g'&&!u)addRecheck(id,{k,due:Date.now()+30*MIN,t:`Measure ${m.n.toLowerCase()} again`});
  S.region=null;render();
  return {kind:'text',lvl:s,title:`Logged ${m.n.toLowerCase()} ${val(k,e)} ${m.u}`.trim(),paras:[`${u?'That is high, so HALO needs a repeat reading within 10 minutes to confirm it before raising it to Urgent. ':SAY[s]+' '}Your overall status is now ${LV[overall()]}.`],steps:s==='g'&&!u?[]:['Measure again to confirm.']};
}
/* triage regression set: phrase, expected level (r, a, or null for no protocol) */
const TRIAGE=[
 ['I have chest pain','r'],['my chest feels tight','r'],['crushing pain spreading to my left arm','r'],['I can\'t breathe','r'],['I am short of breath','r'],
 ['there is smoke in the module','r'],['I smell a burning smell','r'],['Kai fainted','r'],['he passed out','r'],['she is not responding','r'],['he is not breathing','r'],
 ['tingling in my arm after the EVA','r'],['joint pain since the spacewalk','r'],['I hit my head','r'],['my speech is slurred','r'],['weakness on one side','r'],
 ['I suddenly can\'t see out of my left eye','r'],['I want to die','r'],['I have been thinking about suicide','r'],['I keep thinking about hurting myself','r'],['there is no reason to live','r'],
 ['the bleeding won\'t stop','r'],['I cut my hand and it is spurting','r'],['my blood sugar is low and I feel confused','r'],['fever of 39 and a stiff neck','r'],['pain is 9 out of 10','r'],
 ['I have no chest pain but I can\'t breathe','r'],['I have no idea why but my chest hurts','r'],
 ['I have a fever','a'],['I feel shaky and sweaty','a'],['I have a headache','a'],['I feel dizzy','a'],['I feel nauseous','a'],['I threw up after lunch','a'],['my tooth hurts','a'],
 ['I twisted my ankle','a'],['I have back pain','a'],['pain in my side','a'],['I feel lonely','a'],['I am so stressed','a'],['I can\'t sleep','a'],['I feel exhausted','a'],
 ['solar flare alert','a'],['I cut my finger','a'],['I feel homesick','a'],['vertigo when I turn my head','a'],['my near vision is blurry','a'],['I don\'t have a headache, but I feel dizzy','a'],
 ['I have no chest pain',null],['no shortness of breath today',null],['I do not have a fever',null],['what is SANS',null],['what is a circadian rhythm',null],['hello',null]];
function runTriage(){
  const fails=[];TRIAGE.forEach(([q,exp])=>{let r;try{r=localReply(q)}catch(e){r={lvl:'error'}}const got=r.kind==='proto'||r.title==='Severe pain'?r.lvl:null;if(got!==exp)fails.push(`"${q}": expected ${exp?LV[exp]:'no protocol'}, got ${got?LV[got]||got:'no protocol'}`)});
  return {n:TRIAGE.length,pass:TRIAGE.length-fails.length,fails};
}
/* ---------- knowledge.md: Health Buddy's knowledge base ----------
   Each "## Title" section is a topic. "Keywords:" lines point questions to it.
   Plain lines are the short answer, "NASA:" lines what NASA HRP says,
   "HALO:" lines the on-board tips. No AI model and no network beyond this file. */
const KB_STOP=new Set('a an the and or of to in on at for is are was be been am i me my we our you your it its this that what whats which who how why when where do does did can could should would will about tell explain describe define please with from into any some there their they them have has had more than just like get got'.split(' '));
const kbWords=t=>(t.toLowerCase().match(/[a-z0-9]+/g)||[]).filter(w=>w.length>1&&!KB_STOP.has(w));
function parseKB(md){
  md=md.replace(/<!--[\s\S]*?-->/g,'');
  return md.split(/^##\s+/m).slice(1).map(chunk=>{
    const lines=chunk.split(/\r?\n/).map(s=>s.trim()),title=lines.shift(),sec={title,cat:'',keys:[],summary:[],nasa:[],halo:[]};
    lines.forEach(l=>{
      if(!l||/^#/.test(l))return;
      let m;
      if(m=l.match(/^category:\s*(.*)$/i))sec.cat=m[1];
      else if(m=l.match(/^keywords?:\s*(.*)$/i))sec.keys=m[1].split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
      else if(m=l.match(/^nasa:\s*(.*)$/i))sec.nasa.push(m[1]);
      else if(m=l.match(/^(halo|on board|on-board):\s*(.*)$/i))sec.halo.push(m[2]);
      else sec.summary.push(l.replace(/^[-*]\s+/,''));
    });
    sec.words=new Set(kbWords([title,sec.summary.join(' '),sec.nasa.join(' ')].join(' ')));
    sec.titleWords=new Set(kbWords(title));
    return sec;
  }).filter(s=>s.title);
}
async function loadKB(force){
  if(S.kb&&!force)return S.kb;
  try{const r=await fetch('knowledge.md',{cache:'no-cache'});if(!r.ok)throw new Error('HTTP '+r.status);S.kb=parseKB(await r.text());S.kbErr=false}
  catch(e){S.kbErr=true;if(!S.kb)S.kb=null}
  paintBuddyHead();return S.kb;
}
const kbEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function kbScore(sec,q,qw){
  let s=0;
  sec.keys.forEach(k=>{if(new RegExp('(^|[^a-z0-9])'+kbEsc(k)+'([^a-z0-9]|$)').test(q))s+=k.includes(' ')?5:3});
  qw.forEach(w=>{if(sec.titleWords.has(w))s+=2;else if(sec.words.has(w))s+=0.4});
  return s;
}
function kbSearch(text){
  if(!S.kb||!S.kb.length)return null;
  const q=text.toLowerCase(),qw=[...new Set(kbWords(text))];
  const ranked=S.kb.map(sec=>({sec,s:kbScore(sec,q,qw)})).filter(x=>x.s>=3).sort((a,b)=>b.s-a.s);
  return ranked.length?{best:ranked[0].sec,score:ranked[0].s,related:ranked.slice(1,4).map(x=>x.sec.title)}:null;
}
function kbCard(hit){
  const s=hit.best;let related=hit.related;
  // overview topics link to every topic they summarise (hazards, or risks)
  if(/^overview$/i.test(s.cat)){const kind=/hazard/i.test(s.title)?/^hazard/i:/^risk/i;related=S.kb.filter(x=>kind.test(x.cat)).map(x=>x.title)}
  return {kind:'text',lvl:null,title:s.title,cat:s.cat,paras:[...s.summary,...s.nasa],steps:s.halo,stepsLabel:s.halo.length?'On board':'',related,src:'kb'};
}
const KB_Q=/\?|^(what|whats|why|how|who|when|where|which|tell|explain|describe|define|list|is|are|does|do|can|could|should|will)\b|\b(about|risk|risks|hazard|hazards|nasa|mean|means|meaning)\b/i;
function msgHTML(m){
  if(m.who==='me')return `<div class="msg me">${esc(m.text)}</div>`;
  const r=m.r,urgent=r.lvl==='r';
  const body=`${r.lvl?stTag(r.lvl,'small'):''}${r.cat?`<span class="kbCat">${esc(r.cat)}</span>`:''}${r.title?`<h3>${esc(r.title)}</h3>`:''}
    ${(r.paras||[]).map(p=>`<p>${esc(p)}</p>`).join('')}
    ${r.stepsLabel&&r.steps&&r.steps.length?`<p class="kbLabel">${esc(r.stepsLabel)}</p>`:''}
    ${r.steps&&r.steps.length?`<ol class="steps">${r.steps.map((s,i)=>`<li><span class="n">${i+1}</span><span>${esc(s)}</span></li>`).join('')}</ol>`:''}
    ${r.help?`<p class="small" style="color:var(--color-ink)">${esc(r.help)}</p>`:''}
    ${r.train?`<div class="acts"><button class="btn btn--sm" data-act="goTrain">${I('dumbbell','sm')}Open Train</button></div>`:''}
    ${r.id==='blur'?`<div class="acts"><button class="btn btn--sm" data-act="game" data-v="vision">${I('eye','sm')}Start the vision check</button></div>`:''}
    ${urgent?`<div class="acts"><button class="btn btn--sm btn--primary" data-act="cmo">Alert the CMO</button><button class="btn btn--sm" data-act="openLog">Log vitals</button></div>`:''}
    ${r.related&&r.related.length?`<div class="suggest kbRel"><span class="xs muted">Related:</span>${r.related.map(t=>`<button data-act="ask" data-v="Tell me about ${esc(t)}">${esc(t)}</button>`).join('')}</div>`:''}
    ${r.src?`<span class="src">${{kb:'From knowledge.md, based on NASA Human Research Program material.',lib:'From the on-board protocol library.',test:'On-board triage self-test.'}[r.src]||''}</span>`:''}`;
  return `<div class="msg bot"><div class="card ${urgent?'r':''}">${body}</div></div>`;
}
function paintBuddyHead(){
  const el=$('#buddyMode');if(!el)return;
  const n=S.kb?S.kb.length:0;
  el.className='mode'+(n?' on':'');
  el.textContent=n?`Answers from knowledge.md · ${n} topics`:S.kbErr?'knowledge.md did not load, using the symptom library':'Loading knowledge.md';
  const info=$('#kbInfo');
  if(info)info.textContent=n?`${n} topics loaded from knowledge.md. Edit that file to change what Health Buddy knows.`:S.kbErr?'knowledge.md could not be loaded. Open HALO from a web server (for example Vercel, or a local server) rather than by double-clicking the file.':'Loading knowledge.md…';
}
function paintLog(){
  const L=S.chat[S.crew],el=$('#bLog');if(!el)return;
  el.innerHTML=L.length?L.map(msgHTML).join(''):`<div class="msg bot"><div class="card"><h3>Hi ${crew().first}, what is going on?</h3><p>Describe a symptom, ask about a reading, or ask about a spaceflight hazard or risk. For anything urgent I will give you the on-board protocol straight away.</p></div></div>
    <div class="suggest">${['I have chest pain','I feel dizzy','What is SANS?','What are the hazards of spaceflight?','Tell me about space radiation','Why is my sleep flagged?','Log heart rate 72','How am I today?'].map(q=>`<button data-act="ask" data-v="${q}">${q}</button>`).join('')}</div>`;
  // show the start of the newest reply, so long answers are read from the top
  const last=el.lastElementChild;
  el.scrollTop=last&&last.offsetHeight>el.clientHeight?last.offsetTop-el.offsetTop-8:el.scrollHeight;
}
function openBuddy(prefill){
  $('#buddy').innerHTML=`<div class="bHead">${I('chat')}<div style="flex:1"><h2>Health Buddy</h2><span id="buddyMode" class="mode"></span></div>
      <button class="iconBtn" data-act="cfg" aria-label="Health Buddy settings" aria-expanded="${S.showCfg}">${I('gear','sm')}</button>${closeBtn.replace('closeAll','closeBuddy')}</div>
    <div class="cfg" id="cfg" ${S.showCfg?'':'hidden'}>
      <p class="xs muted" id="kbInfo"></p>
      <div class="row" style="flex-wrap:wrap"><button class="btn btn--sm" data-act="reloadKB">Reload knowledge.md</button><button class="btn btn--sm btn--quiet" data-act="kbTopics">List topics</button><button class="btn btn--sm btn--quiet" data-act="runTriage">Run triage self-test</button></div>
    </div>
    <p class="bNote">Health Buddy supports, not replaces, your CMO and flight surgeons. Urgent protocols always come from the on-board library.</p>
    <div class="bLog" id="bLog" aria-live="polite"></div>
    <div class="bFoot">
      <form class="buddyIn" id="buddyForm">
        <button type="button" class="iconBtn mic" data-act="mic" aria-pressed="${S.listening}" aria-label="Speak">${I('mic','sm')}</button>
        <label class="visually-hidden" for="bIn">Message Health Buddy</label>
        <input id="bIn" autocomplete="off" placeholder="Describe a symptom or ask a question" value="${esc(prefill||'')}">
        <button class="iconBtn" type="submit" aria-label="Send" style="background:var(--color-primary);color:var(--color-primary-ink);border-color:var(--color-primary)">${I('send','sm')}</button>
      </form>
      <div class="speak"><button class="switch" role="switch" aria-checked="${S.speak}" data-act="speakTog" aria-labelledby="spL"></button><span id="spL">Read replies aloud</span></div>
    </div>`;
  $('#buddy').classList.add('show');$('#buddyFab').hidden=true;
  paintBuddyHead();paintLog();setTimeout(()=>$('#bIn').focus(),40);
  if(!S.kb)loadKB();
}
function closeBuddy(silent){if(!$('#buddy').classList.contains('show'))return;$('#buddy').classList.remove('show');stopListen();if(S.crew&&!$('#app').hidden)$('#buddyFab').hidden=false;if(!silent)$('#buddyFab').focus()}
function sendBuddy(text){
  text=(text||'').trim();if(!text)return;
  const L=S.chat[S.crew];L.push({who:'me',text});$('#bIn').value='';
  const r=localReply(text);
  if(!r.src)r.src=r.kind==='proto'||r.gloss?'lib':null;
  L.push({who:'bot',r});paintLog();say(r);if(r.lvl==='r')toastUrgent();scheduleSave();
}
function toastUrgent(){toast('Urgent protocol shown. Alert the CMO if you have not.')}
function say(r){
  if(!S.speak||!window.speechSynthesis)return;
  speechSynthesis.cancel();
  const txt=[r.lvl?LV[r.lvl]+'.':'',r.title||'',...(r.paras||[]),...(r.steps||[]).map((s,i)=>`Step ${i+1}. ${s}`),r.help||''].join(' ');
  const u=new SpeechSynthesisUtterance(txt);u.rate=0.98;speechSynthesis.speak(u);
}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec=null;
function startListen(){
  if(!SR){toast('Voice input is not available in this browser. Please type.');return}
  rec=new SR();rec.lang='en-GB';rec.interimResults=true;rec.continuous=false;
  rec.onresult=ev=>{const t=[...ev.results].map(x=>x[0].transcript).join('');$('#bIn').value=t;if(ev.results[ev.results.length-1].isFinal){stopListen();sendBuddy(t)}};
  rec.onerror=ev=>{stopListen();toast(ev.error==='not-allowed'?'Microphone access was blocked.':'Voice input stopped. Please try again or type.')};
  rec.onend=()=>stopListen();
  try{rec.start();S.listening=true;const m=$('.mic');m&&m.setAttribute('aria-pressed','true')}catch(e){stopListen()}
}
function stopListen(){if(rec){try{rec.stop()}catch(e){}rec=null}S.listening=false;const m=$('.mic');m&&m.setAttribute('aria-pressed','false')}

/* =========================================================
   REPLAY, REMINDERS AND BACKGROUND CHECKS
   ========================================================= */
const RP={int:null};
function stopReplay(){if(RP.int){clearInterval(RP.int);RP.int=null}}
function playReplay(){stopReplay();RP.int=setInterval(()=>{if(S.view<DAYS-1){S.view++;render()}else{stopReplay();render();toast('Replay finished. You are back at today.')}},900);render()}
function notify(title,body){try{if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body})}catch(e){}}
function tick(){
  if(!S.crew||$('#app').hidden)return;const t=Date.now(),id=S.crew;let changed=false;
  if(S.blackoutUntil&&t>=S.blackoutUntil){S.blackoutUntil=0;S.online=true;const q=sendQueued();toast(`Ground link is back${q?`. ${q} report${q>1?'s':''} sent`:''}.`);changed=true}
  if(!replaying()){
    Object.entries(S.al[id]).forEach(([k,r])=>{if(r.state==='open'&&r.lvl==='r'&&t-r.t0>=ESC_MS){alEvent(id,k,'escalated','Not acknowledged in 10 minutes, escalated to the CMO');S.queued[id]++;toast(`Escalated to the CMO: ${r.title}`);beep(520,.3);notify('HALO: alert escalated',r.title);changed=true}});
    const n=alertsList().length;if(n!==S._alN){S._alN=n;changed=true}
    const hmNow=hm(t),dk=dayKey(t);
    REMS.forEach(([tm,name],i)=>{const key=dk+'|'+i;if(S.rem[id][i]&&hmNow===tm&&!S.fired[id][key]){S.fired[id][key]=1;toast(`Reminder: ${name}`);beep(760,.2);notify('HALO reminder',name)}});
    S.rechecks[id].forEach(r=>{if(!r.fired&&t>=r.due){r.fired=1;toast(`${r.t} now`);beep(760,.2);notify('HALO re-check',r.t);changed=true}});
  }
  if(changed){const y=scrollY;render();scrollTo({top:y})}
}

/* =========================================================
   EVENTS
   ========================================================= */
const pv=t=>t.dataset.v==='true'?true:t.dataset.v==='false'?false:t.dataset.v;
const ACT={
 pick:t=>{S.crew=t.dataset.id;showCode()},
 back:()=>{$('#step1').hidden=false;$('#step2').hidden=true},
 logout:async()=>{closeAll();stopReplay();S.view=DAYS-1;await wipeSession();$('#app').hidden=true;$('#buddyFab').hidden=true;$('#login').hidden=false;ACT.back();S.crew=null},
 tab:t=>{S.tab=t.dataset.v;render();scrollTo({top:0})},
 region:t=>{S.region=t.dataset.v;render();const b=$(`.regions [data-v="${S.region}"]`);b&&b.focus({preventScroll:true})},
 goRegion:t=>{S.region=t.dataset.v;S.tab='body';render();scrollTo({top:0})},
 openPattern:t=>{S.openPat=t.dataset.v;S.tab='trends';render();scrollTo({top:0})},
 vital:t=>{S.modalN=14;openVital(t.dataset.v)},
 modalN:t=>{S.modalN=+t.dataset.v;openVital(S.modalKey)},
 alerts:()=>openAlerts(),
 env:t=>{S.env=t.dataset.v;saveMeta();render();openGround();toast(env().micro?`Mission set to ${env().long}`:`Mission set to ${env().long}. After arriving, do the gravity change check.`)},
 game:t=>{closeAll();openGame(t.dataset.v)},
 goTrain:()=>{closeBuddy(true);S.tab='train';render();scrollTo({top:0})},
 gSpeed:t=>{GT.speed=+t.dataset.v;paintGame()},
 gRounds:t=>{GT.rounds=+t.dataset.v;paintGame()},
 gDur:t=>{GT.dur=+t.dataset.v;paintGame()},
 gStart:()=>{beep(880,0.2);const g=GT;
   if(g.k==='intervals'){g.phase='push';g.left=g.push;cue('Push');paintGame();runTimer()}
   else if(g.k==='lifts'){g.phase='lift';paintGame()}
   else if(g.k==='vision'){g.phase='near';paintGame()}
   else{g.start=performance.now();g.phase='wait';reflexArm();g.tick=setInterval(()=>{const el=$('#pvtLeft');if(el&&GT===g)el.textContent=mmss(Math.max(0,g.dur-(performance.now()-g.start)/1000))},500)}},
 gPause:()=>{GT.paused=!GT.paused;paintGame()},
 gSet:()=>{const g=GT;g.done++;g.elapsed+=40;beep(760,0.15);
   if(g.set<g.sets){g.set++}else{g.set=1;g.cur++}
   if(g.cur>=g.ex.length){finishGame(true);return}
   g.phase='rest';g.left=g.rest;paintGame();runTimer()},
 gSkip:()=>{stopTimer();GT.phase='lift';paintGame()},
 gTap:()=>reflexTap(),
 gFinish:()=>finishGame(false),
 gDone:()=>{stopGame();closeAll()},
 gBuddy:()=>{stopGame();closeAll();openBuddy('I stopped my workout because ')},
 vNear:t=>{const g=GT;g.res[g.eye].near=+t.dataset.v;g.phase='amsler';paintGame()},
 vAms:t=>{const g=GT;g.res[g.eye].ams=t.dataset.v==='1';if(g.eye==='left'){g.eye='right';g.phase='near';paintGame()}else finishVision()},
 pickFile:()=>$('#imgFile').click(),
 camOn:async()=>{const m=$('#imgMsg');
   if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){m.textContent='No camera here. Choose an image instead.';return}
   try{camStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});const v=$('#camV');v.srcObject=camStream;await v.play();$('#camBox').hidden=false;m.textContent=''}
   catch(err){m.textContent='The camera is not available. Choose an image instead.'}},
 camSnap:()=>{const v=$('#camV');if(!v||!v.videoWidth)return;addImage(shrink(v,v.videoWidth,v.videoHeight));stopCam();$('#camBox').hidden=true},
 btHR:()=>connectHR(),
 camHR:()=>camHR(),
 ocr:()=>$('#ocrFile').click(),
 ground:()=>openGround(),
 openLog:()=>{closeBuddy(true);openLog()},
 closeAll:()=>closeAll(),
 closeBuddy:()=>closeBuddy(),
 ack:t=>{ackAlert(t.dataset.v);const open=$('#drawer').classList.contains('show');render();if(open)openAlerts();toast('Acknowledged. HALO will remind you to re-check.')},
 cmo:()=>{const id=S.crew;alertsList().filter(a=>a.lvl==='r').forEach(a=>alEvent(id,a.id,'escalated',`CMO alerted by ${crew().first}`));S.queued[id]++;
   const up=linkState()==='up';if(up)sendQueued('CMO alert');
   toast(env().esc==='ground'?`CMO and ground flight surgeon alerted (simulated)${up?'':'. Ground message queued for the link'}.`:`CMO alerted (simulated). Ground report ${up?'sent':'queued for the next link'}.`);render()},
 link:()=>{if(S.blackoutUntil>Date.now()){S.blackoutUntil=0;S.online=true}else S.online=!S.online;
   if(S.online){const q=sendQueued();if(q)toast(`Link up. ${q} report${q>1?'s':''} sent (simulated)`)}render();openGround()},
 blackout:()=>{S.blackoutUntil=Date.now()+40*MIN;S.online=false;toast('Blackout for 40 minutes. HALO keeps working on board.');render();openGround()},
 report:t=>{const id=t.dataset.v||S.crew,size=downloadReport(id);S.queued[S.crew]++;const up=linkState()==='up';if(up)sendQueued('Health report');
   toast(`Report saved, ${fx(size/1024,1)} KB, about ${Math.max(1,Math.round(size*8/2000))} s on a 2 kbps link. ${up?'Sent to the ground.':'Queued for the next link.'}`);
   const open=$('#drawer').classList.contains('show');render();if(open)openGround()},
 send:()=>{const q=sendQueued();toast(`${q} report${q>1?'s':''} sent (simulated). Reply in about ${replyText()}.`);render();openGround()},
 cat:t=>{S.cat=t.dataset.v;render();const d=$$('details.more').find(x=>x.textContent.trim().startsWith('Guides'));if(d){d.open=true;d.querySelector(`[data-v="${S.cat}"]`).focus()}},
 mission:t=>{const i=+t.dataset.v,m=S.missions[S.crew];m[i]=!m[i];S.xp[S.crew]+=m[i]?MISSIONS[i][1]:-MISSIONS[i][1];if(m[i]&&i===0)S.logged[S.crew].add(dayKey(new Date()));render();const b=$(`.task[data-v="${i}"]`);b&&b.focus()},
 rem:t=>{const r=S.rem[S.crew],i=+t.dataset.v;r[i]=!r[i];t.setAttribute('aria-checked',r[i]);if(r[i]&&'Notification' in window&&Notification.permission==='default')Notification.requestPermission().catch(()=>{});scheduleSave()},
 consent:t=>{const c=S.consent[S.crew],k=t.dataset.v;c[k]=!c[k];t.setAttribute('aria-checked',c[k]);scheduleSave();toast(c[k]?'Shared with the CMO.':'No longer shared with the CMO.')},
 recN:t=>{S.recN=+t.dataset.v;render()},
 logMood:t=>{S.logMood=+t.dataset.v;$$('[data-act="logMood"]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.v===S.logMood))},
 logFat:t=>{S.logFat=+t.dataset.v;$$('[data-act="logFat"]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.v===S.logFat))},
 painScore:t=>{PN.score=+t.dataset.v;$$('[data-act="painScore"]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.v===PN.score));$('#e-pain').textContent=''},
 pain:t=>{closeAll();openPain(t.dataset.v||S.region)},
 meds:()=>openMeds(),
 pin:()=>{closeAll();openPin()},
 eva:()=>{closeAll();EV={dcs:null,sym:null};openEva()},
 evaDcs:t=>{EV.dcs=pv(t);openEva()},
 evaSym:t=>{EV.sym=pv(t);openEva()},
 evaSend:()=>{const C=evaChecks(),v=worst(C.map(c=>c[1]));S.queued[S.crew]++;const up=linkState()==='up';if(up)sendQueued('EVA go/no-go');closeAll();toast(`EVA check sent to the CMO: ${({g:'Go',a:'Check with CMO',r:'No go'})[v]}.`)},
 ortho:()=>{closeAll();openOrtho()},
 oSpeed:t=>{OT.speed=+t.dataset.v;const l=readTrio('l');if(l)OT.lie=l;paintOrtho()},
 oStart:()=>{const l=readTrio('l');if(!l)return;OT.lie=l;OT.step=2;OT.left=180;beep(880,.2);
   OT.int=setInterval(()=>{if(!OT)return;OT.left--;if(OT.left<=0){stopOrtho();beep(880,.3);cue('Measure now');OT.step=3}paintOrtho()},1000/OT.speed);paintOrtho()},
 oSkip:()=>{stopOrtho();OT.step=3;paintOrtho()},
 oSym:t=>{const s=readTrio('s');if(s)OT.stand=s;OT.sym=pv(t);paintOrtho()},
 oSave:()=>{const s=readTrio('s');if(!s)return;if(OT.sym==null){$('#oErr').textContent='Answer the question about dizziness.';return}
   const o=OT,dSys=o.lie.sys-s.sys,dDia=o.lie.dia-s.dia,dHr=s.hr-o.lie.hr,bp=dSys>=20||dDia>=10,hrUp=dHr>=30,bad=bp||hrUp;
   const lvl=bad?(o.sym?'r':'a'):(o.sym?'a':'g');
   const title=bp?'Blood pressure dropped on standing':hrUp?'Heart rate rose sharply on standing':o.sym?'Normal numbers, but you felt unwell':'Your circulation is adjusting';
   const advice=lvl==='r'?'Sit or lie down now and alert the CMO. Do not stand alone until the CMO has seen you.':lvl==='a'?'Drink 500 ml of water, stand up slowly, and tell the CMO. Compression garments can help. Repeat the test tomorrow.':'No sign of fainting risk. Repeat the test daily for the first week in this gravity.';
   o.stand=s;o.result={t:Date.now(),lvl,title,advice,dSys,dDia,dHr,lie:o.lie,stand:s,sym:o.sym,env:S.env};S.ortho[S.crew].push(o.result);
   recordReading('hr',o.lie.hr,null,'halo');recordReading('bp',o.lie.sys,o.lie.dia,'halo');o.step=4;render();paintOrtho()},
 guide:t=>{closeAll();openGuide(t.dataset.v)},
 guideSpeed:t=>{GM.speed=+t.dataset.v;paintGuide()},
 guideGo:()=>{const g=GM;g.run=true;beep(880,.2);g.int=setInterval(()=>{if(GM!==g)return;g.left--;if(g.left<=0){clearInterval(g.int);g.int=null;beep(880,.3);cue('Measure now')}paintGuide()},1000/g.speed);paintGuide()},
 guideStop:()=>{clearInterval(GM.int);GM.int=null;GM.run=false;paintGuide()},
 guideLog:()=>{const k=GM.k;stopGuide();openLog(k)},
 crewSel:t=>{S.crewSel=t.dataset.v;render()},
 crewClear:t=>{const[cid,aid,lvl]=t.dataset.v.split('|');S.cmoNotes[S.crew][cid+'|'+aid]={state:'cleared',lvl,t:Date.now()};if(cid===S.crew)alEvent(cid,aid,'cleared','Reviewed and cleared by the CMO');render();toast('Marked as reviewed.')},
 crewGround:t=>{const[cid,aid,lvl]=t.dataset.v.split('|');S.cmoNotes[S.crew][cid+'|'+aid]={state:'ground',lvl,t:Date.now()};S.queued[S.crew]++;const up=linkState()==='up';if(up)sendQueued('Crew alert');render();toast(up?`Sent to the ground flight surgeons. Reply in about ${replyText()}.`:'Queued for the ground at the next link.')},
 replayStart:()=>{closeAll();S.view=0;S.tab='today';playReplay();scrollTo({top:0})},
 replayTog:()=>{if(RP.int){stopReplay();render()}else playReplay()},
 replayEnd:()=>{stopReplay();S.view=DAYS-1;render()},
 buddy:()=>{closeAll();openBuddy()},
 buddyAbout:t=>{openBuddy(`My ${REG[t.dataset.v].n.toLowerCase()}: `)},
 ask:t=>sendBuddy(t.dataset.v),
 mic:()=>S.listening?stopListen():startListen(),
 speakTog:t=>{S.speak=!S.speak;t.setAttribute('aria-checked',S.speak);if(!S.speak&&window.speechSynthesis)speechSynthesis.cancel();if(S.speak&&!window.speechSynthesis)toast('Speech is not available in this browser.')},
 cfg:t=>{S.showCfg=!S.showCfg;$('#cfg').hidden=!S.showCfg;t.setAttribute('aria-expanded',S.showCfg)},
 runTriage:()=>{const r=runTriage();S.chat[S.crew].push({who:'bot',r:{kind:'text',lvl:r.pass===r.n?'g':'a',title:`${r.pass} of ${r.n} triage checks passed`,paras:r.fails.length?r.fails:['Every red flag phrase gave Urgent, every symptom gave its protocol, and negated phrases were not treated as symptoms.'],steps:[],src:'test'}});paintLog()},
 reloadKB:()=>{loadKB(true).then(kb=>toast(kb?`knowledge.md loaded: ${kb.length} topics`:'Could not load knowledge.md'))},
 kbTopics:()=>{const kb=S.kb||[],cats={};kb.forEach(s=>{const c=(s.cat||'Other').replace(/\s*\(.*\)/,'');(cats[c]=cats[c]||[]).push(s.title)});
   S.chat[S.crew].push({who:'bot',r:kb.length?{kind:'text',lvl:null,title:`${kb.length} topics in knowledge.md`,paras:Object.entries(cats).map(([c,t])=>`${c}: ${t.join(', ')}.`),steps:[],src:'kb'}:{kind:'text',lvl:null,title:'knowledge.md is not loaded',paras:['Open HALO from a web server so it can read knowledge.md.'],steps:[]}});paintLog()}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(t&&ACT[t.dataset.act]&&!t.disabled){e.preventDefault();ACT[t.dataset.act](t)}});
document.addEventListener('change',e=>{const t=e.target;
  if(t.dataset.change==='recKey'){S.recKey=t.value;render();$('#recKey').focus()}});
document.addEventListener('input',e=>{const n=e.target.name;if(n&&e.target.closest&&e.target.closest('#logForm'))FS[n==='sys'||n==='dia'?'bp':n]='manual'});
document.addEventListener('pointerdown',e=>{if(e.target.closest('.pad')&&GT&&GT.k==='reflex'){e.preventDefault();reflexTap()}});
document.addEventListener('keydown',e=>{
  if((e.key===' '||e.key==='Enter')&&GT&&$('#modal').classList.contains('show')){if(GT.k==='reflex'&&GT.phase!=='setup'&&GT.phase!=='summary'&&e.target.closest('.pad')){e.preventDefault();if(!e.repeat)reflexTap();return}if(GT.k==='lifts'&&GT.phase==='lift'&&e.target.tagName!=='BUTTON'){e.preventDefault();ACT.gSet();return}}
  if(e.key==='Escape'){if($('#buddy').classList.contains('show')&&!$('#modal').classList.contains('show'))closeBuddy();else closeAll()}
  const hot=e.target.closest&&e.target.closest('.hot');if(hot&&(e.key==='Enter'||e.key===' ')){e.preventDefault();S.region=hot.dataset.v;render();const g=$(`.hot[data-v="${S.region}"]`);g&&g.focus()}});
document.addEventListener('submit',e=>{
  const id=e.target.id;if(['buddyForm','logForm','painForm','medForm','pinForm'].includes(id))e.preventDefault();
  if(id==='buddyForm')sendBuddy($('#bIn').value);
  else if(id==='logForm')submitLog(e.target);
  else if(id==='painForm')submitPain();
  else if(id==='medForm')submitMeds();
  else if(id==='pinForm')submitPin();
});

/* ---------- start ---------- */
renderLogin();
const STORE_READY=initStore();
const _unlock=unlock;unlock=async c=>{await STORE_READY;return _unlock(c)};
if('serviceWorker' in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register('sw.js').catch(()=>{});
setInterval(tick,15000);
