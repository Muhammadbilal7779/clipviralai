'use client'
import { useState, useEffect } from 'react'
import { Zap, Check, X, LogOut } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [page, setPage] = useState<'landing'|'login'|'register'|'dashboard'|'generate'|'shorts'|'pricing'|'admin'>('landing')
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [genForm, setGenForm] = useState({ videoUrl:'', style:'🔥 Viral Hook', count:2 })
  const [currentJob, setCurrentJob] = useState<any>(null)
  const [payMethod, setPayMethod] = useState('jazzcash')
  const [txId, setTxId] = useState('')
  const [payDone, setPayDone] = useState(false)
  const [adminData, setAdminData] = useState<any>(null)
  const [activatingId, setActivatingId] = useState('')

  useEffect(()=>{
    fetch('/api/auth/me').then(r=>r.json()).then(d=>{
      if(d.user){setUser(d.user);setPage('dashboard');loadJobs()}
    })
  },[])

  const loadJobs = async()=>{
    const r=await fetch('/api/jobs');const d=await r.json()
    if(d.jobs)setJobs(d.jobs)
  }

  const handleAuth=async(type:'login'|'register')=>{
    setError('');setLoading(true)
    const body=type==='register'?form:{email:form.email,password:form.password}
    const r=await fetch(`/api/auth/${type}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
    const d=await r.json();setLoading(false)
    if(d.error){setError(d.error);return}
    setUser(d.user);setPage('dashboard');loadJobs()
  }

  const handleLogout=async()=>{
    await fetch('/api/auth/logout',{method:'POST'})
    setUser(null);setPage('landing')
  }

  const handleGenerate=async()=>{
    if(!genForm.videoUrl){setError('Video URL daalna zaruri hai');return}
    setError('');setLoading(true)
    const r=await fetch('/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(genForm)})
    const d=await r.json();setLoading(false)
    if(d.error){setError(d.error);return}
    setCurrentJob(d.job);setPage('shorts')
    const interval=setInterval(async()=>{
      const r2=await fetch(`/api/jobs/${d.job.id}`);const d2=await r2.json()
      if(d2.job){setCurrentJob(d2.job);if(d2.job.status==='done'||d2.job.status==='failed'){clearInterval(interval);loadJobs()}}
    },2000)
  }

  const handlePayment=async()=>{
    if(!txId){setError('Transaction ID daalna zaruri hai');return}
    setLoading(true)
    const r=await fetch('/api/payment/manual',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({method:payMethod,transactionId:txId,amount:1})})
    const d=await r.json();setLoading(false)
    if(d.success)setPayDone(true)
  }

  const loadAdmin=async()=>{
    const r=await fetch('/api/admin/users');const d=await r.json()
    if(d.users)setAdminData(d)
  }

  const activateUser=async(uid:string)=>{
    setActivatingId(uid)
    await fetch('/api/payment/manual',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetUserId:uid,plan:'pro'})})
    loadAdmin();setActivatingId('')
  }

  const payDetails:any={
    jazzcash:{label:'JazzCash',detail:'03XX-XXXXXXX (apna number daalo .env mein)',icon:'📱'},
    easypaisa:{label:'EasyPaisa',detail:'03XX-XXXXXXX (apna number daalo .env mein)',icon:'💚'},
    skrill:{label:'Skrill',detail:'your@email.com (apna skrill email daalo)',icon:'💳'},
    bank:{label:'Bank Transfer',detail:'HBL / MCB — account .env mein set karein',icon:'🏦'},
  }

  const s={
    bg:'#0a0a0f',card:'#111120',border:'#1e1e2e',purple:'#7F77DD',lightPurple:'#AFA9EC',
    text:'#ffffff',muted:'#888888',green:'#1D9E75',red:'#ff8080',
  }
  const pBtn:React.CSSProperties={background:s.purple,color:'#fff',border:`1px solid ${s.purple}`,borderRadius:10,cursor:'pointer',fontWeight:600,fontSize:14,padding:'9px 20px'}
  const oBtn:React.CSSProperties={background:'transparent',color:s.muted,border:`1px solid #2e2e4e`,borderRadius:10,cursor:'pointer',fontSize:14,padding:'9px 20px'}
  const inp:React.CSSProperties={width:'100%',padding:'10px 14px',borderRadius:10,border:`1px solid #2e2e4e`,background:'#0d0d1a',color:s.text,fontSize:14,outline:'none',boxSizing:'border-box'}
  const lbl:React.CSSProperties={display:'block',fontSize:12,color:s.muted,marginBottom:6,fontWeight:500}

  // LANDING
  if(page==='landing') return(
    <div style={{minHeight:'100vh',background:s.bg,color:s.text,fontFamily:'Inter,sans-serif'}}>
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 32px',borderBottom:`1px solid ${s.border}`}}>
        <div style={{display:'flex',alignItems:'center',gap:8,fontWeight:700,fontSize:20}}>
          <Zap size={20} color={s.purple} fill={s.purple}/> ClipViralAI
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setPage('login')} style={oBtn}>Login</button>
          <button onClick={()=>setPage('register')} style={pBtn}>Free Shuru Karein</button>
        </div>
      </nav>
      <div style={{textAlign:'center',padding:'80px 24px 60px'}}>
        <div style={{display:'inline-block',background:'#1e1e2e',border:`1px solid ${s.purple}`,borderRadius:100,padding:'6px 16px',fontSize:13,color:s.lightPurple,marginBottom:24}}>
          🔥 Creators ka favourite tool
        </div>
        <h1 style={{fontSize:52,fontWeight:800,lineHeight:1.1,marginBottom:20,background:'linear-gradient(135deg,#fff 0%,#AFA9EC 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          Koi Bhi Video Ko<br/>Viral Short Banao
        </h1>
        <p style={{fontSize:18,color:s.muted,maxWidth:500,margin:'0 auto 36px',lineHeight:1.6}}>
          YouTube ya TikTok link paste karein — AI automatic <strong style={{color:s.lightPurple}}>viral shorts</strong> nikal deta hai. Sirf <strong style={{color:s.purple}}>$1 per week</strong>.
        </p>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>setPage('register')} style={{...pBtn,padding:'14px 32px',fontSize:16}}>Free mein try karein →</button>
          <button onClick={()=>setPage('pricing')} style={{...oBtn,padding:'14px 32px',fontSize:16}}>Plans dekhein</button>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,maxWidth:700,margin:'60px auto 0'}}>
          {[{icon:'⚡',t:'Instant Processing',d:'Link dein, minutes mein shorts ready'},{icon:'🎯',t:'AI Viral Detection',d:'Best moments auto detect hote hain'},{icon:'📤',t:'Direct Upload',d:'TikTok & YouTube pe seedha share'}].map(f=>(
            <div key={f.t} style={{background:'#111120',border:`1px solid ${s.border}`,borderRadius:16,padding:24,textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:12}}>{f.icon}</div>
              <div style={{fontWeight:600,marginBottom:6}}>{f.t}</div>
              <div style={{fontSize:13,color:s.muted}}>{f.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // AUTH
  if(page==='login'||page==='register') return(
    <div style={{minHeight:'100vh',background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:20,padding:40,width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,fontWeight:700,fontSize:22,color:s.text}}>
            <Zap size={20} color={s.purple} fill={s.purple}/> ClipViralAI
          </div>
          <p style={{color:s.muted,marginTop:8,fontSize:14}}>{page==='login'?'Wapas aagaye! Login karein':'Account banayein — bilkul free'}</p>
        </div>
        {page==='register'&&<div style={{marginBottom:16}}><label style={lbl}>Naam</label><input style={inp} placeholder="Ahmed Khan" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>}
        <div style={{marginBottom:16}}><label style={lbl}>Email</label><input style={inp} type="email" placeholder="ahmed@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <div style={{marginBottom:24}}><label style={lbl}>Password</label><input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
        {error&&<div style={{background:'#2a0f0f',border:'1px solid #e24b4a',borderRadius:10,padding:'10px 14px',color:s.red,fontSize:13,marginBottom:16}}>{error}</div>}
        <button onClick={()=>handleAuth(page)} disabled={loading} style={{...pBtn,width:'100%',padding:'12px',fontSize:15,opacity:loading?0.7:1}}>
          {loading?'Please wait...':(page==='login'?'Login':'Account Banao')}
        </button>
        <p style={{textAlign:'center',marginTop:20,fontSize:13,color:s.muted}}>
          {page==='login'?'Pehli baar? ':'Pehle se account hai? '}
          <button onClick={()=>{setPage(page==='login'?'register':'login');setError('')}} style={{color:s.purple,background:'none',border:'none',cursor:'pointer',fontWeight:600}}>
            {page==='login'?'Register karein':'Login karein'}
          </button>
        </p>
        <p style={{textAlign:'center',marginTop:8,fontSize:13}}>
          <button onClick={()=>setPage('landing')} style={{color:'#666',background:'none',border:'none',cursor:'pointer'}}>← Wapas</button>
        </p>
      </div>
    </div>
  )

  // PRICING
  if(page==='pricing') return(
    <div style={{minHeight:'100vh',background:s.bg,color:s.text,fontFamily:'Inter,sans-serif',padding:32}}>
      <div style={{maxWidth:860,margin:'0 auto'}}>
        <button onClick={()=>setPage(user?'dashboard':'landing')} style={{color:s.muted,background:'none',border:'none',cursor:'pointer',marginBottom:32,fontSize:14}}>← Wapas</button>
        <h2 style={{fontSize:36,fontWeight:700,marginBottom:8}}>Simple Pricing</h2>
        <p style={{color:s.muted,marginBottom:40}}>Sirf $1 mein 8 viral shorts har hafte</p>
        {payDone?(
          <div style={{background:'#0d2a1e',border:`1px solid ${s.green}`,borderRadius:20,padding:40,textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>✅</div>
            <h3 style={{color:s.green,marginBottom:12}}>Payment Request Send Ho Gaya!</h3>
            <p style={{color:s.muted}}>Admin 1-2 ghante mein aapka plan activate kar dega.</p>
            <button onClick={()=>setPage(user?'dashboard':'register')} style={{...pBtn,marginTop:24,padding:'12px 32px'}}>{user?'Dashboard pe jao':'Register karo'}</button>
          </div>
        ):(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:20,padding:32}}>
              <h3 style={{fontSize:20,fontWeight:600,marginBottom:8}}>Free</h3>
              <div style={{fontSize:36,fontWeight:700,marginBottom:4}}>$0</div>
              <p style={{color:s.muted,fontSize:13,marginBottom:24}}>Hamesha free</p>
              {['2 shorts/week','Auto captions','YouTube + TikTok'].map(f=>(
                <div key={f} style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,fontSize:14}}><Check size={14} color={s.green}/>{f}</div>
              ))}
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,fontSize:14,color:'#555'}}><X size={14} color="#555"/>Watermark hoga</div>
              <button onClick={()=>setPage('register')} style={{...oBtn,width:'100%',marginTop:20,padding:'11px'}}>Shuru karein</button>
            </div>
            <div style={{background:'#13112a',border:`2px solid ${s.purple}`,borderRadius:20,padding:32}}>
              <div style={{background:s.purple,color:'#fff',fontSize:11,padding:'3px 10px',borderRadius:100,display:'inline-block',marginBottom:12,fontWeight:600}}>🔥 POPULAR</div>
              <h3 style={{fontSize:20,fontWeight:600,marginBottom:8}}>Pro</h3>
              <div style={{fontSize:36,fontWeight:700,marginBottom:4}}>$1 <span style={{fontSize:16,fontWeight:400,color:s.muted}}>/week</span></div>
              <p style={{color:s.muted,fontSize:13,marginBottom:20}}>8 viral shorts guaranteed</p>
              {['8 shorts/week','Advanced AI detection','Urdu/English captions','No watermark','Direct TikTok/YT upload'].map(f=>(
                <div key={f} style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,fontSize:14}}><Check size={14} color={s.purple}/>{f}</div>
              ))}
              <div style={{marginTop:20,borderTop:'1px solid #2e2e4e',paddingTop:20}}>
                <p style={{fontSize:13,color:s.muted,marginBottom:12}}>Payment method chunein:</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
                  {Object.entries(payDetails).map(([key,val]:any)=>(
                    <button key={key} onClick={()=>setPayMethod(key)} style={{padding:'8px 10px',borderRadius:10,fontSize:12,cursor:'pointer',textAlign:'left',background:payMethod===key?'#2a244a':'transparent',border:`1px solid ${payMethod===key?s.purple:'#2e2e4e'}`,color:payMethod===key?s.lightPurple:s.muted}}>
                      {val.icon} {val.label}
                    </button>
                  ))}
                </div>
                <div style={{background:'#1a1830',borderRadius:12,padding:'14px 16px',marginBottom:16,fontSize:13}}>
                  <p style={{color:s.muted,marginBottom:6}}>Yahan $1 bhejein:</p>
                  <p style={{color:s.lightPurple,fontWeight:600,wordBreak:'break-all'}}>{payDetails[payMethod]?.detail}</p>
                </div>
                <input style={{...inp,marginBottom:10}} placeholder="Transaction ID / Reference number" value={txId} onChange={e=>setTxId(e.target.value)}/>
                {error&&<p style={{color:s.red,fontSize:12,marginBottom:10}}>{error}</p>}
                <button onClick={handlePayment} disabled={loading} style={{...pBtn,width:'100%',padding:'11px',opacity:loading?0.7:1}}>
                  {loading?'Sending...':'✅ Payment Confirm Karein'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // DASHBOARD SHELL
  if(['dashboard','generate','shorts','admin'].includes(page)){
    const sub=user?.subscription
    return(
      <div style={{minHeight:'100vh',background:s.bg,color:s.text,fontFamily:'Inter,sans-serif'}}>
        <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 24px',borderBottom:`1px solid ${s.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:8,fontWeight:700,fontSize:18}}>
            <Zap size={18} color={s.purple} fill={s.purple}/> ClipViralAI
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{fontSize:13,color:s.muted}}>{user?.name}</span>
            <span style={{background:sub?.plan==='pro'?'#13112a':'#1a1a2e',border:`1px solid ${sub?.plan==='pro'?s.purple:'#333'}`,borderRadius:100,padding:'3px 12px',fontSize:12,color:sub?.plan==='pro'?s.lightPurple:'#666'}}>
              {sub?.plan==='pro'?`⚡ Pro • ${sub?.shortsLeft} left`:'🆓 Free'}
            </span>
            <button onClick={handleLogout} style={{...oBtn,padding:'6px 12px',fontSize:12,display:'flex',alignItems:'center',gap:4}}><LogOut size={12}/> Logout</button>
          </div>
        </nav>
        <div style={{display:'flex',borderBottom:`1px solid ${s.border}`,padding:'0 24px',overflowX:'auto'}}>
          {[{k:'dashboard',l:'📊 Dashboard'},{k:'generate',l:'⚡ Shorts Banao'},{k:'shorts',l:'🎬 Meri Shorts'},{k:'pricing',l:'💳 Plans'},...(user?.isAdmin?[{k:'admin',l:'👑 Admin'}]:[])].map(t=>(
            <button key={t.k} onClick={()=>{setPage(t.k as any);if(t.k==='shorts')loadJobs();if(t.k==='admin')loadAdmin()}} style={{padding:'12px 16px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:page===t.k?s.lightPurple:s.muted,borderBottom:page===t.k?`2px solid ${s.purple}`:'2px solid transparent',fontWeight:page===t.k?600:400,whiteSpace:'nowrap'}}>
              {t.l}
            </button>
          ))}
        </div>

        <div style={{padding:24,maxWidth:900,margin:'0 auto'}}>

          {/* DASHBOARD */}
          {page==='dashboard'&&(
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              <div style={{background:'#13112a',border:`1px solid #3d3770`,borderRadius:16,padding:'14px 20px',display:'flex',alignItems:'center',gap:12}}>
                <div style={{fontSize:20}}>⚡</div>
                <div style={{flex:1}}>
                  <span style={{color:s.lightPurple,fontWeight:600}}>
                    {sub?.plan==='pro'?`Pro Plan Active — ${sub?.shortsLeft}/8 shorts remaining this week`:'Free Plan — 2 shorts/week'}
                  </span>
                </div>
                {sub?.plan!=='pro'&&<button onClick={()=>setPage('pricing')} style={{...pBtn,padding:'6px 14px',fontSize:12}}>Upgrade $1 →</button>}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16}}>
                {[{l:'Total Shorts',v:jobs.reduce((a,j)=>a+(j.shorts?.length||0),0)},{l:'Videos Processed',v:jobs.length},{l:'This Week Used',v:(sub?.shortsTotal||0)-(sub?.shortsLeft||0)}].map(m=>(
                  <div key={m.l} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:16,padding:20}}>
                    <div style={{color:s.muted,fontSize:13,marginBottom:6}}>{m.l}</div>
                    <div style={{fontSize:28,fontWeight:700}}>{m.v}</div>
                  </div>
                ))}
              </div>
              {jobs.length===0?(
                <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:20,padding:40,textAlign:'center'}}>
                  <div style={{fontSize:48,marginBottom:16}}>🎬</div>
                  <h3 style={{fontWeight:600,marginBottom:8}}>Koi video nahi abhi tak</h3>
                  <p style={{color:s.muted,fontSize:14,marginBottom:20}}>Pehla video link paste karein aur shorts banao!</p>
                  <button onClick={()=>setPage('generate')} style={{...pBtn,padding:'10px 24px'}}>⚡ Pehli Short Banao</button>
                </div>
              ):(
                <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:20,padding:24}}>
                  <h3 style={{fontWeight:600,marginBottom:16}}>Recent Jobs</h3>
                  {jobs.slice(0,5).map((j:any)=>(
                    <div key={j.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:`1px solid ${s.border}`}}>
                      <div style={{width:40,height:40,background:'#1e1e2e',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                        {j.platform==='youtube'?'▶️':'🎵'}
                      </div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,marginBottom:2}}>{j.videoUrl.substring(0,55)}...</div>
                        <div style={{fontSize:12,color:s.muted}}>{j.shorts?.length||0} shorts • {j.style}</div>
                        {j.status==='processing'&&<div style={{height:3,background:'#1e1e2e',borderRadius:2,marginTop:6,overflow:'hidden'}}><div style={{width:`${j.progress}%`,height:'100%',background:s.purple,transition:'width 0.5s'}}/></div>}
                      </div>
                      <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:j.status==='done'?'#0d2a1e':j.status==='failed'?'#2a0f0f':'#1a1830',color:j.status==='done'?s.green:j.status==='failed'?s.red:s.lightPurple,border:`1px solid ${j.status==='done'?s.green:j.status==='failed'?'#e24b4a':'#534AB7'}`}}>
                        {j.status==='done'?'✓ Done':j.status==='failed'?'✗ Failed':`${j.progress}%`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* GENERATE */}
          {page==='generate'&&(
            <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:20,padding:32}}>
              <h2 style={{fontWeight:700,fontSize:22,marginBottom:6}}>⚡ Viral Short Banao</h2>
              <p style={{color:s.muted,fontSize:14,marginBottom:28}}>YouTube ya TikTok link paste karein — AI baaki sab karega</p>
              <label style={lbl}>Video URL (YouTube / TikTok)</label>
              <input style={{...inp,marginBottom:20}} placeholder="https://youtube.com/watch?v=... ya https://tiktok.com/@..." value={genForm.videoUrl} onChange={e=>setGenForm({...genForm,videoUrl:e.target.value})}/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
                <div><label style={lbl}>Style</label>
                  <select style={inp} value={genForm.style} onChange={e=>setGenForm({...genForm,style:e.target.value})}>
                    <option>🔥 Viral Hook</option><option>😂 Funny / Comedy</option><option>💡 Educational</option><option>🏆 Motivational</option><option>📰 News Highlights</option>
                  </select>
                </div>
                <div><label style={lbl}>Shorts count (aapke paas {sub?.shortsLeft||0} bacha hai)</label>
                  <select style={inp} value={genForm.count} onChange={e=>setGenForm({...genForm,count:parseInt(e.target.value)})}>
                    {[1,2,3,4,5,6,7,8].filter(n=>n<=(sub?.shortsLeft||0)).map(n=><option key={n} value={n}>{n} shorts</option>)}
                  </select>
                </div>
              </div>
              {error&&<div style={{background:'#2a0f0f',border:'1px solid #e24b4a',borderRadius:10,padding:'10px 14px',color:s.red,fontSize:13,marginBottom:16}}>{error}</div>}
              {(sub?.shortsLeft||0)===0?(
                <div style={{background:'#1a1830',border:`1px solid #534AB7`,borderRadius:12,padding:20,textAlign:'center'}}>
                  <p style={{color:s.lightPurple,marginBottom:12}}>Shorts khatam! Plan upgrade karein.</p>
                  <button onClick={()=>setPage('pricing')} style={{...pBtn,padding:'10px 24px'}}>$1 mein Upgrade →</button>
                </div>
              ):(
                <button onClick={handleGenerate} disabled={loading} style={{...pBtn,width:'100%',padding:'14px',fontSize:16,opacity:loading?0.7:1}}>
                  {loading?'⚡ Processing...':'⚡ '+genForm.count+' Shorts Generate Karo'}
                </button>
              )}
            </div>
          )}

          {/* SHORTS */}
          {page==='shorts'&&(
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              {currentJob&&currentJob.status==='processing'&&(
                <div style={{background:'#13112a',border:`1px solid ${s.purple}`,borderRadius:20,padding:28}}>
                  <h3 style={{fontWeight:600,marginBottom:6}}>🔄 Processing ho raha hai...</h3>
                  <p style={{color:s.muted,fontSize:14,marginBottom:16}}>AI viral moments detect kar raha hai — please wait</p>
                  <div style={{height:6,background:'#1e1e2e',borderRadius:3,overflow:'hidden',marginBottom:8}}>
                    <div style={{width:`${currentJob.progress}%`,height:'100%',background:`linear-gradient(90deg,${s.purple},${s.lightPurple})`,transition:'width 0.5s',borderRadius:3}}/>
                  </div>
                  <p style={{fontSize:13,color:s.lightPurple}}>{currentJob.progress}% complete</p>
                </div>
              )}
              {jobs.length===0&&!currentJob&&(
                <div style={{textAlign:'center',padding:60,background:s.card,borderRadius:20,border:`1px solid ${s.border}`}}>
                  <div style={{fontSize:48,marginBottom:16}}>🎬</div>
                  <p style={{color:s.muted,marginBottom:20}}>Abhi tak koi short nahi bani</p>
                  <button onClick={()=>setPage('generate')} style={{...pBtn,padding:'10px 24px'}}>Short Banao</button>
                </div>
              )}
              {jobs.map((job:any)=>(
                <div key={job.id} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:20,padding:24}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                    <div>
                      <h3 style={{fontWeight:600,fontSize:16,marginBottom:4}}>{job.platform==='youtube'?'▶️':'🎵'} {job.style}</h3>
                      <p style={{color:s.muted,fontSize:12}}>{job.videoUrl.substring(0,65)}...</p>
                    </div>
                    <span style={{fontSize:12,padding:'4px 12px',borderRadius:100,background:job.status==='done'?'#0d2a1e':'#1a1830',color:job.status==='done'?s.green:s.lightPurple,border:`1px solid ${job.status==='done'?s.green:'#534AB7'}`}}>
                      {job.status==='done'?'✓ Ready':`${job.progress}%`}
                    </span>
                  </div>
                  {job.shorts&&job.shorts.length>0&&(
                    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                      {job.shorts.map((sh:any,i:number)=>(
                        <div key={sh.id} style={{background:'#1a1830',borderRadius:12,overflow:'hidden'}}>
                          <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,background:'#13112a'}}>
                            {['🔥','⚡','💥','🎯','✨','🚀','💡','🏆'][i%8]}
                          </div>
                          <div style={{padding:'8px 10px'}}>
                            <div style={{fontSize:12,fontWeight:500,marginBottom:3}}>Short #{i+1}</div>
                            <div style={{fontSize:11,color:s.purple,marginBottom:5}}>🎯 {sh.viralScore}% viral</div>
                            <p style={{fontSize:10,color:s.muted,marginBottom:8,lineHeight:1.4}}>{sh.caption}</p>
                            <a href={sh.filename} download style={{display:'block',background:s.purple,color:'#fff',borderRadius:8,padding:'5px 8px',fontSize:11,textAlign:'center',textDecoration:'none'}}>⬇ Download</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ADMIN */}
          {page==='admin'&&adminData&&(
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
                {[{l:'Total Users',v:adminData.stats.totalUsers},{l:'Pro Users',v:adminData.stats.proUsers},{l:'Weekly Revenue',v:`$${adminData.stats.weeklyRevenue}`},{l:'Shorts Generated',v:adminData.stats.totalShortsGenerated}].map(m=>(
                  <div key={m.l} style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:16,padding:20}}>
                    <div style={{color:s.muted,fontSize:12,marginBottom:6}}>{m.l}</div>
                    <div style={{fontSize:24,fontWeight:700,color:s.lightPurple}}>{m.v}</div>
                  </div>
                ))}
              </div>
              <div style={{background:s.card,border:`1px solid ${s.border}`,borderRadius:20,padding:24}}>
                <h3 style={{fontWeight:600,marginBottom:20}}>👥 All Users</h3>
                {adminData.users.map((u:any)=>(
                  <div key={u.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:`1px solid ${s.border}`}}>
                    <div style={{width:36,height:36,background:'#1e1e2e',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:600,color:s.lightPurple}}>{u.name.charAt(0).toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:500}}>{u.name}</div>
                      <div style={{fontSize:12,color:s.muted}}>{u.email} • {u.jobs?.length||0} jobs • {u.subscription?.shortsLeft||0} shorts left</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span style={{fontSize:11,padding:'3px 10px',borderRadius:100,background:u.subscription?.plan==='pro'?'#0d2a1e':'#1a1a2e',color:u.subscription?.plan==='pro'?s.green:'#666',border:`1px solid ${u.subscription?.plan==='pro'?s.green:'#333'}`}}>{u.subscription?.plan||'free'}</span>
                      {u.subscription?.plan!=='pro'&&<button onClick={()=>activateUser(u.id)} disabled={activatingId===u.id} style={{...pBtn,padding:'4px 12px',fontSize:11,opacity:activatingId===u.id?0.7:1}}>{activatingId===u.id?'...':'✓ Activate Pro'}</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    )
  }

  return null
}
