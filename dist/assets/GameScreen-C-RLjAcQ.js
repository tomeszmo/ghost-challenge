import{G as c,a as l,b as s,P as m,M as d,T as h}from"./game-BqOSwMmC.js";import{r as a,s as n}from"./index-Cn98VM0l.js";class f{engine=new c;recorder=new l;container=null;timerEl=null;scoreEl=null;timeBarEl=null;score=0;mode="PERFECT_CUT";mount(e){this.container=e,this.mode=this.pickMode(),this.render(),this.startCountdown()}unmount(){this.engine.stop(),this.container=null}pickMode(){const t=a.currentParams().type;return t==="PC"?"PERFECT_CUT":t==="MR"?"MATCH_RHYTHM":t==="TG"?"TAP_GRID":Math.random()<.5?"PERFECT_CUT":"MATCH_RHYTHM"}render(){if(!this.container)return;const e=this.mode==="PERFECT_CUT"?"The Perfect Cut":this.mode==="MATCH_RHYTHM"?"Match the Rhythm":"TapGrid";this.container.innerHTML=`
      <div class="screen">

        <!-- HUD -->
        <div style="
          display:flex; align-items:center; justify-content:space-between;
          padding:1rem 1.5rem 0.5rem; flex-shrink:0;
        ">
          <div>
            <div style="color:var(--color-muted);font-size:0.55rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:2px;">${e}</div>
            <div id="score-el" style="
              font-size:2.5rem; font-weight:700; line-height:1;
              font-variant-numeric:tabular-nums; color:#fff; transition:color 0.1s;
            ">0</div>
          </div>
          <div style="text-align:right;">
            <div style="color:var(--color-muted);font-size:0.55rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:2px;">Time</div>
            <div id="timer-el" style="
              font-size:2.5rem; font-weight:700; line-height:1;
              font-variant-numeric:tabular-nums; color:var(--color-accent); transition:color 0.3s;
            ">${s[this.mode]/1e3}</div>
          </div>
        </div>

        <!-- Time bar -->
        <div style="height:2px; background:var(--color-border); margin:0 1.5rem; border-radius:2px; overflow:hidden; flex-shrink:0;">
          <div id="time-bar" style="height:100%; width:100%; background:var(--color-accent); transform-origin:left center; transition:background 0.3s;"></div>
        </div>

        <!-- Game canvas area -->
        <div id="game-area" style="
          flex:1; display:flex; align-items:center; justify-content:center;
          padding:0.5rem 1rem; overflow:hidden;
        ">
          <div id="game-mount" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;"></div>
        </div>

        <!-- Countdown overlay -->
        <div id="countdown-overlay" style="
          position:absolute; inset:0; background:rgba(10,10,15,0.93);
          display:flex; flex-direction:column; align-items:center; justify-content:center; z-index:10;
        ">
          <div style="color:var(--color-muted);font-size:0.65rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:0.75rem;">
            ${this.mode==="PERFECT_CUT"?"⚡ Hit the zone":this.mode==="MATCH_RHYTHM"?"🎵 Match the ring":"Tap the cell"}
          </div>
          <div id="countdown-num" style="
            font-size:7rem; font-weight:800; line-height:1;
            color:var(--color-accent); text-shadow:0 0 40px rgba(34,211,238,0.8);
          ">3</div>
          <p style="color:var(--color-muted);font-size:0.875rem;margin-top:1.25rem;letter-spacing:0.04em;">
            ${this.mode==="PERFECT_CUT"?"Tap when the pointer is in the zone":this.mode==="MATCH_RHYTHM"?"Tap when the ring reaches the center":"Tap the glowing cell"}
          </p>
        </div>

        <!-- Game-over overlay -->
        <div id="gameover-overlay" style="
          position:absolute; inset:0; background:rgba(10,10,15,0.96);
          display:none; flex-direction:column; align-items:center; justify-content:center; z-index:10;
        ">
          <div style="color:var(--color-muted);font-size:0.65rem;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:0.5rem;">Ghost Captured</div>
          <div id="final-score-el" style="
            font-size:6rem; font-weight:800; line-height:1;
            color:var(--color-accent); text-shadow:0 0 48px rgba(34,211,238,0.7);
          ">0</div>
          <div style="color:var(--color-muted);font-size:0.8rem;margin-top:0.4rem;">
            ${this.mode==="PERFECT_CUT"?"hits before a miss":this.mode==="MATCH_RHYTHM"?"rhythm points":"hits in 30 seconds"}
          </div>
          <div style="margin-top:2rem; display:flex; align-items:center; gap:0.5rem; color:var(--color-ghost); font-size:0.8rem;">
            <span>👻</span><span>Generating QR code...</span>
          </div>
        </div>

      </div>
    `,this.timerEl=this.container.querySelector("#timer-el"),this.scoreEl=this.container.querySelector("#score-el"),this.timeBarEl=this.container.querySelector("#time-bar")}startCountdown(){const e=this.container?.querySelector("#countdown-overlay"),t=this.container?.querySelector("#countdown-num");if(!e||!t)return;const o=["3","2","1","GO!"];let r=0;const i=()=>{if(r>=o.length){e.style.opacity="0",e.style.transition="opacity 0.2s ease",setTimeout(()=>{e.style.display="none",this.beginGame()},200);return}t.style.transition="none",t.style.transform="scale(0.55)",t.style.opacity="0",t.textContent=o[r],requestAnimationFrame(()=>requestAnimationFrame(()=>{t.style.transition="transform 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.2s ease",t.style.transform="scale(1)",t.style.opacity="1"})),r++,setTimeout(i,r===o.length?420:750)};setTimeout(i,300)}beginGame(){n.load()||n.create("tmp","Test run");const e=performance.now();this.recorder.start(e),n.armDnfGuard(n.load()?.id??"tmp"),n.setState("PLAYING");const t=this.container?.querySelector("#game-mount"),o=s[this.mode];if(this.mode==="PERFECT_CUT"){const r=new m;r.mount(t,{onScore:i=>this.updateScore(i),onRecord:i=>this.recorder.push(i),onEnd:()=>this.engine.forceEnd()}),r.start(e)}else if(this.mode==="MATCH_RHYTHM"){const r=new d;r.mount(t,{onScore:i=>this.updateScore(i),onRecord:i=>this.recorder.push(i)}),r.start(e)}else{const r=new h;r.mount(t,{onScore:i=>this.updateScore(i),onRecord:i=>this.recorder.push(i)}),r.start(e)}this.engine.start(o,(r,i)=>this.onTick(i,o),()=>this.onGameOver())}onTick(e,t){const o=Math.ceil(e/1e3),r=e/t,i=o<=5;this.timerEl&&(this.timerEl.textContent=String(o),this.timerEl.style.color=i?"var(--color-danger)":"var(--color-accent)"),this.timeBarEl&&(this.timeBarEl.style.transform=`scaleX(${r})`,this.timeBarEl.style.background=i?"var(--color-danger)":"var(--color-accent)")}updateScore(e){this.score=e,this.scoreEl&&(this.scoreEl.textContent=String(e),this.scoreEl.style.color="var(--color-accent)",setTimeout(()=>{this.scoreEl&&(this.scoreEl.style.color="#fff")},140))}onGameOver(){const e=this.recorder.stop();n.disarmDnfGuard();const t={v:1,mode:this.mode,duration:s[this.mode],score:this.score,events:e};n.setTimeline(t),n.setState("SEALED");const o=this.container?.querySelector("#gameover-overlay"),r=this.container?.querySelector("#final-score-el");o&&r&&(r.textContent=String(this.score),o.style.display="flex"),setTimeout(()=>a.navigate("result"),2200)}}export{f as GameScreen};
