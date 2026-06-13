/* ============================================================
   hero.js — Three.js cursor-reactive liquid form
   A noise-displaced icosphere in vermilion, soft studio light,
   floating on the off-white page. Gentle, tasteful motion.
   ============================================================ */
(function(){
  const canvas = document.getElementById("hero-canvas");
  if(!canvas || !window.THREE) return;
  const reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  const isMobile = window.matchMedia("(max-width:760px)").matches;

  /* ---- compact 3D simplex noise (Gustavson, public domain) ---- */
  function Simplex(seed){
    this.g=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]];
    let s=seed||1, r=()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };
    this.p=[]; for(let i=0;i<256;i++)this.p[i]=Math.floor(r()*256);
    this.perm=[]; for(let i=0;i<512;i++)this.perm[i]=this.p[i&255];
  }
  Simplex.prototype.dot=function(g,x,y,z){return g[0]*x+g[1]*y+g[2]*z;};
  Simplex.prototype.n3=function(x,y,z){
    const F3=1/3,G3=1/6; let n0,n1,n2,n3;
    let s=(x+y+z)*F3, i=Math.floor(x+s), j=Math.floor(y+s), k=Math.floor(z+s);
    let t=(i+j+k)*G3, X0=i-t,Y0=j-t,Z0=k-t, x0=x-X0,y0=y-Y0,z0=z-Z0;
    let i1,j1,k1,i2,j2,k2;
    if(x0>=y0){ if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0;}else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1;}else{i1=0;j1=0;k1=1;i2=1;j2=0;k2=1;} }
    else{ if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1;}else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1;}else{i1=0;j1=1;k1=0;i2=1;j2=1;k2=0;} }
    let x1=x0-i1+G3,y1=y0-j1+G3,z1=z0-k1+G3, x2=x0-i2+2*G3,y2=y0-j2+2*G3,z2=z0-k2+2*G3, x3=x0-1+3*G3,y3=y0-1+3*G3,z3=z0-1+3*G3;
    let ii=i&255,jj=j&255,kk=k&255;
    let gi0=this.perm[ii+this.perm[jj+this.perm[kk]]]%12, gi1=this.perm[ii+i1+this.perm[jj+j1+this.perm[kk+k1]]]%12,
        gi2=this.perm[ii+i2+this.perm[jj+j2+this.perm[kk+k2]]]%12, gi3=this.perm[ii+1+this.perm[jj+1+this.perm[kk+1]]]%12;
    let t0=0.6-x0*x0-y0*y0-z0*z0; n0=t0<0?0:(t0*=t0,t0*t0*this.dot(this.g[gi0],x0,y0,z0));
    let t1=0.6-x1*x1-y1*y1-z1*z1; n1=t1<0?0:(t1*=t1,t1*t1*this.dot(this.g[gi1],x1,y1,z1));
    let t2=0.6-x2*x2-y2*y2-z2*z2; n2=t2<0?0:(t2*=t2,t2*t2*this.dot(this.g[gi2],x2,y2,z2));
    let t3=0.6-x3*x3-y3*y3-z3*z3; n3=t3<0?0:(t3*=t3,t3*t3*this.dot(this.g[gi3],x3,y3,z3));
    return 32*(n0+n1+n2+n3);
  };

  const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0,0,5.4);

  const detail = isMobile ? 18 : 36;
  const RADIUS = 1.45;
  const geo = new THREE.SphereGeometry(RADIUS, detail*2, detail);
  const basePos = geo.attributes.position.array.slice();
  const count = geo.attributes.position.count;

  const mat = new THREE.MeshStandardMaterial({ color:0xff4a1f, roughness:0.42, metalness:0.04, flatShading:false });
  const mesh = new THREE.Mesh(geo, mat);
  const group = new THREE.Group();
  group.add(mesh);
  scene.add(group);

  // lighting — soft studio
  scene.add(new THREE.AmbientLight(0xfff4e8, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3,4,5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd9c2, 0.9); rim.position.set(-4,-1,2); scene.add(rim);
  const fill = new THREE.PointLight(0xffffff, 0.5); fill.position.set(0,2,4); scene.add(fill);

  const simplex = new Simplex(7);

  function size(){
    const r = canvas.getBoundingClientRect();
    renderer.setSize(r.width, r.height, false);
    camera.aspect = r.width/r.height; camera.updateProjectionMatrix();
    // shift the form to the right on wide screens, center on narrow
    mesh.position.x = r.width>900 ? 1.55 : 0;
    mesh.position.y = r.width>900 ? 0.15 : 0.1;
    const scl = r.width>900 ? 1 : (r.width>560?0.86:0.7);
    mesh.scale.setScalar(scl);
  }
  size();
  window.addEventListener("resize", size);

  // cursor
  const target={x:0,y:0}, cur={x:0,y:0};
  let energy=0, targetEnergy=0;
  window.addEventListener("pointermove",(e)=>{
    target.x=(e.clientX/window.innerWidth-0.5);
    target.y=(e.clientY/window.innerHeight-0.5);
    targetEnergy=0.5;
  });
  window.addEventListener("pointerdown",()=>{targetEnergy=1;});
  window.addEventListener("pointerup",()=>{targetEnergy=0.5;});

  const v=new THREE.Vector3();
  function displace(time){
    const pos=geo.attributes.position;
    const amp=0.16 + energy*0.14;
    const freq=1.25;
    for(let i=0;i<count;i++){
      const ix=i*3;
      let x=basePos[ix],y=basePos[ix+1],z=basePos[ix+2];
      const nx=x/RADIUS, ny=y/RADIUS, nz=z/RADIUS;
      const n=simplex.n3(nx*freq+time, ny*freq+time*0.6, nz*freq);
      const d=RADIUS*(1+n*amp);
      pos.array[ix]=nx*d; pos.array[ix+1]=ny*d; pos.array[ix+2]=nz*d;
    }
    pos.needsUpdate=true;
    geo.computeVertexNormals();
  }

  let raf, t0=performance.now(), visible=true;
  function frame(now){
    raf=requestAnimationFrame(frame);
    if(!visible) return;
    const t=(now-t0)/1000;
    energy += (targetEnergy-energy)*0.05;
    targetEnergy *= 0.96;
    cur.x += (target.x-cur.x)*0.05;
    cur.y += (target.y-cur.y)*0.05;
    displace(t*0.22);
    mesh.rotation.y = t*0.12 + cur.x*0.8;
    mesh.rotation.x = cur.y*0.6;
    mesh.rotation.z = Math.sin(t*0.1)*0.05;
    renderer.render(scene,camera);
  }

  if(reduce){
    size(); displace(0); renderer.render(scene,camera);
  } else {
    size(); displace(0); renderer.render(scene,camera); // guaranteed first frame (rAF-independent)
    raf=requestAnimationFrame(frame);
    // pause when hero scrolled out of view
    const hero=document.getElementById("hero");
    if("IntersectionObserver" in window){
      new IntersectionObserver(es=>{ visible=es[0].isIntersecting; },{threshold:0}).observe(hero);
    }
  }
})();
