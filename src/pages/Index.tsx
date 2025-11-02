import { useState } from 'react';
import { ComponentLibrary } from '@/components/optical/ComponentLibrary';
import { OpticalCanvas } from '@/components/optical/OpticalCanvas';
import { PropertiesPanel } from '@/components/optical/PropertiesPanel';
import { Toolbar } from '@/components/optical/Toolbar';
import { SetupGenerator } from '@/components/optical/SetupGenerator';
import { SimulationPanel } from '@/components/optical/SimulationPanel';
import { useOpticalSetup } from '@/hooks/useOpticalSetup';
import { ComponentType, OpticalComponent } from '@/types/optical';
import { Microscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const {
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
  } = useOpticalSetup();

  const handleSetupGenerated = (components: OpticalComponent[]) => {
    setSetup(prev => ({
      ...prev,
      components,
      rays: []
    }));
    toast({
      title: 'Setup loaded',
      description: 'AI-generated setup has been added to canvas',
    });
  };

  const handleExport = () => {
    const data = exportSetup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optical-setup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedComponentData = setup.components.find(c => c.id === selectedComponent) || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Microscope className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Optical Setup Designer</h1>
                <p className="text-sm text-muted-foreground">Design and simulate optical experiments</p>
              </div>
            </div>
            
            <Toolbar
              onExport={handleExport}
              onClear={clearSetup}
              onTraceRays={traceRays}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Component Library */}
          <div className="col-span-2">
            <ComponentLibrary
              onSelectComponent={(type: ComponentType) => {
                // Components are added via drag-and-drop
              }}
            />
          </div>

          {/* Center - Canvas */}
          <div className="col-span-7">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="mb-3">
                <h2 className="font-semibold text-foreground">Canvas</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Drag components from the library onto the grid
                </p>
              </div>
              
              <div className="flex justify-center overflow-auto">
                <OpticalCanvas
                  components={setup.components}
                  rays={setup.rays}
                  selectedId={selectedComponent}
                  onSelectComponent={setSelectedComponent}
                  onMoveComponent={moveComponent}
                  onAddComponent={addComponent}
                  onConnectPorts={connectPorts}
                  gridSize={setup.gridSize}
                  cellSize={setup.cellSize}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Simulation, AI Generator & Properties */}
          <div className="col-span-3">
            <div className="sticky top-6 space-y-4">
              <SimulationPanel setup={setup} onTraceRays={traceRays} />
              
              <SetupGenerator onSetupGenerated={handleSetupGenerated} />
              
              <div>
                <div className="mb-3">
                  <h2 className="font-semibold text-foreground">Properties</h2>
                </div>
                
              <PropertiesPanel
                component={selectedComponentData}
                onUpdate={updateProperties}
                onRotate={rotateComponent}
                onDelete={removeComponent}
                onMove={moveComponent}
                onUpdateComponent={updateComponent}
              />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
