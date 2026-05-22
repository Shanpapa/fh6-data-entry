import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { CATEGORIES, EFFECT_FIELDS } from './lib/categories'

// ── THEME ─────────────────────────────────────────────────
const t = {
  bg:'#0a0a0c', surf:'#141416', surf2:'#1c1c20', surf3:'#242428',
  border:'#2c2c32', borderHi:'#3c3c44',
  accent:'#f97316', accentDim:'rgba(249,115,22,0.12)',
  blue:'#38bdf8', green:'#4ade80', red:'#f87171', yellow:'#fbbf24',
  text:'#e4e4e7', dim:'#71717a', mid:'#a1a1aa',
  head:"'Barlow Condensed', sans-serif",
  mono:"'Space Mono', monospace",
}

// ── UI ATOMS ──────────────────────────────────────────────
const s = (base, over={}) => ({ ...base, ...over })

const Input = ({ value, onChange, placeholder, type='text', step }) => (
  <input type={type} value={value ?? ''} step={step}
    placeholder={placeholder || ''}
    onChange={e => onChange(type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value)}
    style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
      padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
      width:'100%', outline:'none' }}
  />
)

const Select = ({ value, onChange, options, placeholder }) => (
  <select value={value ?? ''} onChange={e => onChange(e.target.value)}
    style={{ background:t.surf3, border:`1px solid ${t.border}`, color: value ? t.text : t.dim,
      padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
      width:'100%', outline:'none', cursor:'pointer' }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
)

const Btn = ({ children, onClick, variant='primary', small, disabled }) => {
  const bg = { primary:t.accent, ghost:'transparent', danger:'transparent', green:t.green }[variant]
  const color = { primary:'#000', ghost:t.dim, danger:t.red, green:'#000' }[variant]
  const border = { primary:'none', ghost:`1px solid ${t.border}`, danger:`1px solid ${t.red}44`, green:'none' }[variant]
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background: disabled ? t.surf2 : bg, border, color: disabled ? t.dim : color,
        padding: small ? '5px 12px' : '8px 18px',
        borderRadius:4, fontSize: small ? 10 : 11, fontFamily:t.mono,
        fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em',
        cursor: disabled ? 'default' : 'pointer', transition:'opacity 0.15s',
        opacity: disabled ? 0.5 : 1 }}>
      {children}
    </button>
  )
}

const Label = ({ children }) => (
  <div style={{ fontSize:14, fontFamily:t.mono, color:t.dim, textTransform:'uppercase',
    letterSpacing:'0.12em', marginBottom:4 }}>{children}</div>
)

const Tag = ({ children, color }) => (
  <span style={{ background:`${color}18`, border:`1px solid ${color}44`,
    borderRadius:3, padding:'2px 8px', fontSize:14, fontFamily:t.mono, color }}>
    {children}
  </span>
)

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100,
    display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
    <div style={{ background:t.surf, border:`1px solid ${t.borderHi}`, borderRadius:8,
      width:'100%', maxWidth: wide ? 640 : 480, maxHeight:'90vh', overflow:'auto' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'14px 20px', borderBottom:`1px solid ${t.border}` }}>
        <span style={{ fontFamily:t.head, fontSize:19, fontWeight:700,
          textTransform:'uppercase', letterSpacing:'0.06em', color:t.text }}>{title}</span>
        <button onClick={onClose} style={{ background:'none', border:'none',
          color:t.dim, fontSize:18, cursor:'pointer', lineHeight:1 }}>✕</button>
      </div>
      <div style={{ padding:20 }}>{children}</div>
    </div>
  </div>
)

const Row = ({ label, children }) => (
  <div style={{ marginBottom:14 }}><Label>{label}</Label>{children}</div>
)

const HR = () => <div style={{ borderTop:`1px solid ${t.border}`, margin:'16px 0' }} />

// ── LOGIN ─────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [pass,  setPass]  = useState('')
  const [err,   setErr]   = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true); setErr('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setErr(error.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:t.bg }}>
      <div style={{ width:340 }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:4, height:28, background:t.accent, borderRadius:2 }} />
            <span style={{ fontFamily:t.head, fontSize:28, fontWeight:800,
              textTransform:'uppercase', letterSpacing:'0.08em', color:t.text }}>
              FH6 Data Entry
            </span>
          </div>
          <div style={{ fontSize:13, color:t.dim, fontFamily:t.mono, marginLeft:14 }}>
            Parts catalog tool
          </div>
        </div>
        <div style={{ background:t.surf, border:`1px solid ${t.border}`,
          borderRadius:8, padding:24 }}>
          <Row label="Email"><Input value={email} onChange={setEmail} placeholder="email@example.com" /></Row>
          <Row label="Password"><Input value={pass} onChange={setPass} type="password" placeholder="••••••••" /></Row>
          {err && <div style={{ color:t.red, fontSize:13, fontFamily:t.mono, marginBottom:12 }}>{err}</div>}
          <Btn onClick={submit} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Btn>
        </div>
      </div>
    </div>
  )
}

// ── ADD / EDIT CAR MODAL ──────────────────────────────────
function CarModal({ car, onClose, onSaved, userId }) {
  const isEdit = !!car?.id
  const [form, setForm] = useState({
    make: car?.make || '', model: car?.model || '', year: car?.year || '',
    stock_class: car?.stock_class || '', stock_pi: car?.stock_pi || '',
    stock_drivetrain: car?.stock_drivetrain || '',
  })
  const [err, setErr]     = useState('')
  const [saving, setSaving] = useState(false)

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const save = async () => {
    if (!form.make || !form.model || !form.year) { setErr('Make, model and year are required'); return }
    setSaving(true); setErr('')
    const payload = { ...form, year: parseInt(form.year),
      stock_pi: form.stock_pi ? parseInt(form.stock_pi) : null,
      added_by: userId }
    const { error } = isEdit
      ? await supabase.from('cars').update(payload).eq('id', car.id)
      : await supabase.from('cars').insert(payload)
    if (error) { setErr(error.message); setSaving(false); return }
    onSaved()
  }

  return (
    <Modal title={isEdit ? 'Edit Car' : 'Add Car'} onClose={onClose}>
      <Row label="Make"><Input value={form.make} onChange={v => upd('make',v)} placeholder="Nissan" /></Row>
      <Row label="Model"><Input value={form.model} onChange={v => upd('model',v)} placeholder="Silvia K's" /></Row>
      <Row label="Year"><Input value={form.year} onChange={v => upd('year',v)} type="number" placeholder="1999" /></Row>
      <HR />
      <Row label="Stock Class">
        <Select value={form.stock_class} onChange={v => upd('stock_class',v)}
          placeholder="— select —" options={['D','C','B','A','S1','S2','X']} />
      </Row>
      <Row label="Stock PI"><Input value={form.stock_pi} onChange={v => upd('stock_pi',v)} type="number" placeholder="499" /></Row>
      <Row label="Stock Drivetrain">
        <Select value={form.stock_drivetrain} onChange={v => upd('stock_drivetrain',v)}
          placeholder="— select —" options={['RWD','FWD','AWD']} />
      </Row>
      {err && <div style={{ color:t.red, fontSize:13, fontFamily:t.mono, marginBottom:12 }}>{err}</div>}
      <div style={{ display:'flex', gap:8 }}>
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Btn>
        <Btn onClick={onClose} variant="ghost">Cancel</Btn>
      </div>
    </Modal>
  )
}

// ── PART FORM MODAL ───────────────────────────────────────
function PartModal({ part, carId, prefillCat, prefillSub, onClose, onSaved, userId }) {
  const isEdit = !!part?.id
  const allCats = Object.keys(CATEGORIES)
  const [cat,  setCat]  = useState(part?.category    || prefillCat || allCats[0])
  const [sub,  setSub]  = useState(part?.subcategory || prefillSub || '')
  const [customCat, setCustomCat] = useState('')
  const [customSub, setCustomSub] = useState('')
  const [useCustomCat, setUseCustomCat] = useState(false)
  const [useCustomSub, setUseCustomSub] = useState(false)

  const [name,     setName]     = useState(part?.name     || '')
  const [isStock,  setIsStock]  = useState(part?.is_stock || false)
  const [piChange, setPiChange] = useState(part?.pi_change ?? '')
  const [priceCr,  setPriceCr]  = useState(part?.price_cr ?? '')
  const [effects,  setEffects]  = useState(part?.effects  || {})
  const [err,      setErr]      = useState('')
  const [saving,   setSaving]   = useState(false)

  const subs = CATEGORIES[cat] || []
  const finalCat = useCustomCat ? customCat : cat
  const finalSub = useCustomSub ? customSub : sub

  const setEffect = (k, v) => setEffects(p => {
    const n = { ...p }
    if (v === '' || v === null || v === undefined) { delete n[k]; return n }
    n[k] = v
    return n
  })

  const save = async () => {
    if (!name)     { setErr('Part name is required'); return }
    if (!finalSub) { setErr('Subcategory is required'); return }
    setSaving(true); setErr('')
    const payload = {
      car_id: carId, category: finalCat, subcategory: finalSub,
      name, is_stock: isStock,
      pi_change: piChange !== '' ? parseInt(piChange) : 0,
      price_cr: priceCr !== '' ? parseInt(priceCr) : null,
      effects, added_by: userId,
    }
    const { error } = isEdit
      ? await supabase.from('car_parts').update(payload).eq('id', part.id)
      : await supabase.from('car_parts').insert(payload)
    if (error) { setErr(error.message); setSaving(false); return }
    onSaved()
  }

  return (
    <Modal title={isEdit ? 'Edit Part' : 'Add Part'} onClose={onClose} wide>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
        <Row label="Category">
          {!useCustomCat
            ? <Select value={cat} onChange={v => { setCat(v); setSub('') }}
                options={allCats} />
            : <Input value={customCat} onChange={setCustomCat} placeholder="New category name" />
          }
          <button onClick={() => setUseCustomCat(p => !p)}
            style={{ background:'none', border:'none', color:t.blue, fontSize:14,
              fontFamily:t.mono, cursor:'pointer', marginTop:4, padding:0 }}>
            {useCustomCat ? '← Use predefined' : '+ New category'}
          </button>
        </Row>
        <Row label="Subcategory">
          {!useCustomSub
            ? <Select value={sub} onChange={setSub} placeholder="— select —"
                options={subs} />
            : <Input value={customSub} onChange={setCustomSub} placeholder="New subcategory name" />
          }
          <button onClick={() => setUseCustomSub(p => !p)}
            style={{ background:'none', border:'none', color:t.blue, fontSize:14,
              fontFamily:t.mono, cursor:'pointer', marginTop:4, padding:0 }}>
            {useCustomSub ? '← Use predefined' : '+ New subcategory'}
          </button>
        </Row>
      </div>
      <Row label="Part Name"><Input value={name} onChange={setName} placeholder="Sport fék" /></Row>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 20px' }}>
        <Row label="PI Change">
          <Input value={piChange} onChange={setPiChange} type="number" step={1} placeholder="0" />
        </Row>
        <Row label="Price (CR)">
          <Input value={priceCr} onChange={setPriceCr} type="number" step={100} placeholder="1300" />
        </Row>
        <Row label="Is Stock?">
          <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:6 }}>
            <input type="checkbox" checked={isStock} onChange={e => setIsStock(e.target.checked)}
              style={{ accentColor:t.accent, width:14, height:14 }} />
            <span style={{ fontSize:13, color:t.mid, fontFamily:t.mono }}>Stock / base part</span>
          </div>
        </Row>
      </div>
      <HR />
      <div style={{ fontSize:13, color:t.dim, fontFamily:t.mono,
        textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>
        Effects — fill in what you know, leave the rest empty
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
        {EFFECT_FIELDS.map(f => (
          <Row key={f.key} label={f.label + (f.hint ? ` (${f.hint})` : '')}>
            {f.type === 'bool'
              ? <div style={{ display:'flex', alignItems:'center', gap:8, paddingTop:6 }}>
                  <input type="checkbox"
                    checked={!!effects[f.key]}
                    onChange={e => setEffect(f.key, e.target.checked || undefined)}
                    style={{ accentColor:t.accent, width:14, height:14 }} />
                  <span style={{ fontSize:13, color:t.mid, fontFamily:t.mono }}>Yes</span>
                </div>
              : f.type === 'select'
              ? <Select value={effects[f.key] || ''} onChange={v => setEffect(f.key, v || undefined)}
                  placeholder="— none —" options={f.options} />
              : <Input value={effects[f.key] ?? ''} type="number" step={f.step}
                  onChange={v => setEffect(f.key, v === '' ? undefined : v)} />
            }
          </Row>
        ))}
      </div>
      {err && <div style={{ color:t.red, fontSize:13, fontFamily:t.mono, margin:'8px 0' }}>{err}</div>}
      <HR />
      <div style={{ display:'flex', gap:8 }}>
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Add Part'}</Btn>
        <Btn onClick={onClose} variant="ghost">Cancel</Btn>
      </div>
    </Modal>
  )
}

// ── CAR DETAIL VIEW ───────────────────────────────────────
function CarDetail({ car, userId, onBack }) {
  const [parts,   setParts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // null | 'add' | {part}
  const [prefCat, setPrefCat] = useState('')
  const [prefSub, setPrefSub] = useState('')
  const [expanded, setExpanded] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('car_parts')
      .select('*').eq('car_id', car.id).order('category').order('subcategory').order('name')
    setParts(data || [])
    setLoading(false)
  }, [car.id])

  useEffect(() => { load() }, [load])

  const verify = async (part) => {
    await supabase.from('car_parts').update({ verified: !part.verified }).eq('id', part.id)
    load()
  }

  const deletePart = async (id) => {
    if (!confirm('Delete this part?')) return
    await supabase.from('car_parts').delete().eq('id', id)
    load()
  }

  // Group by category → subcategory
  const grouped = {}
  parts.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = {}
    if (!grouped[p.category][p.subcategory]) grouped[p.category][p.subcategory] = []
    grouped[p.category][p.subcategory].push(p)
  })

  const toggleCat = (cat) => setExpanded(p => ({ ...p, [cat]: !p[cat] }))

  const openAdd = (cat='', sub='') => {
    setPrefCat(cat); setPrefSub(sub); setModal('add')
  }

  const dtColor = { RWD:t.accent, FWD:t.blue, AWD:t.green }[car.stock_drivetrain] || t.dim

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:t.surf, borderBottom:`1px solid ${t.border}`,
        padding:'12px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:`1px solid ${t.border}`,
          color:t.dim, padding:'5px 12px', borderRadius:4, fontSize:13,
          fontFamily:t.mono, cursor:'pointer', textTransform:'uppercase' }}>← Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:t.head, fontSize:24, fontWeight:800,
            textTransform:'uppercase', letterSpacing:'0.05em', color:t.text }}>
            {car.year} {car.make} {car.model}
          </div>
          <div style={{ display:'flex', gap:6, marginTop:4 }}>
            {car.stock_class && <Tag color={t.yellow}>{car.stock_class} {car.stock_pi}</Tag>}
            {car.stock_drivetrain && <Tag color={dtColor}>{car.stock_drivetrain}</Tag>}
            <Tag color={t.dim}>{parts.length} parts</Tag>
            <Tag color={t.green}>{parts.filter(p=>p.verified).length} verified</Tag>
          </div>
        </div>
        <Btn onClick={() => openAdd()}>+ Add Part</Btn>
      </div>

      {/* Parts list */}
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {loading && <div style={{ color:t.dim, fontSize:14, fontFamily:t.mono }}>Loading...</div>}

        {/* Category groups from DB */}
        {Object.entries(grouped).map(([cat, subs]) => (
          <div key={cat} style={{ marginBottom:8 }}>
            <div onClick={() => toggleCat(cat)}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                background:t.surf2, border:`1px solid ${t.border}`, borderRadius:6,
                padding:'10px 14px', cursor:'pointer', marginBottom: expanded[cat]?0:0 }}>
              <span style={{ fontFamily:t.head, fontSize:14, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.06em', color:t.accent }}>
                {cat}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14, color:t.dim, fontFamily:t.mono }}>
                  {Object.values(subs).flat().length} parts
                </span>
                <span style={{ color:t.dim, fontSize:14 }}>{expanded[cat] ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded[cat] && (
              <div style={{ border:`1px solid ${t.border}`, borderTop:'none',
                borderRadius:'0 0 6px 6px', overflow:'hidden' }}>
                {Object.entries(subs).map(([sub, subParts]) => (
                  <div key={sub}>
                    <div style={{ background:t.surf, padding:'8px 14px',
                      borderTop:`1px solid ${t.border}`,
                      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:14, color:t.mid, fontFamily:t.mono,
                        fontWeight:700 }}>{sub}</span>
                      <button onClick={() => openAdd(cat, sub)}
                        style={{ background:'none', border:'none', color:t.blue,
                          fontSize:13, fontFamily:t.mono, cursor:'pointer' }}>
                        + add here
                      </button>
                    </div>
                    {subParts.map(p => (
                      <PartRow key={p.id} part={p} userId={userId}
                        onEdit={() => setModal(p)}
                        onVerify={() => verify(p)}
                        onDelete={() => deletePart(p.id)} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Empty state with quick-add by default category */}
        {!loading && parts.length === 0 && (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
            <div style={{ color:t.dim, fontFamily:t.mono, fontSize:14, marginBottom:16 }}>
              No parts added yet for this car.
            </div>
            <Btn onClick={() => openAdd()}>+ Add First Part</Btn>
          </div>
        )}

        {/* Quick-add buttons by default category */}
        {!loading && (
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:14, color:t.dim, fontFamily:t.mono,
              textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>
              Quick Add by Category
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {Object.keys(CATEGORIES).map(cat => (
                <button key={cat} onClick={() => openAdd(cat)}
                  style={{ background:t.surf, border:`1px solid ${t.border}`,
                    color:t.mid, padding:'5px 12px', borderRadius:4, fontSize:13,
                    fontFamily:t.mono, cursor:'pointer' }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <PartModal carId={car.id} userId={userId}
          prefillCat={prefCat} prefillSub={prefSub}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); setExpanded(p => ({ ...p, [prefCat]: true })) }} />
      )}
      {modal && modal !== 'add' && (
        <PartModal part={modal} carId={car.id} userId={userId}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }} />
      )}
    </div>
  )
}

// ── PART ROW ──────────────────────────────────────────────
function PartRow({ part, userId, onEdit, onVerify, onDelete }) {
  const [hover, setHover] = useState(false)
  const isOwner = part.added_by === userId
  const eff = part.effects || {}
  const effKeys = Object.keys(eff).filter(k => eff[k] !== undefined && eff[k] !== false && eff[k] !== '')

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? t.surf2 : 'transparent',
        borderTop:`1px solid ${t.border}33`, padding:'8px 14px',
        display:'flex', alignItems:'flex-start', gap:12, transition:'background 0.1s' }}>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:14, color: part.is_stock ? t.dim : t.text,
            fontFamily:t.mono }}>{part.name}</span>
          {part.is_stock && <Tag color={t.dim}>STOCK</Tag>}
          {part.pi_change !== 0 && (
            <Tag color={part.pi_change > 0 ? t.yellow : t.green}>
              {part.pi_change > 0 ? '+' : ''}{part.pi_change} PI
            </Tag>
          )}
          {part.price_cr && <Tag color={t.dim}>{part.price_cr.toLocaleString()} CR</Tag>}
          {part.verified
            ? <Tag color={t.green}>✓ VERIFIED</Tag>
            : <Tag color={t.yellow}>UNVERIFIED</Tag>}
        </div>
        {effKeys.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:5 }}>
            {effKeys.map(k => (
              <span key={k} style={{ fontSize:14, color:t.dim, fontFamily:t.mono,
                background:t.surf3, padding:'1px 6px', borderRadius:2 }}>
                {k.replace(/_/g,' ')}: {typeof eff[k]==='boolean'?'yes':eff[k]}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ display:'flex', gap:6, flexShrink:0, opacity: hover ? 1 : 0, transition:'opacity 0.1s' }}>
        <Btn small variant="ghost" onClick={onVerify}>
          {part.verified ? 'Unverify' : 'Verify'}
        </Btn>
        {isOwner && <Btn small variant="ghost" onClick={onEdit}>Edit</Btn>}
        {isOwner && <Btn small variant="danger" onClick={onDelete}>Del</Btn>}
      </div>
    </div>
  )
}

// ── GARAGE / CAR LIST ─────────────────────────────────────
function Garage({ userId, onSelectCar }) {
  const [cars,    setCars]    = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // null | 'add' | car

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('cars').select('*').order('make').order('model')
    setCars(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = cars.filter(c =>
    `${c.make} ${c.model} ${c.year}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:t.surf, borderBottom:`1px solid ${t.border}`,
        padding:'12px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:4, height:22, background:t.accent, borderRadius:2 }} />
          <span style={{ fontFamily:t.head, fontSize:20, fontWeight:800,
            textTransform:'uppercase', letterSpacing:'0.08em', color:t.text }}>
            FH6 Data Entry
          </span>
        </div>
        <div style={{ flex:1 }} />
        <Btn onClick={() => setModal('add')}>+ Add Car</Btn>
        <button onClick={() => supabase.auth.signOut()}
          style={{ background:'none', border:`1px solid ${t.border}`, color:t.dim,
            padding:'5px 12px', borderRadius:4, fontSize:13, fontFamily:t.mono, cursor:'pointer' }}>
          Sign out
        </button>
      </div>

      {/* Search */}
      <div style={{ padding:'14px 20px 0', flexShrink:0 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search cars... (make, model, year)"
          style={{ background:t.surf, border:`1px solid ${t.border}`, color:t.text,
            padding:'9px 14px', borderRadius:6, fontSize:14, fontFamily:t.mono,
            width:'100%', outline:'none' }} />
      </div>

      {/* Car list */}
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {loading && <div style={{ color:t.dim, fontSize:14, fontFamily:t.mono }}>Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🚗</div>
            <div style={{ color:t.dim, fontFamily:t.mono, fontSize:14, marginBottom:16 }}>
              {search ? 'No cars match your search.' : 'No cars in catalog yet.'}
            </div>
            <Btn onClick={() => setModal('add')}>+ Add First Car</Btn>
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:10 }}>
          {filtered.map(car => (
            <CarCard key={car.id} car={car}
              onClick={() => onSelectCar(car)}
              onEdit={() => setModal(car)} />
          ))}
        </div>
      </div>

      {modal === 'add' && (
        <CarModal userId={userId} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />
      )}
      {modal && modal !== 'add' && (
        <CarModal car={modal} userId={userId} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />
      )}
    </div>
  )
}

function CarCard({ car, onClick, onEdit }) {
  const [hover, setHover] = useState(false)
  const dtColor = { RWD:t.accent, FWD:t.blue, AWD:t.green }[car.stock_drivetrain] || t.dim
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{ background:t.surf, border:`1px solid ${hover?t.accent:t.border}`,
        borderRadius:6, padding:14, cursor:'pointer', transition:'border-color 0.15s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:14, color:t.dim, fontFamily:t.mono }}>{car.year}</div>
          <div style={{ fontFamily:t.head, fontSize:20, fontWeight:700,
            textTransform:'uppercase', letterSpacing:'0.04em', color:t.text, marginTop:2 }}>
            {car.make} {car.model}
          </div>
        </div>
        <button onClick={e => { e.stopPropagation(); onEdit() }}
          style={{ background:'none', border:`1px solid ${t.border}`, color:t.dim,
            padding:'3px 10px', borderRadius:3, fontSize:14, fontFamily:t.mono, cursor:'pointer' }}>
          Edit
        </button>
      </div>
      <div style={{ display:'flex', gap:5, marginTop:10, flexWrap:'wrap' }}>
        {car.stock_class && <Tag color={t.yellow}>{car.stock_class} {car.stock_pi}</Tag>}
        {car.stock_drivetrain && <Tag color={dtColor}>{car.stock_drivetrain}</Tag>}
      </div>
    </div>
  )
}

// ── APP ROOT ──────────────────────────────────────────────
export default function App() {
  const [session,    setSession]    = useState(null)
  const [authReady,  setAuthReady]  = useState(false)
  const [selectedCar, setSelectedCar] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (!authReady) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:t.bg, color:t.dim,
      fontSize:14, fontFamily:t.mono }}>Loading...</div>
  )

  if (!session) return <Login onLogin={setSession} />

  const userId = session.user.id

  if (selectedCar) return (
    <CarDetail car={selectedCar} userId={userId} onBack={() => setSelectedCar(null)} />
  )

  return <Garage userId={userId} onSelectCar={setSelectedCar} />
}
