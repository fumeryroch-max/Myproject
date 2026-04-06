'use strict';
// ═══════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════
const $=id=>document.getElementById(id);
function rnd(a){return a[Math.floor(Math.random()*a.length)];}
function clamp(v,mn=0,mx=100){return Math.max(mn,Math.min(mx,v));}
function fmt(ts){return new Date(ts).toLocaleDateString('fr-FR',{day:'numeric',month:'long'});}
function fmtT(ts){return new Date(ts).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});}
function todayStr(){return new Date().toDateString();}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

let _toastT;
function toast(msg){
  const el=$('toast');el.textContent=msg;el.classList.remove('off');
  clearTimeout(_toastT);_toastT=setTimeout(()=>el.classList.add('off'),2600);
}
function closeModal(){$('modal-root').innerHTML='';if(S.pendingDrop){S.pendingDrop=null;save();}}

// ═══════════════════════════════════════════════════════
//  DATA
// ═══════════════════════════════════════════════════════
const DOMAINS=[
  {id:'lang',   icon:'🗣️',label:'Langues',    color:'#38bdf8'},
  {id:'science',icon:'🔬',label:'Sciences',   color:'#34d399'},
  {id:'math',   icon:'➕',label:'Maths',      color:'#fbbf24'},
  {id:'history',icon:'📜',label:'Histoire',   color:'#fb923c'},
  {id:'art',    icon:'🎨',label:'Arts',       color:'#f472b6'},
  {id:'philo',  icon:'🤔',label:'Philosophie',color:'#a78bfa'},
  {id:'geo',    icon:'🌍',label:'Géographie', color:'#4ade80'},
  {id:'tech',   icon:'💻',label:'Technologie',color:'#60a5fa'},
  {id:'music',  icon:'🎵',label:'Musique',    color:'#fb7185'},
];
const TRAITS={
  lang:{name:'Polyglotte',desc:'Glisse des mots étrangers dans ses phrases.'},
  science:{name:'Scientifique',desc:'Cherche toujours le "pourquoi" derrière les choses.'},
  math:{name:'Logicien·ne',desc:'Raisonne avec précision, déteste l\'ambiguïté.'},
  history:{name:'Historien·ne',desc:'Aime tracer des parallèles avec le passé.'},
  art:{name:'Créatif·ve',desc:'Voit le monde comme une palette de possibilités.'},
  philo:{name:'Philosophe',desc:'Pose des questions profondes au mauvais moment.'},
  geo:{name:'Explorateur·rice',desc:'Toujours prêt·e à parler d\'un coin du monde.'},
  tech:{name:'Technicien·ne',desc:'Voit des systèmes et des patterns partout.'},
  music:{name:'Musicien·ne',desc:'Pense en rythmes et en harmonies.'},
};
const DOM_THOUGHTS={
  lang:['🗣️ Comment dit-on "apprendre" dans ta langue cible ?','🌐 Chaque langue ouvre une fenêtre sur un univers différent.'],
  science:['🔬 As-tu pensé à la mécanique quantique aujourd\'hui ?','⚗️ La science, c\'est l\'art de poser les bonnes questions.'],
  math:['➕ Les nombres ne mentent jamais.','📐 Tout problème complexe cache une solution élégante.'],
  history:['📜 L\'histoire se répète, jamais tout à fait pareil.','⚔️ Sais-tu ce qui se passait ici il y a 200 ans ?'],
  art:['🎨 L\'art, c\'est de l\'ordre dans le chaos.','🖼️ Qu\'aurais-tu aimé créer aujourd\'hui ?'],
  philo:['🤔 Qu\'est-ce que vraiment savoir quelque chose ?','💭 La vérité existe-t-elle indépendamment de nous ?'],
  geo:['🌍 Le monde est bien plus grand qu\'on ne l\'imagine.','🗺️ Chaque lieu cache une histoire que les cartes ne montrent pas.'],
  tech:['💻 Tout système peut être compris et amélioré.','⚙️ L\'automatisation, c\'est l\'intelligence sans fatigue.'],
  music:['🎵 La musique est le seul langage sans traduction.','🎶 Y a-t-il une mélodie dans ce que tu apprends aujourd\'hui ?'],
};

const CARDS=[
  {id:'c1',dom:'geo',   q:'Quelle est la capitale du Japon ?',              a:'Tokyo',type:'fact'},
  {id:'c2',dom:'math',  q:'Combien font 8 × 7 ?',                            a:'56',type:'fact'},
  {id:'c3',dom:'science',q:'Explique ce qu\'est la photosynthèse.',          a:'Conversion de lumière solaire en énergie chimique.',type:'concept',wiki:'Photosynthèse'},
  {id:'c4',dom:'art',   q:'Qui a peint la Joconde ?',                        a:'Léonard de Vinci',type:'fact'},
  {id:'c5',dom:'science',q:'Explique le principe de la gravité.',            a:'Force d\'attraction mutuelle entre deux masses.',type:'concept',wiki:'Gravitation'},
  {id:'c6',dom:'science',q:'Quel est le symbole chimique de l\'or ?',       a:'Au (Aurum)',type:'fact'},
  {id:'c7',dom:'history',q:'En quelle année a éclaté la Révolution française ?',a:'1789',type:'fact'},
  {id:'c8',dom:'science',q:'Explique ce qu\'est l\'ADN.',                   a:'Molécule qui code l\'information génétique.',type:'concept',wiki:'Acide désoxyribonucléique'},
  {id:'c9',dom:'math',  q:'Quelle est la valeur de π à 4 décimales ?',      a:'3,1416',type:'fact'},
  {id:'c10',dom:'geo',  q:'Quel est le plus grand océan du monde ?',         a:'L\'océan Pacifique',type:'fact'},
  {id:'c11',dom:'history',q:'Qui a peint la chapelle Sixtine ?',            a:'Michel-Ange',type:'fact'},
  {id:'c12',dom:'science',q:'Explique ce qu\'est la mitose.',               a:'Division cellulaire produisant deux cellules génétiquement identiques.',type:'concept',wiki:'Mitose'},
];
const Q_TPL=[
  (n,q)=>`${n} te demande : ${q}`,
  (_,q)=>`Petit test — ${q.charAt(0).toLowerCase()+q.slice(1)}`,
  (_,q)=>`Tu saurais répondre ? ${q}`,
  (n,q)=>`Curiosité du jour selon ${n} : ${q}`,
  (_,q)=>`Dis-moi, ${q.charAt(0).toLowerCase()+q.slice(1)}`,
  (_,q)=>`Question ! ${q}`,
  (_,q)=>`Sans hésiter, ${q.charAt(0).toLowerCase()+q.slice(1)}`,
];
function naturalQ(card,name){return rnd(Q_TPL)(name,card.q);}

const RARITY={
  common:   {l:'Commun',   cls:'r-common',  c:'#9898aa',w:60},
  uncommon: {l:'Peu commun',cls:'r-uncommon',c:'#28d98a',w:25},
  rare:     {l:'Rare',     cls:'r-rare',    c:'#4da6ff',w:10},
  epic:     {l:'Épique',   cls:'r-epic',    c:'#b06fff',w:4},
  legendary:{l:'Légendaire',cls:'r-legendary',c:'#f4ac2f',w:1},
};
const ALL_ITEMS=[
  {id:'hat_flower',cat:'hat', icon:'🌸',name:'Couronne florale',rarity:'common',   unlockCond:'streak_3'},
  {id:'hat_cap',   cat:'hat', icon:'🧢',name:'Casquette',       rarity:'common',   unlockCond:'level_2'},
  {id:'hat_wizard',cat:'hat', icon:'🪄',name:'Chapeau de mage', rarity:'rare',     unlockCond:'level_5',premium:true,priceCents:399},
  {id:'hat_crown', cat:'hat', icon:'👑',name:'Couronne royale', rarity:'epic',     unlockCond:'level_10',premium:true,priceCents:799},
  {id:'hat_halo',  cat:'hat', icon:'😇',name:'Auréole sacrée',  rarity:'legendary',unlockCond:'streak_30'},
  {id:'aura_fire', cat:'aura',icon:'🔥',name:'Aura de feu',     rarity:'uncommon', unlockCond:'streak_7'},
  {id:'aura_ice',  cat:'aura',icon:'❄️',name:'Aura glaciale',   rarity:'rare',     unlockCond:'correct_50'},
  {id:'aura_cosmic',cat:'aura',icon:'🌌',name:'Aura cosmique',  rarity:'epic',     unlockCond:'level_8',premium:true,priceCents:599},
  {id:'aura_divine',cat:'aura',icon:'✨',name:'Aura divine',    rarity:'legendary',unlockCond:'correct_500',premium:true,priceCents:999},
  {id:'acc_glasses',cat:'acc',icon:'🕶️',name:'Lunettes cool',   rarity:'common',   unlockCond:'level_2'},
  {id:'acc_bow',   cat:'acc', icon:'🎀',name:'Nœud papillon',   rarity:'uncommon', unlockCond:'streak_5'},
  {id:'acc_star',  cat:'acc', icon:'⭐',name:'Étoile magique',  rarity:'rare',     unlockCond:'correct_100'},
  {id:'acc_gem',   cat:'acc', icon:'💎',name:'Gemme de sagesse',rarity:'epic',     unlockCond:'level_12',premium:true,priceCents:499},
  {id:'acc_inf',   cat:'acc', icon:'♾️',name:'Anneau infini',   rarity:'legendary',unlockCond:'streak_60'},
  {id:'comp_star', cat:'comp',icon:'🌟',name:'Étoile filante',  rarity:'uncommon', unlockCond:'level_3'},
  {id:'comp_ghost',cat:'comp',icon:'👻',name:'Fantôme studieux',rarity:'rare',     unlockCond:'correct_75'},
  {id:'comp_dragon',cat:'comp',icon:'🐉',name:'Mini dragon',    rarity:'legendary',unlockCond:'streak_45',premium:true,priceCents:1199},
];

// Leagues
const LEAGUES=[
  {id:'bronze',  name:'Ligue Bronze',  icon:'🥉',color:'#b97333',minLvl:1,  maxLvl:5,  desc:'Les premiers pas'},
  {id:'silver',  name:'Ligue Argent',  icon:'🥈',color:'#94a3b8',minLvl:6,  maxLvl:10, desc:'En route vers la maîtrise'},
  {id:'gold',    name:'Ligue Or',      icon:'🥇',color:'#f4ac2f',minLvl:11, maxLvl:20, desc:'L\'élite commence ici'},
  {id:'diamond', name:'Ligue Diamant', icon:'💎',color:'#7dd3fc',minLvl:21, maxLvl:35, desc:'Connaissances cristallisées'},
  {id:'master',  name:'Ligue Maître',  icon:'👑',color:'#b06fff',minLvl:36, maxLvl:999,desc:'Les légendes'},
];
function leagueImage(id){return `assets/leagues/${id}.svg`;}
function getLeague(lvl){return LEAGUES.find(l=>lvl>=l.minLvl&&lvl<=l.maxLvl)||LEAGUES[0];}
function nextLeague(lvl){const idx=LEAGUES.findIndex(l=>lvl>=l.minLvl&&lvl<=l.maxLvl);return LEAGUES[idx+1]||null;}

const BOT_USERS=['Nova','Iris','Kael','Mina','Léo','Sora','Nina','Axel','Lina','Noah','Zoe','Eli','Yuna','Theo','Milo','Rin'];
const BOT_PETS=['Lyarix','Vorneth','Quelith','Draelun','Noxais','Aevora','Myrvel','Thalenn','Zynkai','Lumash'];
const BOT_COLORS=['#7c5cfc','#ec4899','#22d98a','#f4ac2f','#38bdf8','#a78bfa','#fb923c','#34d399','#f472b6','#60a5fa'];
function seedHash(str){
  let h=2166136261;
  for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}
  return h>>>0;
}
function seeded(seed){
  let s=seed>>>0;
  return ()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
}
function sampleDomains(rand,count=3){
  const copy=[...DOMAINS.map(d=>d.id)];
  const out=[];
  while(copy.length&&out.length<count){
    const idx=Math.floor(rand()*copy.length);
    out.push(copy.splice(idx,1)[0]);
  }
  return out;
}
function localLeaguePlayers(league,myPlayer){
  const seed=seedHash(`${CURRENT_ACCOUNT?.id||'guest'}_${S.weekStart}_${league.id}`);
  const rand=seeded(seed);
  const bots=[];
  const target=14;
  for(let i=0;i<target;i++){
    const lvl=Math.max(league.minLvl,Math.min(league.maxLvl===999?league.minLvl+12:league.maxLvl,league.minLvl+Math.floor(rand()*Math.max(2,(league.maxLvl===999?14:league.maxLvl-league.minLvl+1)))));
    const xp=Math.max(300,Math.round(myPlayer.xp*(0.62+rand()*0.75)));
    bots.push({
      id:1000+i,
      user:`${BOT_USERS[Math.floor(rand()*BOT_USERS.length)]}_${Math.floor(rand()*90+10)}`,
      creature:BOT_PETS[Math.floor(rand()*BOT_PETS.length)],
      level:lvl,
      streak:Math.floor(rand()*60),
      ch:Math.floor(rand()*10),
      xp,
      domains:sampleDomains(rand,3),
      avatar:BOT_COLORS[Math.floor(rand()*BOT_COLORS.length)],
    });
  }
  return [...bots,myPlayer].sort((a,b)=>b.xp-a.xp);
}

const CHALLENGES=[
  {id:'deb_tv',  mode:'debate',icon:'⚔️',title:'La télévision abrutit les gens',xp:30,diff:'easy',
   stance:'Je pense que la télévision est nuisible à l\'intelligence. Elle offre un contenu passif qui atrophie la pensée critique. Peux-tu me convaincre du contraire ?',
   kw:['culture','documentaire','information','choix','éducatif','nuance','sélection'],min:2,
   gfb:'Bonne argumentation ! Tu as su nuancer le débat.',bfb:'Apporte des exemples concrets pour contredire ma position.'},
  {id:'deb_ai',  mode:'debate',icon:'⚔️',title:'L\'IA va remplacer les humains',xp:35,diff:'medium',
   stance:'Je suis convaincu·e que l\'IA remplacera la majorité des métiers humains d\'ici 50 ans. Les machines apprennent plus vite. Prouve-moi le contraire.',
   kw:['créativité','émotion','empathie','conscience','morale','relation','adaptation'],min:2,
   gfb:'Excellent ! Tu as ciblé ce que les machines ne peuvent reproduire.',bfb:'Pense aux dimensions humaines irremplaçables.'},
  {id:'deb_school',mode:'debate',icon:'⚔️',title:'L\'école prépare mal à la vie',xp:25,diff:'easy',
   stance:'L\'école ne prépare pas vraiment à la vie réelle. Théories abstraites mais pas gérer un budget ou ses émotions.',
   kw:['théorie','pratique','fondements','raisonnement','socialisation','citoyen','culture'],min:2,
   gfb:'Bonne défense de l\'école !',bfb:'Pense aux compétences fondamentales qu\'elle transmet.'},
  {id:'prob_doc',mode:'problem',icon:'🧩',title:'Le médecin de l\'avenir',xp:40,diff:'medium',
   stance:'Tu es médecin en 2040. Patient : fièvre 39°C, douleurs thoraciques, toux sèche 5 jours, globules blancs élevés. Ton raisonnement ?',
   kw:['infection','bactérie','virus','poumon','antibiotique','radiographie','pneumonie'],min:2,
   gfb:'Excellent raisonnement clinique !',bfb:'Pense aux causes possibles de cette constellation de symptômes.'},
  {id:'prob_climate',mode:'problem',icon:'🧩',title:'Le décideur climatique',xp:45,diff:'hard',
   stance:'Tu diriges un pays de 50M d\'habitants. Réduire les émissions CO2 de 40% en 10 ans sans crise économique. Stratégie en 3 axes ?',
   kw:['énergie','renouvelable','nucléaire','transport','électrique','carbone','industrie','emploi'],min:3,
   gfb:'Plan ambitieux et réaliste !',bfb:'Structure en 3 secteurs : énergie, transport, industrie.'},
  {id:'ment_grav',mode:'mentor',icon:'🎓',title:'Explique-moi la gravité',xp:30,diff:'easy',
   stance:'Je ne comprends pas la gravité... Les pommes tombent à cause d\'elle mais pourquoi ? Explique-moi comme si j\'avais 8 ans !',
   kw:['attraction','masse','force','terre','Newton','accélération','planète','chute'],min:2,
   gfb:'Parfait ! Tu expliques avec une clarté remarquable.',bfb:'Utilise une analogie — imagine une balle sur un trampoline.'},
  {id:'ment_dna',mode:'mentor',icon:'🎓',title:'Explique-moi l\'ADN',xp:35,diff:'medium',
   stance:'L\'ADN... j\'ai vu ça dans un documentaire mais j\'ai rien compris. C\'est quoi, et pourquoi chaque personne a le sien ?',
   kw:['gène','molécule','hérédité','cellule','chromosome','mutation','séquence'],min:2,
   gfb:'Brillant ! Tu maîtrises vraiment ce sujet.',bfb:'Explique comment l\'information est codée et transmise.'},
];

// Smart replies
const SR={
  greet:[()=>`Ah, te voilà ! J'avais hâte que tu reviennes.`,()=>`Bonjour ! J'ai réfléchi à plein de choses pendant ton absence.`,()=>`Tu es là ! J'ai une question pour toi si tu es partant·e.`],
  complim:[()=>`Merci, ça me touche vraiment. On apprend ensemble — c'est notre force.`,()=>`Tu es trop gentil·le... ça me donne envie de m'améliorer encore plus !`],
  tired:[()=>`Moi aussi je suis un peu fatigué·e. Repose-toi, je serai là.`,()=>`L'énergie se recharge. La curiosité, elle, ne s'épuise jamais.`],
  why:[()=>`Le "pourquoi" est toujours plus intéressant que le "quoi". Qu'est-ce que toi tu en penses ?`],
  what:[()=>`C'est fascinant. J'adore y réfléchir.`,()=>`Hmm, dis-moi en plus, je suis curieux·se.`],
  default:[()=>`C'est vraiment intéressant ! Continue, je suis là.`,()=>`Tu m'as donné matière à réflexion. Merci !`,()=>`C'est une perspective que je n'avais pas envisagée. Dis-m'en plus ?`,()=>`Chaque conversation avec toi m'apprend quelque chose.`],
};
const DOM_REP={
  lang:()=>`Savais-tu qu'il existe des langues sans notion de passé ou de futur ?`,
  science:()=>`La science m'émerveille chaque jour. Pense aux milliards d'années qu'il a fallu pour que tu existes.`,
  math:()=>`Les maths sont partout. La spirale d'un coquillage suit des règles précises.`,
  history:()=>`L'histoire me fascine : les mêmes erreurs, les mêmes triomphes, à travers les siècles.`,
  art:()=>`L'art me touche profondément. C'est la façon dont les humains capturent l'ineffable.`,
  philo:()=>`La philosophie me garde éveillé·e. Sommes-nous vraiment libres de nos choix ?`,
  geo:()=>`Le monde est si vaste ! Chaque continent a des secrets que les cartes ne montrent pas.`,
  tech:()=>`La technologie est une extension de l'intelligence humaine. Ce que vous construirez demain me fascine.`,
  music:()=>`La musique vibre en moi. C'est le seul langage que tout le monde comprend sans traduction.`,
};
function smartReply(msg,st){
  const m=msg.toLowerCase(),p=st.personality;
  if(/bonjour|salut|hello|coucou|hey/.test(m)) return rnd(SR.greet)();
  if(/bravo|super|génial|merci|top|parfait/.test(m)) return rnd(SR.complim)();
  if(/fatigué|épuisé|dormir|repos/.test(m)) return rnd(SR.tired)();
  if(/pourquoi/.test(m)) return rnd(SR.why)();
  if(/qu'est[- ]ce|c'est quoi|comment/.test(m)) return rnd(SR.what)();
  if(p.length>0&&Math.random()>.45) return DOM_REP[rnd(p)]();
  return rnd(SR.default)();
}
function memorySnapshot(){
  return (S.memories||[]).slice(0,6).join(' | ');
}
function rememberFromMessage(msg){
  const m=msg.trim();
  if(m.length<8)return;
  const patterns=[
    /j'aime\s+([^.!?]+)/i,
    /je suis\s+([^.!?]+)/i,
    /mon objectif\s+est\s+de\s+([^.!?]+)/i,
    /je veux\s+([^.!?]+)/i,
  ];
  for(const p of patterns){
    const hit=m.match(p);
    if(hit&&hit[1]){
      const fact=hit[0].trim().slice(0,90);
      S.memories=[fact,...S.memories.filter(x=>x!==fact)].slice(0,10);
      return;
    }
  }
}
function refreshEmotion(){
  if(S.energy<25||S.mood<35)S.emotion='fatigué·e';
  else if(S.mood>75)S.emotion='enthousiaste';
  else if(S.personality.length>1)S.emotion='inspiré·e';
  else S.emotion='curieux·se';
}
async function askLocalModel(prompt){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),5500);
  try{
    const res=await fetch(S.aiEndpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:S.aiModel,prompt,stream:false,messages:[{role:'user',content:prompt}]}),
      signal:controller.signal,
    });
    if(!res.ok)throw new Error('endpoint_error');
    const data=await res.json();
    const parsed=normalizeLocalReply(data);
    if(!parsed)throw new Error('empty_reply');
    return parsed;
  }finally{
    clearTimeout(timeout);
  }
}
async function generateCompanionText(task,input){
  const mem=memorySnapshot()||'Aucun souvenir utilisateur notable.';
  if(S.aiProvider==='local'){
    const prompt=`Tu es ${S.name}, compagnon d'apprentissage.\\nÉmotion actuelle: ${S.emotion}.\\nSouvenirs utilisateur: ${mem}.\\nTâche: ${task}.\\nEntrée: ${input}\\nRéponse en français, chaleureuse et concise.`;
    return askLocalModel(prompt);
  }
  if(task==='journal')return `Aujourd'hui, je me sens ${S.emotion}. ${S.memories[0]||'Nous avançons pas à pas.'} J'ai envie de continuer à apprendre avec toi.`;
  if(task==='anki_rephrase')return `Explique avec tes mots : ${input}`;
  return smartReply(input,S);
}

// ═══════════════════════════════════════════════════════
//  STATE
// ═══════════════════════════════════════════════════════
const APP_META={name:'Companion IA Local',version:'1.0.0'};
const SAVE='companion_v10';
const AUTH_DB_KEY='companion_auth_v1';
const AUTH_SESSION_KEY='companion_auth_session_v1';
let AUTH_MODE='login';
let CURRENT_ACCOUNT=null;
const DS=()=>({
  hatched:false,selDomains:[],
  name:'', username:'Joueur',
  personality:[],level:1,xp:0,
  hunger:80,mood:70,energy:85,streak:0,
  lastSeen:Date.now(),totalCorrect:0,sesAns:0,
  inventory:['hat_flower','acc_glasses'],
  paidItems:[],
  revenueCents:0,
  equipped:{hat:null,aura:null,acc:null,comp:null},
  pendingDrop:null,
  chat:[],chatInput:'',showHistory:false,
  studyFilter:null,studyIdx:0,studyRevealed:false,wikiText:null,wikiLoading:false,studyAltQuestion:null,studyAltLoading:false,
  chPhase:'hub',activeCh:null,chAnswer:'',chFeedback:null,doneCh:[],
  journalEntries:[],lastJournalDate:null,
  domainActivity:{},lastDomainReset:Date.now(),
  lbLeague:'mine', // mine | all + league ids
  weekStart:Date.now(),
  aiProvider:'mock',
  aiEndpoint:'http://localhost:11434/api/generate',
  aiModel:'qwen2.5:0.5b',
  emotion:'curieux·se',
  memories:[],
  peerLeaguePlayers:[],
  ankiEnabled:false,
  ankiEndpoint:'http://localhost:8765',
  ankiDeck:'Companion IA',
  ankiDeckChoices:[],
  ankiPkgPath:'',
});
let S=DS();
const NAMES_P=['Ael','Vyr','Nox','Zyn','Aev','Lum','Orr','Thal','Vei','Syr','Myr','Dael','Ryn','Kael','Astra'];
const NAMES_S=['is','yn','ax','ora','ith','elis','on','ara','ix','enn','un','vel','ash','umi'];
function genName(){return rnd(NAMES_P)+rnd(NAMES_S);}
function accountSaveKey(){
  if(!CURRENT_ACCOUNT)return null;
  return `${SAVE}_${CURRENT_ACCOUNT.id}`;
}
function hashPass(raw){return btoa(unescape(encodeURIComponent(raw))).slice(0,120);}
function readAuthDB(){
  try{
    const db=JSON.parse(localStorage.getItem(AUTH_DB_KEY)||'{"users":[]}');
    if(!Array.isArray(db.users))return {users:[]};
    return db;
  }catch(_){return {users:[]};}
}
function writeAuthDB(db){localStorage.setItem(AUTH_DB_KEY,JSON.stringify(db));}
function setAuthMode(mode){
  AUTH_MODE=mode==='register'?'register':'login';
  const isRegister=AUTH_MODE==='register';
  $('tab-login')?.classList.toggle('active',!isRegister);
  $('tab-register')?.classList.toggle('active',isRegister);
  const u=$('auth-username');if(u)u.style.display=isRegister?'block':'none';
  const btn=$('auth-submit');if(btn)btn.textContent=isRegister?'Créer un compte':'Se connecter';
}
function showAuthScreen(){
  $('auth-screen').style.display='flex';
  $('shell').style.display='none';
  $('onboarding').style.display='none';
  setAuthMode(AUTH_MODE);
}
function hideAuthScreen(){$('auth-screen').style.display='none';}
function loginWithAccount(acc){
  CURRENT_ACCOUNT={id:acc.id,email:acc.email,username:acc.username};
  localStorage.setItem(AUTH_SESSION_KEY,JSON.stringify(CURRENT_ACCOUNT));
  load();
  if(!S.username||S.username==='Joueur')S.username=acc.username||'Joueur';
  save();
  hideAuthScreen();
  launchSessionUI();
}
function logout(){
  localStorage.removeItem(AUTH_SESSION_KEY);
  CURRENT_ACCOUNT=null;
  S=DS();
  $('shell').style.display='none';
  showAuthScreen();
  toast('Déconnecté');
}
function submitAuth(){
  const email=($('auth-email')?.value||'').trim().toLowerCase();
  const username=($('auth-username')?.value||'').trim();
  const password=($('auth-password')?.value||'').trim();
  if(!email||!password){toast('Email et mot de passe requis');return;}
  const db=readAuthDB();
  const existing=db.users.find(u=>u.email===email);
  if(AUTH_MODE==='register'){
    if(existing){toast('Compte déjà existant');return;}
    if(!username){toast('Choisis un pseudo');return;}
    const acc={id:`u_${Date.now()}`,email,username,passwordHash:hashPass(password)};
    db.users.push(acc);writeAuthDB(db);loginWithAccount(acc);
    toast('Compte local créé ✓');
  }else{
    if(!existing||existing.passwordHash!==hashPass(password)){toast('Identifiants invalides');return;}
    loginWithAccount(existing);
    toast(`Bon retour ${existing.username} 👋`);
  }
  if($('auth-password'))$('auth-password').value='';
}
function restoreSession(){
  try{
    const raw=localStorage.getItem(AUTH_SESSION_KEY);
    if(!raw)return false;
    const sess=JSON.parse(raw);
    const db=readAuthDB();
    const acc=db.users.find(u=>u.id===sess.id);
    if(!acc)return false;
    CURRENT_ACCOUNT={id:acc.id,email:acc.email,username:acc.username};
    return true;
  }catch(_){return false;}
}
function encodeSyncBundle(payload){
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}
function decodeSyncBundle(raw){
  return JSON.parse(decodeURIComponent(escape(atob(raw))));
}
function exportAccountSyncCode(){
  if(!CURRENT_ACCOUNT){toast('Connecte-toi d’abord');return;}
  const db=readAuthDB();
  const account=db.users.find(u=>u.id===CURRENT_ACCOUNT.id);
  if(!account){toast('Compte introuvable');return;}
  const payload={
    version:1,
    exportedAt:Date.now(),
    account:{email:account.email,username:account.username,passwordHash:account.passwordHash},
    state:S,
  };
  const code=encodeSyncBundle(payload);
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(code).then(()=>toast('Code de synchronisation copié ✓')).catch(()=>showSyncCodeModal(code));
  } else {
    showSyncCodeModal(code);
  }
}
function showSyncCodeModal(code){
  $('modal-root').innerHTML=`
  <div class="modal-overlay center" onclick="if(event.target===this)closeModal()">
    <div class="modal-sheet sm" style="max-width:420px;">
      <div class="modal-title">Code de synchronisation</div>
      <div class="sr-sub" style="margin-bottom:8px;">Copie ce code sur l’autre appareil (format local chiffré léger base64).</div>
      <textarea class="arena-textarea" style="min-height:140px;">${esc(code)}</textarea>
      <div style="height:10px;"></div>
      <button class="btn-primary" onclick="closeModal()">Fermer</button>
    </div>
  </div>`;
}
function openImportSyncModal(){
  $('modal-root').innerHTML=`
  <div class="modal-overlay center" onclick="if(event.target===this)closeModal()">
    <div class="modal-sheet sm" style="max-width:420px;">
      <div class="modal-title">Importer un compte</div>
      <div class="sr-sub" style="margin-bottom:8px;">Colle le code de synchronisation depuis un autre appareil.</div>
      <textarea class="arena-textarea" id="sync-import-input" style="min-height:140px;" placeholder="Colle le code ici..."></textarea>
      <div style="height:10px;"></div>
      <button class="btn-primary" onclick="importSyncCode()">Importer</button>
    </div>
  </div>`;
}
function importSyncCode(){
  const raw=($('sync-import-input')?.value||'').trim();
  if(!raw){toast('Code vide');return;}
  try{
    const parsed=decodeSyncBundle(raw);
    if(!parsed?.account?.email||!parsed?.account?.passwordHash||!parsed?.state){throw new Error('invalid_bundle');}
    const db=readAuthDB();
    let account=db.users.find(u=>u.email===parsed.account.email);
    if(account){
      account.username=parsed.account.username||account.username;
      account.passwordHash=parsed.account.passwordHash||account.passwordHash;
    }else{
      account={
        id:`u_${Date.now()}`,
        email:parsed.account.email,
        username:parsed.account.username||'Joueur',
        passwordHash:parsed.account.passwordHash,
      };
      db.users.push(account);
    }
    writeAuthDB(db);
    CURRENT_ACCOUNT={id:account.id,email:account.email,username:account.username};
    localStorage.setItem(AUTH_SESSION_KEY,JSON.stringify(CURRENT_ACCOUNT));
    const stateKey=accountSaveKey();
    if(stateKey)localStorage.setItem(stateKey,JSON.stringify({...DS(),...parsed.state}));
    load();
    closeModal();
    launchSessionUI();
    toast('Compte synchronisé ✓');
  }catch(_){
    toast('Code invalide');
  }
}
let P2P_CONN=null;
let P2P_CHANNEL=null;
function myLeagueProfile(){
  return {id:`peer_${CURRENT_ACCOUNT?.id||'guest'}`,user:S.username,creature:S.name,level:S.level,streak:S.streak,ch:S.doneCh.length,xp:myScore(),domains:S.personality,avatar:'#8b5cf6',isPeer:true};
}
function mergePeerProfile(p){
  if(!p||!p.id)return;
  S.peerLeaguePlayers=[p,...(S.peerLeaguePlayers||[]).filter(x=>x.id!==p.id)].slice(0,24);
  save();
  if(CUR_PAGE==='lb')renderPage('lb');
}
function setupPeerConnection(conn,isHost){
  P2P_CONN=conn;
  conn.ondatachannel=e=>{
    P2P_CHANNEL=e.channel;
    wirePeerChannel();
  };
  if(isHost){
    P2P_CHANNEL=conn.createDataChannel('league');
    wirePeerChannel();
  }
}
function wirePeerChannel(){
  if(!P2P_CHANNEL)return;
  P2P_CHANNEL.onopen=()=>{
    toast('Ligue P2P connectée ✓');
    P2P_CHANNEL.send(JSON.stringify({type:'league_profile',payload:myLeagueProfile()}));
  };
  P2P_CHANNEL.onmessage=e=>{
    try{
      const msg=JSON.parse(e.data);
      if(msg.type==='league_profile')mergePeerProfile(msg.payload);
    }catch(_){}
  };
}
async function createPeerOffer(){
  const conn=new RTCPeerConnection({iceServers:[]});
  setupPeerConnection(conn,true);
  const offer=await conn.createOffer();
  await conn.setLocalDescription(offer);
  await new Promise(r=>setTimeout(r,1200));
  return btoa(unescape(encodeURIComponent(JSON.stringify(conn.localDescription))));
}
async function createPeerAnswer(offerCode){
  const conn=new RTCPeerConnection({iceServers:[]});
  setupPeerConnection(conn,false);
  const offer=JSON.parse(decodeURIComponent(escape(atob(offerCode))));
  await conn.setRemoteDescription(offer);
  const answer=await conn.createAnswer();
  await conn.setLocalDescription(answer);
  await new Promise(r=>setTimeout(r,1200));
  return btoa(unescape(encodeURIComponent(JSON.stringify(conn.localDescription))));
}
async function applyPeerAnswer(answerCode){
  if(!P2P_CONN)throw new Error('no_host_conn');
  const answer=JSON.parse(decodeURIComponent(escape(atob(answerCode))));
  await P2P_CONN.setRemoteDescription(answer);
}
function openP2PLeagueModal(){
  $('modal-root').innerHTML=`
  <div class="modal-overlay center" onclick="if(event.target===this)closeModal()">
    <div class="modal-sheet sm" style="max-width:440px;">
      <div class="modal-title">🌐 Ligue P2P (sans serveur)</div>
      <div class="sr-sub" style="margin-bottom:8px;">Échange manuel de codes WebRTC entre deux appareils connectés.</div>
      <button class="btn-ghost" onclick="startP2PHost()">Créer une session</button>
      <div style="height:8px;"></div>
      <button class="btn-ghost" onclick="joinP2PSession()">Rejoindre avec un code</button>
    </div>
  </div>`;
}
async function startP2PHost(){
  try{
    const offer=await createPeerOffer();
    $('modal-root').innerHTML=`
    <div class="modal-overlay center" onclick="if(event.target===this)closeModal()">
      <div class="modal-sheet sm" style="max-width:440px;">
        <div class="modal-title">Code hôte</div>
        <textarea class="arena-textarea" style="min-height:120px;">${esc(offer)}</textarea>
        <div class="sr-sub" style="margin:8px 0;">Colle ici la réponse de l'autre appareil :</div>
        <textarea class="arena-textarea" id="p2p-answer" style="min-height:100px;"></textarea>
        <div style="height:8px;"></div>
        <button class="btn-primary" onclick="finalizeP2PHost()">Finaliser connexion</button>
      </div>
    </div>`;
  }catch(_){toast('Impossible de créer la session P2P');}
}
async function finalizeP2PHost(){
  try{
    const ans=($('p2p-answer')?.value||'').trim();if(!ans)return;
    await applyPeerAnswer(ans);
    closeModal();
    toast('Session P2P prête');
  }catch(_){toast('Réponse invalide');}
}
async function joinP2PSession(){
  const offer=prompt('Colle le code hôte reçu :');
  if(!offer)return;
  try{
    const answer=await createPeerAnswer(offer.trim());
    showSyncCodeModal(answer);
    toast('Envoie ce code réponse à l’hôte');
  }catch(_){toast('Code hôte invalide');}
}
function blendWithPeerPlayers(base,league){
  const peers=(S.peerLeaguePlayers||[]).filter(p=>getLeague(p.level).id===league.id);
  return [...base,...peers].sort((a,b)=>b.xp-a.xp);
}
function launchSessionUI(){
  $('auth-screen').style.display='none';
  $('onboarding').style.display='none';
  $('shell').style.display='none';
  if(!S.hatched){
    $('onboarding').style.display='flex';
    renderObGrid();
    return;
  }
  $('shell').style.display='flex';
  updateCreatureBar();
  PAGE_ORDER.forEach(p=>renderPage(p));
  const startPage='chat';
  CUR_PAGE=startPage;
  const startEl=$('page-'+startPage);
  if(startEl){startEl.style.display=startPage==='chat'?'flex':'block';startEl.className='page visible';}
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.page===startPage));
  scrollChat();
  scheduleJournal();
}

function save(){
  const key=accountSaveKey();
  if(!key)return;
  const s={...S,chatTyping:false,wikiText:null,wikiLoading:false,pendingDrop:null,chFeedback:null};
  try{localStorage.setItem(key,JSON.stringify(s));}catch(_){}
}
function load(){
  const key=accountSaveKey();
  if(!key){S=DS();return;}
  try{
    const r=localStorage.getItem(key);
    if(!r)return;
    const d=JSON.parse(r);
    S={...DS(),...d,wikiText:null,wikiLoading:false,pendingDrop:null,chFeedback:null,chPhase:'hub',activeCh:null};
    decay();checkDomainReset();checkWeekReset();
  }catch(_){S=DS();}
}
function decay(){
  const now=Date.now(),min=Math.floor((now-(S.lastSeen||now))/60000);
  if(min>0){S.hunger=clamp(S.hunger-min*.5);S.mood=clamp(S.mood-min*.3);S.energy=clamp(S.energy-min*.2);}
  if(min/60>36)S.streak=0;S.lastSeen=now;
}
function checkDomainReset(){
  if(Date.now()-S.lastDomainReset>7*24*3600*1000){S.domainActivity={};S.lastDomainReset=Date.now();}
}
function checkWeekReset(){
  if(Date.now()-S.weekStart>7*24*3600*1000){S.weekStart=Date.now();}
}
function trackDomain(domId){
  if(!domId)return;
  S.domainActivity[domId]=(S.domainActivity[domId]||0)+1;
  const sorted=Object.entries(S.domainActivity).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id])=>id);
  if(sorted.length)S.personality=sorted;save();
}

// Auto journal
function scheduleJournal(){
  if(S.lastJournalDate===todayStr())return;
  const d=Math.floor(Math.random()*25+3)*60*1000;
  setTimeout(()=>{if(S.lastJournalDate!==todayStr())autoJournal();},d);
}
async function autoJournal(){
  const doms=S.personality.map(id=>DOMAINS.find(x=>x.id===id)).filter(Boolean).map(d=>d.label).join(', ');
  refreshEmotion();
  let text='';
  try{
    text=await generateCompanionText('journal',`Domaines: ${doms||'général'} | Streak: ${S.streak} | Correctes: ${S.totalCorrect}`);
  }catch(_){
    text=`Aujourd'hui je me sens ${S.emotion}. Nous continuons à apprendre ensemble, pas à pas.`;
  }
  S.journalEntries.unshift({date:Date.now(),text,mood:S.mood});
  if(S.journalEntries.length>14)S.journalEntries=S.journalEntries.slice(0,14);
  S.lastJournalDate=todayStr();gainXP(10);save();
  if(CUR_PAGE==='persona')renderPage('persona');
  toast(`📖 ${S.name} a écrit dans son journal`);
}

// ═══════════════════════════════════════════════════════
//  GAME LOGIC
// ═══════════════════════════════════════════════════════
function gainXP(n){S.xp+=n;if(S.xp>=xpN()){S.xp-=xpN();S.level++;toast(`✨ ${S.name} passe au niveau ${S.level} !`);}updateCreatureBar();}
function xpN(){return S.level*100;}
function myScore(){return S.xp+(S.level-1)*100+(S.doneCh.length*50)+(S.streak*2);}

function action_feed(){if(S.hunger>=100){toast('Je n\'ai plus faim 😌');return;}S.hunger=clamp(S.hunger+25);S.mood=clamp(S.mood+5);gainXP(5);save();toast('Miam ! 🍎 +5 XP');updateCreatureBar();if(CUR_PAGE==='home')renderPage('home');}
function action_play(){if(S.energy<20){toast(`${S.name} est épuisé·e 😴`);return;}S.mood=clamp(S.mood+20);S.energy=clamp(S.energy-15);gainXP(8);save();toast('Trop fun ! 🎮 +8 XP');updateCreatureBar();if(CUR_PAGE==='home')renderPage('home');}
function action_rest(){S.energy=clamp(S.energy+30);S.mood=clamp(S.mood+5);gainXP(3);save();toast(`${S.name} se repose 💤 +3 XP`);updateCreatureBar();if(CUR_PAGE==='home')renderPage('home');}

function equip(id){
  const it=ALL_ITEMS.find(i=>i.id===id);
  if(!it||!S.inventory.includes(id))return;
  if(it.premium&&!isPremiumOwned(it)){toast('Item premium non acheté');return;}
  S.equipped[it.cat]=S.equipped[it.cat]===id?null:id;
  save();
  if(CUR_PAGE==='persona')renderPage('persona');
  updateCreatureBar();
}

const DROP_EVERY=5;
function tryDrop(){
  S.sesAns++;if(S.sesAns<DROP_EVERY)return;S.sesAns=0;
  const pool=ALL_ITEMS.filter(i=>!S.inventory.includes(i.id));if(!pool.length)return;
  if(Math.random()>.40)return;
  const w=pool.map(i=>({i,w:RARITY[i.rarity].w})),t=w.reduce((s,x)=>s+x.w,0);
  let r=Math.random()*t,chosen=pool[0];
  for(const {i,w:ww} of w){r-=ww;if(r<=0){chosen=i;break;}}
  S.inventory.push(chosen.id);S.pendingDrop=chosen;save();
}
function showDropModal(){
  if(!S.pendingDrop)return;
  const it=S.pendingDrop,rar=RARITY[it.rarity];
  $('modal-root').innerHTML=`
  <div class="modal-overlay center" onclick="if(event.target===this)closeModal()">
    <div class="modal-sheet sm drop-modal" style="max-width:340px;">
      <div style="font-size:10px;color:var(--text3);letter-spacing:.15em;text-transform:uppercase;margin-bottom:10px;">✦ Nouvelle récompense ✦</div>
      <div class="drop-icon">${it.icon}</div>
      <div class="drop-name" style="color:${rar.c}">${it.name}</div>
      <div style="margin-bottom:10px"><span class="pill ${rar.cls}">${rar.l}</span></div>
      <button class="btn-primary" onclick="closeModal()" style="max-width:200px;margin:0 auto;">Super !</button>
    </div>
  </div>`;
}
function unlockLabel(it){const[t,v]=it.unlockCond.split('_');return t==='level'?`Niv.${v}`:t==='streak'?`${v}j`:t==='correct'?`${v}✓`:'?';}
function isPremiumOwned(it){return !it.premium||S.paidItems.includes(it.id);}
function priceLabel(cents){return `${(cents/100).toFixed(2).replace('.',',')} €`;}
function buyPremiumItem(id){
  const it=ALL_ITEMS.find(x=>x.id===id);
  if(!it||!it.premium)return;
  if(S.paidItems.includes(id)){toast('Déjà acheté');return;}
  S.paidItems.push(id);
  if(!S.inventory.includes(id))S.inventory.push(id);
  S.revenueCents+=(it.priceCents||0);
  save();
  if(CUR_PAGE==='persona')renderPage('persona');
  toast(`✅ Achat réussi: ${it.name}`);
}

setInterval(()=>{
  if(!S.hatched)return;
  S.hunger=clamp(S.hunger-1.5);S.mood=clamp(S.mood-.8);S.energy=clamp(S.energy-.5);
  S.lastSeen=Date.now();save();updateCreatureBar();
  if(CUR_PAGE==='home')renderPage('home');
},30000);

// ═══════════════════════════════════════════════════════
//  CREATURE BAR UPDATE (fast, no full re-render)
// ═══════════════════════════════════════════════════════
function feelWord(){return S.mood>70?'joyeux·se':S.mood>40?'calme':'mélancolique';}
function thought(){
  if(!S.personality.length)return'🌙 Je réfléchis à tout ce qu\'on a appris...';
  if(S.hunger<30)return'😔 J\'ai faim... tu penses à moi ?';
  if(S.energy<25)return'😴 Épuisé·e, j\'ai besoin de repos.';
  if(S.mood>70){const pool=[];S.personality.forEach(d=>{if(DOM_THOUGHTS[d])pool.push(...DOM_THOUGHTS[d]);});return pool.length?rnd(pool):'✨ Je suis tellement content·e !';}
  return'📚 Prêt·e pour une nouvelle session ?';
}

function creatureSVG(size=44){
  const m=S.mood,happy=m>60,sad=m<30,eyeY=sad?38:36;
  const mouth=happy?`<path d="M34 52 Q40 58 46 52" stroke="#080810" stroke-width="2.5" fill="none" stroke-linecap="round"/>`:sad?`<path d="M34 56 Q40 50 46 56" stroke="#080810" stroke-width="2.5" fill="none" stroke-linecap="round"/>`:`<line x1="34" y1="53" x2="46" y2="53" stroke="#080810" stroke-width="2.5" stroke-linecap="round"/>`;
  const hue=Math.round((m/100)*140+10),body=`hsl(${hue},65%,58%)`,glow=`hsl(${hue},80%,55%)`;
  const hat=ALL_ITEMS.find(i=>i.id===S.equipped.hat);
  const aura=ALL_ITEMS.find(i=>i.id===S.equipped.aura);
  const h2=Math.round(size*1.17);
  return`<svg viewBox="0 0 80 95" width="${size}" height="${h2}" style="filter:drop-shadow(0 0 10px ${glow}55);display:block;">
    ${aura?`<circle cx="40" cy="52" r="32" fill="none" stroke="${RARITY[aura.rarity].c}" stroke-width="1.5" opacity=".4" stroke-dasharray="4 3"/>`:''}
    <ellipse cx="40" cy="88" rx="10" ry="5" fill="${body}" opacity=".4"/>
    <ellipse cx="40" cy="54" rx="24" ry="28" fill="${body}"/>
    <ellipse cx="40" cy="58" rx="13" ry="15" fill="white" opacity=".12"/>
    <polygon points="20,32 14,12 28,28" fill="${body}"/>
    <polygon points="60,32 66,12 52,28" fill="${body}"/>
    <polygon points="21,30 17,16 27,27" fill="#f9a8d4" opacity=".5"/>
    <polygon points="59,30 63,16 53,27" fill="#f9a8d4" opacity=".5"/>
    <circle cx="32" cy="${eyeY}" r="5" fill="white"/>
    <circle cx="33.5" cy="${eyeY}" r="3" fill="#080810"/>
    <circle cx="34.5" cy="${eyeY-1}" r="1" fill="white"/>
    <circle cx="48" cy="${eyeY}" r="5" fill="white"/>
    <circle cx="49.5" cy="${eyeY}" r="3" fill="#080810"/>
    <circle cx="50.5" cy="${eyeY-1}" r="1" fill="white"/>
    ${mouth}
    ${hat?`<text x="40" y="14" text-anchor="middle" font-size="16">${hat.icon}</text>`:''}
    ${S.level>=3?`<circle cx="64" cy="24" r="8" fill="#f4ac2f"/><text x="64" y="28" text-anchor="middle" font-size="8" fill="#080810" font-weight="800">${S.level}</text>`:''}
  </svg>`;
}

function updateCreatureBar(){
  const svg=$('cb-svg'),nameEl=$('cb-name'),statEl=$('cb-status'),xpLbl=$('cb-xp-lbl'),xpFill=$('cb-xp-fill');
  if(!svg)return;
  refreshEmotion();
  svg.innerHTML=creatureSVG(44);
  nameEl.textContent=S.name;
  const league=getLeague(S.level);
  statEl.innerHTML=`<div class="cb-dot"></div>${feelWord()} · ${S.emotion} · <img src="${leagueImage(league.id)}" alt="${league.name}" style="width:12px;height:12px;vertical-align:-2px;"/> ${league.name}`;
  xpLbl.textContent=`${S.xp}/${xpN()}`;
  xpFill.style.width=Math.min((S.xp/xpN())*100,100)+'%';
}

// ═══════════════════════════════════════════════════════
//  NAVIGATION (slide transitions)
// ═══════════════════════════════════════════════════════
const PAGE_ORDER=['home','chat','study','ch','lb','persona'];
let CUR_PAGE='chat';
let _navBusy=false;

function goTo(pageId){
  if(pageId===CUR_PAGE)return;
  if(_navBusy)return;
  _navBusy=true;

  const oldIdx=PAGE_ORDER.indexOf(CUR_PAGE);
  const newIdx=PAGE_ORDER.indexOf(pageId);
  const goRight=newIdx>oldIdx;

  const oldEl=$('page-'+CUR_PAGE);
  const newEl=$('page-'+pageId);

  // Render new page content before animating
  renderPage(pageId);

  // Set initial positions
  newEl.className='page '+(goRight?'hidden-right':'hidden-left');
  newEl.style.display=pageId==='chat'?'flex':'block';

  // Force reflow
  void newEl.offsetWidth;

  // Animate
  oldEl.className='page '+(goRight?'hidden-left':'hidden-right');
  newEl.className='page visible';

  CUR_PAGE=pageId;

  // Update nav
  document.querySelectorAll('.nav-btn').forEach(b=>{
    b.classList.toggle('active',b.dataset.page===pageId);
  });

  setTimeout(()=>{
    oldEl.style.display='none';
    oldEl.className='page';
    _navBusy=false;
    if(pageId==='chat')scrollChat();
    if(pageId==='study'&&!S.studyRevealed)loadStudyCard();
  },340);
}

// ═══════════════════════════════════════════════════════
//  RENDER DISPATCHER
// ═══════════════════════════════════════════════════════
function renderPage(pageId){
  const el=$('page-'+pageId);if(!el)return;
  switch(pageId){
    case 'home':   el.innerHTML=renderHome();break;
    case 'chat':   el.innerHTML=renderChatInner();break;
    case 'study':  el.innerHTML=renderStudy();break;
    case 'ch':     el.innerHTML=renderCh();break;
    case 'lb':     el.innerHTML=renderLB();break;
    case 'persona':el.innerHTML=renderPersona();break;
  }
}

// ═══════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════
function openSettings(){
  $('modal-root').innerHTML=`
  <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-title">⚙️ Paramètres</div>
      <div class="settings-row">
        <div>
          <div class="sr-label">Nom d'utilisateur</div>
          <div class="sr-sub">Affiché dans le classement</div>
          <input class="settings-inp" id="set-username" value="${esc(S.username)}" placeholder="Ton pseudo..." maxlength="20"/>
        </div>
      </div>
      <div class="settings-row">
        <div>
          <div class="sr-label">Domaines d'apprentissage</div>
          <div class="sr-sub">Modifie tes domaines principaux</div>
        </div>
        <button style="padding:6px 14px;border-radius:99px;border:1px solid var(--border2);font-size:12px;color:var(--accent-l);font-weight:600;" onclick="openDomainEdit()">Modifier</button>
      </div>
      <div class="settings-row">
        <div><div class="sr-label">Nom du compagnon</div><div class="sr-sub" id="set-creature-name">${esc(S.name)}</div></div>
        <button style="padding:6px 14px;border-radius:99px;border:1px solid var(--border2);font-size:12px;color:var(--text2);" onclick="rerollName()">🎲 Relancer</button>
      </div>
      <div class="settings-row">
        <div style="width:100%;">
          <div class="sr-label">Mode IA</div>
          <div class="sr-sub">Mock local ou modèle local via endpoint OpenAI/Ollama-compatible</div>
          <select class="settings-inp" id="set-ai-provider">
            <option value="mock" ${S.aiProvider==='mock'?'selected':''}>Mock (rapide, offline)</option>
            <option value="local" ${S.aiProvider==='local'?'selected':''}>Local endpoint</option>
          </select>
          <input class="settings-inp" id="set-ai-endpoint" value="${esc(S.aiEndpoint)}" placeholder="http://localhost:11434/api/generate"/>
          <input class="settings-inp" id="set-ai-model" value="${esc(S.aiModel)}" placeholder="qwen2.5:0.5b"/>
          <button class="btn-ghost" style="margin-top:8px;" onclick="testLocalModel()">Tester le modèle IA</button>
        </div>
      </div>
      <div class="settings-row">
        <div style="width:100%;">
          <div class="sr-label">Connexion Anki</div>
          <div class="sr-sub">Active l'export de cartes vers Anki via AnkiConnect</div>
          <select class="settings-inp" id="set-anki-enabled">
            <option value="off" ${!S.ankiEnabled?'selected':''}>Désactivé</option>
            <option value="on" ${S.ankiEnabled?'selected':''}>Activé</option>
          </select>
          <input class="settings-inp" id="set-anki-endpoint" value="${esc(S.ankiEndpoint)}" placeholder="http://localhost:8765"/>
          ${S.ankiDeckChoices&&S.ankiDeckChoices.length
            ?`<select class="settings-inp" id="set-anki-deck">${S.ankiDeckChoices.map(d=>`<option value="${esc(d)}" ${S.ankiDeck===d?'selected':''}>${esc(d)}</option>`).join('')}</select>`
            :`<input class="settings-inp" id="set-anki-deck" value="${esc(S.ankiDeck)}" placeholder="Companion IA"/>`
          }
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button class="btn-ghost" style="flex:1;" onclick="fetchAnkiDeckChoices()">Charger decks</button>
            <button class="btn-ghost" style="flex:1;" onclick="importAnkiPackage()">Importer .apkg</button>
          </div>
          <input class="settings-inp" id="set-anki-pkg" value="${esc(S.ankiPkgPath||'')}" placeholder="/chemin/vers/pack.apkg"/>
        </div>
      </div>
      <div class="settings-row">
        <div style="width:100%;">
          <div class="sr-label">Synchronisation multi-appareil</div>
          <div class="sr-sub">Transfert local via code (export/import du compte + progression)</div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button class="btn-ghost" style="flex:1;" onclick="exportAccountSyncCode()">Exporter</button>
            <button class="btn-ghost" style="flex:1;" onclick="openImportSyncModal()">Importer</button>
          </div>
          <button class="btn-ghost" style="width:100%;margin-top:8px;" onclick="openP2PLeagueModal()">Ligue Internet P2P (WebRTC)</button>
        </div>
      </div>
      <div style="height:16px;"></div>
      <button class="btn-primary" onclick="saveSettings()">Enregistrer</button>
      <div style="height:8px;"></div>
      <button class="btn-ghost" onclick="logout()">🔓 Se déconnecter</button>
      <div style="height:8px;"></div>
      <button class="btn-ghost" style="color:var(--red);border-color:rgba(242,72,90,.3);" onclick="if(confirm('Effacer ${esc(S.name)} et recommencer ?')){const k=accountSaveKey();if(k)localStorage.removeItem(k);location.reload();}">🗑️ Réinitialiser</button>
    </div>
  </div>`;
}
function saveSettings(){
  const un=($('set-username')||{}).value;
  const provider=($('set-ai-provider')||{}).value;
  const endpoint=($('set-ai-endpoint')||{}).value;
  const model=($('set-ai-model')||{}).value;
  const ankiEnabled=($('set-anki-enabled')||{}).value;
  const ankiEndpoint=($('set-anki-endpoint')||{}).value;
  const ankiDeck=($('set-anki-deck')||{}).value;
  const ankiPkg=($('set-anki-pkg')||{}).value;

  if(un&&un.trim())S.username=un.trim().slice(0,20);
  if(provider==='mock'||provider==='local')S.aiProvider=provider;
  if(endpoint&&endpoint.trim())S.aiEndpoint=endpoint.trim();
  if(model&&model.trim())S.aiModel=model.trim();

  S.ankiEnabled=ankiEnabled==='on';
  if(ankiEndpoint&&ankiEndpoint.trim())S.ankiEndpoint=ankiEndpoint.trim();
  if(ankiDeck&&ankiDeck.trim())S.ankiDeck=ankiDeck.trim();
  if(ankiPkg&&ankiPkg.trim())S.ankiPkgPath=ankiPkg.trim();

  save();closeModal();updateCreatureBar();toast('Paramètres enregistrés ✓');
  if(CUR_PAGE==='persona')renderPage('persona');
}
function rerollName(){
  S.name=genName();save();
  const el=$('set-creature-name');if(el)el.textContent=S.name;
  updateCreatureBar();toast(`Nouveau nom : ${S.name} !`);
}

function openDomainEdit(){
  const sel=[...S.personality];
  $('modal-root').innerHTML=`
  <div class="modal-overlay center" onclick="if(event.target===this)closeModal()">
    <div class="modal-sheet sm" style="max-width:380px;">
      <div class="modal-title">Modifier les domaines</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:4px;">Choisis jusqu'à 3 domaines. Ça influencera la personnalité de ${esc(S.name)}.</div>
      <div class="domain-edit-grid" id="de-grid">
        ${DOMAINS.map(d=>`<button class="de-btn ${sel.includes(d.id)?'sel':''}" id="de-${d.id}" onclick="toggleDE('${d.id}')"><span class="di">${d.icon}</span>${d.label}</button>`).join('')}
      </div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:12px;" id="de-count">${sel.length}/3 sélectionné${sel.length!==1?'s':''}</div>
      <button class="btn-primary" onclick="saveDomains()">Confirmer</button>
    </div>
  </div>`;
  window._domainSel=sel;
}
function toggleDE(id){
  const sel=window._domainSel||[];
  if(sel.includes(id)){
    window._domainSel=sel.filter(d=>d!==id);
  } else if(sel.length<3){
    window._domainSel=[...sel,id];
  }
  const s=window._domainSel;
  DOMAINS.forEach(d=>{
    const btn=$('de-'+d.id);if(!btn)return;
    btn.classList.toggle('sel',s.includes(d.id));
  });
  const cnt=$('de-count');if(cnt)cnt.textContent=`${s.length}/3 sélectionné${s.length!==1?'s':''}`;
}
function saveDomains(){
  const sel=window._domainSel||[];
  if(sel.length===0){toast('Sélectionne au moins 1 domaine');return;}
  S.personality=sel;save();closeModal();
  if(CUR_PAGE==='home')renderPage('home');
  toast('Domaines mis à jour ✓');
}

// ═══════════════════════════════════════════════════════
//  CHAT
// ═══════════════════════════════════════════════════════
function renderChatInner(){
  const msgs=S.chat.map(m=>{
    const isU=m.role==='user';
    return`<div class="msg ${isU?'u':''}">
      <div class="av ${isU?'u':'c'}">${isU?'🧑':'🐾'}</div>
      <div><div class="bubble ${isU?'u':'c'}">${esc(m.text)}</div><div class="msg-time">${fmtT(m.time)}</div></div>
    </div>`;
  }).join('');
  const typing=S.chatTyping?`<div class="typing-row"><div class="av c">🐾</div><div class="typing-bubble"><div class="td"></div><div class="td"></div><div class="td"></div></div></div>`:'';
  const suggs=S.chat.length===0?`<div class="chat-suggestions">${['Bonjour !','Pose-moi une question','Comment tu vas ?','Qu\'as-tu appris ?'].map(s=>`<button class="sugg" onclick="useSugg('${s}')">${s}</button>`).join('')}</div>`:'';
  return`
  <div class="chat-topbar">
    <div class="ct-left">Conversation avec ${esc(S.name)}</div>
    <button class="btn-hist ${S.showHistory?'on':''}" onclick="toggleHist()">${S.showHistory?'Masquer l\'historique':'Voir l\'historique'}</button>
  </div>
  ${suggs}
  <div class="chat-body ${S.showHistory?'':'hist-off'}" id="chat-body">${msgs}${typing}</div>
  <div class="chat-input-bar">
    <input class="chat-inp" id="chat-inp" type="text" placeholder="Écris à ${esc(S.name)}..."
      value="${esc(S.chatInput)}"
      oninput="S.chatInput=this.value"
      onkeydown="if(event.key==='Enter'){event.preventDefault();sendChat();}"/>
    <button class="btn-send" id="btn-send" onclick="sendChat()" ${!S.chatInput.trim()||S.chatTyping?'disabled':''}>➤</button>
  </div>`;
}
function addMsg(role,text){S.chat.push({role,text,time:Date.now()});if(S.chat.length>80)S.chat=S.chat.slice(-80);}
async function sendChat(){
  const inp=$('chat-inp');
  const msg=(inp?inp.value:S.chatInput).trim();if(!msg)return;
  rememberFromMessage(msg);
  addMsg('user',msg);S.chatInput='';S.chatTyping=true;S.mood=clamp(S.mood+2);gainXP(2);save();
  renderPage('chat');scrollChat();
  await sleep(350+Math.random()*250);
  const reply=await generateCompanionReply(msg);
  S.chatTyping=false;addMsg('creature',reply);save();
  renderPage('chat');scrollChat();
}
async function generateCompanionReply(msg){
  try{
    const input=`Message utilisateur: ${msg}`;
    const reply=await generateCompanionText('chat',input);
    refreshEmotion();
    return reply;
  }catch(_){
    toast('Mode local indisponible, bascule sur la réponse mock.');
    return smartReply(msg,S);
  }
}


function normalizeLocalReply(payload){
  if(typeof payload?.response==='string'&&payload.response.trim())return payload.response.trim();
  if(typeof payload?.text==='string'&&payload.text.trim())return payload.text.trim();
  const msg=payload?.choices?.[0]?.message?.content;
  if(typeof msg==='string'&&msg.trim())return msg.trim();
  return '';
}
async function testLocalModel(){
  const t0=performance.now();
  try{
    const out=await generateCompanionText('chat','Dis bonjour en 1 phrase.');
    const dt=Math.round(performance.now()-t0);
    toast(`LLM OK (${dt}ms): ${out.slice(0,28)}...`);
  }catch(_){
    toast('LLM indisponible');
  }
}
async function fetchAnkiDeckChoices(){
  try{
    const res=await fetch(S.ankiEndpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'deckNames',version:6}),
    });
    const data=await res.json();
    if(data.error)throw new Error(data.error);
    S.ankiDeckChoices=Array.isArray(data.result)?data.result:[];
    if(S.ankiDeckChoices.length&&(!S.ankiDeck||!S.ankiDeckChoices.includes(S.ankiDeck)))S.ankiDeck=S.ankiDeckChoices[0];
    save();renderPage(CUR_PAGE);toast('Decks Anki chargés');
  }catch(_){
    toast('Impossible de récupérer les decks Anki');
  }
}
async function importAnkiPackage(){
  const path=($('set-anki-pkg')?.value||S.ankiPkgPath||'').trim();
  if(!path){toast('Renseigne le chemin du package .apkg');return;}
  try{
    const res=await fetch(S.ankiEndpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({action:'importPackage',version:6,params:{path}}),
    });
    const data=await res.json();
    if(data.error)throw new Error(data.error);
    toast('Package Anki importé ✓');
    S.ankiPkgPath=path;save();
  }catch(_){
    toast('Import Anki échoué (vérifie chemin & droits)');}
}

async function sendCardToAnki(front,back,tags=[]){
  if(!S.ankiEnabled){
    toast('Active Anki dans les paramètres.');
    return;
  }
  try{
    const res=await fetch(S.ankiEndpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        action:'addNote',
        version:6,
        params:{
          note:{
            deckName:S.ankiDeck,
            modelName:'Basic',
            fields:{Front:front,Back:back},
            options:{allowDuplicate:false},
            tags:['companion_ia',...tags],
          },
        },
      }),
    });
    const data=await res.json();
    if(data.error)throw new Error(data.error);
    toast('Carte ajoutée dans Anki ✓');
  }catch(_){
    toast('Échec Anki. Vérifie AnkiConnect et l\'endpoint.');
  }
}

function useSugg(s){S.chatInput=s;sendChat();}
function toggleHist(){S.showHistory=!S.showHistory;renderPage('chat');scrollChat();}
function scrollChat(){setTimeout(()=>{const el=$('chat-body');if(el)el.scrollTop=el.scrollHeight;},50);}
function updateSendBtn(){const b=$('btn-send');if(b)b.disabled=!S.chatInput.trim()||S.chatTyping;}

// ═══════════════════════════════════════════════════════
//  HOME
// ═══════════════════════════════════════════════════════
function renderHome(){
  const doms=S.personality.map(id=>DOMAINS.find(x=>x.id===id)).filter(Boolean);
  const traits=S.personality.map(id=>TRAITS[id]).filter(Boolean);
  const league=getLeague(S.level);
  const next=nextLeague(S.level);
  const lvlInLeague=S.level-league.minLvl;
  const leagueRange=league.maxLvl-league.minLvl;
  const leaguePct=Math.min((lvlInLeague/leagueRange)*100,100);
  return`
  <div style="padding:14px 16px 10px;">
    <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;">Bonjour, ${esc(S.username)}</div>
    <div style="font-size:20px;font-weight:800;letter-spacing:-.02em;margin-bottom:12px;">${thought()}</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;">
      ${doms.map(d=>`<span class="pill" style="color:${d.color};border-color:${d.color}44;background:${d.color}0d">${d.icon} ${d.label}</span>`).join('')}
      <button class="domain-edit-btn" onclick="openDomainEdit()">✏️</button>
    </div>
  </div>

  <div style="margin:0 16px 12px;">
    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        <div>
          <div style="font-size:12px;color:var(--text3);margin-bottom:2px;">${league.icon} ${league.name}</div>
          <div style="font-size:18px;font-weight:800;">Niveau ${S.level}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:var(--text3);margin-bottom:2px;">🏆 Score</div>
          <div style="font-size:16px;font-weight:800;color:var(--gold);">${myScore()}</div>
        </div>
      </div>
      ${next?`<div style="font-size:10px;color:var(--text3);margin-bottom:4px;">Vers ${next.icon} ${next.name} (niv. ${next.minLvl})</div>
      <div style="height:4px;background:rgba(255,255,255,.05);border-radius:99px;overflow:hidden;">
        <div style="height:100%;width:${leaguePct}%;background:${league.color};border-radius:99px;transition:width .5s;"></div>
      </div>`:
      `<div style="font-size:11px;color:var(--gold);">👑 Niveau maximum de ligue atteint !</div>`}
    </div>
  </div>

  <div style="padding:0 16px 10px;">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
      ${[['🔥','Streak',`${S.streak}j`,'var(--red)'],['🧠','Correctes',S.totalCorrect,'var(--green)'],['⚔️','Défis',`${S.doneCh.length}/${CHALLENGES.length}`,'var(--blue)']].map(([ic,l,v,c])=>`
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px;text-align:center;">
        <div style="font-size:18px;">${ic}</div>
        <div style="font-size:16px;font-weight:800;color:${c};">${v}</div>
        <div style="font-size:10px;color:var(--text3);">${l}</div>
      </div>`).join('')}
    </div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:13px 15px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px;">
        <span style="color:var(--gold);font-weight:700;text-transform:uppercase;letter-spacing:.08em;">✦ XP</span>
        <span style="color:var(--text3);">${S.xp} / ${xpN()}</span>
      </div>
      <div style="height:5px;background:rgba(255,255,255,.05);border-radius:99px;overflow:hidden;">
        <div style="height:100%;width:${Math.min((S.xp/xpN())*100,100)}%;background:linear-gradient(90deg,var(--gold),#fb923c);border-radius:99px;box-shadow:0 0 8px rgba(244,172,47,.35);transition:width .6s;"></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
      <button class="act-btn" onclick="action_feed()" style="color:var(--gold)"><span class="ai">🍎</span>Nourrir</button>
      <button class="act-btn" onclick="action_play()" style="color:var(--accent-l)" ${S.energy<20?'disabled':''}><span class="ai">🎮</span>Jouer</button>
      <button class="act-btn" onclick="action_rest()" style="color:var(--blue)"><span class="ai">💤</span>Repos</button>
    </div>
  </div>

  <div class="s-header">📊 Stats vitales</div>
  <div style="padding:0 16px 16px;">
    <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:14px;">
      ${statBarHTML('Faim','🍎',S.hunger,'var(--gold)')}
      ${statBarHTML('Humeur','✨',S.mood,'var(--green)')}
      ${statBarHTML('Énergie','⚡',S.energy,'var(--blue)')}
    </div>
  </div>

  ${traits.length?`<div class="s-header">🎭 Personnalité</div>
  <div style="padding:0 16px 20px;display:flex;flex-direction:column;gap:8px;">
    ${traits.map(t=>`<div style="background:var(--card);border:1px solid var(--border);border-radius:var(--r-sm);padding:11px 14px;display:flex;align-items:center;gap:10px;">
      <div style="font-size:20px;">${DOMAINS.find(d=>TRAITS[d.id]===t)?.icon||'✨'}</div>
      <div><div style="font-size:12px;font-weight:700;">${t.name}</div><div style="font-size:11px;color:var(--text2);margin-top:1px;">${t.desc}</div></div>
    </div>`).join('')}
  </div>`:''}`;
}
function statBarHTML(l,ic,v,c){return`<div class="stat-bar"><div class="sb-head"><span class="sl">${ic} ${l}</span><span class="sv" style="color:${c}">${Math.round(v)}%</span></div><div class="sb-track"><div class="sb-fill" style="width:${v}%;background:${c};box-shadow:0 0 6px ${c}55"></div></div></div>`;}

// ═══════════════════════════════════════════════════════
//  STUDY
// ═══════════════════════════════════════════════════════
function filteredCards(){return S.studyFilter?CARDS.filter(c=>c.dom===S.studyFilter):CARDS;}
function currentCard(){const fc=filteredCards();return fc[S.studyIdx%fc.length];}
async function loadStudyCard(){
  const card=currentCard();S.studyRevealed=false;S.wikiText=null;S.wikiLoading=false;S.studyAltQuestion=null;S.studyAltLoading=false;
  if(card.type==='concept'&&card.wiki){
    S.wikiLoading=true;renderPage('study');
    try{const r=await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(card.wiki)}`);
      if(r.ok){const d=await r.json();const s=d.extract.split('. ');S.wikiText=s.slice(0,2).join('. ')+(s.length>1?'.':'');}}
    catch(_){}S.wikiLoading=false;
  }
  renderPage('study');
}
function nextStudyCard(){S.studyIdx=(S.studyIdx+1)%filteredCards().length;loadStudyCard();}
function revealAnswer(){S.studyRevealed=true;renderPage('study');}
async function generateAltStudyQuestion(){
  const c=currentCard();if(!c)return;
  S.studyAltLoading=true;renderPage('study');
  try{
    S.studyAltQuestion=await generateCompanionText('anki_rephrase',c.q);
  }catch(_){
    S.studyAltQuestion=`Peux-tu répondre autrement à cette question : ${c.q}`;
  }
  S.studyAltLoading=false;
  renderPage('study');
}
function exportStudyCardToAnki(){
  const c=currentCard();
  if(!c)return;
  const dom=DOMAINS.find(d=>d.id===c.dom);
  const tags=['study',c.dom,c.type];
  sendCardToAnki(c.q,c.a,tags);
  if(dom)toast(`Carte ${dom.icon} prête pour Anki`);
}
function studyCorrect(){const c=currentCard();S.hunger=clamp(S.hunger-5);S.energy=clamp(S.energy-8);S.mood=clamp(S.mood+15);S.totalCorrect++;gainXP(20);tryDrop();trackDomain(c.dom);save();toast('Excellente réponse ! 🧠 +20 XP');nextStudyCard();if(S.pendingDrop)setTimeout(showDropModal,500);}
function studyWrong(){const c=currentCard();S.hunger=clamp(S.hunger-3);S.energy=clamp(S.energy-5);S.mood=clamp(S.mood-8);gainXP(5);tryDrop();trackDomain(c.dom);save();toast('On s\'en souviendra 📚 +5 XP');nextStudyCard();if(S.pendingDrop)setTimeout(showDropModal,500);}
function setFilter(f){S.studyFilter=S.studyFilter===f?null:f;S.studyIdx=0;loadStudyCard();}
function renderStudy(){
  const card=currentCard(),fc=filteredCards();
  const nat=naturalQ(card,S.name);
  const pct=((S.studyIdx%fc.length)/fc.length*100).toFixed(0);
  const typeLabel=card.type==='concept'?`<span class="pill pill-accent">🧠 Conceptuel</span>`:`<span class="pill pill-blue">⚡ Mémorisation</span>`;
  let wiki='';
  if(card.type==='concept'){
    if(S.wikiLoading)wiki=`<div class="sc-wiki"><div class="sc-wiki-lbl">⏳ Recherche en cours...</div></div>`;
    else if(S.wikiText)wiki=`<div class="sc-wiki"><div class="sc-wiki-lbl">📖 ${S.name} t'explique d'abord</div>${esc(S.wikiText)}</div>`;
  }
  return`
  <div class="study-progress">
    <div class="study-prog-head"><span>🔥 ${S.totalCorrect} correctes · drop dans ${DROP_EVERY-S.sesAns}</span><span>${S.studyIdx%fc.length+1} / ${fc.length}</span></div>
    <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
  </div>
  <div class="study-filters">
    ${DOMAINS.map(d=>`<button class="sf ${S.studyFilter===d.id?'active':''}" onclick="setFilter('${d.id}')">${d.icon} ${d.label}</button>`).join('')}
  </div>
  <div class="study-card">
    <div class="sc-speaker" style="color:var(--accent-l)">🐾 ${esc(S.name)} · ${typeLabel}</div>
    <div class="sc-q">${esc(nat)}</div>
    ${wiki}
    ${S.studyRevealed?`<div class="sc-answer">${esc(card.a)}</div>`:''}
    ${S.studyAltLoading?`<div class="sc-wiki"><div class="sc-wiki-lbl">🧠 Reformulation IA...</div></div>`:''}
    ${S.studyAltQuestion?`<div class="sc-wiki"><div class="sc-wiki-lbl">❓ Variante de question</div>${esc(S.studyAltQuestion)}</div>`:''}
  </div>
  <div class="study-btns">
    ${S.studyRevealed
      ?`<div class="study-btns-row"><button class="btn-wrong" onclick="studyWrong()">✕ Raté</button><button class="btn-correct" onclick="studyCorrect()">✓ Réussi</button></div>
        <button class="btn-ghost" onclick="generateAltStudyQuestion()">🧠 Reformuler la question</button>
        <button class="btn-ghost" onclick="exportStudyCardToAnki()">🗂️ Envoyer vers Anki</button>`
      :`<button class="btn-ghost" onclick="revealAnswer()">Révéler la réponse</button>`
    }
  </div>`;
}

// ═══════════════════════════════════════════════════════
//  CHALLENGES
// ═══════════════════════════════════════════════════════
function startCh(id){const ch=CHALLENGES.find(c=>c.id===id);if(!ch)return;S.activeCh=id;S.chPhase='active';S.chAnswer='';S.chFeedback=null;renderPage('ch');}
function submitCh(){
  const ch=CHALLENGES.find(c=>c.id===S.activeCh);if(!ch)return;
  const ans=S.chAnswer.toLowerCase();
  const found=ch.kw.filter(k=>ans.includes(k));
  const isGood=found.length>=ch.min,isOk=found.length>=Math.ceil(ch.min/2)&&!isGood;
  const xpe=isGood?ch.xp:isOk?Math.round(ch.xp*.5):Math.round(ch.xp*.2);
  S.chFeedback={found,miss:ch.kw.filter(k=>!found.includes(k)),score:Math.min(100,Math.round((found.length/ch.min)*100)),isGood,isOk,xpe,ch};
  S.chPhase='feedback';
  if(isGood){S.mood=clamp(S.mood+20);S.totalCorrect++;gainXP(xpe);tryDrop();}
  else if(isOk){S.mood=clamp(S.mood+8);gainXP(xpe);}
  else{S.mood=clamp(S.mood-5);gainXP(xpe);}
  S.energy=clamp(S.energy-10);
  if(!S.doneCh.includes(S.activeCh))S.doneCh.push(S.activeCh);
  save();renderPage('ch');if(S.pendingDrop)setTimeout(showDropModal,500);
}
function backToChHub(){S.chPhase='hub';S.activeCh=null;S.chFeedback=null;renderPage('ch');}
function renderCh(){
  if(S.chPhase==='active'){
    const ch=CHALLENGES.find(c=>c.id===S.activeCh);
    const mc=ch.mode==='debate'?'var(--red)':ch.mode==='problem'?'var(--blue)':'var(--green)';
    const ml=ch.mode==='debate'?'⚔️ Débat':ch.mode==='problem'?'🧩 Scénario':'🎓 Mentorat';
    return`
    <div style="padding:14px 16px;display:flex;align-items:center;gap:10px;">
      <button class="arena-back" onclick="backToChHub()">← Retour</button>
      <div><div style="font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${mc}">${ml}</div><div style="font-size:14px;font-weight:700;">${esc(ch.title)}</div></div>
    </div>
    <div class="arena-speech"><div class="arena-sp-lbl" style="color:${mc}">✦ ${esc(S.name)} dit :</div>${esc(ch.stance)}</div>
    <div style="padding:0 16px 10px;">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:7px;">Ta réponse</div>
      <textarea class="arena-textarea" placeholder="Développe ton argument... donne des exemples, sois précis·e !" oninput="S.chAnswer=this.value">${esc(S.chAnswer)}</textarea>
    </div>
    <div style="padding:0 16px 16px;display:flex;flex-direction:column;gap:8px;">
      <button class="btn-primary" onclick="submitCh()" ${S.chAnswer.trim().length<15?'disabled':''}>Soumettre ma réponse</button>
      <button class="btn-ghost" onclick="backToChHub()">Abandonner</button>
    </div>`;
  }
  if(S.chPhase==='feedback'){
    const fb=S.chFeedback,cls=fb.isGood?'good':fb.isOk?'ok':'bad';
    const emoji=fb.isGood?'🏆':fb.isOk?'👍':'📚',sc=fb.isGood?'var(--green)':fb.isOk?'var(--gold)':'var(--red)';
    return`
    <div class="s-header">Résultat</div>
    <div class="fb-card ${cls}" style="margin:0 16px 10px;">
      <div style="font-size:24px;font-weight:800;color:${sc};margin-bottom:4px;">${emoji} ${fb.score}%</div>
      <div style="font-size:14px;font-weight:600;margin-bottom:6px;">${esc(fb.isGood?fb.ch.gfb:fb.ch.bfb)}</div>
      <div style="font-size:12px;color:var(--text2);">${fb.found.length?'Concepts clés reconnus :':'Aucun concept clé détecté.'}
        <div class="kw-chips">${fb.found.map(k=>`<span class="kw-f">✓ ${k}</span>`).join('')}${fb.miss.slice(0,5).map(k=>`<span class="kw-m">○ ${k}</span>`).join('')}</div>
      </div>
      <div style="font-size:12px;color:var(--gold);font-weight:700;margin-top:9px;">+${fb.xpe} XP gagnés</div>
    </div>
    <div class="card" style="margin:0 16px 10px;font-size:12px;color:var(--text2);line-height:1.6;">
      <div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.1em;margin-bottom:5px;">Ta réponse</div>${esc(S.chAnswer)}
    </div>
    <div style="padding:0 16px 16px;"><button class="btn-primary" onclick="backToChHub()">← Retour aux défis</button></div>`;
  }
  // Hub
  const byMode=[{mode:'debate',label:'⚔️ Débats',c:'var(--red)'},{mode:'problem',label:'🧩 Scénarios',c:'var(--blue)'},{mode:'mentor',label:'🎓 Mentorat inversé',c:'var(--green)'}];
  const availXP=CHALLENGES.filter(c=>!S.doneCh.includes(c.id)).reduce((s,c)=>s+c.xp,0);
  let html=`<div style="padding:14px 16px 10px;display:flex;justify-content:space-between;align-items:center;">
    <div><div style="font-size:10px;color:var(--text3);margin-bottom:1px;">Complétés</div><div style="font-size:22px;font-weight:800;">${S.doneCh.length}<span style="font-size:13px;color:var(--text3);font-weight:400;"> / ${CHALLENGES.length}</span></div></div>
    <div style="text-align:right;"><div style="font-size:10px;color:var(--text3);margin-bottom:1px;">XP disponible</div><div style="font-size:20px;font-weight:800;color:var(--gold);">${availXP}</div></div>
  </div>`;
  for(const g of byMode){
    html+=`<div class="s-header" style="color:${g.c}">${g.label}</div><div style="padding:0 16px;display:flex;flex-direction:column;gap:6px;margin-bottom:6px;">`;
    for(const ch of CHALLENGES.filter(c=>c.mode===g.mode)){
      const done=S.doneCh.includes(ch.id);
      const dc=ch.diff==='easy'?'var(--green)':ch.diff==='medium'?'var(--gold)':'var(--red)';
      const dl=ch.diff==='easy'?'Facile':ch.diff==='medium'?'Moyen':'Difficile';
      html+=`<div class="ch-row ${done?'done':''}" onclick="startCh('${ch.id}')">
        <div class="ch-icon">${ch.icon}</div>
        <div class="ch-body"><div class="ch-title">${done?'✓ ':''} ${esc(ch.title)}</div><div class="ch-sub"><span style="color:${dc}">${dl}</span></div></div>
        <div class="ch-right">${done?'<div style="color:var(--green);font-size:18px;">✓</div>':`<div class="ch-xp">${ch.xp} XP</div>`}</div>
      </div>`;
    }
    html+=`</div>`;
  }
  return html;
}

// ═══════════════════════════════════════════════════════
//  LEADERBOARD + LEAGUES
// ═══════════════════════════════════════════════════════
let LB_TAB='mine';
let LB_PLAYERS_CACHE=[];
function setLbTab(t){LB_TAB=t;renderPage('lb');}
function showPlayerModal(id){
  const p=LB_PLAYERS_CACHE.find(x=>x.id===id);
  if(!p)return;
  const doms=(p.domains||[]).map(id=>DOMAINS.find(x=>x.id===id)).filter(Boolean);
  const league=getLeague(p.level);
  const initials=(p.user||'?').slice(0,2).toUpperCase();
  $('modal-root').innerHTML=`
  <div class="modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="player-modal-header">
        <div style="width:60px;height:60px;border-radius:50%;background:${p.avatar};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:white;margin:0 auto 10px;">${initials}</div>
        <div class="pml-name">${esc(p.user)}</div>
        <div class="pml-creature">🐾 ${esc(p.creature)} · ${league.icon} ${league.name}</div>
        <div style="display:flex;gap:5px;justify-content:center;flex-wrap:wrap;margin-top:8px;">${doms.map(d=>`<span class="pill" style="color:${d.color};border-color:${d.color}44;background:${d.color}0d">${d.icon} ${d.label}</span>`).join('')}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;">
        ${[['✦ Niv.',p.level],['🔥 Streak',p.streak+'j'],['⚔️ Défis',p.ch]].map(([l,v])=>`<div class="card" style="text-align:center;padding:11px;"><div style="font-size:18px;font-weight:800;">${v}</div><div style="font-size:10px;color:var(--text2);margin-top:2px;">${l}</div></div>`).join('')}
      </div>
      ${!p.isMe?`<button class="btn-primary" disabled style="opacity:.4;margin-bottom:8px;">⚔️ Défier ${esc(p.creature)} (bientôt)</button>`:''}
      <button class="btn-ghost" onclick="closeModal()">Fermer</button>
    </div>
  </div>`;
}
function renderLB(){
  const me={id:0,user:S.username,creature:S.name,level:S.level,streak:S.streak,ch:S.doneCh.length,xp:myScore(),domains:S.personality,avatar:'#7c5cfc',isMe:true};
  const myLeague=getLeague(S.level);

  // Filter by selected tab
  let list;
  if(LB_TAB==='mine'){
    list=blendWithPeerPlayers(localLeaguePlayers(myLeague,me),myLeague);
  } else {
    const lg=LEAGUES.find(l=>l.id===LB_TAB)||myLeague;
    const shadowMe={...me,level:Math.max(lg.minLvl,Math.min(lg.maxLvl===999?lg.minLvl+8:lg.maxLvl,me.level)),isMe:lg.id===myLeague.id};
    list=blendWithPeerPlayers(localLeaguePlayers(lg,shadowMe),lg);
  }
  LB_PLAYERS_CACHE=list;
  const myRank=list.findIndex(p=>p.isMe)+1;

  // Week reset timer
  const msLeft=7*24*3600*1000-(Date.now()-S.weekStart);
  const dLeft=Math.floor(msLeft/(24*3600*1000));
  const hLeft=Math.floor((msLeft%(24*3600*1000))/(3600*1000));

  const leagueTabsHTML=`<div class="league-tabs">
    <button class="lt ${LB_TAB==='mine'?'active':''}" onclick="setLbTab('mine')"><img src="${leagueImage(myLeague.id)}" alt="${myLeague.name}" style="width:14px;height:14px;vertical-align:-2px;margin-right:5px;"/>Ma ligue</button>
    ${LEAGUES.map(l=>`<button class="lt ${LB_TAB===l.id?'active':''}" onclick="setLbTab('${l.id}')"><img src="${leagueImage(l.id)}" alt="${l.name}" style="width:14px;height:14px;vertical-align:-2px;margin-right:5px;"/>${l.name}</button>`).join('')}
  </div>`;

  const currentLg=LB_TAB==='mine'?myLeague:(LEAGUES.find(l=>l.id===LB_TAB)||myLeague);
  const lbRows=list.map((p,i)=>{
    const rank=i+1;
    const rc=rank===1?'g1':rank===2?'g2':rank===3?'g3':'';
    const ri=rank===1?'🥇':rank===2?'🥈':rank===3?'🥉':rank;
    const initials=(p.user||'?').slice(0,2).toUpperCase();
    const doms=(p.domains||[]).map(id=>DOMAINS.find(x=>x.id===id)).filter(Boolean);
    return`<div class="lb-row ${p.isMe?'me':''}" onclick="showPlayerModal(${p.id})" ${p.isMe?'style="border-color:rgba(124,92,252,.3);background:rgba(124,92,252,.04);"':''}>
      <div class="lb-rank ${rc}">${ri}</div>
      <div class="lb-av" style="background:${p.avatar}22;border:1px solid ${p.avatar}44;color:${p.avatar};">${initials}</div>
      <div><div class="lb-name">${esc(p.user)}${p.isMe?' 👈':''}</div><div class="lb-creature">${esc(p.creature)} · ${doms.map(d=>d.icon).join('')}</div></div>
      <div class="lb-right"><div class="lb-xp">${p.xp}</div><div class="lb-ch">⚔️ ${p.ch}</div></div>
    </div>`;
  }).join('');

  return`
  ${leagueTabsHTML}
  <div class="league-info">
    <div class="li-row">
      <div class="li-title"><img src="${leagueImage(currentLg.id)}" alt="${currentLg.name}" style="width:18px;height:18px;vertical-align:-3px;margin-right:6px;"/>${currentLg.name}</div>
      <div class="li-reset">🔄 Reset dans ${dLeft}j ${hLeft}h</div>
    </div>
    <div class="li-desc">${currentLg.desc} · Niv. ${currentLg.minLvl}–${currentLg.maxLvl===999?'∞':currentLg.maxLvl}</div>
    ${myRank>0?`<div style="font-size:12px;color:var(--text2);">Ton rang : <strong style="color:var(--accent-l);">#${myRank}</strong></div>`:'<div style="font-size:12px;color:var(--text3);">Tu n\'es pas encore dans cette ligue.</div>'}
  </div>
  <div class="week-timer">🏆 Classement hebdomadaire — reset dans ${dLeft}j ${hLeft}h</div>
  <div class="lb-list">${lbRows||'<div style="text-align:center;padding:24px;color:var(--text3);">Aucun joueur dans cette ligue.</div>'}</div>`;
}

// ═══════════════════════════════════════════════════════
//  PERSONA / PROFILE
// ═══════════════════════════════════════════════════════
function renderPersona(){
  const doms=S.personality.map(id=>DOMAINS.find(x=>x.id===id)).filter(Boolean);
  const traits=S.personality.map(id=>TRAITS[id]).filter(Boolean);
  const warCats=[{k:'hat',l:'🎩 Couvre-chefs'},{k:'aura',l:'✨ Auras'},{k:'acc',l:'🎀 Accessoires'},{k:'comp',l:'🐾 Compagnons'}];
  let wd='';
  for(const cat of warCats){
    wd+=`<div class="s-header">${cat.l}</div><div class="wd-grid" style="margin-bottom:4px;">`;
    for(const it of ALL_ITEMS.filter(i=>i.cat===cat.k)){
      const owned=S.inventory.includes(it.id),eq=S.equipped[it.cat]===it.id,rar=RARITY[it.rarity];
      const lockedPremium=it.premium&&!isPremiumOwned(it);
      wd+=`<div class="wd-item ${eq?'eq':''} ${!owned?'lk':''}" ${owned?`onclick="equip('${it.id}')"`:''}
        style="${eq?'box-shadow:0 0 10px rgba(124,92,252,.25);':''}">
        ${eq?'<div class="wd-eq">✓</div>':''}
        <div class="wd-icon">${it.icon}</div>
        <div class="wd-name">${it.name}</div>
        <span class="pill ${rar.cls}" style="font-size:9px;padding:1px 7px;">${rar.l}</span>
        ${it.premium?`<div style="font-size:10px;color:var(--gold);font-weight:700;margin-top:3px;">💳 ${priceLabel(it.priceCents||0)}</div>`:''}
        ${!owned?`<div class="wd-lock"><span style="font-size:16px;">🔒</span>${lockedPremium?`Premium`:unlockLabel(it)}</div>`:''}
      </div>`;
    }
    wd+=`</div>`;
  }
  const jEntries=S.journalEntries.length
    ?S.journalEntries.map(e=>{const hue=Math.round((e.mood/100)*140+10),mc=`hsl(${hue},65%,58%)`;return`<div class="j-card"><div class="j-date">${fmt(e.date)}</div><div class="j-title">Journal de ${esc(S.name)}</div><div class="j-body">${esc(e.text)}</div><div class="j-mood-row"><span style="font-size:10px;color:var(--text3);">Humeur</span><div class="j-mood-bar"><div class="j-mood-fill" style="width:${e.mood}%;background:${mc}"></div></div><span style="font-size:10px;color:${mc};font-weight:600;">${e.mood>70?'😊':e.mood>40?'😐':'😔'}</span></div></div>`;}).join('')
    :`<div class="card" style="margin:0 16px;text-align:center;padding:22px;"><div style="font-size:30px;margin-bottom:8px;">📖</div><div style="font-size:12px;color:var(--text2);">${esc(S.name)} écrira automatiquement dans son journal aujourd'hui.</div></div>`;

  return`
  <div class="profile-hero">
    ${creatureSVG(100)}
    <div class="profile-name">${esc(S.name)}</div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:4px;">${esc(S.username)}</div>
    <div class="profile-pills">${doms.map(d=>`<span class="pill" style="color:${d.color};border-color:${d.color}44;background:${d.color}0d">${d.icon} ${d.label}</span>`).join('')}</div>
    ${traits.length?`<div style="font-size:12px;color:var(--text2);text-align:center;max-width:260px;line-height:1.5;">${traits.map(t=>t.desc).join(' · ')}</div>`:''}
  </div>
  <div class="stats-grid">
    ${[['✦','Niveau',S.level],['🔥','Streak',S.streak+'j'],['🧠','Correctes',S.totalCorrect],['⚔️','Défis',S.doneCh.length],['🎒','Items',S.inventory.length],['💬','Messages',S.chat.length]].map(([ic,l,v])=>`<div class="stat-cell"><div class="sc-val">${ic} ${v}</div><div class="sc-lbl">${l}</div></div>`).join('')}
  </div>
  <div class="s-header">💸 Boutique Premium</div>
  <div class="card" style="margin:0 16px 10px;">
    <div style="font-size:11px;color:var(--text3);margin-bottom:8px;">Revenu simulé total: <strong style="color:var(--gold);">${priceLabel(S.revenueCents||0)}</strong></div>
    ${(ALL_ITEMS.filter(it=>it.premium&&!S.paidItems.includes(it.id)).slice(0,5).map(it=>`
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);">
        <div style="font-size:12px;">${it.icon} ${it.name} <span style="color:var(--gold);font-weight:700;">${priceLabel(it.priceCents||0)}</span></div>
        <button class="btn-ghost" style="width:auto;padding:7px 10px;" onclick="buyPremiumItem('${it.id}')">Acheter</button>
      </div>
    `).join(''))||'<div style="font-size:12px;color:var(--text2);">Tous les items premium de base sont achetés 🎉</div>'}
  </div>
  <div class="s-header">🧠 Mémoire compagnon</div>
  <div class="card" style="margin:0 16px 10px;font-size:12px;color:var(--text2);line-height:1.6;">
    ${(S.memories&&S.memories.length)
      ?`<ul style="padding-left:16px;">${S.memories.slice(0,5).map(m=>`<li>${esc(m)}</li>`).join('')}</ul>`
      :`<div>Je n'ai pas encore assez d'éléments sur toi. Dis-moi ce que tu aimes, tes objectifs, ou ce que tu ressens.</div>`
    }
  </div>
  <div class="s-header">📖 Journal intime</div>
  ${jEntries}
  ${wd}
  <div style="height:20px;"></div>`;
}

// ═══════════════════════════════════════════════════════
//  ONBOARDING
// ═══════════════════════════════════════════════════════
let _selDoms=[];
function renderObGrid(){
  const grid=$('ob-grid');if(!grid)return;
  grid.innerHTML=DOMAINS.map(d=>`<button class="domain-btn ${_selDoms.includes(d.id)?'sel':''}" onclick="obToggle('${d.id}')"><span class="di">${d.icon}</span>${d.label}</button>`).join('');
  $('ob-count').textContent=`${_selDoms.length}/3 sélectionné${_selDoms.length!==1?'s':''}`;
  $('ob-hatch-btn').disabled=_selDoms.length===0;
}
function obToggle(id){
  if(_selDoms.includes(id))_selDoms=_selDoms.filter(d=>d!==id);
  else if(_selDoms.length<3)_selDoms.push(id);
  renderObGrid();
}
function hatch(){
  if(!_selDoms.length)return;
  S.personality=[..._selDoms];S.name=genName();
  _selDoms.forEach(d=>{S.domainActivity[d]=(S.domainActivity[d]||0)+3;});
  $('onboarding').style.display='none';
  $('hatch-overlay').style.display='flex';
  setTimeout(()=>{
    S.hatched=true;S.streak=1;S.lastSeen=Date.now();
    addMsg('creature',`Bonjour ! Je suis ${S.name}. Je suis tellement content·e de te rencontrer ! On va apprendre ensemble, débattre, explorer... C'est le début d'une belle aventure. Par quoi on commence ?`);
    save();
    $('hatch-overlay').style.display='none';
    $('shell').style.display='flex';
    updateCreatureBar();
    // Show all pages, set initial state
    PAGE_ORDER.forEach(p=>{
      const el=$('page-'+p);
      if(el)el.style.display=p==='chat'?'flex':'block';
    });
    goTo('chat');
    scheduleJournal();
    toast(`✨ ${S.name} est né·e !`);
  },2600);
}

// ═══════════════════════════════════════════════════════
//  BOOT
// ═══════════════════════════════════════════════════════
function boot(){
  const hasSession=restoreSession();
  if(hasSession)load();
  // Hide all pages initially
  PAGE_ORDER.forEach(p=>{
    const el=$('page-'+p);
    if(el)el.style.display='none';
  });

  setTimeout(()=>{
    // Fade out loading
    $('loading').classList.add('out');
    setTimeout(()=>{ $('loading').style.display='none'; },500);

    if(!hasSession){
      showAuthScreen();
      return;
    }

    launchSessionUI();
  },2000);
}

boot();
