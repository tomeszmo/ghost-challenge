import{r as i,s as l}from"./index-Cn98VM0l.js";let c="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict",d=(n=21)=>{let t="",e=crypto.getRandomValues(new Uint8Array(n|=0));for(;n--;)t+=c[e[n]&63];return t};const o=60,a=["Tonight's drinks on you 🍺","Loser buys coffee ☕","You cook dinner for a week 🍝","Loser does the dishes"];class h{container=null;inputEl=null;charCountEl=null;btnStart=null;vpListener=null;mount(t){this.container=t,this.render(),this.bindViewport(),setTimeout(()=>this.inputEl?.focus(),180)}unmount(){this.vpListener&&window.visualViewport?.removeEventListener("resize",this.vpListener),this.container=null}render(){if(!this.container)return;this.container.innerHTML=`
      <div class="screen anim-fade-in" style="justify-content:flex-start;">

        <!-- Nav -->
        <div style="padding:1rem 1.5rem 0.25rem; flex-shrink:0;">
          <button id="btn-back" style="
            background:none; border:none; color:var(--color-muted);
            font-size:0.875rem; cursor:pointer; padding:0.25rem 0;
            display:flex; align-items:center; gap:0.35rem; font-family:inherit;
          ">← Back</button>
        </div>

        <!-- Scrollable body -->
        <div style="flex:1; overflow-y:auto; padding:0.5rem 1.5rem 0; -webkit-overflow-scrolling:touch;">

          <!-- Prompt -->
          <div style="margin-bottom:2rem; margin-top:0.5rem;">
            <h1 style="font-size:1.75rem; font-weight:700; margin:0 0 0.4rem; letter-spacing:-0.02em; line-height:1.2;">
              What's the wager?
            </h1>
            <p style="color:var(--color-muted); font-size:0.875rem; margin:0; line-height:1.5;">
              Loser pays up. Make it sting.
            </p>
          </div>

          <!-- Input card -->
          <div id="input-panel" style="
            background:var(--color-panel);
            border:1.5px solid var(--color-border);
            border-radius:1rem;
            padding:1rem 1rem 0.6rem;
            margin-bottom:1.25rem;
            transition:border-color 0.2s, box-shadow 0.2s;
          ">
            <input
              id="stake-input"
              type="text"
              maxlength="${o}"
              placeholder="Tonight's drinks on you..."
              autocomplete="off"
              autocorrect="off"
              autocapitalize="sentences"
              spellcheck="false"
              style="
                width:100%; background:none; border:none; outline:none;
                font-size:1.15rem; font-weight:500; color:#fff;
                caret-color:var(--color-accent);
                line-height:1.5; font-family:inherit;
              "
            />
            <div style="display:flex; justify-content:flex-end; margin-top:0.35rem;">
              <span id="char-count" style="
                font-size:0.68rem; color:var(--color-border);
                font-variant-numeric:tabular-nums; transition:color 0.2s;
              ">0 / ${o}</span>
            </div>
          </div>

          <!-- Quick picks -->
          <div style="margin-bottom:2rem;">
            <div style="
              color:var(--color-muted); font-size:0.62rem;
              letter-spacing:0.1em; text-transform:uppercase; margin-bottom:0.6rem;
            ">Quick picks</div>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
              ${a.map((e,r)=>`
                <button data-chip="${r}" style="
                  background:var(--color-panel); border:1px solid var(--color-border);
                  border-radius:999px; padding:0.4rem 0.9rem;
                  color:var(--color-muted); font-size:0.78rem;
                  cursor:pointer; white-space:nowrap;
                  font-family:inherit; transition:border-color 0.15s, color 0.15s;
                ">${e}</button>
              `).join("")}
            </div>
          </div>

        </div>

        <!-- Bottom CTA — stays above keyboard via visualViewport -->
        <div id="cta-wrap" style="padding:0.75rem 1.5rem 1.5rem; flex-shrink:0; transition:transform 0.1s ease-out;">
          <button id="btn-start" class="btn-primary" disabled style="
            opacity:0.3; box-shadow:none;
            transition:opacity 0.2s ease, box-shadow 0.2s ease;
          ">
            Start Sharp Challenge
          </button>
          <p style="
            text-align:center; font-size:0.68rem; color:var(--color-muted);
            margin:0.6rem 0 0; line-height:1.5;
          ">
            Quitting mid-game = automatic forfeit. No chickening out.
          </p>
        </div>

      </div>
    `,this.inputEl=this.container.querySelector("#stake-input"),this.charCountEl=this.container.querySelector("#char-count"),this.btnStart=this.container.querySelector("#btn-start");const t=this.container.querySelector("#input-panel");this.inputEl?.addEventListener("input",()=>this.onInput()),this.inputEl?.addEventListener("focus",()=>{t.style.borderColor="var(--color-accent)",t.style.boxShadow="0 0 12px rgba(34,211,238,0.15)"}),this.inputEl?.addEventListener("blur",()=>{t.style.borderColor="var(--color-border)",t.style.boxShadow="none"}),this.container.querySelector("#btn-back")?.addEventListener("click",()=>{i.navigate("home")}),this.container.querySelectorAll("[data-chip]").forEach(e=>{e.addEventListener("click",()=>{const r=parseInt(e.dataset.chip??"0",10),s=a[r]??"";this.inputEl&&(this.inputEl.value=s,this.onInput(),this.inputEl.focus())})}),this.btnStart?.addEventListener("click",()=>this.handleStart())}onInput(){const t=this.inputEl?.value??"",e=t.length;if(this.charCountEl&&(this.charCountEl.textContent=`${e} / ${o}`,this.charCountEl.style.color=e>=o*.85?"var(--color-danger)":"var(--color-border)"),this.btnStart){const r=t.trim().length>0;this.btnStart.disabled=!r,this.btnStart.style.opacity=r?"1":"0.3",this.btnStart.style.boxShadow=r?"0 0 24px rgba(34,211,238,0.35)":"none"}}handleStart(){const t=this.inputEl?.value.trim()??"";if(!t)return;const e=d(10);l.create(e,t),this.btnStart&&(this.btnStart.textContent="Locked in 🔒",this.btnStart.disabled=!0,this.btnStart.style.boxShadow="0 0 24px rgba(34,211,238,0.2)"),setTimeout(()=>i.navigate("game"),380)}bindViewport(){const t=this.container?.querySelector("#cta-wrap");!t||!window.visualViewport||(this.vpListener=()=>{const e=window.visualViewport,r=window.innerHeight-e.height-e.offsetTop;t.style.transform=r>0?`translateY(-${Math.round(r)}px)`:""},window.visualViewport.addEventListener("resize",this.vpListener))}}export{h as StakeScreen};
