export type ComponentType = 'laser' | 'mirror' | 'lens' | 'beamsplitter' | 'detector';

export interface Port {
  id: string;
  position: 'top' | 'right' | 'bottom' | 'left';
  connectedTo?: string; // componentId:portId
}

export interface ComponentProperties {
  // Mirror
  reflectivity?: number;
  roc?: number; // radius of curvature
  
  // Lens
  focalLength?: number;
  
  // Beam Splitter
  transmitivity?: number;
  
  // Laser
  power?: number;
  wavelength?: number;
  
  // Photodetector
  sensitivity?: number;
}

export interface OpticalComponent {
  id: string;
  type: ComponentType;
  x: number; // grid x position
  y: number; // grid y position
  rotation: number; // degrees (any angle)
  ports: Port[];
  properties: ComponentProperties;
  label?: string;
}

export interface Ray {
  id: string;
  path: { x: number; y: number }[];
  intensity: number;
  wavelength: number;
}

export interface OpticalSetup {
  components: OpticalComponent[];
  rays: Ray[];
  gridSize: { width: number; height: number };
  cellSize: number;
}

export interface ExportData {
  version: string;
  timestamp: string;
  setup: OpticalSetup;
  metadata: {
    description?: string;
    author?: string;
  };
}
