import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Activity, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OpticalSetup } from '@/types/optical';

interface SimulationPanelProps {
  setup: OpticalSetup;
  onTraceRays: () => void;
}

export const SimulationPanel = ({ setup, onTraceRays }: SimulationPanelProps) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runSimulation = async () => {
    if (setup.components.length === 0) {
      toast({
        title: 'No components',
        description: 'Add components to the canvas before simulating',
        variant: 'destructive',
      });
      return;
    }

    // Check if there are any lasers
    const hasLaser = setup.components.some(c => c.type === 'laser');
    if (!hasLaser) {
      toast({
        title: 'No laser source',
        description: 'Add at least one laser to trace rays',
        variant: 'destructive',
      });
      return;
    }

    setIsSimulating(true);
    try {
      // First, trace rays to populate setup.rays
      console.log('Tracing rays before simulation...');
      onTraceRays();
      
      // Wait for state to update (increased delay)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('Setup rays after tracing:', setup.rays.length);
      
      const { data, error } = await supabase.functions.invoke('simulate-optical-setup', {
        body: { setup },
      });

      if (error) throw error;

      setResults(data);
      
      if (data.rayTraceResults.length > 0) {
        toast({
          title: 'Simulation complete',
          description: `Analyzed ${data.rayTraceResults.length} rays`,
        });
      } else {
        toast({
          title: 'No rays detected',
          description: 'Click "Trace Rays" button first, then run simulation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: 'Simulation failed',
        description: error instanceof Error ? error.message : 'Failed to run simulation',
        variant: 'destructive',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Card className="p-4 border-border">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">Simulation</Label>
        </div>
        
        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          className="w-full"
          size="sm"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <Activity className="w-4 h-4 mr-2" />
              Run Simulation
            </>
          )}
        </Button>

        {results && (
          <div className="mt-4 space-y-2 text-xs">
            <div className="p-2 bg-muted rounded">
              <div className="font-semibold text-foreground mb-1">Summary</div>
              <div className="space-y-1 text-muted-foreground">
                <div>Components: {results.summary.totalComponents}</div>
                <div>Rays: {results.summary.totalRays}</div>
                <div>Avg Path: {results.summary.averagePathLength} mm</div>
                <div>Avg Loss: {results.summary.averagePowerLoss}%</div>
              </div>
            </div>

            {results.rayTraceResults.map((ray: any, idx: number) => (
              <div key={idx} className="p-2 bg-muted rounded">
                <div className="font-semibold text-foreground">Ray {idx + 1}</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>Path: {ray.totalPathLength} mm</div>
                  <div>Final Power: {ray.finalPower} W</div>
                  <div>Loss: {ray.powerLossPercent}%</div>
                  <div>Interactions: {ray.interactions.length}</div>
                </div>
              </div>
            ))}

            {results.interferencePatterns.length > 0 && (
              <div className="p-2 bg-muted rounded">
                <div className="font-semibold text-foreground mb-1">Interference</div>
                {results.interferencePatterns.map((pattern: any, idx: number) => (
                  <div key={idx} className="space-y-1 text-muted-foreground">
                    {pattern.interferencePattern !== 'none' && (
                      <>
                        <div>Path Diff: {pattern.pathDifference} mm</div>
                        <div>Order: {pattern.orderOfInterference}</div>
                        <div>Visibility: {pattern.visibility}</div>
                        <div>Type: {pattern.interferenceType}</div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
