import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OpticalComponent, ComponentType } from '@/types/optical';
import { getDefaultPorts } from '@/lib/opticalComponents';

interface SetupGeneratorProps {
  onSetupGenerated: (components: OpticalComponent[]) => void;
}

export const SetupGenerator = ({ onSetupGenerated }: SetupGeneratorProps) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateSetup = async () => {
    if (!description.trim()) {
      toast({
        title: 'Description required',
        description: 'Please describe the optical setup you want to create',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-optical-setup', {
        body: { description },
      });

      if (error) throw error;

      // Convert generated components to proper format
      const components: OpticalComponent[] = data.components.map((comp: any, idx: number) => ({
        id: `${comp.type}-${Date.now()}-${idx}`,
        type: comp.type as ComponentType,
        x: Math.round(comp.x),
        y: Math.round(comp.y),
        rotation: comp.rotation as 0 | 90 | 180 | 270,
        ports: getDefaultPorts(comp.type as ComponentType),
        properties: comp.properties,
        label: undefined,
      }));

      onSetupGenerated(components);
      
      toast({
        title: 'Setup generated!',
        description: `Created ${components.length} components`,
      });
      
      setDescription('');
    } catch (error) {
      console.error('Error generating setup:', error);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Failed to generate setup',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4 border-border">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">AI Setup Generator</Label>
        </div>
        
        <Input
          placeholder="e.g., Michelson interferometer, or laser with two mirrors..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generateSetup()}
          disabled={isGenerating}
          className="text-sm"
        />
        
        <Button
          onClick={generateSetup}
          disabled={isGenerating}
          className="w-full"
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Setup
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
