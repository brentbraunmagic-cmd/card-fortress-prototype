// Replace or extend this array with a memorized 52-card stack.
// The game consumes the first 13 entries for each fortress level.
const MEMORY_STACK = [
  ['4','clubs'],['K','hearts'],['7','spades'],['2','diamonds'],
  ['A','hearts'],['9','clubs'],['Q','diamonds'],['5','spades'],
  ['10','hearts'],['3','clubs'],['J','spades'],['8','diamonds'],['6','hearts']
];
const SUITS = {clubs:'♣', hearts:'♥', spades:'♠', diamonds:'♦'};
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
// Visual order is top-to-bottom. Memory positions still build bottom-to-top.
const FORTRESS_ROWS = [[11,12],[8,9,10],[4,5,6,7],[0,1,2,3]];

const state = {phase:1,built:0,score:0,combo:1,selectedSuit:'clubs',health:Array(13).fill(0),paused:false,laserTimer:null,bombTimer:null,bomb:null,phaseTwoHits:0};
const $ = id => document.getElementById(id);

function cardMarkup(card) {
  const [rank,suit]=card, red=suit==='hearts'||suit==='diamonds';
  return `<div class="card-face ${red?'red':''}"><span>${rank}<br>${SUITS[suit]}</span><em>${SUITS[suit]}</em><div class="health"><i style="width:100%"></i></div></div>`;
}

function renderFortress() {
  const root=$('fortress'); root.innerHTML='';
  FORTRESS_ROWS.forEach(positions=>{const row=document.createElement('div');row.className='fortress-row';
    positions.forEach(pos=>{const el=document.createElement('div');el.className='fortress-card';el.dataset.position=String(pos+1).padStart(2,'0');el.dataset.index=pos;
      if(state.health[pos]>0){el.classList.add('built');el.innerHTML=cardMarkup(MEMORY_STACK[pos]);el.querySelector('.health i').style.width=`${state.health[pos]}%`;if(state.health[pos]<55)el.classList.add('damaged');}
      if(pos===state.built && state.phase===1)el.classList.add('next');
      el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();placeCard(e.dataTransfer.getData('rank'));});row.appendChild(el)});root.appendChild(row)});
}

function renderControls(){
  $('suitRow').innerHTML=Object.entries(SUITS).map(([name,symbol])=>`<button class="suit-button ${name===state.selectedSuit?'selected':''} ${(name==='hearts'||name==='diamonds')?'red':''}" data-suit="${name}">${symbol}</button>`).join('');
  document.querySelectorAll('.suit-button').forEach(b=>b.onclick=()=>{state.selectedSuit=b.dataset.suit;renderControls()});
  $('rankRow').innerHTML=RANKS.map(rank=>`<button draggable="true" class="rank-button" data-rank="${rank}">${rank}</button>`).join('');
  document.querySelectorAll('.rank-button').forEach(b=>{b.onclick=()=>placeCard(b.dataset.rank);b.ondragstart=e=>e.dataTransfer.setData('rank',b.dataset.rank)});
}

function placeCard(rank){if(state.paused||state.phase!==1||state.built>=13)return;const expected=MEMORY_STACK[state.built];
  if(rank===expected[0]&&state.selectedSuit===expected[1]){state.health[state.built]=100;state.built++;state.score+=100*state.combo;state.combo=Math.min(9,state.combo+1);flashMessage('POSITION SECURED',true);updateUI();renderFortress();beep(520,.07);
    if(state.built===13)setTimeout(showPhaseComplete,350);
  }else{state.combo=1;state.score=Math.max(0,state.score-25);flashMessage('MEMORY MISMATCH',false);updateUI();beep(150,.1)}
}

function fireLaser(){if(state.paused||state.phase!==1||state.built===0)return;
  // Attack the newest wall segment so a destroyed card becomes the next card to rebuild.
  const target=state.built-1,card=document.querySelector(`[data-index="${target}"]`);if(!card)return;
  const field=$('battlefield').getBoundingClientRect(), ship=$('ship').getBoundingClientRect(), rect=card.getBoundingClientRect();const laser=document.createElement('i');laser.className='laser';laser.style.left=`${ship.left-field.left+ship.width/2}px`;laser.style.top=`${ship.bottom-field.top-8}px`;$('laserLayer').appendChild(laser);
  requestAnimationFrame(()=>{laser.style.left=`${rect.left-field.left+rect.width/2}px`;laser.style.top=`${rect.top-field.top+rect.height/2}px`});
  setTimeout(()=>{laser.remove();damageCard(target,20);const impact=document.createElement('i');impact.className='impact';impact.style.left=`${rect.left-field.left+rect.width/2-14}px`;impact.style.top=`${rect.top-field.top+rect.height/2-14}px`;$('laserLayer').appendChild(impact);setTimeout(()=>impact.remove(),400)},310)
}

function damageCard(index,amount){if(state.phase!==1)return;state.health[index]=Math.max(0,state.health[index]-amount);const destroyed=state.health[index]===0;if(destroyed){state.built=Math.max(0,state.built-1);state.combo=1;flashMessage(`POSITION ${String(index+1).padStart(2,'0')} BREACHED`,false);beep(100,.13)}renderFortress();updateUI()}

function showPhaseComplete(){clearInterval(state.laserTimer);$('modal').classList.remove('hidden');$('modalEyebrow').textContent='PHASE 01 COMPLETE';$('modalTitle').textContent='FORTRESS ONLINE';$('modalText').textContent='All 13 memory positions are secure. Prepare to intercept incoming card bombs.';$('modalButton').textContent='BEGIN PHASE 2';$('modalButton').onclick=startPhaseTwo}
function startPhaseTwo(){$('modal').classList.add('hidden');state.phase=2;state.phaseTwoHits=0;state.bomb=null;$('battleMessage').textContent='IDENTIFY THE FALLING CARD';$('buildControls').classList.add('hidden');$('phaseTwoControls').classList.remove('hidden');$('positionGrid').innerHTML=Array.from({length:13},(_,i)=>`<button class="position-button" data-position="${i}">${String(i+1).padStart(2,'0')}</button>`).join('');document.querySelectorAll('.position-button').forEach(b=>b.onclick=()=>intercept(Number(b.dataset.position)));updateUI();spawnBomb();state.bombTimer=setInterval(tickBomb,50)}
function spawnBomb(){if(state.paused||state.bomb)return;const index=Math.floor(Math.random()*13),el=document.createElement('div'),card=MEMORY_STACK[index];el.className='bomb';el.innerHTML=`<span class="bomb-position">?</span><span class="card-symbol">${card[0]}${SUITS[card[1]]}</span><small>IDENTIFY POSITION</small>`;el.style.left=`${10+Math.random()*75}%`;$('bombLayer').appendChild(el);state.bomb={index,el,y:-82}}
function tickBomb(){if(state.paused)return;if(!state.bomb){spawnBomb();return}state.bomb.y+=1.25;state.bomb.el.style.top=`${state.bomb.y}px`;if(state.bomb.y>315){state.bomb.el.remove();state.bomb=null;state.combo=1;flashMessage('BOMB IMPACT',false);updateUI();setTimeout(spawnBomb,400)}}
function intercept(position){if(state.paused||!state.bomb)return;if(position===state.bomb.index){state.score+=200*state.combo;state.combo=Math.min(9,state.combo+1);state.phaseTwoHits++;state.bomb.el.classList.add('shake');flashMessage('MEMORY LOCK · INTERCEPTED',true);beep(680,.08);setTimeout(()=>{state.bomb?.el.remove();state.bomb=null;if(state.phaseTwoHits>=10)showVictory();else spawnBomb()},180)}else{state.combo=1;state.score=Math.max(0,state.score-50);flashMessage('WRONG POSITION',false);beep(130,.1)}updateUI()}
function showVictory(){clearInterval(state.bombTimer);$('modal').classList.remove('hidden');$('modalEyebrow').textContent='TRAINING COMPLETE';$('modalTitle').textContent='MEMORY DEFENDED';$('modalText').textContent=`10 bombs intercepted. Final score: ${state.score}.`;$('modalButton').textContent='PLAY AGAIN';$('modalButton').onclick=restart}
function flashMessage(text,good){const el=$('battleMessage');el.textContent=text;el.style.color=good?'var(--cyan)':'var(--danger)';clearTimeout(el._timer);el._timer=setTimeout(()=>{el.textContent=state.phase===1?`FORTIFY POSITION ${String(state.built+1).padStart(2,'0')}`:'IDENTIFY THE FALLING CARD';el.style.color='var(--cyan)'},900)}
function updateUI(){$('phaseLabel').textContent=state.phase===1?'01 · BUILD':'02 · RECALL';$('scoreLabel').textContent=String(state.score).padStart(4,'0');$('comboLabel').textContent=`×${state.combo}`;$('progressText').textContent=state.phase===1?`${state.built} / 13 BUILT`:`${state.phaseTwoHits} / 10 INTERCEPTED`;$('progressBar').style.width=`${state.phase===1?state.built/13*100:state.phaseTwoHits/10*100}%`;
  if(state.built<13){$('targetPosition').textContent=String(state.built+1).padStart(2,'0');const c=MEMORY_STACK[state.built];$('targetCard').textContent=c?`${c[0]}${SUITS[c[1]]}`:'✓'}$('pauseButton').textContent=state.paused?'▶ RESUME':'Ⅱ PAUSE'}
function restart(){location.reload()}
function beep(freq,duration){if($('soundButton').dataset.muted==='true')return;try{const ctx=beep.ctx||(beep.ctx=new AudioContext()),osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=freq;gain.gain.setValueAtTime(.04,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+duration)}catch{}}

$('restartButton').onclick=restart;$('pauseButton').onclick=()=>{state.paused=!state.paused;updateUI()};$('soundButton').onclick=e=>{const muted=e.currentTarget.dataset.muted!=='true';e.currentTarget.dataset.muted=muted;e.currentTarget.textContent=muted?'MUTE':'◖))'};
renderFortress();renderControls();updateUI();state.laserTimer=setInterval(fireLaser,1800);
