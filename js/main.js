/* ============================================================
   main.js — interactions
   GSAP scroll reveals · hero entrance · custom cursor ·
   mobile menu · liquid hover · header hide-on-scroll
   ============================================================ */
(function(){
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  const fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  /* ---- year ---- */
  const y=document.getElementById("year"); if(y) y.textContent=new Date().getFullYear();

  /* ---- mobile menu ---- */
  const menuBtn=document.querySelector(".menu-btn");
  function closeMenu(){ document.body.classList.remove("menu-open"); menuBtn&&menuBtn.setAttribute("aria-expanded","false"); }
  if(menuBtn){
    menuBtn.addEventListener("click",()=>{
      const open=document.body.classList.toggle("menu-open");
      menuBtn.setAttribute("aria-expanded",open?"true":"false");
    });
  }
  document.querySelectorAll('#mobileNav a, .nav a, .brand, .to-top').forEach(a=>{
    a.addEventListener("click",closeMenu);
  });

  /* ---- smooth anchor scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener("click",e=>{
      const id=a.getAttribute("href");
      if(id.length<2) return;
      const el=document.querySelector(id);
      if(el){ e.preventDefault(); el.scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"}); }
    });
  });

  /* ---- header hide on scroll down ---- */
  const head=document.querySelector(".site-head");
  let lastY=0;
  window.addEventListener("scroll",()=>{
    const cy=window.scrollY;
    if(head && !document.body.classList.contains("menu-open")){
      head.dataset.hidden = (cy>lastY && cy>240) ? "true" : "false";
    }
    lastY=cy;
  },{passive:true});

  /* ---- custom cursor (desktop) ---- */
  if(fine && !reduce){
    document.body.classList.add("cursor-on");
    const dot=document.querySelector(".cursor-dot"), ring=document.querySelector(".cursor-ring");
    let rx=0,ry=0,tx=0,ty=0;
    window.addEventListener("pointermove",e=>{
      tx=e.clientX; ty=e.clientY;
      dot.style.transform=`translate(${tx}px,${ty}px) translate(-50%,-50%)`;
    });
    (function loop(){ rx+=(tx-rx)*0.18; ry+=(ty-ry)*0.18;
      ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop); })();
    document.querySelectorAll('a,button,.proj,.srv').forEach(el=>{
      el.addEventListener("pointerenter",()=>ring.classList.add("is-hover"));
      el.addEventListener("pointerleave",()=>ring.classList.remove("is-hover"));
    });
  }

  /* ---- scroll reveals (IntersectionObserver — robust, no rAF dependency) ---- */
  (function(){
    const els=document.querySelectorAll(".reveal");
    if(!("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("is-in")); return; }
    const io=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); } });
    },{ threshold:0.1, rootMargin:"0px 0px -7% 0px" });
    els.forEach(e=>io.observe(e));
  })();

  /* ---- liquid hover on project thumbnails (SVG displacement pulse) ---- */
  if(!reduce){
    const disp=document.querySelector('#liquid feDisplacementMap');
    document.querySelectorAll(".proj").forEach(p=>{
      const wrap=p.querySelector(".thumb-wrap");
      p.addEventListener("pointerenter",()=>{
        wrap.style.filter="url(#liquid)";
        if(disp && window.gsap) gsap.fromTo(disp,{attr:{scale:0}},{attr:{scale:16},duration:0.7,ease:"power2.out"});
      });
      p.addEventListener("pointerleave",()=>{
        if(disp && window.gsap) gsap.to(disp,{attr:{scale:0},duration:0.5,ease:"power2.inOut",onComplete:()=>{ wrap.style.filter="none"; }});
        else wrap.style.filter="none";
      });
    });
  }
})();
