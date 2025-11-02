import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { setup } = await req.json();
    console.log('Simulating optical setup with', setup.components.length, 'components');

    // Calculate total path lengths
    const pathLengths: Record<string, number> = {};
    const powerLevels: Record<string, number> = {};
    
    setup.components.forEach((component: any) => {
      if (component.type === 'laser') {
        pathLengths[component.id] = 0;
        powerLevels[component.id] = component.properties.power || 1;
      }
    });

    // Trace rays and calculate losses
    const results = setup.rays.map((ray: any) => {
      let totalDistance = 0;
      let currentPower = ray.intensity;
      const interactions: any[] = [];

      for (let i = 0; i < ray.path.length - 1; i++) {
        const p1 = ray.path[i];
        const p2 = ray.path[i + 1];
        const distance = Math.sqrt(
          Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
        ) * setup.cellSize; // Convert to mm

        totalDistance += distance;

        // Find component at this position
        const component = setup.components.find(
          (c: any) => Math.abs(c.x - p2.x) < 0.5 && Math.abs(c.y - p2.y) < 0.5
        );

        if (component) {
          let loss = 0;
          if (component.type === 'mirror') {
            loss = 1 - (component.properties.reflectivity || 1);
          } else if (component.type === 'beamsplitter') {
            loss = 1 - (component.properties.reflectivity || 0.5);
          } else if (component.type === 'lens') {
            loss = 0.05; // 5% loss through lens
          }
          
          currentPower *= (1 - loss);
          
          interactions.push({
            componentId: component.id,
            componentType: component.type,
            distance: totalDistance,
            powerBefore: currentPower / (1 - loss),
            powerAfter: currentPower,
            loss: loss * 100
          });
        }
      }

      return {
        rayId: ray.id,
        wavelength: ray.wavelength,
        totalPathLength: totalDistance.toFixed(2),
        finalPower: currentPower.toFixed(4),
        powerLossPercent: ((1 - currentPower / ray.intensity) * 100).toFixed(2),
        interactions
      };
    });

    // Calculate interference patterns if applicable
    const interferenceData = calculateInterference(setup, results);

    const simulation = {
      timestamp: new Date().toISOString(),
      rayTraceResults: results,
      interferencePatterns: interferenceData,
      summary: {
        totalComponents: setup.components.length,
        totalRays: setup.rays.length,
        averagePathLength: (
          results.reduce((sum: number, r: any) => sum + parseFloat(r.totalPathLength), 0) / 
          results.length
        ).toFixed(2),
        averagePowerLoss: (
          results.reduce((sum: number, r: any) => sum + parseFloat(r.powerLossPercent), 0) / 
          results.length
        ).toFixed(2)
      }
    };

    console.log('Simulation complete:', simulation.summary);

    return new Response(JSON.stringify(simulation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in simulate-optical-setup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function calculateInterference(setup: any, rayResults: any[]) {
  // Simple interference calculation for rays that converge at detectors
  const detectors = setup.components.filter((c: any) => c.type === 'detector');
  
  return detectors.map((detector: any) => {
    // Find rays that hit this detector
    const convergingRays = rayResults.filter(r => {
      const lastPoint = setup.rays.find((ray: any) => ray.id === r.rayId)?.path.slice(-1)[0];
      return lastPoint && 
             Math.abs(lastPoint.x - detector.x) < 1 && 
             Math.abs(lastPoint.y - detector.y) < 1;
    });

    if (convergingRays.length < 2) {
      return {
        detectorId: detector.id,
        interferencePattern: 'none',
        visibility: 0
      };
    }

    // Calculate path difference
    const pathDiff = Math.abs(
      parseFloat(convergingRays[0].totalPathLength) - 
      parseFloat(convergingRays[1].totalPathLength)
    );
    
    const wavelength = convergingRays[0].wavelength / 1e6; // Convert nm to mm
    const orderOfInterference = pathDiff / wavelength;
    
    // Calculate fringe visibility
    const I1 = parseFloat(convergingRays[0].finalPower);
    const I2 = parseFloat(convergingRays[1].finalPower);
    const visibility = (2 * Math.sqrt(I1 * I2)) / (I1 + I2);

    return {
      detectorId: detector.id,
      pathDifference: pathDiff.toFixed(4),
      orderOfInterference: orderOfInterference.toFixed(2),
      visibility: visibility.toFixed(3),
      interferenceType: orderOfInterference % 1 < 0.25 ? 'constructive' : 
                       orderOfInterference % 1 > 0.75 ? 'constructive' : 'destructive'
    };
  });
}
