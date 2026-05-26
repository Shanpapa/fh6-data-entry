// FH6 Class ranges
export const CLASSES = ['D','C','B','A','S1','S2','R','X']
export const CLASS_RANGES = {
  D:  { min:100, max:400  },
  C:  { min:401, max:500  },
  B:  { min:501, max:600  },
  A:  { min:601, max:700  },
  S1: { min:701, max:800  },
  S2: { min:801, max:900  },
  R:  { min:901, max:998  },
  X:  { min:999, max:9999 },
}

// Upgrade shop categories (English, FH6 in-game)
export const CATEGORIES = {
  'Engine': [
    'Intake', 'Fuel System', 'Ignition', 'Exhaust', 'Camshaft', 'Valves',
    'Displacement', 'Piston / Compression', 'Twin Turbo', 'Intercooler',
    'Oil / Cooling', 'Flywheel',
  ],
  'Platform and Handling': [
    'Springs and Dampers', 'Front Anti-roll Bars', 'Rear Anti-roll Bars',
    'Chassis Reinforcement / Roll Cage', 'Weight Reduction',
  ],
  'Drivetrain': ['Clutch', 'Transmission', 'Differential'],
  'Tires and Rims': [
    'Tire Compound', 'Front Tire Width', 'Rear Tire Width', 'Rims', 'Track Width',
  ],
  'Aero and Appearance': [
    'Front Bumper', 'Rear Bumper', 'Rear Wing', 'Hood', 'Side Skirts', 'Wide Body Kit',
  ],
  'Body Kits and Conversions': ['Engine Swap', 'Drivetrain Swap'],
}

// ── EFFECT FIELDS (parts delta — what a part changes) ─────────────────────
// group names match CarDetail section headers
export const EFFECT_FIELDS = [
  // Performance Index deltas (game's 0–10 PI rating change)
  { key:'stat_speed',        label:'Speed (PI)',       type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_handling',     label:'Handling (PI)',    type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_acceleration', label:'Acceleration (PI)',type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_launch',       label:'Launch (PI)',      type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_braking',      label:'Braking (PI)',     type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_offroad',      label:'Off-Road (PI)',    type:'number', step:0.1,   group:'Performance Index' },
  // Car Stat deltas
  { key:'power_hp',          label:'Power (HP)',       type:'number', step:1,     group:'Car Stat' },
  { key:'torque_nm',         label:'Torque (Nm)',      type:'number', step:1,     group:'Car Stat' },
  { key:'weight_kg',         label:'Weight (kg)',      type:'number', step:1,     group:'Car Stat', hint:'negative = lighter' },
  { key:'pwr_hp_kg',         label:'PWR (hp/kg)',      type:'number', step:0.01,  group:'Car Stat' },
  { key:'displacement_l',    label:'Displacement (L)', type:'number', step:0.01,  group:'Car Stat' },
  { key:'top_speed_kmh',     label:'Top Speed (km/h)', type:'number', step:0.1,   group:'Car Stat' },
  { key:'accel_0_100',       label:'0-100 kph (s)',    type:'number', step:0.001, group:'Car Stat' },
  // Aero — FH6 confirmed targets
  { key:'aero_efficiency',   label:'Aero Efficiency',  type:'number', step:0.001, group:'Aero', hint:'higher = less drag' },
  { key:'aero_balance',      label:'Aero Balance',     type:'number', step:0.01,  group:'Aero', hint:'FH6 target: ~0.50' },
  { key:'mech_balance',      label:'Mech. Balance',    type:'number', step:0.01,  group:'Aero', hint:'FH6 target: 0.55–0.65' },
  // Braking Distance (Tune tab)
  { key:'brake_dist_97',     label:'Braking 97 km/h (m)',  type:'number', step:0.1,   group:'Braking Distance' },
  { key:'brake_dist_161',    label:'Braking 161 km/h (m)', type:'number', step:0.1,   group:'Braking Distance' },
  // Lateral Gs (Tune tab)
  { key:'lateral_g_97',      label:'Lateral G @ 97 km/h',  type:'number', step:0.01,  group:'Lateral Gs' },
  { key:'lateral_g_193',     label:'Lateral G @ 193 km/h', type:'number', step:0.01,  group:'Lateral Gs' },
  // Acceleration (Tune tab)
  { key:'accel_0_97',        label:'0-97 km/h (s)',    type:'number', step:0.001, group:'Acceleration' },
  { key:'accel_0_161',       label:'0-161 km/h (s)',   type:'number', step:0.001, group:'Acceleration' },
  // Flags
  { key:'unlocks_tuning',    label:'Unlocks tuning sliders', type:'bool',   group:'Flags' },
  { key:'unlock_type',       label:'Unlock type',      type:'select', group:'Flags',
    // springs_dampers = Springs + Dampers + Alignment | arb = ARBs | differential = Diff | transmission = Gearing | aero = Aero
    options:['','springs_dampers','arb','differential','transmission','aero'] },
  { key:'compound_type',     label:'Compound type',    type:'select', group:'Flags',
    options:['','Stock','Street','Sport','Semi-Slick','Race Slick','Rally','Drift','Off-Road'] },
]

// ── CAR BASE STATS (stored in cars.base_stats JSONB + separate car columns) ─
// Matches in-game screen order for easy data entry
// group = which screen section in the data entry form
export const CAR_STAT_FIELDS = [
  // ── Performance Index (My Cars → first tab, 0–10 PI ratings) ──────────────
  { key:'stat_speed',        label:'Speed (PI)',        type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_handling',     label:'Handling (PI)',     type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_acceleration', label:'Acceleration (PI)', type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_launch',       label:'Launch (PI)',        type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_braking',      label:'Braking (PI)',       type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_offroad',      label:'Off-Road (PI)',      type:'number', step:0.1,   group:'Performance Index' },
  // ── Car Stat (My Cars → second tab) ─────────────────────────────────────
  { key:'power_hp',          label:'Power (HP)',         type:'number', step:1,     group:'Car Stat' },
  { key:'torque_nm',         label:'Torque (Nm)',        type:'number', step:1,     group:'Car Stat' },
  { key:'weight_kg',         label:'Weight (kg)',        type:'number', step:1,     group:'Car Stat' },
  { key:'front_weight_pct',  label:'Front (%)',          type:'number', step:0.1,   group:'Car Stat', col:'front_weight_pct' },
  { key:'displacement_l',    label:'Displacement (L)',   type:'number', step:0.01,  group:'Car Stat' },
  { key:'top_speed_kmh',     label:'Top Speed (km/h)',   type:'number', step:0.1,   group:'Car Stat' },
  { key:'accel_0_100',       label:'0-100 kph (s)',      type:'number', step:0.001, group:'Car Stat' },
  { key:'pwr_hp_kg',         label:'PWR (hp/kg)',        type:'number', step:0.01,  group:'Car Stat' },
  // ── Misc / Performance screen ──────────────────────────────────────────
  { key:'aero_efficiency',   label:'Aero Efficiency',    type:'number', step:0.001, group:'Performance' },
  { key:'aero_balance',      label:'Aero Balance',       type:'number', step:0.01,  group:'Performance' },
  { key:'mech_balance',      label:'Mech. Balance',      type:'number', step:0.01,  group:'Performance' },
  { key:'suspension_type',   label:'Suspension',         type:'select', group:'Performance', col:'suspension_type',
    options:['','Stock','Street','Sport','Race','Rally','Off-Road'] },
  { key:'tyre_compound_stock',label:'Tyre Compound',     type:'select', group:'Performance', col:'tyre_compound_stock',
    options:['','Standard','Street','Sport','Semi-Slick','Race Slick','Rally','Drift','Off-Road'] },
  // ── Braking Distance (Tune tab) ────────────────────────────────────────
  { key:'brake_dist_97',     label:'Braking 97 km/h (m)',  type:'number', step:0.1,   group:'Braking Distance' },
  { key:'brake_dist_161',    label:'Braking 161 km/h (m)', type:'number', step:0.1,   group:'Braking Distance' },
  // ── Lateral Gs (Tune tab) ─────────────────────────────────────────────
  { key:'lateral_g_97',      label:'Lateral G @ 97 km/h',  type:'number', step:0.01,  group:'Lateral Gs' },
  { key:'lateral_g_193',     label:'Lateral G @ 193 km/h', type:'number', step:0.01,  group:'Lateral Gs' },
  // ── Acceleration & Speed (Tune tab) ───────────────────────────────────
  { key:'accel_0_97',        label:'0-97 km/h (s)',      type:'number', step:0.001, group:'Acceleration & Speed' },
  { key:'accel_0_161',       label:'0-161 km/h (s)',     type:'number', step:0.001, group:'Acceleration & Speed' },
]
