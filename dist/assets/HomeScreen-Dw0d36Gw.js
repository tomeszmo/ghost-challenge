import{r as o}from"./index-Cn98VM0l.js";class a{container=null;mount(e){this.container=e,this.render(),this.checkDnf()}unmount(){this.container=null}render(){this.container&&(this.container.innerHTML=`
      <div class="screen anim-fade-in" style="align-items:center; justify-content:center; padding:2rem;">

        <div class="anim-ghost-float" style="font-size:4rem; line-height:1; margin-bottom:1rem;">👻</div>

        <h1 class="neon-text-accent" style="
          font-size:2rem; font-weight:700; margin:0 0 0.5rem; letter-spacing:-0.02em;
        ">ChallengeGhost</h1>

        <p style="color:var(--color-muted); font-size:0.875rem; margin:0 0 3rem; line-height:1.5; text-align:center;">
          Issue a micro-challenge.<br>Bet on the outcome. Let the ghost decide.
        </p>

        <div style="width:100%; max-width:22rem; display:flex; flex-direction:column; gap:0.875rem;">
          <button id="btn-create" class="btn-primary">Create Challenge</button>
          <button id="btn-scan" class="btn-ghost-style">Scan to Play</button>
        </div>

      </div>
    `,this.container.querySelector("#btn-create")?.addEventListener("click",()=>{o.navigate("stake")}),this.container.querySelector("#btn-scan")?.addEventListener("click",()=>{this.showScanTip()}))}showScanTip(){const e=this.container?.querySelector(".screen");if(!e)return;e.querySelector("#scan-tip")?.remove();const t=document.createElement("div");t.id="scan-tip",t.style.cssText=`
      position:absolute; bottom:5rem; left:1.25rem; right:1.25rem;
      background:rgba(168,85,247,0.1);
      border:1px solid rgba(168,85,247,0.28);
      border-radius:1rem; padding:1rem 1.1rem;
      z-index:20; animation:slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both;
      text-align:center;
    `,t.innerHTML=`
      <div style="color:var(--color-ghost);font-size:0.8rem;font-weight:600;margin-bottom:0.3rem;">👻 How to receive a challenge</div>
      <div style="color:var(--color-muted);font-size:0.8rem;line-height:1.5;">
        Scan your challenger's QR code with your phone's camera app, or ask them to share the link directly.
      </div>
    `,e.appendChild(t),setTimeout(()=>{t.style.transition="opacity 0.35s ease",t.style.opacity="0",setTimeout(()=>t.remove(),380)},4e3)}checkDnf(){const e=sessionStorage.getItem("cg_dnf_stake");e&&(sessionStorage.removeItem("cg_dnf_stake"),this.showDnfToast(e))}showDnfToast(e){const t=this.container?.querySelector(".screen");if(!t)return;const r=document.createElement("div");r.style.cssText=`
      position:absolute; top:1.25rem; left:1.25rem; right:1.25rem;
      background:rgba(248,113,113,0.1);
      border:1px solid rgba(248,113,113,0.35);
      border-radius:1rem; padding:1rem 1.1rem;
      z-index:20; animation:slideUp 0.35s cubic-bezier(0.16,1,0.3,1) both;
    `,r.innerHTML=`
      <div style="color:var(--color-danger); font-size:0.72rem; font-weight:700;
        letter-spacing:0.08em; text-transform:uppercase; margin-bottom:0.3rem;">
        👻 You chickened out
      </div>
      <div style="color:#fff; font-size:0.95rem; font-weight:600;">
        &ldquo;${i(e)}&rdquo;
      </div>
      <div style="color:var(--color-muted); font-size:0.75rem; margin-top:0.25rem;">
        That one's still on you. Try again?
      </div>
    `,t.appendChild(r),setTimeout(()=>{r.style.transition="opacity 0.4s ease, transform 0.4s ease",r.style.opacity="0",r.style.transform="translateY(-6px)",setTimeout(()=>r.remove(),420)},4500)}}function i(n){return n.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}export{a as HomeScreen};
