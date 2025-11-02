import { ComponentType } from '@/types/optical';
import { componentLabels, componentDescriptions } from '@/lib/opticalComponents';
import { Card } from '@/components/ui/card';
import { Zap, Circle, Disc, Box, Target } from 'lucide-react';

interface ComponentLibraryProps {
  onSelectComponent: (type: ComponentType) => void;
}

const componentIcons: Record<ComponentType, React.ReactNode> = {
  laser: <Zap className="w-6 h-6" />,
  mirror: <Circle className="w-6 h-6" />,
  lens: <Disc className="w-6 h-6" />,
  beamsplitter: <Box className="w-6 h-6" />,
  detector: <Target className="w-6 h-6" />
};

export const ComponentLibrary = ({ onSelectComponent }: ComponentLibraryProps) => {
  const components: ComponentType[] = ['laser', 'mirror', 'lens', 'beamsplitter', 'detector'];

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-foreground">Component Library</h3>
      <div className="space-y-2">
        {components.map(type => (
          <Card
            key={type}
            className="p-3 cursor-pointer hover:bg-accent/50 transition-colors border-border"
            onClick={() => onSelectComponent(type)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('componentType', type);
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`text-optical-${type} mt-0.5`}>
                {componentIcons[type]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground">
                  {componentLabels[type]}
                </h4>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
