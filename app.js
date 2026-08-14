// Juan Tamariz's Mnemonica stack, positions 1–52.
// Four sectors train positions 1–13, 14–26, 27–39, and 40–52.
const MNEMONICA_STACK = [
  ['4','clubs'],['2','hearts'],['7','diamonds'],['3','clubs'],['4','hearts'],['6','diamonds'],['A','spades'],['5','hearts'],['9','spades'],['2','spades'],['Q','hearts'],['3','diamonds'],['Q','clubs'],
  ['8','hearts'],['6','spades'],['5','spades'],['9','hearts'],['K','clubs'],['2','diamonds'],['J','hearts'],['3','spades'],['8','spades'],['6','hearts'],['10','clubs'],['5','diamonds'],['K','diamonds'],
  ['2','clubs'],['3','hearts'],['8','diamonds'],['5','clubs'],['K','spades'],['J','diamonds'],['8','clubs'],['10','spades'],['K','hearts'],['J','clubs'],['7','spades'],['10','hearts'],['A','diamonds'],
  ['4','spades'],['7','hearts'],['4','diamonds'],['A','clubs'],['9','clubs'],['J','spades'],['Q','diamonds'],['7','clubs'],['Q','spades'],['10','diamonds'],['6','clubs'],['A','hearts'],['9','diamonds']
];
const REDFORD_STACK = [
  ['Q','hearts'],['2','spades'],['5','diamonds'],['8','clubs'],['J','hearts'],['K','spades'],['10','hearts'],['7','clubs'],['4','diamonds'],['A','spades'],['8','hearts'],['5','clubs'],['2','diamonds'],
  ['Q','spades'],['9','hearts'],['6','clubs'],['3','diamonds'],['10','spades'],['7','hearts'],['4','clubs'],['A','diamonds'],['J','spades'],['9','spades'],['6','hearts'],['3','clubs'],['K','diamonds'],
  ['Q','diamonds'],['10','diamonds'],['7','spades'],['4','hearts'],['A','clubs'],['J','diamonds'],['8','spades'],['5','hearts'],['2','clubs'],['2','hearts'],['Q','clubs'],['9','diamonds'],['6','spades'],
  ['3','hearts'],['K','clubs'],['4','spades'],['A','hearts'],['J','clubs'],['8','diamonds'],['5','spades'],['3','spades'],['K','hearts'],['10','clubs'],['7','diamonds'],['6','diamonds'],['9','clubs']
];
const ARONSON_STACK = [
  ['J','spades'],['K','clubs'],['5','clubs'],['2','hearts'],['9','spades'],['A','spades'],['3','hearts'],['6','clubs'],['8','diamonds'],['A','clubs'],['10','spades'],['5','hearts'],['2','diamonds'],
  ['K','diamonds'],['7','diamonds'],['8','clubs'],['3','spades'],['A','diamonds'],['7','spades'],['5','spades'],['Q','diamonds'],['A','hearts'],['8','spades'],['3','diamonds'],['7','hearts'],['Q','hearts'],
  ['5','diamonds'],['7','clubs'],['4','hearts'],['K','hearts'],['4','diamonds'],['10','diamonds'],['J','clubs'],['J','hearts'],['10','clubs'],['J','diamonds'],['4','spades'],['10','hearts'],['6','hearts'],
  ['3','clubs'],['2','spades'],['9','hearts'],['K','spades'],['6','spades'],['4','clubs'],['8','hearts'],['9','clubs'],['Q','spades'],['6','diamonds'],['Q','clubs'],['2','clubs'],['9','diamonds']
];
const STACKS = {
  mnemonica:{name:'MNEMONICA',cards:MNEMONICA_STACK},
  redford:{name:'REDFORD',cards:REDFORD_STACK},
  aronson:{name:'ARONSON',cards:ARONSON_STACK}
};
let MEMORY_STACK = MNEMONICA_STACK;
const SUITS = {clubs:'♣', hearts:'♥', spades:'♠', diamonds:'♦'};
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
// Visual order is top-to-bottom. Memory positions still build bottom-to-top.
const FORTRESS_ROWS = [[11,12],[8,9,10],[4,5,6,7],[0,1,2,3]];
const SECTOR_SIZE = 13;
const SECTOR_COUNT = 4;

const state = {stackKey:null,sector:0,phase:1,built:0,score:0,combo:1,selectedRank:null,health:Array(13).fill(0),paused:false,laserTimer:null,bombTimer:null,bomb:null,phaseTwoHits:0,recallQueue:[],reviewQueue:[],mastered:new Set(),misses:0};
const $ = id => document.getElementById(id);
const sectorStart = () => state.sector * SECTOR_SIZE;
const globalPosition = localIndex => sectorStart() + localIndex + 1;
const sectorCard = localIndex => MEMORY_STACK[sectorStart() + localIndex];

function syncViewportHeight(){const height=window.visualViewport?.height||window.innerHeight;document.documentElement.style.setProperty('--app-height',`${Math.round(height)}px`)}
syncViewportHeight();window.addEventListener('resize',syncViewportHeight);window.visualViewport?.addEventListener('resize',syncViewportHeight);

function cardMarkup(card) {
  const [rank,suit]=card, red=suit==='hearts'||suit==='diamonds';
  return `<div class="card-face ${red?'red':''}"><span>${rank}<br>${SUITS[suit]}</span><em>${SUITS[suit]}</em><div class="health"><i style="width:100%"></i></div></div>`;
}

function renderFortress() {
  const root=$('fortress'); root.innerHTML='';
  FORTRESS_ROWS.forEach(positions=>{const row=document.createElement('div');row.className='fortress-row';
    positions.forEach(pos=>{const el=document.createElement('div');el.className='fortress-card';el.dataset.position=String(globalPosition(pos)).padStart(2,'0');el.dataset.index=pos;
      if(state.health[pos]>0){el.classList.add('built');el.innerHTML=cardMarkup(sectorCard(pos));el.querySelector('.health i').style.width=`${state.health[pos]}%`;if(state.health[pos]<55)el.classList.add('damaged');}
      if(pos===state.built && state.phase===1)el.classList.add('next');
      el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();placeCard(e.dataTransfer.getData('rank'));});row.appendChild(el)});root.appendChild(row)});
}

function renderControls(){
  $('rankRow').innerHTML=RANKS.map(rank=>`<button class="rank-button ${rank===state.selectedRank?'selected':''}" data-rank="${rank}">${rank}</button>`).join('');
  document.querySelectorAll('.rank-button').forEach(b=>b.onclick=()=>{if(state.paused)return;state.selectedRank=b.dataset.rank;renderControls();sound('select')});
  $('suitRow').innerHTML=Object.entries(SUITS).map(([name,symbol])=>`<button class="suit-button ${(name==='hearts'||name==='diamonds')?'red':''}" data-suit="${name}" ${state.selectedRank?'':'disabled'}><span>${symbol}</span><small>${name.toUpperCase()}</small></button>`).join('');
  document.querySelectorAll('.suit-button').forEach(b=>b.onclick=()=>placeCard(b.dataset.suit));
  $('valueStep').classList.toggle('active',!state.selectedRank);$('suitStep').classList.toggle('active',!!state.selectedRank);$('selectionPreview').textContent=state.selectedRank?`${state.selectedRank} OF …`:'SELECT VALUE';
}

function placeCard(suit){if(state.paused||state.phase!==1||state.built>=13||!state.selectedRank)return;const expected=sectorCard(state.built),chosenRank=state.selectedRank;state.selectedRank=null;
  if(chosenRank===expected[0]&&suit===expected[1]){state.health[state.built]=100;state.built++;state.score+=100*state.combo;state.combo=Math.min(9,state.combo+1);flashMessage(`${chosenRank} OF ${suit.toUpperCase()} · SECURED`,true);updateUI();renderFortress();renderControls();sound('build');
    if(state.built===13)setTimeout(showPhaseComplete,350);
  }else{state.combo=1;state.score=Math.max(0,state.score-25);flashMessage('MEMORY MISMATCH',false);updateUI();renderControls();sound('error')}
}

function fireLaser(){if(state.paused||state.phase!==1||state.built===0)return;
  // Attack the newest wall segment so a destroyed card becomes the next card to rebuild.
  const target=state.built-1,card=document.querySelector(`[data-index="${target}"]`);if(!card)return;
  const field=$('battlefield').getBoundingClientRect(), ship=$('ship').getBoundingClientRect(), rect=card.getBoundingClientRect();const laser=document.createElement('i');laser.className='laser';laser.style.left=`${ship.left-field.left+ship.width/2}px`;laser.style.top=`${ship.bottom-field.top-8}px`;$('laserLayer').appendChild(laser);
  sound('laser');
  requestAnimationFrame(()=>{laser.style.left=`${rect.left-field.left+rect.width/2}px`;laser.style.top=`${rect.top-field.top+rect.height/2}px`});
  setTimeout(()=>{laser.remove();damageCard(target,15);const impact=document.createElement('i');impact.className='impact';impact.style.left=`${rect.left-field.left+rect.width/2-14}px`;impact.style.top=`${rect.top-field.top+rect.height/2-14}px`;$('laserLayer').appendChild(impact);setTimeout(()=>impact.remove(),400)},430)
}

function damageCard(index,amount){if(state.phase!==1)return;state.health[index]=Math.max(0,state.health[index]-amount);sound('impact');const destroyed=state.health[index]===0;if(destroyed){state.built=Math.max(0,state.built-1);state.combo=1;flashMessage(`POSITION ${String(globalPosition(index)).padStart(2,'0')} BREACHED`,false);sound('breach')}renderFortress();updateUI()}

function showPhaseComplete(){clearInterval(state.laserTimer);$('modal').classList.remove('hidden');$('modalEyebrow').textContent=`SECTOR ${String(state.sector+1).padStart(2,'0')} · FORTRESS COMPLETE`;$('modalTitle').textContent='FORTRESS ONLINE';$('modalText').textContent=`Positions ${globalPosition(0)}–${globalPosition(12)} are secure. Now recall all 13 cards.`;$('modalButton').textContent='BEGIN RECALL';$('modalButton').onclick=startPhaseTwo}
function shuffle(values){for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}return values}
function startPhaseTwo(){$('modal').classList.add('hidden');state.phase=2;state.phaseTwoHits=0;state.bomb=null;state.recallQueue=shuffle(Array.from({length:13},(_,i)=>i));state.reviewQueue=[];state.mastered=new Set();state.misses=0;$('battleMessage').textContent='IDENTIFY THE FALLING CARD';$('buildControls').classList.add('hidden');$('phaseTwoControls').classList.remove('hidden');$('positionGrid').innerHTML=Array.from({length:13},(_,i)=>`<button class="position-button" data-position="${i}">${String(globalPosition(i)).padStart(2,'0')}</button>`).join('');document.querySelectorAll('.position-button').forEach(b=>b.onclick=()=>intercept(Number(b.dataset.position)));updateUI();spawnBomb();state.bombTimer=setInterval(tickBomb,50)}
function nextRecallCard(){if(!state.recallQueue.length&&state.reviewQueue.length){state.recallQueue=shuffle([...new Set(state.reviewQueue)].filter(i=>!state.mastered.has(i)));state.reviewQueue=[];flashMessage('REVIEW ROUND',true)}while(state.recallQueue.length&&state.mastered.has(state.recallQueue[0]))state.recallQueue.shift();return state.recallQueue.shift()}
function spawnBomb(){if(state.paused||state.bomb)return;if(state.mastered.size===13){showVictory();return}const index=nextRecallCard();if(index===undefined)return;const el=document.createElement('div'),card=sectorCard(index);el.className='bomb';el.innerHTML=`<span class="bomb-position">?</span><span class="card-symbol">${card[0]}${SUITS[card[1]]}</span><small>IDENTIFY POSITION</small>`;el.style.left=`${8+Math.random()*72}%`;$('bombLayer').appendChild(el);state.bomb={index,el,y:-74,missed:false};updateUI()}
function markMissed(index){if(!state.mastered.has(index)&&!state.reviewQueue.includes(index))state.reviewQueue.push(index);state.misses++;state.combo=1}
function tickBomb(){if(state.paused)return;if(!state.bomb){spawnBomb();return}state.bomb.y+=Math.max(1.05,$('battlefield').clientHeight/15000*50);state.bomb.el.style.top=`${state.bomb.y}px`;const floor=$('battlefield').clientHeight-state.bomb.el.offsetHeight-10;if(state.bomb.y>floor){markMissed(state.bomb.index);state.bomb.el.remove();state.bomb=null;flashMessage('BREACH · ADDED TO REVIEW',false);sound('breach');updateUI();setTimeout(spawnBomb,450)}}
function intercept(position){if(state.paused||!state.bomb)return;if(position===state.bomb.index){const masteredIndex=state.bomb.index;state.score+=200*state.combo;state.combo=Math.min(9,state.combo+1);state.mastered.add(masteredIndex);state.reviewQueue=state.reviewQueue.filter(i=>i!==masteredIndex);state.phaseTwoHits=state.mastered.size;state.bomb.el.classList.add('intercepted');flashMessage('MEMORY LOCK · +200',true);sound('intercept');setTimeout(()=>{state.bomb?.el.remove();state.bomb=null;if(state.mastered.size===13)showVictory();else spawnBomb()},220)}else{if(!state.bomb.missed){state.bomb.missed=true;markMissed(state.bomb.index)}state.score=Math.max(0,state.score-50);flashMessage('WRONG · CARD QUEUED FOR REVIEW',false);sound('error')}updateUI()}
function showVictory(){clearInterval(state.bombTimer);state.bomb?.el.remove();state.bomb=null;$('modal').classList.remove('hidden');const finalSector=state.sector===SECTOR_COUNT-1;$('modalEyebrow').textContent=finalSector?'FULL DECK MASTERED':`SECTOR ${String(state.sector+1).padStart(2,'0')} CLEARED`;$('modalTitle').textContent=finalSector?'MNEMONICA COMPLETE':'SECTOR DEFENDED';$('modalText').textContent=`Positions ${globalPosition(0)}–${globalPosition(12)} recalled. ${state.misses?`${state.misses} miss${state.misses===1?'':'es'} reviewed. `:'Perfect run. '}Score: ${state.score}.`;$('modalButton').textContent=finalSector?'PLAY FULL DECK AGAIN':`CONTINUE TO ${globalPosition(12)+1}–${globalPosition(12)+13}`;$('modalButton').onclick=finalSector?restart:startNextSector;sound('victory')}
function startNextSector(){state.sector++;state.phase=1;state.built=0;state.health=Array(13).fill(0);state.selectedRank=null;state.combo=1;state.bomb=null;state.phaseTwoHits=0;state.mastered=new Set();state.misses=0;$('modal').classList.add('hidden');$('phaseTwoControls').classList.add('hidden');$('buildControls').classList.remove('hidden');renderFortress();renderControls();updateUI();flashMessage(`SECTOR ${state.sector+1} · BUILD POSITION ${globalPosition(0)}`,true);state.laserTimer=setInterval(fireLaser,2600)}
function flashMessage(text,good){const el=$('battleMessage');el.textContent=text;el.style.color=good?'var(--cyan)':'var(--danger)';clearTimeout(el._timer);el._timer=setTimeout(()=>{el.textContent=state.phase===1?`FORTIFY POSITION ${String(globalPosition(state.built)).padStart(2,'0')}`:'IDENTIFY THE FALLING CARD';el.style.color='var(--cyan)'},900)}
function updateUI(){const sectorNumber=String(state.sector+1).padStart(2,'0'),stackName=state.stackKey?STACKS[state.stackKey].name:'SELECT STACK';$('sectorLabel').textContent=`${stackName} // SECTOR ${sectorNumber} // ${String(globalPosition(0)).padStart(2,'0')}–${String(globalPosition(12)).padStart(2,'0')}`;$('phaseLabel').textContent=`${sectorNumber} · ${state.phase===1?'BUILD':'RECALL'}`;$('scoreLabel').textContent=String(state.score).padStart(4,'0');$('comboLabel').textContent=`×${state.combo}`;const shield=state.built?Math.round(state.health.slice(0,state.built).reduce((a,b)=>a+b,0)/state.built):100;$('statLabel').textContent=state.phase===1?'SHIELD':'MISSES';$('statValue').textContent=state.phase===1?`${shield}%`:String(state.misses);$('progressText').textContent=state.phase===1?`${state.built} / 13 BUILT`:`${state.phaseTwoHits} / 13 MASTERED`;$('progressBar').style.width=`${state.phase===1?state.built/13*100:state.phaseTwoHits/13*100}%`;if(state.phase===2&&$('recallStatus'))$('recallStatus').textContent=`${13-state.mastered.size} REMAIN`;
  if(state.built<13){$('targetPosition').textContent=String(globalPosition(state.built)).padStart(2,'0');const c=sectorCard(state.built);$('targetCard').textContent=c?`${c[0]}${SUITS[c[1]]}`:'✓'}$('pauseButton').textContent=state.paused?'▶ RESUME':'Ⅱ PAUSE'}
function restart(){location.reload()}
function tone(freq,duration,volume=.045,type='sine',delay=0,endFreq=freq){if($('soundButton').dataset.muted==='true')return;try{const ctx=tone.ctx||(tone.ctx=new AudioContext()),start=ctx.currentTime+delay,osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,start);osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),start+duration);gain.gain.setValueAtTime(volume,start);gain.gain.exponentialRampToValueAtTime(.001,start+duration);osc.connect(gain).connect(ctx.destination);osc.start(start);osc.stop(start+duration)}catch{}}
function sound(name){if(name==='select'){tone(330,.045,.018,'sine')}else if(name==='laser'){tone(1050,.13,.032,'sawtooth',0,240);tone(1450,.08,.018,'square',0,500)}else if(name==='impact'){tone(150,.12,.045,'square',0,55)}else if(name==='build'){tone(440,.08);tone(660,.12,.04,'sine',.07)}else if(name==='intercept'){tone(720,.07,.04,'square');tone(1080,.13,.04,'sine',.06)}else if(name==='error'){tone(170,.12,.04,'sawtooth',0,95)}else if(name==='breach'){tone(120,.28,.06,'sawtooth',0,35)}else if(name==='victory'){[523,659,784,1047].forEach((f,i)=>tone(f,.22,.04,'sine',i*.11))}}

$('restartButton').onclick=restart;$('pauseButton').onclick=()=>{state.paused=!state.paused;updateUI()};$('soundButton').onclick=e=>{const muted=e.currentTarget.dataset.muted!=='true';e.currentTarget.dataset.muted=muted;e.currentTarget.textContent=muted?'MUTE':'◖))'};
document.querySelectorAll('[data-stack]').forEach(button=>button.onclick=()=>{state.stackKey=button.dataset.stack;MEMORY_STACK=STACKS[state.stackKey].cards;$('stackChooser').classList.add('hidden');state.sector=0;state.phase=1;state.built=0;state.health=Array(13).fill(0);renderFortress();renderControls();updateUI();flashMessage(`${STACKS[state.stackKey].name} · SECTOR 1 READY`,true);state.laserTimer=setInterval(fireLaser,2600);sound('build')});
renderFortress();renderControls();updateUI();
