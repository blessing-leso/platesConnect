import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { farmer_id } = await req.json();
    console.log('Starting AI matching for farmer:', farmer_id);

    // Get farmer's latest surplus listings
    const { data: surplusListings, error: surplusError } = await supabaseClient
      .from('surplus_listings')
      .select('*')
      .eq('farmer_id', farmer_id)
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (surplusError) {
      console.error('Error fetching surplus listings:', surplusError);
      throw surplusError;
    }

    // Get all kitchens with their details
    const { data: kitchens, error: kitchenError } = await supabaseClient
      .from('profiles')
      .select(`
        *,
        kitchen_details (*)
      `)
      .eq('user_type', 'kitchen');

    if (kitchenError) {
      console.error('Error fetching kitchens:', kitchenError);
      throw kitchenError;
    }

    console.log(`Found ${surplusListings?.length} surplus listings and ${kitchens?.length} kitchens`);

    // For each surplus listing, calculate matches with kitchens
    for (const surplus of surplusListings || []) {
      for (const kitchen of kitchens || []) {
        const matchScore = await calculateMatchScore(surplus, kitchen);
        const distance = calculateDistance(surplus.location, kitchen.location);
        
        // Only create matches with score > 0.3
        if (matchScore > 0.3) {
          const { error: matchError } = await supabaseClient
            .from('surplus_matches')
            .upsert({
              surplus_id: surplus.id,
              kitchen_id: kitchen.user_id,
              match_score: matchScore,
              distance_km: distance,
              nutritional_fit_score: await calculateNutritionalFit(surplus, kitchen),
              capacity_fit_score: calculateCapacityFit(surplus, kitchen)
            }, {
              onConflict: 'surplus_id,kitchen_id'
            });

          if (matchError) {
            console.error('Error creating match:', matchError);
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'AI matching completed',
      processed: {
        surplus_listings: surplusListings?.length || 0,
        kitchens: kitchens?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI matching:', error);
    return new Response(JSON.stringify({ 
      error: 'AI matching failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function calculateMatchScore(surplus: any, kitchen: any): Promise<number> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    console.warn('OpenAI API key not found, using basic matching');
    return calculateBasicMatchScore(surplus, kitchen);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an AI that matches surplus food with community kitchens. 
            Rate the match on a scale of 0.0 to 1.0 based on:
            - Nutritional value for community needs
            - Quantity vs kitchen capacity
            - Location proximity
            - Expiry date urgency
            - Kitchen storage capabilities
            
            Respond with just a decimal number between 0.0 and 1.0.`
          },
          {
            role: 'user',
            content: `
            SURPLUS: ${surplus.product_name}, ${surplus.quantity}${surplus.unit}, expires ${surplus.expiry_date}, location: ${surplus.location}
            KITCHEN: ${kitchen.kitchen_details?.[0]?.kitchen_name || 'Community Kitchen'}, serves ${kitchen.kitchen_details?.[0]?.capacity_people || 50} people, location: ${kitchen.location}, storage: ${kitchen.kitchen_details?.[0]?.storage_capacity || 'basic'}
            `
          }
        ],
        max_completion_tokens: 10,
      }),
    });

    const data = await response.json();
    const score = parseFloat(data.choices[0].message.content.trim());
    
    return isNaN(score) ? calculateBasicMatchScore(surplus, kitchen) : Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('OpenAI matching failed, using basic matching:', error);
    return calculateBasicMatchScore(surplus, kitchen);
  }
}

function calculateBasicMatchScore(surplus: any, kitchen: any): number {
  let score = 0.5; // Base score
  
  // Higher score for larger quantities if kitchen has high capacity
  const kitchenCapacity = kitchen.kitchen_details?.[0]?.capacity_people || 50;
  if (surplus.quantity >= kitchenCapacity * 0.5) score += 0.2;
  
  // Higher score for urgent expiry (within 3 days)
  const daysToExpiry = (new Date(surplus.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
  if (daysToExpiry <= 3) score += 0.2;
  
  // Location matching (simple string similarity)
  if (surplus.location.toLowerCase().includes(kitchen.location.toLowerCase()) || 
      kitchen.location.toLowerCase().includes(surplus.location.toLowerCase())) {
    score += 0.3;
  }
  
  return Math.max(0, Math.min(1, score));
}

function calculateDistance(location1: string, location2: string): number {
  // Simple distance calculation based on location string similarity
  // In a real implementation, you'd use GPS coordinates and proper distance calculation
  const similarity = location1.toLowerCase() === location2.toLowerCase() ? 0 : 
                    location1.toLowerCase().includes(location2.toLowerCase()) || 
                    location2.toLowerCase().includes(location1.toLowerCase()) ? 5 : 25;
  
  return similarity;
}

async function calculateNutritionalFit(surplus: any, kitchen: any): Promise<number> {
  // Simple nutritional scoring based on food type
  const nutritionalValues: { [key: string]: number } = {
    'vegetables': 0.8,
    'fruits': 0.7,
    'grains': 0.9,
    'protein': 0.9,
    'dairy': 0.6,
  };
  
  const productLower = surplus.product_name.toLowerCase();
  
  for (const [category, score] of Object.entries(nutritionalValues)) {
    if (productLower.includes(category)) {
      return score;
    }
  }
  
  return 0.6; // Default nutritional score
}

function calculateCapacityFit(surplus: any, kitchen: any): number {
  const kitchenCapacity = kitchen.kitchen_details?.[0]?.capacity_people || 50;
  const surplusQuantity = surplus.quantity;
  
  // Optimal fit: surplus can serve 70-100% of kitchen capacity
  const optimalMin = kitchenCapacity * 0.1; // 10% of capacity
  const optimalMax = kitchenCapacity * 0.5; // 50% of capacity
  
  if (surplusQuantity >= optimalMin && surplusQuantity <= optimalMax) {
    return 1.0;
  } else if (surplusQuantity > optimalMax) {
    return 0.7; // Too much but still useful
  } else {
    return 0.4; // Too little but better than nothing
  }
}