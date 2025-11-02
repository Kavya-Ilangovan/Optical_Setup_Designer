import { useState, useCallback } from 'react';
import { OpticalComponent, OpticalSetup, Ray, ComponentType } from '@/types/optical';
import { getDefaultPorts, getDefaultProperties } from '@/lib/opticalComponents';

export const useOpticalSetup = () => {
  const [setup, setSetup] = useState<OpticalSetup>({
    components: [],
    rays: [],
    gridSize: { width: 40, height: 25 },
    cellSize: 30
  });

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const addComponent = useCallback((type: ComponentType, x: number, y: number) => {
    const newComponent: OpticalComponent = {
      id: `${type}-${Date.now()}`,
      type,
      x: Math.round(x),
      y: Math.round(y),
      rotation: 0,
      ports: getDefaultPorts(type),
      properties: getDefaultProperties(type),
      label: undefined
    };

    setSetup(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));

    return newComponent.id;
  }, []);

  const removeComponent = useCallback((id: string) => {
    setSetup(prev => ({
      ...prev,
      components: prev.components.filter(c => c.id !== id)
    }));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent]);

  const updateComponent = useCallback((id: string, updates: Partial<OpticalComponent>) => {
    setSetup(prev => ({
      ...prev,
      components: prev.components.map(c => 
        c.id === id ? { ...c, ...updates } : c
      )
    }));
  }, []);

  const moveComponent = useCallback((id: string, x: number, y: number) => {
    updateComponent(id, { x: Math.round(x), y: Math.round(y) });
  }, [updateComponent]);

  const rotateComponent = useCallback((id: string) => {
    setSetup(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (c.id === id) {
          const newRotation = (c.rotation + 45) % 360;
          return { ...c, rotation: newRotation };
        }
        return c;
      })
    }));
  }, []);

  const updateProperties = useCallback((id: string, properties: Partial<OpticalComponent['properties']>) => {
    setSetup(prev => ({
      ...prev,
      components: prev.components.map(c =>
        c.id === id ? { ...c, properties: { ...c.properties, ...properties } } : c
      )
    }));
  }, []);

  const connectPorts = useCallback((comp1Id: string, port1Id: string, comp2Id: string, port2Id: string) => {
    setSetup(prev => ({
      ...prev,
      components: prev.components.map(c => {
        if (c.id === comp1Id) {
          return {
            ...c,
            ports: c.ports.map(p =>
              p.id === port1Id ? { ...p, connectedTo: `${comp2Id}:${port2Id}` } : p
            )
          };
        }
        if (c.id === comp2Id) {
          return {
            ...c,
            ports: c.ports.map(p =>
              p.id === port2Id ? { ...p, connectedTo: `${comp1Id}:${port1Id}` } : p
            )
          };
        }
        return c;
      })
    }));
  }, []);

  const traceRays = useCallback(() => {
    // Advanced ray tracing with beam splitting support
    const rays: Ray[] = [];
    const lasers = setup.components.filter(c => c.type === 'laser');
    const rayLength = Math.max(setup.gridSize.width, setup.gridSize.height);
    const maxBounces = 30;

    // Helper function to trace a single ray path
    const traceSingleRay = (
      startPos: { x: number; y: number },
      startDirection: { x: number; y: number },
      startIntensity: number,
      rayId: string,
      wavelength: number,
      visitedComponents: Set<string> = new Set()
    ): Ray[] => {
      const resultRays: Ray[] = [];
      const path: { x: number; y: number }[] = [startPos];
      let currentPos = { ...startPos };
      let direction = { ...startDirection };
      let intensity = startIntensity;
      
      for (let bounce = 0; bounce < maxBounces; bounce++) {
        let minDist = Infinity;
        let hitComponent: OpticalComponent | null = null;
        
        // Find nearest component in ray path
        setup.components.forEach(comp => {
          // Skip if we've already been at this component in this path
          if (visitedComponents.has(comp.id)) return;
          
          const dx = comp.x - currentPos.x;
          const dy = comp.y - currentPos.y;
          const projection = dx * direction.x + dy * direction.y;
          
          if (projection <= 0.1) return; // Must be ahead
          
          const closestX = currentPos.x + direction.x * projection;
          const closestY = currentPos.y + direction.y * projection;
          const perpDist = Math.sqrt((comp.x - closestX) ** 2 + (comp.y - closestY) ** 2);
          
          if (perpDist < 0.8 && projection < minDist) {
            minDist = projection;
            hitComponent = comp;
          }
        });
        
        if (!hitComponent) {
          // Ray continues to edge of grid
          const endX = currentPos.x + direction.x * rayLength;
          const endY = currentPos.y + direction.y * rayLength;
          const clampedX = Math.max(0, Math.min(setup.gridSize.width - 1, endX));
          const clampedY = Math.max(0, Math.min(setup.gridSize.height - 1, endY));
          path.push({ x: clampedX, y: clampedY });
          break;
        }
        
        // Ray hits component
        path.push({ x: hitComponent.x, y: hitComponent.y });
        visitedComponents.add(hitComponent.id);
        
        // Handle different component types
        if (hitComponent.type === 'mirror') {
          const reflectivity = hitComponent.properties.reflectivity || 1;
          intensity *= reflectivity / 100;
          
          // Mirror normal is the rotation angle
          const normalAngle = hitComponent.rotation * Math.PI / 180;
          const normal = { x: Math.cos(normalAngle), y: Math.sin(normalAngle) };
          
          // Reflect direction across normal
          const dot = 2 * (direction.x * normal.x + direction.y * normal.y);
          direction = { x: direction.x - dot * normal.x, y: direction.y - dot * normal.y };
          
        } else if (hitComponent.type === 'beamsplitter') {
          // CRITICAL: Beamsplitter splits into TWO rays
          const reflectivity = (hitComponent.properties.reflectivity || 50) / 100;
          const transmitivity = (hitComponent.properties.transmitivity || 50) / 100;
          
          // Calculate reflected ray direction (90 degree split)
          const normalAngle = hitComponent.rotation * Math.PI / 180;
          const normal = { x: Math.cos(normalAngle), y: Math.sin(normalAngle) };
          const dot = 2 * (direction.x * normal.x + direction.y * normal.y);
          const reflectedDir = { 
            x: direction.x - dot * normal.x, 
            y: direction.y - dot * normal.y 
          };
          
          // Create and trace the REFLECTED ray (if intensity sufficient)
          const reflectedIntensity = intensity * reflectivity;
          if (reflectedIntensity > 0.01) {
            const reflectedRays = traceSingleRay(
              { x: hitComponent.x, y: hitComponent.y },
              reflectedDir,
              reflectedIntensity,
              `${rayId}-r${bounce}`,
              wavelength,
              new Set(visitedComponents)
            );
            resultRays.push(...reflectedRays);
          }
          
          // Continue with TRANSMITTED ray (straight through)
          intensity *= transmitivity;
          // Direction stays the same for transmitted beam
          
        } else if (hitComponent.type === 'lens') {
          intensity *= 0.95; // Small loss
          
        } else if (hitComponent.type === 'detector') {
          // Ray absorbed
          break;
        }
        
        currentPos = { x: hitComponent.x, y: hitComponent.y };
        
        if (intensity < 0.01) break;
      }
      
      // Add this ray path to results
      if (path.length > 1) {
        resultRays.push({
          id: rayId,
          path,
          intensity: startIntensity,
          wavelength
        });
      }
      
      return resultRays;
    };

    // Trace rays from each laser
    lasers.forEach(laser => {
      const direction = { 
        x: Math.cos(laser.rotation * Math.PI / 180), 
        y: Math.sin(laser.rotation * Math.PI / 180) 
      };
      const allRays = traceSingleRay(
        { x: laser.x, y: laser.y },
        direction,
        laser.properties.power || 1,
        `ray-${laser.id}`,
        laser.properties.wavelength || 632.8
      );
      rays.push(...allRays);
    });

    setSetup(prev => ({ ...prev, rays }));
  }, [setup.components, setup.gridSize]);

  const clearSetup = useCallback(() => {
    setSetup({
      components: [],
      rays: [],
      gridSize: { width: 40, height: 25 },
      cellSize: 30
    });
    setSelectedComponent(null);
  }, []);

  const exportSetup = useCallback(() => {
    return {
      version: '1.0',
      timestamp: new Date().toISOString(),
      setup,
      metadata: {
        description: 'Optical setup design',
        author: 'Optical Designer'
      }
    };
  }, [setup]);

  return {
    setup,
    selectedComponent,
    setSelectedComponent,
    addComponent,
    removeComponent,
    updateComponent,
    moveComponent,
    rotateComponent,
    updateProperties,
    connectPorts,
    traceRays,
    clearSetup,
    exportSetup,
    setSetup
  };
};
