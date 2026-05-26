import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { CATEGORIES, EFFECT_FIELDS, EFFECT_GROUPS, CAR_STAT_FIELDS, CLASSES } from './lib/categories'

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

const Modal = ({ title, onClose, children, wide }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])
  return (
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
}

const Row = ({ label, children }) => (
  <div style={{ marginBottom:14 }}><Label>{label}</Label>{children}</div>
)

const HR = () => <div style={{ borderTop:`1px solid ${t.border}`, margin:'16px 0' }} />

// ── AUTOCOMPLETE ──────────────────────────────────────────
function Autocomplete({ value, onChange, onSelect, suggestions, placeholder, loading }) {
  const [open, setOpen] = useState(false)
  const filtered = suggestions.filter(s =>
    s.toLowerCase().includes((value||'').toLowerCase()) && s !== value
  )
  const show = open && filtered.length > 0

  return (
    <div style={{ position:'relative' }}>
      <input
        value={value ?? ''}
        placeholder={placeholder || ''}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{ background:t.surf3, border:`1px solid ${open ? t.accent : t.border}`,
          color:t.text, padding:'7px 10px', borderRadius:4, fontSize:14,
          fontFamily:t.mono, width:'100%', outline:'none' }}
      />
      {loading && (
        <div style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
          fontSize:11, color:t.dim, fontFamily:t.mono }}>...</div>
      )}
      {show && (
        <div style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:200,
          background:t.surf2, border:`1px solid ${t.accent}`, borderTop:'none',
          borderRadius:'0 0 4px 4px', maxHeight:200, overflowY:'auto' }}>
          {filtered.map(s => (
            <div key={s}
              onMouseDown={() => { onSelect(s); setOpen(false) }}
              style={{ padding:'8px 12px', fontSize:14, fontFamily:t.mono,
                color:t.text, cursor:'pointer', borderBottom:`1px solid ${t.border}33` }}
              onMouseEnter={e => e.currentTarget.style.background = t.surf3}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── LOGIN + SIGNUP ────────────────────────────────────────
function Login() {
  const [mode,    setMode]    = useState('login') // 'login' | 'signup'
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [pass2,   setPass2]   = useState('')
  const [name,    setName]    = useState('')
  const [err,     setErr]     = useState('')
  const [ok,      setOk]      = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setErr(''); setOk('')
    if (!email || !pass) { setErr('Email and password required'); return }
    if (mode === 'signup') {
      if (pass !== pass2) { setErr('Passwords do not match'); return }
      if (pass.length < 6) { setErr('Password must be at least 6 characters'); return }
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email, password: pass,
        options: { data: { username: name || email } }
      })
      if (error) { setErr(error.message); setLoading(false); return }
      setOk('Account created! You can now sign in.')
      setMode('login'); setPass(''); setPass2(''); setLoading(false)
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setErr(error.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:t.bg }}>
      <div style={{ width:360 }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:4, height:28, background:t.accent, borderRadius:2 }} />
            <span style={{ fontFamily:t.head, fontSize:28, fontWeight:800,
              textTransform:'uppercase', letterSpacing:'0.08em', color:t.text }}>
              FH6 Data Entry
            </span>
          </div>
          <div style={{ fontSize:13, color:t.dim, fontFamily:t.mono, marginLeft:14 }}>
            Community parts catalog
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display:'flex', marginBottom:16, background:t.surf2,
          borderRadius:6, padding:3, gap:3 }}>
          {['login','signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setErr(''); setOk('') }}
              style={{ flex:1, background: mode===m ? t.surf : 'transparent',
                border: mode===m ? `1px solid ${t.border}` : 'none',
                color: mode===m ? t.text : t.dim,
                padding:'8px', borderRadius:4, fontSize:13, fontFamily:t.mono,
                fontWeight:700, textTransform:'uppercase', cursor:'pointer' }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <div style={{ background:t.surf, border:`1px solid ${t.border}`, borderRadius:8, padding:24 }}>
          {ok && <div style={{ color:t.green, fontSize:13, fontFamily:t.mono,
            marginBottom:12, padding:'8px 10px', background:`${t.green}11`,
            borderRadius:4, border:`1px solid ${t.green}33` }}>{ok}</div>}

          {mode === 'signup' && (
            <Row label="Username (optional)">
              <Input value={name} onChange={setName} placeholder="shanpapa" />
            </Row>
          )}
          <Row label="Email"><Input value={email} onChange={setEmail} placeholder="email@example.com" /></Row>
          <Row label="Password"><Input value={pass} onChange={setPass} type="password" placeholder="••••••••" /></Row>
          {mode === 'signup' && (
            <Row label="Confirm Password">
              <Input value={pass2} onChange={setPass2} type="password" placeholder="••••••••" />
            </Row>
          )}
          {err && <div style={{ color:t.red, fontSize:13, fontFamily:t.mono, marginBottom:12 }}>{err}</div>}

          {mode === 'signup' && (
            <div style={{ fontSize:12, color:t.dim, fontFamily:t.mono, marginBottom:14,
              padding:'8px 10px', background:t.surf2, borderRadius:4, lineHeight:1.6 }}>
              New accounts get <b style={{color:t.mid}}>Contributor</b> role — can add and edit parts.
              Verify rights are granted by admin.
            </div>
          )}
          <Btn onClick={submit} disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Btn>
        </div>
      </div>
    </div>
  )
}

// ── ADMIN PANEL ───────────────────────────────────────────
function AdminPanel({ currentUserId, onClose }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(null)

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at')
      .then(({ data }) => { setUsers(data || []); setLoading(false) })
  }, [])

  const toggleRole = async (user) => {
    const newRole = user.role === 'verifier' ? 'contributor' : 'verifier'
    setSaving(user.id)
    await supabase.from('profiles').update({ role: newRole }).eq('id', user.id)
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u))
    setSaving(null)
  }

  return (
    <Modal title="User Management" onClose={onClose} wide>
      <div style={{ fontSize:13, color:t.dim, fontFamily:t.mono, marginBottom:16 }}>
        Contributors can add and edit parts. Verifiers can also verify parts and manage users.
      </div>
      {loading ? (
        <div style={{ color:t.dim, fontFamily:t.mono, fontSize:13 }}>Loading users...</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {users.map(user => (
            <div key={user.id} style={{ display:'flex', alignItems:'center', gap:12,
              background:t.surf2, borderRadius:6, padding:'10px 14px' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, color:t.text, fontFamily:t.mono }}>
                  {user.username || user.id.slice(0,8)}
                </div>
                <div style={{ fontSize:12, color:t.dim, fontFamily:t.mono, marginTop:2 }}>
                  {user.id === currentUserId ? '(you) ' : ''}
                  joined {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
              <Tag color={user.role === 'verifier' ? t.green : t.blue}>
                {user.role || 'contributor'}
              </Tag>
              {user.id !== currentUserId && (
                <Btn small variant="ghost"
                  disabled={saving === user.id}
                  onClick={() => toggleRole(user)}>
                  {saving === user.id ? '...' : user.role === 'verifier' ? '↓ Contributor' : '↑ Verifier'}
                </Btn>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

function CarModal({ car, onClose, onSaved, userId }) {
  const isEdit = !!car?.id
  const [form, setForm] = useState({
    make: car?.make || '', model: car?.model || '', year: car?.year || '',
    stock_class: car?.stock_class || '', stock_pi: car?.stock_pi || '',
    stock_drivetrain: car?.stock_drivetrain || '',
    car_type: car?.car_type || '', country: car?.country || '',
    collection: car?.collection || '', dlc_pack: car?.dlc_pack || '',
    is_dlc: car?.is_dlc || false,
    front_weight_pct: car?.front_weight_pct || '',
    suspension_type: car?.suspension_type || '',
    tyre_compound_stock: car?.tyre_compound_stock || '',
  })
  const [baseStats, setBaseStats] = useState(car?.base_stats || {})
  const [err,    setErr]    = useState('')
  const [saving, setSaving] = useState(false)
  const [makes,  setMakes]  = useState([])
  const [models, setModels] = useState([])
  const [years,  setYears]  = useState([])
  const [carTypes,   setCarTypes]   = useState([])
  const [countries,  setCountries]  = useState([])

  useEffect(() => {
    supabase.from('cars').select('make').order('make')
      .then(({ data }) => setMakes([...new Set((data||[]).map(r => r.make))]))
    supabase.from('cars').select('car_type').order('car_type')
      .then(({ data }) => setCarTypes([...new Set((data||[]).map(r => r.car_type).filter(Boolean))]))
    supabase.from('cars').select('country').order('country')
      .then(({ data }) => setCountries([...new Set((data||[]).map(r => r.country).filter(Boolean))]))
  }, [])

  useEffect(() => {
    if (!form.make) { setModels([]); return }
    supabase.from('cars').select('model').eq('make', form.make).order('model')
      .then(({ data }) => setModels([...new Set((data||[]).map(r => r.model))]))
  }, [form.make])

  useEffect(() => {
    if (!form.make || !form.model) { setYears([]); return }
    supabase.from('cars').select('year').eq('make', form.make).eq('model', form.model).order('year')
      .then(({ data }) => setYears((data||[]).map(r => String(r.year))))
  }, [form.make, form.model])

  const upd  = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const updS = (k, v) => setBaseStats(p => {
    const n = { ...p }
    if (v === '' || v === null) { delete n[k]; return n }
    n[k] = v; return n
  })

  const save = async () => {
    if (!form.make || !form.model || !form.year) { setErr('Make, model and year are required'); return }
    setSaving(true); setErr('')
    const common = {
      make: form.make, model: form.model, year: parseInt(form.year),
      stock_class: form.stock_class || null,
      stock_pi: form.stock_pi ? parseInt(form.stock_pi) : null,
      stock_drivetrain: form.stock_drivetrain || null,
      car_type: form.car_type || null,
      country: form.country || null,
      collection: form.collection || null,
      dlc_pack: form.dlc_pack || null,
      is_dlc: form.is_dlc || false,
      front_weight_pct: form.front_weight_pct !== '' ? parseFloat(form.front_weight_pct) : null,
      suspension_type: form.suspension_type || null,
      tyre_compound_stock: form.tyre_compound_stock || null,
      base_stats: Object.keys(baseStats).length > 0 ? baseStats : null,
    }
    const { error } = isEdit
      ? await supabase.from('cars').update(common).eq('id', car.id)
      : await supabase.from('cars').insert({ ...common, added_by: userId })
    if (error) {
      console.error('Save error:', error)
      setErr(`Save failed: ${error.message}`)
      setSaving(false)
      return
    }
    onSaved()
  }

  // Group CAR_STAT_FIELDS by section for display
  const statGroups = [
    { label:'Performance Index',    keys:['stat_speed','stat_handling','stat_acceleration','stat_launch','stat_braking','stat_offroad'] },
    { label:'Car Stat',             keys:['power_hp','torque_nm','weight_kg','front_weight_pct','displacement_l','top_speed_kmh','accel_0_100','pwr_hp_kg'] },
    { label:'Performance',          keys:['aero_efficiency','aero_balance','mech_balance','suspension_type','tyre_compound_stock'] },
    { label:'Braking Distance',     keys:['brake_dist_97','brake_dist_161'] },
    { label:'Lateral Gs',           keys:['lateral_g_97','lateral_g_193'] },
    { label:'Acceleration & Speed', keys:['accel_0_97','accel_0_161'] },
  ]

  // col fields are stored as direct car columns, not in base_stats
  const colFields = new Set(CAR_STAT_FIELDS.filter(f => f.col).map(f => f.key))
  const getStatVal = (key) => colFields.has(key) ? (form[key] ?? '') : (baseStats[key] ?? '')
  const setStatVal = (key, val) => {
    if (colFields.has(key)) upd(key, val === '' ? null : val)
    else updS(key, val === '' ? '' : (isNaN(Number(val)) ? val : parseFloat(val)))
  }

  return (
    <Modal title={isEdit ? 'Edit Car' : 'Add Car'} onClose={onClose} wide>
      {/* Identity */}
      <div style={{ fontSize:11, color:t.accent, fontFamily:t.mono, textTransform:'uppercase',
        letterSpacing:'0.12em', marginBottom:10 }}>Identity</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 16px' }}>
        <Row label="Make">
          <Autocomplete value={form.make} onChange={v => upd('make', v)}
            onSelect={v => upd('make', v)} suggestions={makes} placeholder="Nissan" />
        </Row>
        <Row label="Model">
          <Autocomplete value={form.model} onChange={v => upd('model', v)}
            onSelect={v => upd('model', v)} suggestions={models} placeholder="Silvia K's" />
        </Row>
        <Row label="Year">
          <Autocomplete value={String(form.year||'')} onChange={v => upd('year', v)}
            onSelect={v => upd('year', v)} suggestions={years} placeholder="1999" />
        </Row>
      </div>
      <HR />
      {/* Class & Drivetrain */}
      <div style={{ fontSize:11, color:t.accent, fontFamily:t.mono, textTransform:'uppercase',
        letterSpacing:'0.12em', marginBottom:10 }}>Class & Drivetrain</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 16px' }}>
        <Row label="Stock Class">
          <Select value={form.stock_class} onChange={v => upd('stock_class',v)}
            placeholder="— select —" options={CLASSES} />
        </Row>
        <Row label="Stock PI">
          <input type="number" value={form.stock_pi ?? ''} placeholder="499"
            onChange={e => upd('stock_pi', e.target.value)}
            style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
              padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
              width:'100%', outline:'none' }} />
        </Row>
        <Row label="Stock Drivetrain">
          <Select value={form.stock_drivetrain} onChange={v => upd('stock_drivetrain',v)}
            placeholder="— select —" options={['RWD','FWD','AWD']} />
        </Row>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px', marginTop:4 }}>
        <Row label="Car Type">
          <Autocomplete value={form.car_type} onChange={v => upd('car_type', v)}
            onSelect={v => upd('car_type', v)} suggestions={carTypes} placeholder="Retro Rally" />
        </Row>
        <Row label="Country">
          <Autocomplete value={form.country} onChange={v => upd('country', v)}
            onSelect={v => upd('country', v)} suggestions={countries} placeholder="Japan" />
        </Row>
        <Row label="Collection">
          <input value={form.collection ?? ''} placeholder="Autoshow"
            onChange={e => upd('collection', e.target.value)}
            style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
              padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
              width:'100%', outline:'none' }} />
        </Row>
        <Row label="DLC Pack">
          <input value={form.dlc_pack ?? ''} placeholder="Car Pass (optional)"
            onChange={e => upd('dlc_pack', e.target.value)}
            style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
              padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
              width:'100%', outline:'none' }} />
        </Row>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:8, margin:'8px 0 14px' }}>
        <input type="checkbox" checked={form.is_dlc} onChange={e => upd('is_dlc', e.target.checked)}
          style={{ accentColor:t.accent, width:14, height:14 }} />
        <span style={{ fontSize:13, color:t.mid, fontFamily:t.mono }}>DLC car</span>
      </div>
      <HR />
      {/* Base Stats */}
      <div style={{ fontSize:11, color:t.accent, fontFamily:t.mono, textTransform:'uppercase',
        letterSpacing:'0.12em', marginBottom:4 }}>Base Stats (stock)</div>
      <div style={{ fontSize:12, color:t.dim, fontFamily:t.mono, marginBottom:12 }}>
        From in-game screens — leave empty if unknown, fill in later. Order matches game UI.
      </div>
      {statGroups.map(group => (
        <div key={group.label} style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:t.dim, fontFamily:t.mono, textTransform:'uppercase',
            letterSpacing:'0.1em', marginBottom:8, borderBottom:`1px solid ${t.border}33`,
            paddingBottom:4 }}>{group.label}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0 16px' }}>
            {CAR_STAT_FIELDS.filter(f => group.keys.includes(f.key)).map(f => (
              <Row key={f.key} label={f.label}>
                {f.type === 'select'
                  ? <Select value={getStatVal(f.key)} onChange={v => setStatVal(f.key, v)}
                      placeholder="— select —" options={f.options} />
                  : <input type="number" value={getStatVal(f.key)} step={f.step}
                      placeholder="—"
                      onChange={e => setStatVal(f.key, e.target.value)}
                      style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
                        padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
                        width:'100%', outline:'none' }} />
                }
              </Row>
            ))}
          </div>
        </div>
      ))}
      {err && <div style={{ color:t.red, fontSize:13, fontFamily:t.mono, marginBottom:12 }}>{err}</div>}
      <HR />
      <div style={{ display:'flex', gap:8 }}>
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Btn>
        <Btn onClick={onClose} variant="ghost">Cancel</Btn>
      </div>
    </Modal>
  )
}

// ── PART FORM MODAL ───────────────────────────────────────
function PartModal({ part, carId, prefillCat, prefillSub, onClose, onSaved, userId, baseStats, car, userRole }) {
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
  const [inputMode, setInputMode] = useState(getActualModePref())
  const [actualVals, setActualVals] = useState({})

  const [nameOptions, setNameOptions] = useState([])
  const [prefillNote, setPrefillNote] = useState('')

  const subs = CATEGORIES[cat] || []
  const finalCat = useCustomCat ? customCat : cat
  const finalSub = useCustomSub ? customSub : sub

  // Load existing part names for this subcategory
  useEffect(() => {
    if (!finalSub) return
    supabase.from('car_parts').select('name').eq('subcategory', finalSub).order('name')
      .then(({ data }) => setNameOptions([...new Set((data||[]).map(r => r.name))]))
  }, [finalSub])

  // When a known name is selected → prefill effects from any existing part with that name
  const handleNameSelect = async (selectedName) => {
    setName(selectedName)
    const { data } = await supabase.from('car_parts')
      .select('effects, pi_change, price_cr, is_stock')
      .eq('subcategory', finalSub)
      .eq('name', selectedName)
      .limit(1)
      .single()
    if (data) {
      if (data.effects && Object.keys(data.effects).length > 0) {
        setEffects(data.effects)
        setPrefillNote('Effects pre-filled from existing entry — update values for this car.')
      }
      if (data.is_stock) setIsStock(true)
      setTimeout(() => setPrefillNote(''), 5000)
    }
  }

  const setEffect = (k, v) => setEffects(p => {
    const n = { ...p }
    if (v === '' || v === null || v === undefined) { delete n[k]; return n }
    n[k] = v
    return n
  })

  const save = async (stayOpen = false) => {
    if (!name)     { setErr('Part name is required'); return false }
    if (!finalSub) { setErr('Subcategory is required'); return false }
    setSaving(true); setErr('')

    // Actual mode: save ALL fields that have base data
    // If user didn't change a field, delta = 0 (base value used)
    let finalEffects = { ...effects }
    if (inputMode === 'actual') {
      EFFECT_FIELDS.filter(f => f.type === 'number').forEach(f => {
        const base = (baseStats || {})[f.key]
        if (base === undefined || base === null || base === '') return
        // Use user input if provided, otherwise fall back to base value (no change)
        const userInput = actualVals[f.key]
        const actualVal = (userInput !== undefined && userInput !== '')
          ? parseFloat(userInput)
          : parseFloat(base)
        finalEffects[f.key] = parseFloat((actualVal - parseFloat(base)).toFixed(4))
      })
    }

    // Compute PI change
    let finalPiChange = piChange !== '' ? parseInt(piChange) : 0
    if (inputMode === 'actual' && actualVals['_pi'] !== undefined && car?.stock_pi) {
      finalPiChange = parseInt(actualVals['_pi']) - parseInt(car.stock_pi)
    }

    const payload = {
      car_id: carId, category: finalCat, subcategory: finalSub,
      name, is_stock: isStock,
      pi_change: finalPiChange,
      price_cr: priceCr !== '' ? parseInt(priceCr) : null,
      effects: finalEffects, added_by: userId,
      verified: userRole === 'verifier',
    }
    const { error } = isEdit
      ? await supabase.from('car_parts').update(payload).eq('id', part.id)
      : await supabase.from('car_parts').insert(payload)
    if (error) { setErr(`Save failed: ${error.message}`); setSaving(false); return false }
    setSaving(false)
    if (!stayOpen) { onSaved(false); return true }
    // Stay open: reset only name/effects/pi/price, keep category+subcategory
    setName(''); setEffects({}); setPiChange(''); setPriceCr('')
    setActualVals({}); setPrefillNote(''); setIsStock(false)
    onSaved(true) // reload list but keep modal open
    return true
  }

  const hasBaseStats = baseStats && Object.keys(baseStats).length > 0

  return (
    <Modal title={isEdit ? 'Edit Part' : 'Add Part'} onClose={onClose} wide>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 20px' }}>
        <Row label="Category">
          {!useCustomCat
            ? <Select value={cat} onChange={v => { setCat(v); setSub(''); setName(''); setEffects({}) }}
                options={allCats} />
            : <Input value={customCat} onChange={setCustomCat} placeholder="New category name" />
          }
          <button onClick={() => setUseCustomCat(p => !p)}
            style={{ background:'none', border:'none', color:t.blue, fontSize:13,
              fontFamily:t.mono, cursor:'pointer', marginTop:4, padding:0 }}>
            {useCustomCat ? '← Use predefined' : '+ New category'}
          </button>
        </Row>
        <Row label="Subcategory">
          {!useCustomSub
            ? <Select value={sub} onChange={v => { setSub(v); setName(''); setEffects({}) }}
                placeholder="— select —" options={subs} />
            : <Input value={customSub} onChange={setCustomSub} placeholder="New subcategory name" />
          }
          <button onClick={() => setUseCustomSub(p => !p)}
            style={{ background:'none', border:'none', color:t.blue, fontSize:13,
              fontFamily:t.mono, cursor:'pointer', marginTop:4, padding:0 }}>
            {useCustomSub ? '← Use predefined' : '+ New subcategory'}
          </button>
        </Row>
      </div>
      <Row label={`Part Name${nameOptions.length > 0 ? ` (${nameOptions.length} existing in this subcategory)` : ''}`}>
        <Autocomplete value={name} onChange={setName}
          onSelect={handleNameSelect}
          suggestions={nameOptions}
          placeholder="Sport fék" />
      </Row>
      {prefillNote && (
        <div style={{ fontSize:12, color:t.blue, fontFamily:t.mono, marginBottom:12,
          padding:'6px 10px', background:`${t.blue}11`, borderRadius:4,
          border:`1px solid ${t.blue}33` }}>
          ℹ {prefillNote}
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0 20px' }}>
        <Row label={inputMode === 'actual' && hasBaseStats ? `PI (base: ${car?.stock_pi ?? '?'})` : 'PI Change'}>
          <div>
            <input type="number"
              value={inputMode === 'actual' ? (actualVals['_pi'] ?? '') : (piChange ?? '')}
              placeholder={inputMode === 'actual' ? String(car?.stock_pi ?? '—') : '0'}
              step={1}
              onChange={e => {
                if (inputMode === 'actual') {
                  setActualVals(p => ({ ...p, _pi: e.target.value === '' ? undefined : e.target.value }))
                } else {
                  setPiChange(e.target.value)
                }
              }}
              style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
                padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
                width:'100%', outline:'none' }} />
            {inputMode === 'actual' && actualVals['_pi'] !== undefined && car?.stock_pi && (
              <div style={{ fontSize:11, color:t.blue, fontFamily:t.mono, marginTop:2 }}>
                Δ {(parseInt(actualVals['_pi']) - parseInt(car.stock_pi)) >= 0 ? '+' : ''}
                {parseInt(actualVals['_pi']) - parseInt(car.stock_pi)}
              </div>
            )}
          </div>
        </Row>
        <Row label="Price (CR)">
          <input type="number" value={priceCr ?? ''} placeholder="1300" step={100}
            onChange={e => setPriceCr(e.target.value)}
            style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
              padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
              width:'100%', outline:'none' }} />
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
      {/* Mode toggle */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:8 }}>
        <div>
          <div style={{ fontSize:11, color:t.accent, fontFamily:t.mono,
            textTransform:'uppercase', letterSpacing:'0.12em' }}>Effects</div>
          <div style={{ fontSize:12, color:t.dim, fontFamily:t.mono, marginTop:2 }}>
            {inputMode === 'delta'
              ? 'Enter the change (+/-) directly from the game.'
              : hasBaseStats
                ? 'Enter the value shown in-game after installing. Delta auto-calculated.'
                : '⚠ No base stats on this car — actual mode will save values as-is.'}
          </div>
        </div>
        <div style={{ display:'flex', background:t.surf2, borderRadius:6,
          padding:3, gap:3, flexShrink:0 }}>
          {[['delta','Δ Delta'],['actual','= Actual']].map(([mode, label]) => (
            <button key={mode} onClick={() => { setInputMode(mode); setActualModePref(mode) }}
              style={{ background: inputMode===mode ? t.surf3 : 'transparent',
                border: inputMode===mode ? `1px solid ${t.accent}` : '1px solid transparent',
                color: inputMode===mode ? t.accent : t.dim,
                padding:'5px 12px', borderRadius:4, fontSize:12, fontFamily:t.mono,
                cursor:'pointer', fontWeight:700 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {EFFECT_GROUPS.map(group => {
        const fields = EFFECT_FIELDS.filter(f => f.group === group)
        if (fields.length === 0) return null
        return (
          <div key={group} style={{ marginBottom:14 }}>
            <div style={{ fontSize:10, color:t.dim, fontFamily:t.mono, textTransform:'uppercase',
              letterSpacing:'0.1em', marginBottom:8, borderBottom:`1px solid ${t.border}33`,
              paddingBottom:4 }}>{group}</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0 16px' }}>
              {fields.map(f => {
                const isNumeric = f.type === 'number'
                const useActual = inputMode === 'actual' && isNumeric
                const baseVal   = (baseStats || {})[f.key]
                const hasBase   = baseVal !== undefined && baseVal !== null && baseVal !== ''
                // In actual mode: if no user input yet, show existing effect+base as default
                const existingDelta = effects[f.key]
                const defaultActual = hasBase && existingDelta !== undefined
                  ? parseFloat((parseFloat(baseVal) + parseFloat(existingDelta)).toFixed(4))
                  : undefined
                const actualDisplayVal = actualVals[f.key] !== undefined
                  ? actualVals[f.key]
                  : defaultActual !== undefined ? String(defaultActual) : ''
                const deltaPreview = hasBase && actualDisplayVal !== ''
                  ? parseFloat((parseFloat(actualDisplayVal) - parseFloat(baseVal)).toFixed(4))
                  : null

                return (
                  <Row key={f.key} label={
                    useActual && hasBase ? `${f.label} (base: ${baseVal})`
                    : f.hint ? `${f.label} (${f.hint})` : f.label
                  }>
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
                      : useActual
                      ? <div>
                          {hasBase
                            ? <>
                                <input type="number"
                                  value={actualDisplayVal}
                                  step={f.step}
                                  placeholder={String(baseVal)}
                                  onChange={e => setActualVals(p => ({
                                    ...p,
                                    [f.key]: e.target.value === '' ? undefined : e.target.value
                                  }))}
                                  style={{ background:t.surf3,
                                    border:`1px solid ${actualVals[f.key] !== undefined ? t.blue : t.border}`,
                                    color:t.text, padding:'7px 10px', borderRadius:4, fontSize:14,
                                    fontFamily:t.mono, width:'100%', outline:'none' }} />
                                {deltaPreview !== null && deltaPreview !== 0 && (
                                  <div style={{ fontSize:11, color:t.blue, fontFamily:t.mono, marginTop:2 }}>
                                    Δ {deltaPreview > 0 ? '+' : ''}{deltaPreview}
                                  </div>
                                )}
                                {deltaPreview === 0 && (
                                  <div style={{ fontSize:11, color:t.dim, fontFamily:t.mono, marginTop:2 }}>
                                    Δ 0 — no change
                                  </div>
                                )}
                              </>
                            : <div style={{ padding:'7px 10px', background:t.surf2,
                                border:`1px solid ${t.border}33`, borderRadius:4,
                                fontSize:11, color:t.dim, fontFamily:t.mono }}>
                                No base stat — set on car first
                              </div>
                          }
                        </div>
                      : <input type="number" value={effects[f.key] ?? ''} step={f.step}
                          placeholder="—"
                          onChange={e => setEffect(f.key, e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
                            padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
                            width:'100%', outline:'none' }} />
                    }
                  </Row>
                )
              })}
            </div>
          </div>
        )
      })}
      {err && <div style={{ color:t.red, fontSize:13, fontFamily:t.mono, margin:'8px 0' }}>{err}</div>}
      <HR />
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        <Btn onClick={() => save(false)} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Add Part'}</Btn>
        {!isEdit && (
          <Btn variant="ghost" disabled={saving} onClick={() => save(true)}>
            Save &amp; Add Another
          </Btn>
        )}
        <Btn onClick={onClose} variant="ghost">Cancel</Btn>
      </div>
    </Modal>
  )
}

// ── CLONE MODAL ───────────────────────────────────────────
function CloneModal({ currentCar, onClose, onClone, cloning }) {
  const [search,     setSearch]     = useState('')
  const [cars,       setCars]       = useState([])
  const [partCounts, setPartCounts] = useState({})
  const [loading,    setLoading]    = useState(false)
  const [copied,     setCopied]     = useState('')

  useEffect(() => {
    if (search.length < 2) { setCars([]); setPartCounts({}); return }
    setLoading(true)
    const q = search.toLowerCase()
    supabase.from('cars').select('id,make,model,year,stock_class,stock_pi,stock_drivetrain')
      .or(`make.ilike.%${q}%,model.ilike.%${q}%`)
      .neq('id', currentCar.id)
      .limit(12)
      .then(async ({ data }) => {
        setCars(data || [])
        if (data?.length) {
          const ids = data.map(c => c.id)
          const { data: counts } = await supabase.from('car_parts')
            .select('car_id').in('car_id', ids)
          if (counts) {
            const map = {}
            counts.forEach(p => { map[p.car_id] = (map[p.car_id] || 0) + 1 })
            setPartCounts(map)
          }
        }
        setLoading(false)
      })
  }, [search, currentCar.id])

  const copyId = (id) => {
    navigator.clipboard.writeText(id)
    setCopied(id)
    setTimeout(() => setCopied(''), 2000)
  }

  return (
    <Modal title="Clone Structure From Car" onClose={onClose} wide>
      <div style={{ fontSize:12, color:t.dim, fontFamily:t.mono, marginBottom:14, lineHeight:1.6 }}>
        Copies all categories, subcategories, and part names from the selected car to{' '}
        <span style={{ color:t.accent }}>{currentCar.year} {currentCar.make} {currentCar.model}</span>.
        Effects will be empty — fill them in afterwards using Actual mode.
        Parts that already exist on this car are skipped.
      </div>
      <Row label="Search source car">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Type make or model..."
          style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
            padding:'8px 12px', borderRadius:4, fontSize:14, fontFamily:t.mono,
            width:'100%', outline:'none' }} />
      </Row>
      {loading && <div style={{ color:t.dim, fontSize:12, fontFamily:t.mono }}>Searching...</div>}
      <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:8, maxHeight:300, overflowY:'auto' }}>
        {cars.map(c => {
          const dtColor = { RWD:t.accent, FWD:t.blue, AWD:t.green }[c.stock_drivetrain] || t.dim
          const count = partCounts[c.id] || 0
          return (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12,
              background:t.surf2, borderRadius:6, padding:'10px 14px' }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontFamily:t.head, fontWeight:700,
                  textTransform:'uppercase', color:t.text }}>
                  {c.year} {c.make} {c.model}
                </div>
                <div style={{ display:'flex', gap:6, marginTop:4, flexWrap:'wrap' }}>
                  {c.stock_class && <Tag color={t.yellow}>{c.stock_class} {c.stock_pi}</Tag>}
                  {c.stock_drivetrain && <Tag color={dtColor}>{c.stock_drivetrain}</Tag>}
                  <Tag color={count > 0 ? t.green : t.dim}>
                    {count > 0 ? `${count} parts` : 'no parts'}
                  </Tag>
                </div>
              </div>
              <Btn small variant="ghost" onClick={() => copyId(c.id)}
                disabled={copied === c.id}>
                {copied === c.id ? '✓ Copied ID' : 'Copy ID'}
              </Btn>
              <Btn small onClick={() => onClone(c)} disabled={cloning || count === 0}>
                {cloning ? '...' : count === 0 ? 'No parts' : 'Clone'}
              </Btn>
            </div>
          )
        })}
        {!loading && search.length >= 2 && cars.length === 0 && (
          <div style={{ color:t.dim, fontSize:12, fontFamily:t.mono, padding:8 }}>No cars found.</div>
        )}
        {search.length < 2 && (
          <div style={{ color:t.dim, fontSize:12, fontFamily:t.mono, padding:8 }}>
            Type at least 2 characters to search.
          </div>
        )}
      </div>
    </Modal>
  )
}

// ── CAR DETAIL VIEW ───────────────────────────────────────
function CarDetail({ car, userId, userRole, onBack }) {
  const [parts,   setParts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [prefCat, setPrefCat] = useState('')
  const [prefSub, setPrefSub] = useState('')
  const [expanded,    setExpanded]    = useState({})
  const [expandedSub, setExpandedSub] = useState({})
  const [showClone, setShowClone] = useState(false)
  const [cloning,   setCloning]  = useState(false)
  const [cloneMsg,  setCloneMsg] = useState('')
  const [showEmptyOnly, setShowEmptyOnly] = useState(false)
  const [bulkVerifying, setBulkVerifying] = useState(false)

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

  // Export parts as CSV template (effects cleared)
  const exportTemplate = () => {
    if (parts.length === 0) return
    const rows = parts.map(p => ({
      car_id: car.id, category: p.category, subcategory: p.subcategory,
      name: p.name, is_stock: p.is_stock ? 'true' : 'false',
      pi_change: '', price_cr: '',
      ...Object.fromEntries(IMPORT_COLUMNS
        .filter(c => !['car_id','category','subcategory','name','is_stock','pi_change','price_cr'].includes(c))
        .map(c => [c, '']))
    }))
    downloadCSV(`${car.make}_${car.model}_${car.year}_parts_template.csv`, rows)
  }

  // Clone structure from another car
  const handleClone = async (sourceCar) => {
    setCloning(true); setCloneMsg('')
    const { data: sourceParts } = await supabase.from('car_parts')
      .select('category,subcategory,name,is_stock').eq('car_id', sourceCar.id)
    if (!sourceParts?.length) {
      setCloning(false); setCloneMsg('Source car has no parts.')
      return
    }
    // Skip parts already existing on this car
    const existingKeys = new Set(parts.map(p => `${p.category}|${p.subcategory}|${p.name}`))
    const toInsert = sourceParts
      .filter(p => !existingKeys.has(`${p.category}|${p.subcategory}|${p.name}`))
      .map(p => ({ car_id: car.id, category: p.category,
        subcategory: p.subcategory, name: p.name,
        is_stock: p.is_stock, pi_change: 0,
        effects: {}, added_by: userId,
        verified: userRole === 'verifier' }))

    if (toInsert.length === 0) {
      setCloning(false); setCloneMsg('All parts already exist on this car.')
      return
    }
    const { error } = await supabase.from('car_parts').insert(toInsert)
    setCloning(false)
    if (error) { setCloneMsg(`Error: ${error.message}`); return }
    setCloneMsg(`✓ Cloned ${toInsert.length} parts from ${sourceCar.make} ${sourceCar.model}. Effects are empty — fill in with actual mode.`)
    setShowClone(false)
    load()
  }

  const toggleCat = (cat) => setExpanded(p => ({ ...p, [cat]: !p[cat] }))
  const toggleSub = (key) => setExpandedSub(p => ({ ...p, [key]: !p[key] }))
  const openAdd = (cat='', sub='') => { setPrefCat(cat); setPrefSub(sub); setModal('add') }
  const dtColor = { RWD:t.accent, FWD:t.blue, AWD:t.green }[car.stock_drivetrain] || t.dim

  const emptyParts = parts.filter(p => !p.effects || Object.keys(p.effects).length === 0)
  const unverifiedParts = parts.filter(p => !p.verified)

  const bulkVerify = async () => {
    if (!unverifiedParts.length) return
    setBulkVerifying(true)
    const ids = unverifiedParts.map(p => p.id)
    await supabase.from('car_parts').update({ verified: true }).in('id', ids)
    setBulkVerifying(false)
    load()
  }

  // Filter grouped by showEmptyOnly
  const displayParts = showEmptyOnly ? emptyParts : parts
  const grouped = {}
  displayParts.forEach(p => {
    if (!grouped[p.category]) grouped[p.category] = {}
    if (!grouped[p.category][p.subcategory]) grouped[p.category][p.subcategory] = []
    grouped[p.category][p.subcategory].push(p)
  })
  // Stock parts first within each subcategory
  Object.values(grouped).forEach(subs =>
    Object.keys(subs).forEach(sub => {
      subs[sub].sort((a, b) => (b.is_stock ? 1 : 0) - (a.is_stock ? 1 : 0))
    })
  )
  // Category-level completion counts
  const catCompletion = {}
  parts.forEach(p => {
    if (!catCompletion[p.category]) catCompletion[p.category] = { total: 0, withEffects: 0 }
    catCompletion[p.category].total++
    if (p.effects && Object.keys(p.effects).length > 0) catCompletion[p.category].withEffects++
  })
  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:t.surf, borderBottom:`1px solid ${t.border}`,
        padding:'14px 20px', flexShrink:0 }}>
        {/* Top row */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
          <button onClick={onBack} style={{ background:'none', border:`1px solid ${t.border}`,
            color:t.dim, padding:'5px 12px', borderRadius:4, fontSize:13,
            fontFamily:t.mono, cursor:'pointer', textTransform:'uppercase' }}>← Back</button>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:t.head, fontSize:24, fontWeight:800,
              textTransform:'uppercase', letterSpacing:'0.05em', color:t.text }}>
              {car.year} {car.make} {car.model}
            </div>
          </div>
          {parts.length > 0 && (
            <Btn variant="ghost" small onClick={exportTemplate}>↓ Export Template</Btn>
          )}
          <Btn variant="ghost" small onClick={() => setShowClone(true)}>⎘ Clone Structure</Btn>
          {emptyParts.length > 0 && (
            <button onClick={() => setShowEmptyOnly(p => !p)}
              style={{ background: showEmptyOnly ? `${t.yellow}22` : 'none',
                border:`1px solid ${showEmptyOnly ? t.yellow : t.border}`,
                color: showEmptyOnly ? t.yellow : t.dim,
                padding:'5px 12px', borderRadius:4, fontSize:12,
                fontFamily:t.mono, cursor:'pointer', textTransform:'uppercase' }}>
              {showEmptyOnly ? '⚠ Empty only' : `⚠ ${emptyParts.length} empty`}
            </button>
          )}
          {unverifiedParts.length > 0 && (
            <Btn small variant="ghost" onClick={bulkVerify} disabled={bulkVerifying}>
              {bulkVerifying ? 'Verifying...' : `Verify all (${unverifiedParts.length})`}
            </Btn>
          )}
          <Btn onClick={() => openAdd()}>+ Add Part</Btn>
        </div>

        {/* Info panel */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px,1fr))',
          gap:'6px 12px', background:t.surf2, borderRadius:6, padding:'10px 14px', marginBottom: car.base_stats ? 8 : 0 }}>
          {[
            { label:'Class',      value: car.stock_class && car.stock_pi ? `${car.stock_class} ${car.stock_pi}` : car.stock_class, color: t.yellow },
            { label:'Drivetrain', value: car.stock_drivetrain, color: { RWD:t.accent, FWD:t.blue, AWD:t.green }[car.stock_drivetrain] || t.dim },
            { label:'Type',       value: car.car_type,       color: t.mid },
            { label:'Country',    value: car.country,        color: t.mid },
            { label:'Collection', value: car.collection,     color: t.dim },
            { label:'DLC',        value: car.dlc_pack || (car.is_dlc ? 'Yes' : null), color: t.red },
            { label:'Parts',      value: `${parts.length} total`, color: t.dim },
            { label:'Verified',   value: `${parts.filter(p=>p.verified).length} / ${parts.length}`, color: t.green },
          ].filter(item => item.value).map(item => (
            <div key={item.label}>
              <div style={{ fontSize:10, fontFamily:t.mono, color:t.dim,
                textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:2 }}>
                {item.label}
              </div>
              <div style={{ fontSize:13, fontFamily:t.mono, color:item.color,
                fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Missing front_weight_pct warning */}
        {!car.front_weight_pct && (
          <div style={{ background:`${t.yellow}11`, border:`1px solid ${t.yellow}44`,
            borderRadius:6, padding:'8px 14px', marginBottom:8,
            fontSize:12, fontFamily:t.mono, color:t.yellow }}>
            ⚠ Front weight % not set — spring rate formula will use 52% fallback.
            Edit the car to add it.
          </div>
        )}
        {car.base_stats && Object.keys(car.base_stats).length > 0 && (
          <div style={{ background:t.surf2, borderRadius:6, padding:'10px 14px',
            display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:'6px 12px' }}>
            {Object.entries(car.base_stats).map(([k, v]) => {
              const field = (CAR_STAT_FIELDS || []).find(f => f.key === k)
              return (
                <div key={k}>
                  <div style={{ fontSize:10, fontFamily:t.mono, color:t.dim,
                    textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }}>
                    {field?.label || k.replace(/_/g,' ')}
                  </div>
                  <div style={{ fontSize:13, fontFamily:t.mono, color:t.text }}>
                    {v}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Parts list */}
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {loading && <div style={{ color:t.dim, fontSize:14, fontFamily:t.mono }}>Loading...</div>}

        {/* Category groups from DB */}
        {Object.entries(grouped).map(([cat, subs]) => {
          const cc = catCompletion[cat] || { total: 0, withEffects: 0 }
          const catPct = cc.total > 0 ? Math.round((cc.withEffects / cc.total) * 100) : 0
          const catColor = catPct === 100 ? t.green : catPct > 0 ? t.yellow : t.dim
          return (
          <div key={cat} style={{ marginBottom:8 }}>
            <div onClick={() => toggleCat(cat)}
              style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                background:t.surf2, border:`1px solid ${t.border}`, borderRadius:6,
                padding:'10px 14px', cursor:'pointer' }}>
              <span style={{ fontFamily:t.head, fontSize:14, fontWeight:700,
                textTransform:'uppercase', letterSpacing:'0.06em', color:t.accent }}>
                {cat}
              </span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:12, color:catColor, fontFamily:t.mono }}>
                  {cc.withEffects}/{cc.total}
                  {catPct === 100 ? ' ✓' : ''}
                </span>
                <span style={{ fontSize:14, color:t.dim, fontFamily:t.mono }}>
                  {Object.values(subs).flat().length} parts
                </span>
                <span style={{ color:t.dim, fontSize:14 }}>{expanded[cat] ? '▲' : '▼'}</span>
              </div>
            </div>

            {expanded[cat] && (
              <div style={{ border:`1px solid ${t.border}`, borderTop:'none',
                borderRadius:'0 0 6px 6px', overflow:'hidden' }}>
                {Object.entries(subs).map(([sub, subParts]) => {
                  const subKey = `${cat}__${sub}`
                  const subOpen = expandedSub[subKey] !== false // default open
                  return (
                  <div key={sub}>
                    <div style={{ background:t.surf, padding:'8px 14px',
                      borderTop:`1px solid ${t.border}`,
                      display:'flex', justifyContent:'space-between', alignItems:'center',
                      cursor:'pointer' }}
                      onClick={() => toggleSub(subKey)}>
                      <span style={{ fontSize:14, color:t.mid, fontFamily:t.mono,
                        fontWeight:700 }}>{sub}
                        <span style={{ fontSize:11, color:t.dim, marginLeft:8 }}>
                          {subParts.length} {subOpen ? '▲' : '▼'}
                        </span>
                      </span>
                      <button onClick={e => { e.stopPropagation(); openAdd(cat, sub) }}
                        style={{ background:'none', border:'none', color:t.blue,
                          fontSize:13, fontFamily:t.mono, cursor:'pointer' }}>
                        + add here
                      </button>
                    </div>
                    {subOpen && subParts.map(p => (
                      <PartRow key={p.id} part={p} userId={userId} userRole={userRole}
                        onEdit={() => setModal(p)}
                        onVerify={() => verify(p)}
                        onDelete={() => deletePart(p.id)} />
                    ))}
                  </div>
                )})}

              </div>
            )}
          </div>
        )})}

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

        {/* Quick-add buttons */}
        {!loading && (
          <div style={{ marginTop:16 }}>
            {(() => {
              // Merge predefined CATEGORIES with actual categories/subcategories on this car
              const dbCats = {}
              parts.forEach(p => {
                if (!dbCats[p.category]) dbCats[p.category] = new Set()
                dbCats[p.category].add(p.subcategory)
              })
              const allCats = { ...Object.fromEntries(Object.entries(CATEGORIES).map(([k,v]) => [k, new Set(v)])) }
              Object.entries(dbCats).forEach(([cat, subs]) => {
                if (!allCats[cat]) allCats[cat] = new Set()
                subs.forEach(s => allCats[cat].add(s))
              })
              const catList = Object.keys(allCats)
              const subList = catList.flatMap(cat => [...allCats[cat]].map(sub => ({ cat, sub })))
              return <>
                <div style={{ fontSize:11, color:t.dim, fontFamily:t.mono,
                  textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>
                  Quick Add by Category
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                  {catList.map(cat => (
                    <button key={cat} onClick={() => openAdd(cat)}
                      style={{ background:t.surf2, border:`1px solid ${t.border}`,
                        color:t.mid, padding:'5px 12px', borderRadius:4,
                        fontSize:12, fontFamily:t.mono, cursor:'pointer' }}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:11, color:t.dim, fontFamily:t.mono,
                  textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>
                  Quick Add by Subcategory
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                  {subList.map(({ cat, sub }) => (
                    <button key={`${cat}__${sub}`} onClick={() => openAdd(cat, sub)}
                      style={{ background:t.surf2, border:`1px solid ${t.border}`,
                        color:t.mid, padding:'5px 12px', borderRadius:4,
                        fontSize:12, fontFamily:t.mono, cursor:'pointer' }}
                      title={cat}>
                      {sub}
                    </button>
                  ))}
                </div>
              </>
            })()}
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <PartModal carId={car.id} userId={userId} car={car} userRole={userRole}
          baseStats={{ ...(car.base_stats || {}), front_weight_pct: car.front_weight_pct }}
          prefillCat={prefCat} prefillSub={prefSub}
          onClose={() => setModal(null)}
          onSaved={(keepOpen) => { load(); if (!keepOpen) { setModal(null); setExpanded(p => ({ ...p, [prefCat]: true })) } }} />
      )}
      {modal && modal !== 'add' && (
        <PartModal part={modal} carId={car.id} userId={userId} car={car} userRole={userRole}
          baseStats={{ ...(car.base_stats || {}), front_weight_pct: car.front_weight_pct }}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }} />
      )}
      {showClone && (
        <CloneModal
          currentCar={car}
          onClose={() => setShowClone(false)}
          onClone={handleClone}
          cloning={cloning}
        />
      )}
      {cloneMsg && (
        <div style={{ position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
          background:t.surf, border:`1px solid ${cloneMsg.startsWith('✓') ? t.green : t.red}`,
          borderRadius:6, padding:'10px 20px', fontSize:12, fontFamily:t.mono,
          color: cloneMsg.startsWith('✓') ? t.green : t.red, zIndex:200,
          maxWidth:500, textAlign:'center' }}>
          {cloneMsg}
          <button onClick={() => setCloneMsg('')}
            style={{ background:'none', border:'none', color:'inherit',
              cursor:'pointer', marginLeft:12, fontSize:14 }}>✕</button>
        </div>
      )}
    </div>
  )
}

// ── PART ROW ──────────────────────────────────────────────
function PartRow({ part, userId, userRole, onEdit, onVerify, onDelete }) {
  const [hover, setHover] = useState(false)
  const isOwner    = part.added_by === userId
  const isVerifier = userRole === 'verifier'
  const eff     = part.effects || {}
  const effKeys = Object.keys(eff).filter(k => eff[k] !== undefined && eff[k] !== false && eff[k] !== '')

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: hover ? t.surf2 : 'transparent',
        borderTop:`1px solid ${t.border}33`, padding:'8px 14px',
        display:'flex', alignItems:'flex-start', gap:12, transition:'background 0.1s' }}>
      <div style={{ flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:14, color: part.is_stock ? t.dim : t.text, fontFamily:t.mono }}>{part.name}</span>
          {part.is_stock && <Tag color={t.dim}>STOCK</Tag>}
          {part.pi_change !== 0 && (
            <Tag color={part.pi_change > 0 ? t.yellow : t.green}>
              {part.pi_change > 0 ? '+' : ''}{part.pi_change} PI
            </Tag>
          )}
          {part.price_cr && <Tag color={t.dim}>{part.price_cr.toLocaleString()} CR</Tag>}
          {part.verified ? <Tag color={t.green}>✓ VERIFIED</Tag> : <Tag color={t.yellow}>UNVERIFIED</Tag>}
        </div>
        {effKeys.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:5 }}>
            {effKeys.map(k => (
              <span key={k} style={{ fontSize:11, color:t.dim, fontFamily:t.mono,
                background:t.surf3, padding:'1px 6px', borderRadius:2 }}>
                {k.replace(/_/g,' ')}: {typeof eff[k]==='boolean'?'yes':eff[k]}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ display:'flex', gap:6, flexShrink:0, opacity: hover ? 1 : 0, transition:'opacity 0.1s' }}>
        {isVerifier && <Btn small variant="ghost" onClick={onVerify}>{part.verified ? 'Unverify' : 'Verify'}</Btn>}
        {isOwner && !part.verified && <Btn small variant="ghost" onClick={onEdit}>Edit</Btn>}
        {isOwner && <Btn small variant="danger" onClick={onDelete}>Del</Btn>}
      </div>
    </div>
  )
}

import Papa from 'papaparse'

// ── CSV IMPORT CONSTANTS ──────────────────────────────────
const IMPORT_COLUMNS = [
  'car_id','category','subcategory','name','is_stock','pi_change','price_cr',
  'stat_speed','stat_handling','stat_acceleration','stat_launch','stat_braking','stat_offroad',
  'power_hp','torque_nm','weight_kg','top_speed_kmh','accel_0_97','accel_0_161',
  'brake_dist_97','brake_dist_161','lateral_g_97','lateral_g_193',
  'aero_efficiency','aero_balance','mech_balance',
  'compound_type','unlocks_tuning','unlock_type'
]
const EFFECT_KEYS = [
  'stat_speed','stat_handling','stat_acceleration','stat_launch','stat_braking','stat_offroad',
  'power_hp','torque_nm','weight_kg','top_speed_kmh','accel_0_97','accel_0_161',
  'brake_dist_97','brake_dist_161','lateral_g_97','lateral_g_193',
  'aero_efficiency','aero_balance','mech_balance',
  'compound_type','unlocks_tuning','unlock_type'
]
const NUMERIC_KEYS = [
  'pi_change','price_cr',
  'stat_speed','stat_handling','stat_acceleration','stat_launch','stat_braking','stat_offroad',
  'power_hp','torque_nm','weight_kg','top_speed_kmh','accel_0_97','accel_0_161',
  'brake_dist_97','brake_dist_161','lateral_g_97','lateral_g_193',
  'aero_efficiency','aero_balance','mech_balance'
]

function downloadCSV(filename, rows) {
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function buildEffects(row) {
  const effects = {}
  EFFECT_KEYS.forEach(k => {
    const v = row[k]
    if (v === undefined || v === null || v === '') return
    if (k === 'unlocks_tuning') {
      if (v === 'true' || v === '1' || v === true) effects[k] = true
      return
    }
    if (NUMERIC_KEYS.includes(k)) {
      const n = parseFloat(v)
      if (!isNaN(n) && n !== 0) effects[k] = n
    } else {
      if (String(v).trim()) effects[k] = String(v).trim()
    }
  })
  return effects
}

function validateRows(rows, knownCarIds) {
  return rows.map((row, i) => {
    const errors = [], warnings = []
    if (!row.car_id?.trim())  errors.push('Missing car_id')
    if (!row.category?.trim()) errors.push('Missing category')
    if (!row.name?.trim())    errors.push('Missing name')
    if (row.car_id && !knownCarIds.has(row.car_id.trim())) warnings.push('Unknown car_id')
    NUMERIC_KEYS.forEach(k => {
      if (row[k] !== undefined && row[k] !== '' && isNaN(parseFloat(row[k])))
        errors.push(`${k} is not a number`)
    })
    return { ...row, _row: i + 2, _errors: errors, _warnings: warnings,
             _valid: errors.length === 0 }
  })
}

// ── IMPORT VIEW ───────────────────────────────────────────
function ImportView({ onBack, userId }) {
  const [loadingCars, setLoadingCars] = useState(false)
  const [rows,        setRows]        = useState([])
  const [validated,   setValidated]   = useState([])
  const [knownCars,   setKnownCars]   = useState([])
  const [importing,   setImporting]   = useState(false)
  const [result,      setResult]      = useState(null)
  const [fileErr,     setFileErr]     = useState('')

  // Download import template
  const downloadTemplate = () => {
    downloadCSV('fh6_parts_import_template.csv',
      [Object.fromEntries(IMPORT_COLUMNS.map(c => [c, '']))])
  }

  // Download car lookup
  const downloadLookup = async () => {
    setLoadingCars(true)
    const { data } = await supabase.from('cars')
      .select('id,make,model,year').eq('verified', true).order('make').order('model')
    if (data) downloadCSV('fh6_car_lookup.csv',
      data.map(c => ({ car_id: c.id, make: c.make, model: c.model, year: c.year })))
    setLoadingCars(false)
  }

  // Load known car IDs for validation
  const loadKnownCars = async () => {
    const { data } = await supabase.from('cars').select('id,make,model,year')
    return data || []
  }

  // Parse uploaded CSV
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileErr(''); setRows([]); setValidated([]); setResult(null)
    const cars = await loadKnownCars()
    setKnownCars(cars)
    const carIdSet = new Set(cars.map(c => c.id))
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length > 0) { setFileErr(`Parse error: ${errors[0].message}`); return }
        if (data.length === 0) { setFileErr('File is empty'); return }
        const v = validateRows(data, carIdSet)
        setRows(data); setValidated(v)
      },
      error: (err) => setFileErr(`Failed to read file: ${err.message}`)
    })
    e.target.value = ''
  }

  // Import valid rows
  const handleImport = async () => {
    const valid = validated.filter(r => r._valid)
    if (valid.length === 0) return
    setImporting(true); setResult(null)
    const payload = valid.map(row => ({
      car_id:     row.car_id.trim(),
      category:   row.category.trim(),
      subcategory:(row.subcategory || '').trim(),
      name:        row.name.trim(),
      is_stock:    row.is_stock === 'true' || row.is_stock === '1',
      pi_change:   row.pi_change !== '' ? parseInt(row.pi_change) : 0,
      price_cr:    row.price_cr  !== '' ? parseInt(row.price_cr)  : null,
      effects:     buildEffects(row),
      added_by:    userId,
    }))

    // Batch insert in chunks of 100
    let inserted = 0, skipped = 0
    for (let i = 0; i < payload.length; i += 100) {
      const chunk = payload.slice(i, i + 100)
      const { error, data } = await supabase.from('car_parts').insert(chunk)
      if (error) { skipped += chunk.length; console.error('Batch error:', error) }
      else inserted += chunk.length
    }
    setImporting(false)
    setResult({ inserted, skipped, total: payload.length })
  }

  const validCount   = validated.filter(r => r._valid).length
  const invalidCount = validated.filter(r => !r._valid).length
  const warnCount    = validated.filter(r => r._valid && r._warnings.length > 0).length
  const carCount     = new Set(validated.filter(r => r._valid).map(r => r.car_id)).size
  const preview      = validated.slice(0, 10)

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:t.surf, borderBottom:`1px solid ${t.border}`,
        padding:'12px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:`1px solid ${t.border}`,
          color:t.dim, padding:'5px 12px', borderRadius:4, fontSize:13,
          fontFamily:t.mono, cursor:'pointer', textTransform:'uppercase' }}>← Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:t.head, fontSize:22, fontWeight:800,
            textTransform:'uppercase', letterSpacing:'0.05em', color:t.text }}>
            CSV Import
          </div>
          <div style={{ fontSize:12, color:t.dim, fontFamily:t.mono, marginTop:2 }}>
            Bulk import car parts from spreadsheet
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        <div style={{ maxWidth:960 }}>

          {/* Step 1 — Download templates */}
          <div style={{ background:t.surf, border:`1px solid ${t.border}`,
            borderRadius:6, padding:18, marginBottom:16 }}>
            <div style={{ fontSize:11, color:t.accent, fontFamily:t.mono,
              textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>
              Step 1 — Download Templates
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              <Btn variant="ghost" onClick={downloadTemplate}>
                ↓ Import Template CSV
              </Btn>
              <Btn variant="ghost" onClick={downloadLookup} disabled={loadingCars}>
                {loadingCars ? 'Loading...' : '↓ Car Lookup CSV (VLOOKUP source)'}
              </Btn>
            </div>
            <div style={{ fontSize:11, color:t.dim, fontFamily:t.mono, marginTop:10,
              lineHeight:1.6 }}>
              Fill the template in Excel/Google Sheets. Use VLOOKUP with the car lookup file
              to get the correct <span style={{color:t.accent}}>car_id</span> for each row.
              Save as CSV when done.
            </div>
          </div>

          {/* Step 2 — Upload */}
          <div style={{ background:t.surf, border:`1px solid ${t.border}`,
            borderRadius:6, padding:18, marginBottom:16 }}>
            <div style={{ fontSize:11, color:t.accent, fontFamily:t.mono,
              textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>
              Step 2 — Upload CSV
            </div>
            <label style={{ display:'inline-block', cursor:'pointer' }}>
              <div style={{ background:t.surf2, border:`2px dashed ${t.border}`,
                borderRadius:6, padding:'20px 32px', textAlign:'center',
                fontSize:13, fontFamily:t.mono, color:t.mid,
                transition:'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = t.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = t.border}>
                Click to select .csv file
              </div>
              <input type="file" accept=".csv" onChange={handleFile}
                style={{ display:'none' }} />
            </label>
            {fileErr && <div style={{ color:t.red, fontSize:12, fontFamily:t.mono,
              marginTop:8 }}>{fileErr}</div>}
          </div>

          {/* Step 3 — Preview + Import */}
          {validated.length > 0 && (
            <div style={{ background:t.surf, border:`1px solid ${t.border}`,
              borderRadius:6, padding:18, marginBottom:16 }}>
              <div style={{ fontSize:11, color:t.accent, fontFamily:t.mono,
                textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:12 }}>
                Step 3 — Preview & Import
              </div>

              {/* Summary */}
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:14 }}>
                <Tag color={t.green}>{validCount} valid rows</Tag>
                <Tag color={t.blue}>{carCount} cars</Tag>
                {warnCount > 0 && <Tag color={t.yellow}>{warnCount} warnings</Tag>}
                {invalidCount > 0 && <Tag color={t.red}>{invalidCount} invalid (will be skipped)</Tag>}
              </div>

              {/* Preview table */}
              <div style={{ overflowX:'auto', marginBottom:14 }}>
                <table style={{ width:'100%', borderCollapse:'collapse',
                  fontSize:11, fontFamily:t.mono }}>
                  <thead>
                    <tr style={{ background:t.surf2 }}>
                      {['Row','Status','car_id','category','subcategory','name','pi_change','Warnings/Errors'].map(h => (
                        <th key={h} style={{ padding:'6px 10px', textAlign:'left',
                          color:t.dim, fontSize:10, textTransform:'uppercase',
                          letterSpacing:'0.08em', borderBottom:`1px solid ${t.border}`,
                          whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} style={{ background: i%2===0 ? t.surf : t.surf2 }}>
                        <td style={{ padding:'5px 10px', color:t.dim }}>{row._row}</td>
                        <td style={{ padding:'5px 10px' }}>
                          {row._valid
                            ? <span style={{ color:t.green }}>✓</span>
                            : <span style={{ color:t.red }}>✗</span>}
                        </td>
                        <td style={{ padding:'5px 10px', color:t.text, maxWidth:120,
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {row.car_id?.slice(0,8)}…
                        </td>
                        <td style={{ padding:'5px 10px', color:t.mid }}>{row.category}</td>
                        <td style={{ padding:'5px 10px', color:t.mid }}>{row.subcategory}</td>
                        <td style={{ padding:'5px 10px', color:t.text }}>{row.name}</td>
                        <td style={{ padding:'5px 10px', color:t.yellow }}>{row.pi_change}</td>
                        <td style={{ padding:'5px 10px', fontSize:10,
                          color: row._errors.length ? t.red : t.yellow }}>
                          {[...row._errors, ...row._warnings].join(', ') || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validated.length > 10 && (
                  <div style={{ fontSize:11, color:t.dim, fontFamily:t.mono,
                    padding:'6px 10px', background:t.surf2 }}>
                    … and {validated.length - 10} more rows (showing first 10)
                  </div>
                )}
              </div>

              {/* Import button */}
              {!result && (
                <Btn onClick={handleImport} disabled={importing || validCount === 0}>
                  {importing ? `Importing ${validCount} rows...` : `Import ${validCount} valid rows`}
                </Btn>
              )}

              {/* Result */}
              {result && (
                <div style={{ background:t.surf2, border:`1px solid ${t.green}44`,
                  borderRadius:6, padding:'12px 16px' }}>
                  <div style={{ fontSize:13, fontFamily:t.mono }}>
                    <span style={{ color:t.green }}>✓ Imported: {result.inserted} rows</span>
                    {result.skipped > 0 && (
                      <span style={{ color:t.red, marginLeft:16 }}>
                        ✗ Failed: {result.skipped} rows
                      </span>
                    )}
                  </div>
                  {result.skipped > 0 && (
                    <div style={{ fontSize:11, color:t.dim, fontFamily:t.mono, marginTop:4 }}>
                      Failed rows may already exist (duplicate car_id + category + name).
                      Check browser console for details.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── DESCRIPTIONS VIEW ─────────────────────────────────────
function DescriptionsView({ onBack }) {
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // null | 'add' | item
  const [delConfirm, setDelConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('descriptions').select('*').order('key')
    setItems(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    await supabase.from('descriptions').delete().eq('id', id)
    setDelConfirm(null)
    load()
  }

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:t.surf, borderBottom:`1px solid ${t.border}`,
        padding:'12px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'none', border:`1px solid ${t.border}`,
          color:t.dim, padding:'5px 12px', borderRadius:4, fontSize:13,
          fontFamily:t.mono, cursor:'pointer', textTransform:'uppercase' }}>← Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:t.head, fontSize:22, fontWeight:800,
            textTransform:'uppercase', letterSpacing:'0.05em', color:t.text }}>
            Descriptions
          </div>
          <div style={{ fontSize:12, color:t.dim, fontFamily:t.mono, marginTop:2 }}>
            {items.length} entries
          </div>
        </div>
        <Btn onClick={() => setModal('add')}>+ New</Btn>
      </div>

      {/* List */}
      <div style={{ flex:1, overflowY:'auto', padding:20 }}>
        {loading
          ? <div style={{ color:t.dim, fontFamily:t.mono, fontSize:13 }}>Loading...</div>
          : items.length === 0
          ? <div style={{ textAlign:'center', padding:60, color:t.dim,
              fontFamily:t.mono, fontSize:13 }}>No descriptions yet.</div>
          : (
            <div style={{ display:'flex', flexDirection:'column', gap:8, maxWidth:820 }}>
              {items.map(item => (
                <div key={item.id} style={{ background:t.surf,
                  border:`1px solid ${t.border}`, borderRadius:6, padding:'12px 16px',
                  display:'flex', alignItems:'flex-start', gap:16 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                      <span style={{ fontSize:12, fontFamily:t.mono, color:t.accent,
                        background:t.accentDim, padding:'2px 8px', borderRadius:3 }}>
                        {item.key}
                      </span>
                      <span style={{ fontSize:14, fontFamily:t.head, fontWeight:700,
                        color:t.text, textTransform:'uppercase', letterSpacing:'0.04em' }}>
                        {item.title}
                      </span>
                    </div>
                    <div style={{ fontSize:12, color:t.dim, fontFamily:t.mono,
                      lineHeight:1.6, whiteSpace:'pre-wrap',
                      maxHeight:60, overflow:'hidden', textOverflow:'ellipsis' }}>
                      {item.body}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <Btn small variant="ghost" onClick={() => setModal(item)}>Edit</Btn>
                    <Btn small variant="danger" onClick={() => setDelConfirm(item)}>Del</Btn>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>

      {/* Add / Edit modal */}
      {modal && (
        <DescriptionModal
          item={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:t.surf, border:`1px solid ${t.border}`,
            borderRadius:8, padding:28, maxWidth:360 }}>
            <div style={{ fontFamily:t.head, fontSize:18, fontWeight:700,
              textTransform:'uppercase', color:t.text, marginBottom:8 }}>
              Delete description?
            </div>
            <div style={{ fontFamily:t.mono, fontSize:12, color:t.dim, marginBottom:6 }}>
              Key: <span style={{ color:t.accent }}>{delConfirm.key}</span>
            </div>
            <div style={{ fontFamily:t.mono, fontSize:12, color:t.red, marginBottom:20 }}>
              This cannot be undone.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Btn variant="danger" onClick={() => handleDelete(delConfirm.id)}>Delete</Btn>
              <Btn variant="ghost" onClick={() => setDelConfirm(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DescriptionModal({ item, onClose, onSaved }) {
  const isEdit = !!item
  const [key,   setKey]   = useState(item?.key   || '')
  const [title, setTitle] = useState(item?.title || '')
  const [body,  setBody]  = useState(item?.body  || '')
  const [err,   setErr]   = useState('')
  const [saving,setSaving]= useState(false)

  const save = async () => {
    if (!key.trim())   { setErr('Key is required'); return }
    if (!title.trim()) { setErr('Title is required'); return }
    if (!body.trim())  { setErr('Body is required'); return }
    setSaving(true); setErr('')
    const payload = { key: key.trim(), title: title.trim(), body: body.trim() }
    const { error } = isEdit
      ? await supabase.from('descriptions').update({ title: payload.title, body: payload.body }).eq('id', item.id)
      : await supabase.from('descriptions').insert(payload)
    if (error) { setErr(`Save failed: ${error.message}`); setSaving(false); return }
    onSaved()
  }

  return (
    <Modal title={isEdit ? 'Edit Description' : 'New Description'} onClose={onClose} wide>
      <Row label="Key">
        {isEdit
          ? <div style={{ padding:'7px 10px', background:t.surf2,
              border:`1px solid ${t.border}`, borderRadius:4,
              fontSize:14, fontFamily:t.mono, color:t.accent }}>
              {item.key}
            </div>
          : <>
              <Input value={key} onChange={v => setKey(v.toLowerCase().replace(/[^a-z0-9_]/g,''))}
                placeholder="parts_suspension" />
              <div style={{ fontSize:11, color:t.dim, fontFamily:t.mono, marginTop:4 }}>
                Format: parts_[category] or tune_[section] — lowercase + underscore only
              </div>
            </>
        }
      </Row>
      <Row label="Title">
        <Input value={title} onChange={setTitle} placeholder="Springs and Dampers" />
      </Row>
      <Row label="Body">
        <textarea value={body} onChange={e => setBody(e.target.value)}
          placeholder="Describe this setting or category..."
          rows={8}
          style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
            padding:'8px 10px', borderRadius:4, fontSize:13, fontFamily:t.mono,
            width:'100%', outline:'none', resize:'vertical', lineHeight:1.6 }} />
      </Row>
      {err && <div style={{ color:t.red, fontSize:13, fontFamily:t.mono, marginBottom:12 }}>{err}</div>}
      <div style={{ display:'flex', gap:8 }}>
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}</Btn>
        <Btn onClick={onClose} variant="ghost">Cancel</Btn>
      </div>
    </Modal>
  )
}

// ── GARAGE / CAR LIST ─────────────────────────────────────
// Actual mode preference persisted in sessionStorage
const getActualModePref = () => sessionStorage.getItem('fh6_input_mode') || 'delta'
const setActualModePref = (m) => sessionStorage.setItem('fh6_input_mode', m)

function Garage({ userId, userRole, onSelectCar }) {
  const [cars,       setCars]      = useState([])
  const [partCounts, setPartCounts]= useState({})
  const [search,     setSearch]    = useState('')
  const [filterClass,setFilterClass]= useState('')
  const [filterDt,   setFilterDt]  = useState('')
  const [sortBy,     setSortBy]    = useState('make')
  const [loading,    setLoading]   = useState(true)
  const [modal,      setModal]     = useState(null)
  const [showAdmin,  setShowAdmin] = useState(false)
  const [showDesc,   setShowDesc]  = useState(false)
  const [showImport, setShowImport]= useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('cars').select('*').order('make').order('model')
    setCars(data || [])
    // Efficient count query using aggregation
    const { data: counts } = await supabase.rpc('get_car_part_counts')
    if (counts) {
      const map = {}
      counts.forEach(r => {
        map[r.car_id] = { total: parseInt(r.total), withEffects: parseInt(r.with_effects) }
      })
      setPartCounts(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = cars.filter(c => {
    const matchSearch = `${c.make} ${c.model} ${c.year}`.toLowerCase().includes(search.toLowerCase())
    const matchClass  = !filterClass || c.stock_class === filterClass
    const matchDt     = !filterDt   || c.stock_drivetrain === filterDt
    return matchSearch && matchClass && matchDt
  }).sort((a, b) => {
    if (sortBy === 'parts_asc') {
      return (partCounts[a.id]?.total || 0) - (partCounts[b.id]?.total || 0)
    }
    if (sortBy === 'incomplete') {
      const pctA = partCounts[a.id] ? partCounts[a.id].withEffects / partCounts[a.id].total : 0
      const pctB = partCounts[b.id] ? partCounts[b.id].withEffects / partCounts[b.id].total : 0
      return pctA - pctB
    }
    // default: make/model
    return `${a.make} ${a.model}`.localeCompare(`${b.make} ${b.model}`)
  })

  const availableClasses = [...new Set(cars.map(c => c.stock_class).filter(Boolean))].sort()

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ background:t.surf, borderBottom:`1px solid ${t.border}`,
        padding:'12px 20px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:4, height:22, background:t.accent, borderRadius:2 }} />
          <span style={{ fontFamily:t.head, fontSize:20, fontWeight:800,
            textTransform:'uppercase', letterSpacing:'0.08em', color:t.text }}>FH6 Data Entry</span>
        </div>
        <Tag color={userRole === 'verifier' ? t.green : t.blue}>{userRole || 'contributor'}</Tag>
        <div style={{ flex:1 }} />
        {userRole === 'verifier' && (
          <Btn variant="ghost" small onClick={() => setShowAdmin(true)}>👥 Users</Btn>
        )}
        <Btn variant="ghost" small onClick={() => setShowDesc(true)}>📋 Descriptions</Btn>
        <Btn variant="ghost" small onClick={() => setShowImport(true)}>⬆ Import CSV</Btn>
        <Btn onClick={() => setModal('add')}>+ Add Car</Btn>
        <button onClick={() => supabase.auth.signOut()}
          style={{ background:'none', border:`1px solid ${t.border}`, color:t.dim,
            padding:'5px 12px', borderRadius:4, fontSize:13, fontFamily:t.mono, cursor:'pointer' }}>
          Sign out
        </button>
      </div>

      {/* Search + Filters */}
      <div style={{ padding:'12px 20px', flexShrink:0, display:'flex', gap:10, flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search cars... (make, model, year)"
          style={{ background:t.surf, border:`1px solid ${t.border}`, color:t.text,
            padding:'8px 14px', borderRadius:6, fontSize:14, fontFamily:t.mono,
            flex:1, minWidth:180, outline:'none' }} />
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          style={{ background:t.surf, border:`1px solid ${t.border}`, color: filterClass ? t.yellow : t.dim,
            padding:'8px 12px', borderRadius:6, fontSize:13, fontFamily:t.mono,
            cursor:'pointer', outline:'none', minWidth:80 }}>
          <option value="">All Classes</option>
          {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterDt} onChange={e => setFilterDt(e.target.value)}
          style={{ background:t.surf, border:`1px solid ${t.border}`, color: filterDt ? t.accent : t.dim,
            padding:'8px 12px', borderRadius:6, fontSize:13, fontFamily:t.mono,
            cursor:'pointer', outline:'none', minWidth:90 }}>
          <option value="">All DT</option>
          <option value="RWD">RWD</option>
          <option value="FWD">FWD</option>
          <option value="AWD">AWD</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ background:t.surf, border:`1px solid ${t.border}`, color:t.dim,
            padding:'8px 12px', borderRadius:6, fontSize:13, fontFamily:t.mono,
            cursor:'pointer', outline:'none', minWidth:120 }}>
          <option value="make">A→Z</option>
          <option value="parts_asc">Fewest parts first</option>
          <option value="incomplete">Least complete first</option>
        </select>
        {(filterClass || filterDt) && (
          <button onClick={() => { setFilterClass(''); setFilterDt('') }}
            style={{ background:'none', border:`1px solid ${t.border}`, color:t.dim,
              padding:'8px 12px', borderRadius:6, fontSize:12, fontFamily:t.mono, cursor:'pointer' }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Stats bar */}
      {!loading && (
        <div style={{ padding:'0 20px 10px', flexShrink:0,
          fontSize:11, color:t.dim, fontFamily:t.mono }}>
          {filtered.length} cars
          {(filterClass || filterDt || search) && ` (filtered from ${cars.length})`}
          {' · '}
          {Object.keys(partCounts).length} cars with parts
        </div>
      )}

      <div style={{ flex:1, overflowY:'auto', padding:'0 20px 20px' }}>
        {loading && <div style={{ color:t.dim, fontSize:14, fontFamily:t.mono, padding:20 }}>Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:60 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🚗</div>
            <div style={{ color:t.dim, fontFamily:t.mono, fontSize:14, marginBottom:16 }}>
              {search || filterClass || filterDt ? 'No cars match your filters.' : 'No cars in catalog yet.'}
            </div>
            <Btn onClick={() => setModal('add')}>+ Add First Car</Btn>
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px,1fr))', gap:10 }}>
          {filtered.map(car => (
            <CarCard key={car.id} car={car}
              counts={partCounts[car.id] || null}
              onClick={() => onSelectCar(car)}
              onEdit={() => setModal(car)} />
          ))}
        </div>
      </div>

      {modal === 'add' && <CarModal userId={userId} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
      {modal && modal !== 'add' && <CarModal car={modal} userId={userId} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
      {showAdmin && <AdminPanel currentUserId={userId} onClose={() => setShowAdmin(false)} />}
      {showDesc && <div style={{ position:'fixed', inset:0, zIndex:50, background:t.bg }}>
        <DescriptionsView onBack={() => setShowDesc(false)} />
      </div>}
      {showImport && <div style={{ position:'fixed', inset:0, zIndex:50, background:t.bg }}>
        <ImportView onBack={() => setShowImport(false)} userId={userId} />
      </div>}
    </div>
  )
}

function CarCard({ car, onClick, onEdit, counts }) {
  const [hover,  setHover]  = useState(false)
  const [copied, setCopied] = useState(false)
  const dtColor = { RWD:t.accent, FWD:t.blue, AWD:t.green }[car.stock_drivetrain] || t.dim
  const hasBaseStats = car.base_stats && Object.keys(car.base_stats).length > 0
  const hasparts = counts && counts.total > 0
  const pct = hasparts ? Math.round((counts.withEffects / counts.total) * 100) : 0

  const copyId = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(car.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{ background:t.surf, border:`1px solid ${hover?t.accent:t.border}`,
        borderRadius:6, padding:14, cursor:'pointer', transition:'border-color 0.15s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, color:t.dim, fontFamily:t.mono }}>{car.year}</div>
          <div style={{ fontFamily:t.head, fontSize:20, fontWeight:700,
            textTransform:'uppercase', letterSpacing:'0.04em', color:t.text, marginTop:2,
            whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {car.make} {car.model}
          </div>
        </div>
        <div style={{ display:'flex', gap:4, flexShrink:0, marginLeft:8 }}>
          <button onClick={copyId}
            style={{ background:'none',
              border:`1px solid ${copied ? t.green : t.border}`,
              color: copied ? t.green : t.dim,
              padding:'3px 8px', borderRadius:3, fontSize:11, fontFamily:t.mono,
              cursor:'pointer', whiteSpace:'nowrap' }}>
            {copied ? '✓ ID' : 'ID'}
          </button>
          <button onClick={e => { e.stopPropagation(); onEdit() }}
            style={{ background:'none', border:`1px solid ${t.border}`, color:t.dim,
              padding:'3px 10px', borderRadius:3, fontSize:14, fontFamily:t.mono, cursor:'pointer' }}>
            Edit
          </button>
        </div>
      </div>
      <div style={{ display:'flex', gap:5, marginTop:10, flexWrap:'wrap' }}>
        {car.stock_class && <Tag color={t.yellow}>{car.stock_class} {car.stock_pi||''}</Tag>}
        {car.stock_drivetrain && <Tag color={dtColor}>{car.stock_drivetrain}</Tag>}
        {car.car_type && <Tag color={t.dim}>{car.car_type}</Tag>}
      </div>
      <div style={{ marginTop:10, display:'flex', gap:8, alignItems:'center' }}>
        <div style={{ fontSize:11, color: hasBaseStats ? t.green : t.dim, fontFamily:t.mono }}>
          {hasBaseStats ? '✓ Stats' : '○ No stats'}
        </div>
        {hasparts && (
          <>
            <div style={{ fontSize:11, color:t.dim, fontFamily:t.mono }}>·</div>
            <div style={{ fontSize:11, fontFamily:t.mono,
              color: pct === 100 ? t.green : pct > 0 ? t.yellow : t.dim }}>
              {counts.withEffects}/{counts.total} parts
              {pct === 100 ? ' ✓' : pct > 0 ? ` (${pct}%)` : ' — empty'}
            </div>
          </>
        )}
        {!hasparts && (
          <div style={{ fontSize:11, color:t.dim, fontFamily:t.mono }}>· No parts yet</div>
        )}
      </div>
      {hasparts && pct < 100 && (
        <div style={{ marginTop:6, height:3, background:t.surf2, borderRadius:2, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`,
            background: pct > 50 ? t.yellow : t.red,
            borderRadius:2, transition:'width 0.3s' }} />
        </div>
      )}
    </div>
  )
}

// ── APP ROOT ──────────────────────────────────────────────
export default function App() {
  const [session,     setSession]     = useState(null)
  const [authReady,   setAuthReady]   = useState(false)
  const [userRole,    setUserRole]    = useState('contributor')
  const [selectedCar, setSelectedCar] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session); setAuthReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load role when session changes
  useEffect(() => {
    if (!session) return
    // Data entry tool is editor-only — all users have full (verifier) rights
    setUserRole('verifier')
  }, [session])

  if (!authReady) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:t.bg, color:t.dim,
      fontSize:14, fontFamily:t.mono }}>Loading...</div>
  )

  if (!session) return <Login />

  const userId = session.user.id

  if (selectedCar) return (
    <CarDetail car={selectedCar} userId={userId} userRole={userRole}
      onBack={() => setSelectedCar(null)} />
  )

  return <Garage userId={userId} userRole={userRole} onSelectCar={setSelectedCar} />
}
