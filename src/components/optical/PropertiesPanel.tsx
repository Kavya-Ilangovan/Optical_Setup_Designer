import { OpticalComponent } from '@/types/optical';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RotateCw, Trash2 } from 'lucide-react';
import { componentLabels } from '@/lib/opticalComponents';

interface PropertiesPanelProps {
  component: OpticalComponent | null;
  onUpdate: (id: string, properties: Partial<OpticalComponent['properties']>) => void;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onUpdateComponent: (id: string, updates: Partial<OpticalComponent>) => void;
}

export const PropertiesPanel = ({ 
  component, 
  onUpdate, 
  onRotate, 
  onDelete,
  onMove,
  onUpdateComponent
}: PropertiesPanelProps) => {
  if (!component) {
    return (
      <Card className="p-4 border-border">
        <p className="text-sm text-muted-foreground text-center">
          Select a component to edit its properties
        </p>
      </Card>
    );
  }

  const handlePropertyChange = (key: string, value: number) => {
    onUpdate(component.id, { [key]: value });
  };

  return (
    <Card className="p-4 space-y-4 border-border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">
          {componentLabels[component.type]}
        </h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRotate(component.id)}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(component.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs">Position (Grid)</Label>
          <div className="flex gap-2 mt-1">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">X</Label>
              <Input
                type="number"
                value={component.x}
                onChange={(e) => onMove(component.id, parseInt(e.target.value) || 0, component.y)}
                className="text-xs"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Y</Label>
              <Input
                type="number"
                value={component.y}
                onChange={(e) => onMove(component.id, component.x, parseInt(e.target.value) || 0)}
                className="text-xs"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs">Rotation</Label>
          <select
            value={component.rotation}
            onChange={(e) => onUpdateComponent(component.id, { rotation: parseInt(e.target.value) as 0 | 90 | 180 | 270 })}
            className="w-full text-xs mt-1 px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value={0}>0°</option>
            <option value={90}>90°</option>
            <option value={180}>180°</option>
            <option value={270}>270°</option>
          </select>
        </div>

        {component.type === 'mirror' && (
          <>
            <div>
              <Label className="text-xs">Reflectivity</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={component.properties.reflectivity || 0}
                onChange={(e) => handlePropertyChange('reflectivity', parseFloat(e.target.value))}
                className="text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Radius of Curvature (mm)</Label>
              <Input
                type="number"
                value={component.properties.roc || 0}
                onChange={(e) => handlePropertyChange('roc', parseFloat(e.target.value))}
                className="text-xs mt-1"
              />
            </div>
          </>
        )}

        {component.type === 'lens' && (
          <div>
            <Label className="text-xs">Focal Length (mm)</Label>
            <Input
              type="number"
              value={component.properties.focalLength || 0}
              onChange={(e) => handlePropertyChange('focalLength', parseFloat(e.target.value))}
              className="text-xs mt-1"
            />
          </div>
        )}

        {component.type === 'beamsplitter' && (
          <>
            <div>
              <Label className="text-xs">Reflectivity</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={component.properties.reflectivity || 0}
                onChange={(e) => handlePropertyChange('reflectivity', parseFloat(e.target.value))}
                className="text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Transmitivity</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={component.properties.transmitivity || 0}
                onChange={(e) => handlePropertyChange('transmitivity', parseFloat(e.target.value))}
                className="text-xs mt-1"
              />
            </div>
          </>
        )}

        {component.type === 'laser' && (
          <>
            <div>
              <Label className="text-xs">Power (W)</Label>
              <Input
                type="number"
                step="0.001"
                value={component.properties.power || 0}
                onChange={(e) => handlePropertyChange('power', parseFloat(e.target.value))}
                className="text-xs mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Wavelength (nm)</Label>
              <Input
                type="number"
                value={component.properties.wavelength || 0}
                onChange={(e) => handlePropertyChange('wavelength', parseFloat(e.target.value))}
                className="text-xs mt-1"
              />
            </div>
          </>
        )}

        {component.type === 'detector' && (
          <div>
            <Label className="text-xs">Sensitivity</Label>
            <Input
              type="number"
              step="0.1"
              value={component.properties.sensitivity || 0}
              onChange={(e) => handlePropertyChange('sensitivity', parseFloat(e.target.value))}
              className="text-xs mt-1"
            />
          </div>
        )}
      </div>
    </Card>
  );
};
