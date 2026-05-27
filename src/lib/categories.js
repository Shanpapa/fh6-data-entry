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
    'Displacement', 'Piston / Compression', 'Single Turbo', 'Twin Turbo',
    'Intercooler', 'Oil / Cooling', 'Flywheel',
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

// ── EFFECT FIELDS ─────────────────────────────────────────────────────────
// Groups match in-game upgrade screen layout exactly.
// Each group is a separate section in the PartModal effects form.
export const EFFECT_FIELDS = [
  // ── Performance (PI ratings, 0–10 game scale) ─────────────────────────
  { key:'stat_speed',        label:'Speed',            type:'number', step:0.1,   group:'Performance' },
  { key:'stat_handling',     label:'Handling',         type:'number', step:0.1,   group:'Performance' },
  { key:'stat_acceleration', label:'Acceleration',     type:'number', step:0.1,   group:'Performance' },
  { key:'stat_launch',       label:'Launch',           type:'number', step:0.1,   group:'Performance' },
  { key:'stat_braking',      label:'Braking',          type:'number', step:0.1,   group:'Performance' },
  { key:'stat_offroad',      label:'Off-Road',         type:'number', step:0.1,   group:'Performance' },
  // ── Car Stat ──────────────────────────────────────────────────────────
  { key:'power_hp',          label:'Power (HP)',        type:'number', step:1,     group:'Car Stat' },
  { key:'torque_nm',         label:'Torque (Nm)',       type:'number', step:1,     group:'Car Stat' },
  { key:'weight_kg',         label:'Weight (kg)',       type:'number', step:1,     group:'Car Stat', hint:'negative = lighter' },
  { key:'front_weight_pct',  label:'Front (%)',         type:'number', step:0.1,   group:'Car Stat', hint:'e.g. 54' },
  { key:'pwr_hp_kg',         label:'PWR (hp/kg)',       type:'number', step:0.01,  group:'Car Stat' },
  { key:'displacement_l',    label:'Displacement (L)',  type:'number', step:0.001, group:'Car Stat', ccInput:true },
  // ── Braking Distance ──────────────────────────────────────────────────
  { key:'brake_dist_97',     label:'97 km/h – 0 (m)',   type:'number', step:0.1,   group:'Braking Distance' },
  { key:'brake_dist_161',    label:'161 km/h – 0 (m)',  type:'number', step:0.1,   group:'Braking Distance' },
  // ── Lateral Gs ────────────────────────────────────────────────────────
  { key:'lateral_g_97',      label:'@ 97 km/h',         type:'number', step:0.01,  group:'Lateral Gs' },
  { key:'lateral_g_193',     label:'@ 193 km/h',        type:'number', step:0.01,  group:'Lateral Gs' },
  // ── Acceleration & Speed ──────────────────────────────────────────────
  { key:'accel_0_97',        label:'0–97 km/h (s)',     type:'number', step:0.001, group:'Acceleration & Speed' },
  { key:'accel_0_161',       label:'0–161 km/h (s)',    type:'number', step:0.001, group:'Acceleration & Speed' },
  { key:'top_speed_kmh',     label:'Top Speed (km/h)',  type:'number', step:0.1,   group:'Acceleration & Speed' },
  // ── Aerodynamics ──────────────────────────────────────────────────────
  { key:'aero_efficiency',   label:'Efficiency',        type:'number', step:0.001, group:'Aerodynamics', hint:'higher = less drag' },
  { key:'aero_balance',      label:'Balance',           type:'number', step:0.01,  group:'Aerodynamics', hint:'FH6 target: ~0.50' },
  // ── Chassis ───────────────────────────────────────────────────────────
  { key:'mech_balance',      label:'Mech. Balance',     type:'number', step:0.01,  group:'Chassis', hint:'FH6 target: 0.55–0.65' },
  // ── Flags ─────────────────────────────────────────────────────────────
  { key:'unlocks_tuning',    label:'Unlocks tuning sliders', type:'bool', group:'Flags' },
  { key:'unlock_type',       label:'Unlock type',       type:'select', group:'Flags',
    options:['','springs_dampers','arb_front','arb_rear','differential','transmission','aero'] },
  { key:'compound_type',     label:'Compound type',     type:'select', group:'Flags',
    options:['','Stock','Street','Sport','Semi-Slick','Race Slick','Rally','Drift','Off-Road'] },
  { key:'drivetrain_result', label:'Drivetrain swap result', type:'select', group:'Flags',
    options:['','RWD','FWD','AWD'] },
]

// Derived: ordered unique group names for rendering
export const EFFECT_GROUPS = [...new Set(EFFECT_FIELDS.map(f => f.group))]

// ── CAR BASE STATS ────────────────────────────────────────────────────────
export const CAR_STAT_FIELDS = [
  // Performance Index
  { key:'stat_speed',        label:'Speed (PI)',        type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_handling',     label:'Handling (PI)',     type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_acceleration', label:'Acceleration (PI)', type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_launch',       label:'Launch (PI)',        type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_braking',      label:'Braking (PI)',       type:'number', step:0.1,   group:'Performance Index' },
  { key:'stat_offroad',      label:'Off-Road (PI)',      type:'number', step:0.1,   group:'Performance Index' },
  // Car Stat
  { key:'power_hp',          label:'Power (HP)',         type:'number', step:1     },
  { key:'torque_nm',         label:'Torque (Nm)',        type:'number', step:1     },
  { key:'weight_kg',         label:'Weight (kg)',        type:'number', step:1     },
  { key:'front_weight_pct',  label:'Front (%)',          type:'number', step:0.1,  col:'front_weight_pct' },
  { key:'displacement_l',    label:'Displacement (L)',   type:'number', step:0.001, ccInput:true },
  { key:'top_speed_kmh',     label:'Top Speed (km/h)',   type:'number', step:0.1  },
  { key:'accel_0_100',       label:'0-100 kph (s)',      type:'number', step:0.001 },
  { key:'pwr_hp_kg',         label:'PWR (hp/kg)',        type:'number', step:0.01  },
  // Performance screen
  { key:'aero_efficiency',   label:'Aero Efficiency',    type:'number', step:0.001 },
  { key:'aero_balance',      label:'Aero Balance',       type:'number', step:0.01  },
  { key:'mech_balance',      label:'Mech. Balance',      type:'number', step:0.01  },
  { key:'suspension_type',   label:'Suspension',         type:'select', col:'suspension_type',
    options:['','Stock','Street','Sport','Race','Rally','Off-Road'] },
  { key:'tyre_compound_stock',label:'Tyre Compound',     type:'select', col:'tyre_compound_stock',
    options:['','Standard','Street','Sport','Semi-Slick','Race Slick','Rally','Drift','Off-Road'] },
  // Braking Distance
  { key:'brake_dist_97',     label:'Braking 97 km/h (m)',  type:'number', step:0.1  },
  { key:'brake_dist_161',    label:'Braking 161 km/h (m)', type:'number', step:0.1  },
  // Lateral Gs
  { key:'lateral_g_97',      label:'Lateral G @ 97 km/h',  type:'number', step:0.01 },
  { key:'lateral_g_193',     label:'Lateral G @ 193 km/h', type:'number', step:0.01 },
  // Acceleration & Speed
  { key:'accel_0_97',        label:'0-97 km/h (s)',      type:'number', step:0.001 },
  { key:'accel_0_161',       label:'0-161 km/h (s)',     type:'number', step:0.001 },
]
