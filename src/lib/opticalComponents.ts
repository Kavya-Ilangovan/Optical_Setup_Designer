import { ComponentType, Port, ComponentProperties } from '@/types/optical';

export const getDefaultPorts = (type: ComponentType): Port[] => {
  switch (type) {
    case 'laser':
      return [{ id: 'out', position: 'right' }];
    
    case 'detector':
      return [{ id: 'in', position: 'left' }];
    
    case 'mirror':
    case 'lens':
      return [
        { id: 'port1', position: 'left' },
        { id: 'port2', position: 'right' }
      ];
    
    case 'beamsplitter':
      return [
        { id: 'port1', position: 'left' },
        { id: 'port2', position: 'top' },
        { id: 'port3', position: 'right' },
        { id: 'port4', position: 'bottom' }
      ];
    
    default:
      return [];
  }
};

export const getDefaultProperties = (type: ComponentType): ComponentProperties => {
  switch (type) {
    case 'mirror':
      return { reflectivity: 0.99, roc: 1000 };
    
    case 'lens':
      return { focalLength: 100 };
    
    case 'beamsplitter':
      return { reflectivity: 0.5, transmitivity: 0.5 };
    
    case 'laser':
      return { power: 1, wavelength: 632.8 };
    
    case 'detector':
      return { sensitivity: 1 };
    
    default:
      return {};
  }
};

export const componentLabels: Record<ComponentType, string> = {
  laser: 'Laser',
  mirror: 'Mirror',
  lens: 'Lens',
  beamsplitter: 'Beam Splitter',
  detector: 'Photodetector'
};

export const componentDescriptions: Record<ComponentType, string> = {
  laser: 'Light source with configurable power and wavelength',
  mirror: 'Reflective surface with 2 ports',
  lens: 'Focusing element with adjustable focal length',
  beamsplitter: 'Splits light beam into 4 directions',
  detector: 'Measures light intensity'
};
