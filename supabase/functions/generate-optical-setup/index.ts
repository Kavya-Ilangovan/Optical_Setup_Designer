import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating optical setup for:', description);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert optical physicist and engineer. Generate precise optical setups based on descriptions.

CRITICAL PHYSICS RULES:

1. ROTATION SYSTEM (degrees, 0-360):
   - Laser rotation: 0° = emits RIGHT, 90° = emits DOWN, 180° = emits LEFT, 270° = emits UP
   - Mirror rotation: defines the normal direction (perpendicular to surface)
   - Beamsplitter at 45°: splits incoming beam at 90° (one transmitted, one reflected)
   - Detector rotation: defines sensitive direction

2. COMPONENT BEHAVIOR:
   - Laser: Emits beam in direction of its rotation angle
   - Mirror: Reflects beam perpendicular to its surface normal (rotation angle)
   - Beamsplitter (50/50 at 45°): Splits beam - 50% transmitted straight, 50% reflected at 90°
   - Lens: Focuses/defocuses beam along optical axis
   - Detector: Absorbs beam from its facing direction

3. MICHELSON INTERFEROMETER SPECIFIC:
   - Laser (x=8, y=12, rotation=0°) emits RIGHT towards beamsplitter
   - Beamsplitter (x=15, y=12, rotation=45°) splits beam:
     * 50% goes UP to mirror 1
     * 50% goes RIGHT to mirror 2
   - Mirror 1 (x=15, y=5, rotation=90°) reflects beam DOWN back to beamsplitter
   - Mirror 2 (x=22, y=12, rotation=180°) reflects beam LEFT back to beamsplitter
   - Detector (x=15, y=19, rotation=270°) receives recombined beams from beamsplitter

Return ONLY valid JSON (no markdown):
{
  "components": [
    {
      "type": "laser" | "mirror" | "lens" | "beamsplitter" | "detector",
      "x": number (0-39),
      "y": number (0-24),
      "rotation": number (0-360 degrees),
      "properties": {
        "power"?: number,
        "wavelength"?: number,
        "reflectivity"?: number,
        "roc"?: number,
        "focalLength"?: number,
        "transmissivity"?: number,
        "sensitivity"?: number
      }
    }
  ]
}

POSITIONING GUIDELINES:
- All x: 0-39, y: 0-24 (visible canvas)
- Space components 5-8 units apart for clear beam paths
- Align components for straight or 90° beam paths when possible
- Start near x=8 for input, spread evenly across grid`
          },
          {
            role: 'user',
            content: description
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const setupData = JSON.parse(content);
    
    console.log('Generated setup:', setupData);

    return new Response(JSON.stringify(setupData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-optical-setup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
