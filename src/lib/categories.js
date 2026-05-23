// FH6 Class ranges (updated from FH6 in-game data)
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
    'Intake',
    'Fuel System',
    'Ignition',
    'Exhaust',
    'Camshaft',
    'Valves',
    'Displacement',
    'Piston / Compression',
    'Twin Turbo',
    'Intercooler',
    'Oil / Cooling',
    'Flywheel',
  ],
  'Platform and Handling': [
    'Springs and Dampers',
    'Front Anti-roll Bars',
    'Rear Anti-roll Bars',
    'Chassis Reinforcement / Roll Cage',
    'Weight Reduction',
  ],
  'Drivetrain': [
    'Clutch',
    'Transmission',
    'Differential',
  ],
  'Tires and Rims': [
    'Tire Compound',
    'Front Tire Width',
    'Rear Tire Width',
    'Rims',
    'Track Width',
  ],
  'Aero and Appearance': [
    'Front Bumper',
    'Rear Bumper',
    'Rear Wing',
    'Hood',
    'Side Skirts',
    'Wide Body Kit',
  ],
  'Body Kits and Conversions': [
    'Engine Swap',
    'Drivetrain Swap',
  ],
}

// Effect fields — grouped by section (matches in-game upgrade screen layout)
export const EFFECT_FIELDS = [
  // ── Main Stats ─────────────────────────────────
  { key:'stat_speed',        label:'Speed',            type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_handling',     label:'Handling',         type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_acceleration', label:'Acceleration',     type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_launch',       label:'Launch',           type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_braking',      label:'Braking',          type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_offroad',      label:'Offroad',          type:'number', step:0.1, group:'Main Stats' },
  // ── Engine ─────────────────────────────────────
  { key:'power_hp',          label:'Power (HP)',        type:'number', step:1,   group:'Engine' },
  { key:'torque_nm',         label:'Torque (Nm)',       type:'number', step:1,   group:'Engine' },
  { key:'weight_kg',         label:'Weight (kg)',       type:'number', step:1,   group:'Engine', hint:'negative = lighter' },
  { key:'pwr_hp_kg',         label:'PWR (hp/kg)',       type:'number', step:0.01,group:'Engine' },
  { key:'displacement_cc',   label:'Displacement (cc)', type:'number', step:1,   group:'Engine' },
  // ── Braking ────────────────────────────────────
  { key:'brake_dist_97',     label:'Braking 97 km/h (m)',  type:'number', step:0.1, group:'Braking' },
  { key:'brake_dist_161',    label:'Braking 161 km/h (m)', type:'number', step:0.1, group:'Braking' },
  // ── Lateral G ──────────────────────────────────
  { key:'lateral_g_97',      label:'Lateral G @ 97 km/h',  type:'number', step:0.01, group:'Lateral G' },
  { key:'lateral_g_193',     label:'Lateral G @ 193 km/h', type:'number', step:0.01, group:'Lateral G' },
  // ── Speed ──────────────────────────────────────
  { key:'accel_0_97',        label:'0-97 km/h (s)',     type:'number', step:0.001, group:'Speed' },
  { key:'accel_0_161',       label:'0-161 km/h (s)',    type:'number', step:0.001, group:'Speed' },
  { key:'top_speed_kmh',     label:'Top Speed (km/h)',  type:'number', step:0.1,   group:'Speed' },
  // ── Aero ───────────────────────────────────────
  { key:'aero_efficiency',   label:'Aero Efficiency',  type:'number', step:0.001, group:'Aero' },
  { key:'aero_balance',      label:'Aero Balance',     type:'number', step:0.01,  group:'Aero' },
  { key:'mech_balance',      label:'Mech. Balance',    type:'number', step:0.01,  group:'Aero' },
  // ── Flags ──────────────────────────────────────
  { key:'unlocks_tuning',    label:'Unlocks tuning sliders', type:'bool', group:'Flags' },
  { key:'unlock_type',       label:'Unlock type',      type:'select', group:'Flags',
    options:['','springs_dampers','arb_front','arb_rear','aero','transmission','differential','all'] },
  { key:'compound_type',     label:'Compound type',    type:'select', group:'Flags',
    options:['','Stock','Street','Sport','Semi-Slick','Race Slick','Rally','Drift','Off-Road'] },
]

// Car base stats fields (stored in cars.base_stats JSONB)
export const CAR_STAT_FIELDS = [
  // Main Stats (in-game 0–10 scale)
  { key:'stat_speed',        label:'Speed',           type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_handling',     label:'Handling',        type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_acceleration', label:'Acceleration',    type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_launch',       label:'Launch',          type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_braking',      label:'Braking',         type:'number', step:0.1, group:'Main Stats' },
  { key:'stat_offroad',      label:'Offroad',         type:'number', step:0.1, group:'Main Stats' },
  // Engine
  { key:'power_hp',          label:'Power (HP)',           type:'number', step:1     },
  { key:'torque_nm',         label:'Torque (Nm)',          type:'number', step:1     },
  { key:'weight_kg',         label:'Weight (kg)',          type:'number', step:1     },
  { key:'pwr_hp_kg',         label:'PWR (hp/kg)',          type:'number', step:0.01  },
  { key:'displacement_cc',   label:'Displacement (cc)',    type:'number', step:1     },
  { key:'top_speed_kmh',     label:'Top Speed (km/h)',     type:'number', step:0.1   },
  // Timing
  { key:'accel_0_97',        label:'0-97 km/h (s)',        type:'number', step:0.001 },
  { key:'accel_0_161',       label:'0-161 km/h (s)',       type:'number', step:0.001 },
  { key:'brake_dist_97',     label:'Braking 97 km/h (m)',  type:'number', step:0.1   },
  { key:'brake_dist_161',    label:'Braking 161 km/h (m)', type:'number', step:0.1   },
  // Dynamics
  { key:'lateral_g_97',      label:'Lateral G @ 97 km/h',  type:'number', step:0.01  },
  { key:'lateral_g_193',     label:'Lateral G @ 193 km/h', type:'number', step:0.01  },
  { key:'mech_balance',      label:'Mech. Balance',        type:'number', step:0.01  },
  { key:'aero_balance',      label:'Aero Balance',         type:'number', step:0.01  },
  { key:'aero_efficiency',   label:'Aero Efficiency',      type:'number', step:0.001 },
]
