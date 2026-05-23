import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { CATEGORIES, EFFECT_FIELDS, CAR_STAT_FIELDS, CLASSES } from './lib/categories'

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
    { label:'Main Stats',keys:['stat_speed','stat_handling','stat_acceleration','stat_launch','stat_braking','stat_offroad'] },
    { label:'Engine',   keys:['power_hp','torque_nm','weight_kg','pwr_hp_kg','displacement_cc','top_speed_kmh'] },
    { label:'Timing',   keys:['accel_0_97','accel_0_161','brake_dist_97','brake_dist_161'] },
    { label:'Dynamics', keys:['lateral_g_97','lateral_g_193','mech_balance','aero_balance','aero_efficiency'] },
  ]

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
        From in-game Performance screen — leave empty if unknown, fill in later
      </div>
      {statGroups.map(group => (
        <div key={group.label} style={{ marginBottom:12 }}>
          <div style={{ fontSize:10, color:t.dim, fontFamily:t.mono, textTransform:'uppercase',
            letterSpacing:'0.1em', marginBottom:8, borderBottom:`1px solid ${t.border}33`,
            paddingBottom:4 }}>{group.label}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0 16px' }}>
            {CAR_STAT_FIELDS.filter(f => group.keys.includes(f.key)).map(f => (
              <Row key={f.key} label={f.label}>
                <input type="number" value={baseStats[f.key] ?? ''} step={f.step}
                  placeholder="—"
                  onChange={e => updS(f.key, e.target.value === '' ? '' : parseFloat(e.target.value))}
                  style={{ background:t.surf3, border:`1px solid ${t.border}`, color:t.text,
                    padding:'7px 10px', borderRadius:4, fontSize:14, fontFamily:t.mono,
                    width:'100%', outline:'none' }} />
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
function PartModal({ part, carId, prefillCat, prefillSub, onClose, onSaved, userId, baseStats, car }) {
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
  const [inputMode, setInputMode] = useState('delta') // 'delta' | 'actual'
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

  const save = async () => {
    if (!name)     { setErr('Part name is required'); return }
    if (!finalSub) { setErr('Subcategory is required'); return }
    setSaving(true); setErr('')

    // Actual mode: compute deltas ONLY where base stat exists — skip the rest
    let finalEffects = { ...effects }
    if (inputMode === 'actual') {
      EFFECT_FIELDS.filter(f => f.type === 'number').forEach(f => {
        const actual = actualVals[f.key]
        if (actual === '' || actual === undefined) return
        const base = (baseStats || {})[f.key]
        if (base !== undefined && base !== null && base !== '') {
          // Has base stat → save delta
          finalEffects[f.key] = parseFloat((parseFloat(actual) - parseFloat(base)).toFixed(4))
        }
        // No base stat → do NOT save this field (skip entirely)
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
    }
    const { error } = isEdit
      ? await supabase.from('car_parts').update(payload).eq('id', part.id)
      : await supabase.from('car_parts').insert(payload)
    if (error) { setErr(`Save failed: ${error.message}`); setSaving(false); return }
    onSaved()
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
            <button key={mode} onClick={() => setInputMode(mode)}
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

      {['Main Stats','Engine','Braking','Lateral G','Speed','Aero','Flags'].map(group => {
        const fields = EFFECT_FIELDS.filter(f => f.group === group)
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

                return (
                  <Row key={f.key} label={
                    useActual && hasBase
                      ? `${f.label} (base: ${baseVal})`
                      : f.label
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
                                  value={actualVals[f.key] ?? ''}
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
                                {actualVals[f.key] !== undefined && actualVals[f.key] !== '' && (
                                  <div style={{ fontSize:11, color:t.blue, fontFamily:t.mono, marginTop:2 }}>
                                    Δ {parseFloat((parseFloat(actualVals[f.key]) - parseFloat(baseVal)).toFixed(4)) >= 0 ? '+' : ''}
                                    {parseFloat((parseFloat(actualVals[f.key]) - parseFloat(baseVal)).toFixed(4))}
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
      <div style={{ display:'flex', gap:8 }}>
        <Btn onClick={save} disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Add Part'}</Btn>
        <Btn onClick={onClose} variant="ghost">Cancel</Btn>
      </div>
    </Modal>
  )
}

// ── CAR DETAIL VIEW ───────────────────────────────────────
function CarDetail({ car, userId, userRole, onBack }) {
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

        {/* Base stats */}
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
                      <PartRow key={p.id} part={p} userId={userId} userRole={userRole}
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
        <PartModal carId={car.id} userId={userId} car={car} baseStats={car.base_stats || {}}
          prefillCat={prefCat} prefillSub={prefSub}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); setExpanded(p => ({ ...p, [prefCat]: true })) }} />
      )}
      {modal && modal !== 'add' && (
        <PartModal part={modal} carId={car.id} userId={userId} car={car} baseStats={car.base_stats || {}}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }} />
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
function Garage({ userId, userRole, onSelectCar }) {
  const [cars,    setCars]    = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showDesc,  setShowDesc]  = useState(false)

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
        <Btn onClick={() => setModal('add')}>+ Add Car</Btn>
        <button onClick={() => supabase.auth.signOut()}
          style={{ background:'none', border:`1px solid ${t.border}`, color:t.dim,
            padding:'5px 12px', borderRadius:4, fontSize:13, fontFamily:t.mono, cursor:'pointer' }}>
          Sign out
        </button>
      </div>

      <div style={{ padding:'14px 20px 0', flexShrink:0 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search cars... (make, model, year)"
          style={{ background:t.surf, border:`1px solid ${t.border}`, color:t.text,
            padding:'9px 14px', borderRadius:6, fontSize:14, fontFamily:t.mono,
            width:'100%', outline:'none' }} />
      </div>

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
            <CarCard key={car.id} car={car} onClick={() => onSelectCar(car)} onEdit={() => setModal(car)} />
          ))}
        </div>
      </div>

      {modal === 'add' && <CarModal userId={userId} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
      {modal && modal !== 'add' && <CarModal car={modal} userId={userId} onClose={() => setModal(null)} onSaved={() => { setModal(null); load() }} />}
      {showAdmin && <AdminPanel currentUserId={userId} onClose={() => setShowAdmin(false)} />}
      {showDesc && <div style={{ position:'fixed', inset:0, zIndex:50, background:t.bg }}>
        <DescriptionsView onBack={() => setShowDesc(false)} />
      </div>}
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
