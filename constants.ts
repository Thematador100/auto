export const IMAGE_CATEGORIES = [
  'Front Exterior',
  'Rear Exterior',
  'Driver Side',
  'Passenger Side',
  'Interior (Front)',
  'Interior (Rear)',
  'Tires & Wheels',
  'Engine Bay',
  'Undercarriage',
  'Dashboard/VIN',
  'Odometer',
  'Damage/Misc',
];

// Comprehensive, categorized checklists for different vehicle types
export const VEHICLE_INSPECTION_TEMPLATES = {
  Standard: {
    'Exterior & Body': ['Body Panels for Dents/Scratches', 'Glass & Mirrors Condition', 'Lights & Lenses Function', 'Frame/Unibody Integrity', 'Wiper Blade Condition'],
    'Tires & Brakes': ['Tire Tread Depth & Condition (All 4 + Spare)', 'Brake Pad Life (Visual)', 'Rotors/Drums Condition', 'Brake Fluid Level & Color', 'Emergency Brake Function'],
    'Engine Compartment': ['Engine Oil Level & Condition', 'Coolant Level & Condition', 'Belts & Hoses Condition', 'Battery Terminals & Health', 'Visible Fluid Leaks', 'Engine Air Filter'],
    'Interior': ['Upholstery & Carpet Condition', 'Dashboard & Controls Function', 'HVAC System (Heat & A/C)', 'Audio & Infotainment System', 'Warning Lights on Dash', 'Odor Check'],
    'Test Drive': ['Engine Performance & Acceleration', 'Transmission Shifting Smoothness', 'Steering & Alignment', 'Suspension Noise & Performance', 'Braking Performance (Noises, Pulsation)'],
  },
  EV: {
    'Exterior & Body': ['Body Panels for Dents/Scratches', 'Glass & Mirrors Condition', 'LED Lights & Lenses Function', 'Frame/Unibody Integrity'],
    'Tires & Brakes': ['Tire Tread Depth & Condition', 'Brake Pad Life (Regen affects wear)', 'Brake Fluid Level & Color', 'Emergency Brake Function'],
    'Battery & Charging': ['State of Health (SoH) Reading', 'Charge Port Condition', 'Charging Cable Included & Condition', 'Onboard Charger Function', 'Thermal Management System (Visual)'],
    'Interior & Electronics': ['Upholstery & Carpet Condition', 'Main Display & Controls Function', 'HVAC System (Heat Pump/Resistive)', 'Driver Assist Systems (ADAS) Function', 'Warning Lights on Dash'],
    'Test Drive': ['Motor Performance & Acceleration', 'Regenerative Braking Function', 'Steering & Alignment', 'Suspension Noise & Performance', 'Unusual Electrical Noises'],
  },
  Commercial: {
    'Cab Exterior': ['Body Panels & Fairings', 'Windshield & Mirrors (No Cracks)', 'Lights & Reflective Tapes (DOT)', 'Entry Steps & Grab Handles'],
    'Chassis & Drivetrain': ['Frame Rails (No Cracks/Bends)', 'Visible Fluid Leaks (Engine, Trans, Axles)', 'Exhaust System Integrity', 'Driveshaft & U-Joints'],
    'Tires, Wheels & Brakes': ['Tire Tread Depth (>4/32" Steer, >2/32" Other)', 'Dual Tire Spacing & Condition', 'Hub Oil Levels', 'Air Brake System (Leaks, Hoses)', 'Brake Adjustment (Slack Adjusters)'],
    'Cab Interior': ['Gauges & Warning Lights', 'HVAC & Defroster', 'Safety Equipment (Horn, Wipers, Fire Ext.)', 'Hours & Odometer Reading'],
    'Special Equipment': ['Fifth Wheel & Locking Jaw', 'Hydraulic Systems (If applicable)', 'Liftgate Operation (If applicable)'],
  },
  RV: {
    'Coach Exterior': ['Roof Condition & Seals', 'Sidewalls (Delamination Check)', 'Awnings & Slide-Outs Operation', 'Windows & Seals', 'Storage Compartment Doors'],
    'Chassis (Motorhome) / Frame (Trailer)': ['Frame Condition (Rust, Cracks)', 'Tire Age & Condition (Sidewall Cracking)', 'Suspension Components (Springs, Airbags)', 'Leveling Jacks Operation'],
    'Life Support Systems': ['Propane System (Leak Check)', 'Freshwater System (Pump, Faucets)', 'Wastewater Tanks & Valves', 'House Battery Bank Health'],
    'Interior Appliances': ['Refrigerator Operation (Gas & Electric)', 'Stove & Oven Function', 'Water Heater Function', 'Furnace & AC Operation'],
    'Cabin': ['Signs of Water Intrusion (Stains)', 'Cabinetry & Flooring Condition', 'Furniture Upholstery', 'Safety Devices (Smoke, LP, CO Detectors)'],
  },
  Classic: {
    'Body & Paint': ['Paint Quality & Originality', 'Panel Gaps & Alignment', 'Chrome & Trim Condition', 'Evidence of Bondo/Fillers (Magnet Test)'],
    'Frame & Undercarriage': ['Frame Rails for Rust/Rot/Repairs', 'Floor Pans Integrity', 'Suspension Bushings & Components (Age)', 'Originality of Undercarriage'],
    'Engine & Drivetrain': ['Engine Numbers Matching (If applicable)', 'Carburetor/Fuel Injection Condition', 'Originality of Components', 'Exhaust System (Rust, Originality)'],
    'Interior': ['Upholstery Originality & Condition', 'Dashboard, Gauges & Radio Originality', 'Headliner & Carpet', 'Correctness of Switches & Knobs'],
    'Documentation': ['History & Service Records', 'Original Bill of Sale / Window Sticker', 'Restoration Photo Album', 'VIN & Title Verification'],
  },
  Motorcycle: {
    'Controls & Electrical': ['Handlebars, Levers, Switches', 'Lights & Signals Function', 'Battery Health & Terminals', 'Wiring Condition'],
    'Engine & Transmission': ['Visible Oil Leaks', 'Clutch Engagement & Feel', 'Exhaust System Condition', 'Engine Noises (Cold & Warm)'],
    'Frame, Wheels & Tires': ['Frame for Damage/Cracks', 'Tire Age & Tread', 'Wheel Rims & Spokes/Casting', 'Fork Seals (No Leaks)'],
    'Final Drive': ['Chain/Belt Tension & Condition', 'Sprocket/Pulley Wear', 'Shaft Drive Fluid (If applicable)'],
    'Brakes & Suspension': ['Brake Pad Life & Rotor Condition', 'Brake Fluid Level & Color', 'Front & Rear Suspension Action'],
  },
};
