// src/data/interviewCurriculum.ts

export const ROLE_CURRICULUM: Record<string, {
  easy: string[];
  medium: string[];
  hard: string[];
}> = {
  // --- COMPUTER SCIENCE / IT ---
  "Frontend Developer": {
    easy: ["HTML/CSS Basics", "JS Data Types", "DOM Manipulation"],
    medium: ["React Hooks", "State Management", "Async/Await"],
    hard: ["Performance Optimization", "Micro-frontends", "Web Workers"]
  },
  "Backend Developer": {
    easy: ["REST APIs", "SQL Basics", "HTTP Methods"],
    medium: ["Middleware", "Authentication (JWT)", "Database Normalization"],
    hard: ["Microservices", "Caching Strategies (Redis)", "System Design"]
  },

  // --- CORE ENGINEERING ---
  "Mechanical Engineer": {
    easy: ["Laws of Thermodynamics", "Stress & Strain", "Types of Gears", "Fluid Properties"],
    medium: ["Fluid Mechanics (Bernoulli)", "Heat Transfer", "Manufacturing Processes", "Strength of Materials"],
    hard: ["Finite Element Analysis (FEA)", "Robotics Kinematics", "Computational Fluid Dynamics (CFD)", "Vibrations"]
  },
  "Civil Engineer": {
    easy: ["Types of Cement", "Surveying Basics", "Soil Mechanics", "Concrete Grades"],
    medium: ["Structural Analysis", "Fluid Mechanics in Pipes", "Highway Engineering", "Geotechnical Engineering"],
    hard: ["Earthquake Engineering", "Bridge Design", "Construction Management", "Advanced Structural Dynamics"]
  },
  "EEE Engineer": {
    easy: ["Ohm's Law & Kirchhoff's Laws", "AC vs DC", "Basic Components (R, L, C)", "Transformers"],
    medium: ["Induction Motors", "Power Systems", "Control Systems Basics", "Circuit Analysis"],
    hard: ["Power Electronics", "High Voltage Engineering", "Smart Grids", "Microprocessor Architecture"]
  },
  "ECE Engineer": {
    easy: ["Semiconductor Physics", "Logic Gates", "Analog vs Digital", "Modulation Basics"],
    medium: ["Microcontrollers (Arduino/8051)", "Signal Processing (DSP)", "Antenna Theory", "Communication Systems"],
    hard: ["VLSI Design", "Embedded Systems Real-time OS", "Satellite Communication", "FPGA Programming"]
  },
  
  // --- SPECIAL MIXED MODE (Placeholder) ---
  "Resume Based": {
    easy: ["Resume Project Basics", "Introductory Skills", "General Logic"],
    medium: ["Project Technical Details", "Skill Application", "Problem Solving"],
    hard: ["System Design of Projects", "Advanced Scenarios", "Optimization"]
  }
};