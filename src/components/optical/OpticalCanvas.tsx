import { useRef, useEffect, useState } from 'react';
import { OpticalComponent, ComponentType, Ray } from '@/types/optical';
import { Zap, Circle, Disc, Box, Target } from 'lucide-react';

interface OpticalCanvasProps {
  components: OpticalComponent[];
  rays: Ray[];
  selectedId: string | null;
  onSelectComponent: (id: string) => void;
  onMoveComponent: (id: string, x: number, y: number) => void;
  onAddComponent: (type: ComponentType, x: number, y: number) => void;
  onConnectPorts: (comp1Id: string, port1Id: string, comp2Id: string, port2Id: string) => void;
  gridSize: { width: number; height: number };
  cellSize: number;
}

export const OpticalCanvas = ({
  components,
  rays,
  selectedId,
  onSelectComponent,
  onMoveComponent,
  onAddComponent,
  onConnectPorts,
  gridSize,
  cellSize
}: OpticalCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingPort, setConnectingPort] = useState<{ componentId: string; portId: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    
    if (componentType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cellSize);
      const y = Math.floor((e.clientY - rect.top) / cellSize);
      
      onAddComponent(componentType, x, y);
    }
  };

  const handleComponentMouseDown = (e: React.MouseEvent, component: OpticalComponent) => {
    e.stopPropagation();
    onSelectComponent(component.id);
    setDraggingId(component.id);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const clickX = (e.clientX - rect.left) / cellSize;
      const clickY = (e.clientY - rect.top) / cellSize;
      setDragOffset({
        x: clickX - component.x,
        y: clickY - component.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / cellSize - dragOffset.x;
        const y = (e.clientY - rect.top) / cellSize - dragOffset.y;
        onMoveComponent(draggingId, x, y);
      }
      
      // Track mouse position for connection line
      if (connectingPort && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      setConnectingPort(null);
    };

    if (draggingId || connectingPort) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset, cellSize, onMoveComponent, connectingPort]);

  const renderComponent = (component: OpticalComponent) => {
    const x = component.x * cellSize;
    const y = component.y * cellSize;
    const isSelected = component.id === selectedId;

    let icon;
    let color;
    
    switch (component.type) {
      case 'laser':
        icon = <Zap className="w-6 h-6" />;
        color = 'text-optical-laser';
        break;
      case 'mirror':
        icon = <Circle className="w-6 h-6" />;
        color = 'text-optical-mirror';
        break;
      case 'lens':
        icon = <Disc className="w-6 h-6" />;
        color = 'text-optical-lens';
        break;
      case 'beamsplitter':
        icon = <Box className="w-6 h-6" />;
        color = 'text-optical-beamsplitter';
        break;
      case 'detector':
        icon = <Target className="w-6 h-6" />;
        color = 'text-optical-detector';
        break;
    }

    return (
      <div
        key={component.id}
        className={`absolute cursor-move transition-all ${color}`}
        style={{
          left: x,
          top: y,
          width: cellSize,
          height: cellSize,
          transform: `rotate(${component.rotation}deg)`
        }}
        onMouseDown={(e) => handleComponentMouseDown(e, component)}
      >
        <div
          className={`w-full h-full flex items-center justify-center rounded-lg border-2 bg-card ${
            isSelected ? 'border-primary shadow-lg' : 'border-border'
          }`}
        >
          {icon}
        </div>
        
        {/* Port indicators */}
        {component.ports.map(port => {
          let portStyle = {};
          switch (port.position) {
            case 'top':
              portStyle = { top: -4, left: '50%', transform: 'translateX(-50%)' };
              break;
            case 'right':
              portStyle = { right: -4, top: '50%', transform: 'translateY(-50%)' };
              break;
            case 'bottom':
              portStyle = { bottom: -4, left: '50%', transform: 'translateX(-50%)' };
              break;
            case 'left':
              portStyle = { left: -4, top: '50%', transform: 'translateY(-50%)' };
              break;
          }
          
          const isConnected = !!port.connectedTo;
          
          return (
            <div
              key={port.id}
              className={`absolute w-3 h-3 rounded-full cursor-pointer transition-all hover:scale-150 z-10 ${
                isConnected ? 'bg-primary' : 'bg-accent hover:bg-primary/50'
              }`}
              style={portStyle}
              onMouseDown={(e) => {
                e.stopPropagation();
                setConnectingPort({ componentId: component.id, portId: port.id });
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                if (connectingPort && connectingPort.componentId !== component.id) {
                  // Connect the ports
                  onConnectPorts(
                    connectingPort.componentId,
                    connectingPort.portId,
                    component.id,
                    port.id
                  );
                }
                setConnectingPort(null);
              }}
            />
          );
        })}
      </div>
    );
  };

  const getPortPosition = (component: OpticalComponent, portId: string) => {
    const port = component.ports.find(p => p.id === portId);
    if (!port) return { x: 0, y: 0 };
    
    const centerX = component.x * cellSize + cellSize / 2;
    const centerY = component.y * cellSize + cellSize / 2;
    
    // Port offset from center (before rotation)
    let offsetX = 0;
    let offsetY = 0;
    
    switch (port.position) {
      case 'top':
        offsetY = -cellSize / 2;
        break;
      case 'right':
        offsetX = cellSize / 2;
        break;
      case 'bottom':
        offsetY = cellSize / 2;
        break;
      case 'left':
        offsetX = -cellSize / 2;
        break;
    }
    
    // Apply rotation to port offset
    const rotRad = (component.rotation * Math.PI) / 180;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);
    
    const rotatedX = offsetX * cos - offsetY * sin;
    const rotatedY = offsetX * sin + offsetY * cos;
    
    return {
      x: centerX + rotatedX,
      y: centerY + rotatedY
    };
  };

  const renderConnections = () => {
    const lines: JSX.Element[] = [];
    
    components.forEach(component => {
      component.ports.forEach(port => {
        if (port.connectedTo) {
          const [targetCompId, targetPortId] = port.connectedTo.split(':');
          const targetComp = components.find(c => c.id === targetCompId);
          
          if (targetComp) {
            const startPos = getPortPosition(component, port.id);
            const endPos = getPortPosition(targetComp, targetPortId);
            
            lines.push(
              <line
                key={`${component.id}:${port.id}-${port.connectedTo}`}
                x1={startPos.x}
                y1={startPos.y}
                x2={endPos.x}
                y2={endPos.y}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
            );
          }
        }
      });
    });
    
    // Draw connecting line while dragging
    if (connectingPort) {
      const sourceComp = components.find(c => c.id === connectingPort.componentId);
      if (sourceComp) {
        const startPos = getPortPosition(sourceComp, connectingPort.portId);
        lines.push(
          <line
            key="connecting-line"
            x1={startPos.x}
            y1={startPos.y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.6"
          />
        );
      }
    }
    
    return (
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          width: gridSize.width * cellSize,
          height: gridSize.height * cellSize
        }}
      >
        {lines}
      </svg>
    );
  };

  const renderRays = () => {
    return rays.map(ray => {
      const pathString = ray.path
        .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x * cellSize + cellSize/2} ${point.y * cellSize + cellSize/2}`)
        .join(' ');
      
      // Calculate color based on wavelength (simple approximation)
      const wavelength = ray.wavelength;
      let color = '#ff0000'; // Default red
      if (wavelength < 500) color = '#4444ff'; // Blue
      else if (wavelength < 550) color = '#44ff44'; // Green
      else if (wavelength < 600) color = '#ffff44'; // Yellow
      else color = '#ff4444'; // Red
      
      return (
        <svg
          key={ray.id}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: gridSize.width * cellSize,
            height: gridSize.height * cellSize
          }}
        >
          <path
            d={pathString}
            stroke={color}
            strokeWidth="2"
            fill="none"
            opacity={ray.intensity > 0.5 ? 0.8 : 0.4}
            strokeDasharray={ray.intensity < 0.5 ? "4 4" : "none"}
          />
          {/* Add arrowheads */}
          {ray.path.map((point, idx) => {
            if (idx === 0 || idx === ray.path.length - 1) return null;
            const prev = ray.path[idx - 1];
            const angle = Math.atan2(point.y - prev.y, point.x - prev.x) * 180 / Math.PI;
            return (
              <circle
                key={`${ray.id}-${idx}`}
                cx={point.x * cellSize + cellSize/2}
                cy={point.y * cellSize + cellSize/2}
                r="2"
                fill={color}
              />
            );
          })}
        </svg>
      );
    });
  };

  return (
    <div
      ref={canvasRef}
      className="relative bg-grid-bg border border-border rounded-lg overflow-hidden"
      style={{
        width: gridSize.width * cellSize,
        height: gridSize.height * cellSize,
        backgroundImage: `
          linear-gradient(hsl(var(--grid-line)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--grid-line)) 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => onSelectComponent('')}
    >
      {renderConnections()}
      {renderRays()}
      {components.map(renderComponent)}
    </div>
  );
};
