/* ============================================================
   thumbs.js — generative project thumbnails + portrait
   Cohesive: paper base, ink, vermilion + per-project tint.
   Pure canvas. Seeded so each project is distinct but stable.
   ============================================================ */
(function(){
  const PAPER = "#e9e3d6", INK = "#16130d", ACCENT = "#ff4a1f";

  // seeded PRNG (mulberry32)
  function rng(seed){ let a=seed>>>0; return function(){ a|=0;a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

  function fit(canvas){
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    const r = canvas.getBoundingClientRect();
    const w = Math.max(2, r.width), h = Math.max(2, r.height);
    canvas.width = w*dpr; canvas.height = h*dpr;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    return {ctx,w,h};
  }

  // palettes keyed by project (each a tint family, cohesive with brand)
  const PAL = {
    atlas: ["#1f5d8c","#0e2c45"],   // deep blue
    tide:  ["#2f7d6b","#11332d"],   // teal/green
    mono:  ["#5a4b8c","#241d3b"],   // violet
    verre: ["#b06a2f","#4a2c13"],   // clay
  };

  const DRAW = {
    // 01 — concentric system / grid (design system)
    atlas(ctx,w,h,rand,c1,c2){
      ctx.fillStyle=c2; ctx.fillRect(0,0,w,h);
      // grid of dots
      const gx=14, gy=10, mx=w*0.12, my=h*0.14;
      for(let i=0;i<gx;i++)for(let j=0;j<gy;j++){
        const x=mx+i/(gx-1)*(w-2*mx), y=my+j/(gy-1)*(h-2*my);
        const d=Math.hypot(x-w*0.62,y-h*0.5);
        ctx.beginPath(); ctx.arc(x,y,Math.max(.6,2.4-d/120),0,7); ctx.fillStyle="rgba(255,255,255,.5)"; ctx.fill();
      }
      // concentric rings
      const cx=w*0.62, cy=h*0.5;
      for(let r=Math.min(w,h)*0.42;r>10;r-=Math.min(w,h)*0.07){
        ctx.beginPath(); ctx.arc(cx,cy,r,0,7); ctx.strokeStyle=r<Math.min(w,h)*0.16?ACCENT:"rgba(255,255,255,.35)"; ctx.lineWidth=r<Math.min(w,h)*0.16?3:1; ctx.stroke();
      }
      ctx.fillStyle=ACCENT; ctx.beginPath(); ctx.arc(cx,cy,Math.min(w,h)*0.05,0,7); ctx.fill();
    },
    // 02 — flowing waves (tide)
    tide(ctx,w,h,rand,c1,c2){
      const g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,c1); g.addColorStop(1,c2);
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      for(let k=0;k<7;k++){
        ctx.beginPath();
        const base=h*0.2+k*h*0.1, amp=14+rand()*22, ph=rand()*7;
        ctx.moveTo(0,base);
        for(let x=0;x<=w;x+=8){ ctx.lineTo(x, base+Math.sin(x/70+ph+k)*amp); }
        ctx.strokeStyle=k===3?ACCENT:"rgba(255,255,255,"+(.18+k*0.04)+")"; ctx.lineWidth=k===3?3:1.4; ctx.stroke();
      }
    },
    // 03 — single soft orb + arc (mono / focus)
    mono(ctx,w,h,rand,c1,c2){
      ctx.fillStyle=c2; ctx.fillRect(0,0,w,h);
      const cx=w*0.5, cy=h*0.52, R=Math.min(w,h)*0.3;
      const g=ctx.createRadialGradient(cx-R*0.3,cy-R*0.3,R*0.1,cx,cy,R);
      g.addColorStop(0,c1); g.addColorStop(1,c2);
      ctx.beginPath(); ctx.arc(cx,cy,R,0,7); ctx.fillStyle=g; ctx.fill();
      // orbit arc
      ctx.beginPath(); ctx.arc(cx,cy,R*1.5,-1.2,0.7); ctx.strokeStyle="rgba(255,255,255,.4)"; ctx.lineWidth=1.4; ctx.stroke();
      const a=0.7; ctx.beginPath(); ctx.arc(cx+Math.cos(a)*R*1.5, cy+Math.sin(a)*R*1.5, 5,0,7); ctx.fillStyle=ACCENT; ctx.fill();
    },
    // 04 — stacked vessels / blocks (verre / ceramics)
    verre(ctx,w,h,rand,c1,c2){
      ctx.fillStyle=c2; ctx.fillRect(0,0,w,h);
      const cols=4, cw=w/cols;
      for(let i=0;i<cols;i++){
        const hh=h*(0.3+rand()*0.55); const x=i*cw; 
        ctx.fillStyle=i%2? c1 : "rgba(255,255,255,.12)"; ctx.fillRect(x+cw*0.12,h-hh,cw*0.76,hh);
        // rim
        ctx.fillStyle=ACCENT; ctx.fillRect(x+cw*0.12,h-hh,cw*0.76, i===1?6:2);
      }
    }
  };

  function paintThumb(canvas){
    const key = canvas.closest("[data-thumb]").dataset.thumb;
    const seed = +canvas.closest("[data-thumb]").dataset.seed || 1;
    const {ctx,w,h} = fit(canvas);
    const rand = rng(seed);
    const pal = PAL[key] || ["#444","#111"];
    (DRAW[key]||DRAW.atlas)(ctx,w,h,rand,pal[0],pal[1]);
    // subtle vignette
    const vg=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.3,w/2,h/2,Math.max(w,h)*0.7);
    vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,.22)");
    ctx.fillStyle=vg; ctx.fillRect(0,0,w,h);
  }

  // ---- portrait : abstract generative "figure" in brand palette ----
  function paintPortrait(canvas){
    const {ctx,w,h} = fit(canvas);
    const rand = rng(99);
    const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,"#efe9dd"); g.addColorStop(1,"#ddd4c2");
    ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
    // soft head + shoulders silhouette
    const cx=w*0.5;
    ctx.fillStyle=INK;
    ctx.beginPath(); ctx.arc(cx,h*0.34,w*0.17,0,7); ctx.fill(); // head
    ctx.beginPath(); ctx.moveTo(cx-w*0.34,h); ctx.quadraticCurveTo(cx-w*0.30,h*0.56,cx,h*0.55);
    ctx.quadraticCurveTo(cx+w*0.30,h*0.56,cx+w*0.34,h); ctx.closePath(); ctx.fill();
    // accent halo
    ctx.beginPath(); ctx.arc(cx,h*0.34,w*0.24,-2.3,0.5); ctx.strokeStyle=ACCENT; ctx.lineWidth=3; ctx.stroke();
    // fine contour lines over figure
    ctx.globalCompositeOperation="overlay";
    for(let y=h*0.2;y<h;y+=7){
      ctx.beginPath(); ctx.moveTo(0,y);
      for(let x=0;x<=w;x+=10){ ctx.lineTo(x,y+Math.sin(x/40+y/30)*2.5); }
      ctx.strokeStyle="rgba(255,255,255,.07)"; ctx.lineWidth=1; ctx.stroke();
    }
    ctx.globalCompositeOperation="source-over";
  }

  function paintAll(){
    document.querySelectorAll(".proj canvas.thumb").forEach(paintThumb);
    const p=document.getElementById("portrait-canvas"); if(p) paintPortrait(p);
  }

  let t;
  window.addEventListener("resize",()=>{ clearTimeout(t); t=setTimeout(paintAll,200); });
  if(document.readyState!=="loading") paintAll();
  else document.addEventListener("DOMContentLoaded",paintAll);
  // repaint once fonts/layout settle
  window.addEventListener("load",paintAll);
})();
