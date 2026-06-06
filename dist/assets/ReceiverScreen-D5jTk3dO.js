import{G as f,a as y,P as b,b as x,M as w,T}from"./game-BqOSwMmC.js";import{s as E,r as h}from"./index-Cn98VM0l.js";import{u as z}from"./compress-Dr0IXXBE.js";class k{events=[];timers=[];overlay=null;gridEl=null;load(e){this.events=e}start(e,o){this.gridEl=o??null,this.overlay=document.createElement("div"),this.overlay.style.cssText="position:absolute;inset:0;pointer-events:none;z-index:6;overflow:hidden;",e.appendChild(this.overlay),this.events.forEach(t=>{if(t.action!=="TAP_HIT")return;const r=setTimeout(()=>{const n=this.resolvePosition(t);n&&this.flashTap(n.x,n.y)},t.t);this.timers.push(r)})}stop(){this.timers.forEach(clearTimeout),this.timers=[],this.overlay?.remove(),this.overlay=null,this.gridEl=null}resolvePosition(e){return e.cell!==void 0&&this.gridEl?this.cellCenter(e.cell):e.x||e.y?{x:e.x*window.innerWidth,y:e.y*window.innerHeight}:null}cellCenter(e){if(!this.gridEl)return null;const o=this.gridEl.firstElementChild;if(!o)return null;const t=o.getBoundingClientRect(),r=e%4,n=Math.floor(e/4),s=t.width/4,d=t.height/4;return{x:t.left+(r+.5)*s,y:t.top+(n+.5)*d}}flashTap(e,o){if(!this.overlay)return;const t=document.createElement("div");t.style.cssText=`
      position:absolute;
      width:64px; height:64px;
      left:${e-32}px; top:${o-32}px;
      border-radius:50%;
      border:2px solid rgba(168,85,247,0.9);
      box-shadow:0 0 20px rgba(168,85,247,0.55), inset 0 0 10px rgba(168,85,247,0.15);
      background:rgba(168,85,247,0.18);
      transform:scale(0.15); opacity:0;
      pointer-events:none;
    `;const r=document.createElement("div");r.style.cssText=`
      position:absolute;
      width:16px; height:16px;
      left:${e-8}px; top:${o-8}px;
      border-radius:50%;
      background:rgba(168,85,247,0.95);
      box-shadow:0 0 12px rgba(168,85,247,0.9);
      transform:scale(0); opacity:0;
      pointer-events:none;
    `,this.overlay.appendChild(t),this.overlay.appendChild(r),requestAnimationFrame(()=>requestAnimationFrame(()=>{t.style.transition="transform 0.18s cubic-bezier(0.16,1,0.3,1), opacity 0.12s ease",t.style.transform="scale(1)",t.style.opacity="1",r.style.transition="transform 0.15s cubic-bezier(0.16,1,0.3,1), opacity 0.12s ease",r.style.transform="scale(1)",r.style.opacity="1",setTimeout(()=>{t.style.transition="transform 0.28s ease, opacity 0.28s ease",t.style.transform="scale(1.65)",t.style.opacity="0",r.style.transition="opacity 0.2s ease",r.style.opacity="0",setTimeout(()=>{t.remove(),r.remove()},300)},150)}))}}const p="cg_played_";class ${rawPayload;container=null;engine=new f;recorder=new y;ghostPlayer=new k;score=0;timerEl=null;scoreEl=null;timeBarEl=null;constructor(e){this.rawPayload=e}mount(e){if(this.container=e,!this.rawPayload){this.showError("No challenge data found in this link.");return}const o=z(this.rawPayload);if(!o){this.showError("This challenge link is invalid or has expired.");return}if(E.load()?.id===o.id){this.showOwnChallenge(o);return}if(localStorage.getItem(p+o.id)){this.showUsedUp(o);return}this.showDilemma(o)}unmount(){this.engine.stop(),this.ghostPlayer.stop(),this.container=null}showOwnChallenge(e){this.container&&(this.container.innerHTML=`
      <div class="screen anim-fade-in" style="align-items:center;justify-content:center;padding:2rem;text-align:center;">
        <div class="anim-ghost-float" style="font-size:3rem;margin-bottom:1.25rem;">👻</div>
        <p style="color:var(--color-accent);font-weight:700;font-size:1.05rem;margin:0 0 0.5rem;">That's your challenge!</p>
        <p style="color:var(--color-muted);font-size:0.875rem;margin:0 0 0.4rem;line-height:1.5;">
          You set the ghost for<br><span style="color:#fff;font-weight:600;">&ldquo;${u(e.stake)}&rdquo;</span>
        </p>
        <p style="color:var(--color-muted);font-size:0.875rem;margin:0 0 2rem;line-height:1.5;">
          Send this to your challenger — they get one shot to beat
          <span style="color:var(--color-accent);font-weight:600;">${e.timeline.score}</span>.
        </p>
        <button id="btn-home" class="btn-ghost-style" style="max-width:22rem;">Back</button>
      </div>`,this.container.querySelector("#btn-home")?.addEventListener("click",()=>h.navigate("home")))}showError(e){this.container&&(this.container.innerHTML=`
      <div class="screen anim-fade-in" style="align-items:center;justify-content:center;padding:2rem;text-align:center;">
        <div style="font-size:3rem;margin-bottom:1rem;">💀</div>
        <p style="color:var(--color-danger);font-weight:700;margin:0 0 0.5rem;">Dead Link</p>
        <p style="color:var(--color-muted);font-size:0.875rem;margin:0 0 2rem;">${e}</p>
        <button id="btn-home" class="btn-primary">Go Home</button>
      </div>`,this.container.querySelector("#btn-home")?.addEventListener("click",()=>h.navigate("home")))}showUsedUp(e){this.container&&(this.container.innerHTML=`
      <div class="screen anim-fade-in" style="align-items:center;justify-content:center;padding:2rem;text-align:center;">
        <div style="font-size:3rem;margin-bottom:1rem;">🔒</div>
        <p style="color:var(--color-danger);font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;margin:0 0 0.5rem;">Attempt Consumed</p>
        <p style="color:#fff;font-size:1.1rem;font-weight:600;margin:0 0 0.4rem;">&ldquo;${u(e.stake)}&rdquo;</p>
        <p style="color:var(--color-muted);font-size:0.875rem;margin:0 0 2rem;">You already used your one shot at this challenge.</p>
        <button id="btn-home" class="btn-ghost-style">Go Home</button>
      </div>`,this.container.querySelector("#btn-home")?.addEventListener("click",()=>h.navigate("home")))}showDilemma(e){if(!this.container)return;const o=e.timeline.mode==="PERFECT_CUT"?"⚡ The Perfect Cut":e.timeline.mode==="MATCH_RHYTHM"?"🎵 Match the Rhythm":"🎯 TapGrid";this.container.innerHTML=`
      <div class="screen anim-fade-in" style="
        align-items:center;justify-content:center;
        padding:2rem;overflow-y:auto;-webkit-overflow-scrolling:touch;">
        <div style="width:100%;max-width:22rem;display:flex;flex-direction:column;align-items:center;">

          <div class="anim-ghost-float" style="font-size:3.5rem;line-height:1;margin-bottom:1.5rem;">👻</div>

          <div style="color:var(--color-ghost);font-size:0.62rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.4rem;">${o}</div>
          <div style="color:var(--color-muted);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.75rem;">The Wager</div>

          <div class="panel" style="width:100%;text-align:center;margin-bottom:1.75rem;">
            <div style="font-size:1.1rem;font-weight:600;color:#fff;">&ldquo;${u(e.stake)}&rdquo;</div>
          </div>

          <div style="text-align:center;margin-bottom:1.75rem;">
            <div style="color:var(--color-muted);font-size:0.8rem;margin-bottom:0.35rem;">Score to beat</div>
            <div style="font-size:4.5rem;font-weight:800;line-height:1;color:var(--color-accent);text-shadow:0 0 36px rgba(34,211,238,0.65);">${e.timeline.score}</div>
            <div style="color:var(--color-muted);font-size:0.75rem;margin-top:0.3rem;">${e.timeline.mode==="MATCH_RHYTHM"?"rhythm points":"hits in "+e.timeline.duration/1e3+"s"}</div>
          </div>

          <div style="width:100%;background:rgba(168,85,247,0.07);border:1px solid rgba(168,85,247,0.22);border-radius:1rem;padding:1rem;margin-bottom:1.75rem;">
            <div style="color:var(--color-ghost);font-size:0.68rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:0.35rem;">⚠ One Attempt Only</div>
            <div style="color:var(--color-muted);font-size:0.8rem;line-height:1.55;">The ghost will haunt the game in real time. Once you accept, there is no second chance.</div>
          </div>

          <div style="width:100%;display:flex;flex-direction:column;gap:0.75rem;">
            <button id="btn-accept" class="btn-primary">Accept the Challenge</button>
            <button id="btn-decline" class="btn-danger">Decline</button>
          </div>
        </div>
      </div>`,this.container.querySelector("#btn-accept")?.addEventListener("click",()=>this.beginChallenge(e)),this.container.querySelector("#btn-decline")?.addEventListener("click",()=>h.navigate("home"))}beginChallenge(e){if(localStorage.setItem(p+e.id,"1"),!this.container)return;const o=e.timeline.mode,t=x[o],r=o==="MATCH_RHYTHM"?"pts":"",n=e.timeline.score+(r?" pts":"");this.container.innerHTML=`
      <div class="screen" id="rx-root">

        <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.5rem 0.75rem;flex-shrink:0;">
          <div>
            <div style="color:var(--color-muted);font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">You</div>
            <div id="rx-score" style="font-size:2.25rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;color:#fff;transition:color 0.1s;">0</div>
          </div>
          <div style="text-align:center;">
            <div id="rx-timer" style="font-size:2.25rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;color:var(--color-accent);transition:color 0.3s;">${t/1e3}</div>
          </div>
          <div style="text-align:right;">
            <div style="color:var(--color-ghost);font-size:0.6rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:3px;">👻 Ghost</div>
            <div style="font-size:2.25rem;font-weight:700;line-height:1;font-variant-numeric:tabular-nums;color:var(--color-ghost);text-shadow:0 0 14px rgba(168,85,247,0.45);">${n}</div>
          </div>
        </div>

        <div style="height:2px;background:var(--color-border);margin:0 1.5rem;border-radius:2px;overflow:hidden;flex-shrink:0;">
          <div id="rx-bar" style="height:100%;width:100%;background:var(--color-accent);transform-origin:left;transition:background 0.3s;"></div>
        </div>

        <div id="rx-game-area" style="flex:1;display:flex;align-items:center;justify-content:center;padding:0.5rem 1rem;position:relative;overflow:hidden;">
          <div id="rx-mount" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;"></div>
        </div>

        <!-- Countdown -->
        <div id="rx-countdown" style="position:absolute;inset:0;background:rgba(10,10,15,0.93);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;">
          <div style="color:var(--color-ghost);font-size:0.68rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.75rem;">👻 Ghost is watching</div>
          <div id="rx-count-num" style="font-size:7rem;font-weight:800;line-height:1;color:var(--color-accent);text-shadow:0 0 40px rgba(34,211,238,0.8);">3</div>
          <p style="color:var(--color-muted);font-size:0.875rem;margin-top:1.25rem;">
            ${o==="PERFECT_CUT"?"Tap when the pointer is in the zone":o==="MATCH_RHYTHM"?"Tap when the ring reaches the center":"Tap the glowing cell"}
          </p>
        </div>

        <!-- Result overlay -->
        <div id="rx-result" style="position:absolute;inset:0;background:rgba(10,10,15,0.97);display:none;flex-direction:column;align-items:center;justify-content:center;padding:2rem;z-index:20;"></div>
      </div>`,this.timerEl=this.container.querySelector("#rx-timer"),this.scoreEl=this.container.querySelector("#rx-score"),this.timeBarEl=this.container.querySelector("#rx-bar");const s=this.container.querySelector("#rx-mount"),d=this.container.querySelector("#rx-root"),l=this.recorder,c=this.engine;if(o==="PERFECT_CUT"){const a=new b;a.loadGhost(e.timeline),a.mount(s,{onScore:i=>this.updateScore(i),onRecord:i=>l.push(i),onEnd:()=>c.forceEnd()}),this.runCountdown(()=>{const i=performance.now();l.start(i),a.start(i),c.start(t,(v,m)=>this.onTick(m,t),()=>this.onGameOver(e))})}else if(o==="MATCH_RHYTHM"){const a=new w;a.loadGhost(e.timeline),a.mount(s,{onScore:i=>this.updateScore(i),onRecord:i=>l.push(i)}),this.runCountdown(()=>{const i=performance.now();l.start(i),a.start(i),c.start(t,(v,m)=>this.onTick(m,t),()=>this.onGameOver(e))})}else{const a=new T;a.mount(s,{onScore:i=>this.updateScore(i),onRecord:i=>l.push(i)}),this.ghostPlayer.load(e.timeline.events),this.runCountdown(()=>{const i=performance.now();l.start(i),this.ghostPlayer.start(d,s),a.start(i),c.start(t,(v,m)=>this.onTick(m,t),()=>{a.stop(),this.ghostPlayer.stop(),this.onGameOver(e)})})}}runCountdown(e){const o=this.container?.querySelector("#rx-countdown"),t=this.container?.querySelector("#rx-count-num");if(!o||!t)return;const r=["3","2","1","GO!"];let n=0;const s=()=>{if(n>=r.length){o.style.opacity="0",o.style.transition="opacity 0.2s ease",setTimeout(()=>{o.style.display="none",e()},200);return}t.style.transition="none",t.style.transform="scale(0.55)",t.style.opacity="0",t.textContent=r[n],requestAnimationFrame(()=>requestAnimationFrame(()=>{t.style.transition="transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease",t.style.transform="scale(1)",t.style.opacity="1"})),n++,setTimeout(s,n===r.length?420:750)};setTimeout(s,400)}onTick(e,o){const t=Math.ceil(e/1e3),r=t<=5;this.timerEl&&(this.timerEl.textContent=String(t),this.timerEl.style.color=r?"var(--color-danger)":"var(--color-accent)"),this.timeBarEl&&(this.timeBarEl.style.transform=`scaleX(${e/o})`,this.timeBarEl.style.background=r?"var(--color-danger)":"var(--color-accent)")}updateScore(e){this.score=e,this.scoreEl&&(this.scoreEl.textContent=String(e),this.scoreEl.style.color="var(--color-accent)",setTimeout(()=>{this.scoreEl&&(this.scoreEl.style.color="#fff")},140))}onGameOver(e){const o=this.score,t=e.timeline.score,r=o>t,n=o===t,s=this.container?.querySelector("#rx-result");if(!s)return;const d=r?"var(--color-success)":n?"var(--color-accent)":"var(--color-danger)",l=r?"🏆 You Win!":n?"👻 It's a Tie!":"👻 Ghost Wins",c=r?`The ghost is shamed. Pay up — &ldquo;${u(e.stake)}&rdquo;`:n?"You matched the ghost exactly. The stakes stand.":`&ldquo;${u(e.stake)}&rdquo; — you know what to do.`;s.innerHTML=`
      <div class="anim-slide-up" style="width:100%;max-width:22rem;text-align:center;">
        <div style="font-size:0.68rem;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:${d};margin-bottom:0.75rem;">${l}</div>

        <div style="display:flex;align-items:center;justify-content:center;gap:2.5rem;margin-bottom:1.75rem;">
          <div>
            <div style="color:var(--color-muted);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.2rem;">You</div>
            <div style="font-size:4rem;font-weight:800;line-height:1;color:${r?"var(--color-success)":"#fff"};">${o}</div>
          </div>
          <div style="color:var(--color-muted);font-size:1.1rem;font-weight:300;">vs</div>
          <div>
            <div style="color:var(--color-ghost);font-size:0.62rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.2rem;">👻 Ghost</div>
            <div style="font-size:4rem;font-weight:800;line-height:1;color:${r?"var(--color-muted)":"var(--color-ghost)"};${r?"":"text-shadow:0 0 20px rgba(168,85,247,0.5);"}">${t}</div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:1.75rem;">
          <div style="color:var(--color-muted);font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.35rem;">The Stake</div>
          <div style="color:#fff;font-size:0.95rem;font-weight:500;line-height:1.5;">${c}</div>
        </div>

        <button id="rx-done" class="btn-ghost-style">Done</button>
      </div>`,s.style.display="flex",s.querySelector("#rx-done")?.addEventListener("click",()=>h.navigate("home"))}}function u(g){return g.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}export{$ as ReceiverScreen};
