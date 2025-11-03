# Optical Setup Simulator

A powerful web-based optical experiment designer and simulator that enables users to create, visualize, and analyze complex optical setups with AI-powered assistance.

## Overview

This interactive application allows researchers, students, and optical engineers to design optical experiments by placing components on a canvas, connecting them, and simulating light propagation through the system. The built-in AI assistant can generate complete optical setups from natural language descriptions, making it easy to quickly prototype classic experiments like Michelson interferometers or custom configurations.

## Key Features

### Interactive Design Canvas
- Drag-and-drop interface for placing optical components
- Support for various optical elements:
  - Lasers (configurable wavelength and power)
  - Mirrors (adjustable reflectivity)
  - Beamsplitters (50/50 splitting with configurable transmitivity)
  - Lenses (focal length customization)
  - Photodetectors
- Free rotation at any angle for precise component alignment
- Visual port connections showing optical paths
- Snap-to-grid positioning for alignment

### AI-Powered Setup Generation
- Generate complete optical setups from text descriptions
- Intelligent component placement and rotation
- Pre-configured classic experiments (Michelson interferometer, etc.)
- Powered by advanced AI models through Lovable AI Gateway

### Physics Simulation
- Accurate ray tracing through optical components
- Beamsplitter physics with proper beam splitting and reflection
- Power loss calculations through optical paths
- Interference pattern detection at detectors
- Path length analysis for interferometry applications

### Real-time Visualization
- Live ray path rendering
- Component property editing panel
- Simulation results display with detailed metrics
- Export functionality for saving setups

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Radix UI primitives with shadcn/ui
- **Backend**: Supabase
- **AI Integration**: Gemini & GPT models
- **State Management**: React hooks with custom optical setup hook
- **Routing**: React Router

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the local development URL

## Usage

### Creating an Optical Setup

1. **Manual Design**: 
   - Select components from the library on the left
   - Click on the canvas to place components
   - Rotate components by selecting and using rotation controls
   - Connect ports by clicking between component ports

2. **AI Generation**:
   - Enter a description in the AI Setup Generator panel
   - Example: "Michelson interferometer" or "laser with two mirrors and a detector"
   - The AI will generate a complete setup with proper component placement and rotations

3. **Edit Properties**:
   - Select any component to view/edit its properties
   - Adjust wavelengths, power levels, reflectivity, focal lengths, etc.

4. **Run Simulation**:
   - Click "Trace Rays" to visualize light paths
   - Click "Run Simulation" for detailed analysis
   - View simulation results including power levels, path lengths, and interference patterns

### Exporting Setups

Use the export button in the toolbar to save your optical setup as a JSON file for later use or sharing.

## Project Structure

```
src/
├── components/
│   ├── optical/          # Optical simulator components
│   │   ├── OpticalCanvas.tsx
│   │   ├── ComponentLibrary.tsx
│   │   ├── PropertiesPanel.tsx
│   │   ├── SimulationPanel.tsx
│   │   ├── SetupGenerator.tsx
│   │   └── Toolbar.tsx
│   └── ui/              # Reusable UI components
├── hooks/
│   └── useOpticalSetup.ts  # Core optical setup logic
├── lib/
│   └── opticalComponents.ts # Component definitions
├── types/
│   └── optical.ts       # TypeScript type definitions
└── pages/
    └── Index.tsx        # Main application page

supabase/
└── functions/
    ├── generate-optical-setup/  # AI setup generation
    └── simulate-optical-setup/  # Physics simulation
```

## Key Concepts

### Component Rotation System
- **0°**: Default orientation (laser emits right, mirror faces right, etc.)
- **90°**: Rotated clockwise 90 degrees
- **180°**: Flipped 180 degrees
- **270°**: Rotated counter-clockwise 90 degrees
- Any degree value is supported for precise alignment

### Ray Tracing Algorithm
The simulator uses a physics-based ray tracing algorithm that:
- Traces light from laser sources through the optical system
- Properly handles beamsplitter physics (creates two rays)
- Calculates power losses through components
- Detects ray convergence at photodetectors
- Computes interference patterns and fringe visibility

---

**Project URL**: https://optical-setup-designer.vercel.app/
