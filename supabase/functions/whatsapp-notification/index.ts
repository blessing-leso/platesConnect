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

    const { surplus_id, kitchen_id, type } = await req.json();
    console.log('Sending WhatsApp notification:', { surplus_id, kitchen_id, type });

    // Get surplus and farmer details
    const { data: surplus, error: surplusError } = await supabaseClient
      .from('surplus_listings')
      .select(`
        *,
        profiles!surplus_listings_farmer_id_fkey (*)
      `)
      .eq('id', surplus_id)
      .single();

    if (surplusError) {
      console.error('Error fetching surplus:', surplusError);
      throw surplusError;
    }

    // Get kitchen details
    const { data: kitchen, error: kitchenError } = await supabaseClient
      .from('profiles')
      .select(`
        *,
        kitchen_details (*)
      `)
      .eq('user_id', kitchen_id)
      .single();

    if (kitchenError) {
      console.error('Error fetching kitchen:', kitchenError);
      throw kitchenError;
    }

    // Prepare notification message based on type
    let message = '';
    let targetPhone = '';

    if (type === 'surplus_claimed') {
      // Notify farmer that their surplus was claimed
      message = `🎉 Great news! Your surplus listing "${surplus.product_name}" (${surplus.quantity}${surplus.unit}) has been claimed by ${kitchen.kitchen_details?.[0]?.kitchen_name || kitchen.full_name}.\n\nThey will contact you soon to arrange pickup. Kitchen contact: ${kitchen.phone_number}\n\nLocation: ${kitchen.location}\n\nThank you for helping reduce food waste with Kaiǀūb! 🌱`;
      targetPhone = surplus.profiles.phone_number;
    } else if (type === 'new_match') {
      // Notify kitchen about new match
      message = `🍅 New surplus match found!\n\n"${surplus.product_name}" - ${surplus.quantity}${surplus.unit}\nLocation: ${surplus.location}\nExpires: ${new Date(surplus.expiry_date).toLocaleDateString()}\n${surplus.price > 0 ? `Price: R${surplus.price}` : 'FREE donation'}\n\nClaim it now on Kaiǀūb dashboard before it expires! 🌱`;
      targetPhone = kitchen.phone_number;
    }

    // Check if user opted in for WhatsApp notifications
    const recipient = type === 'surplus_claimed' ? surplus.profiles : kitchen;
    if (!recipient.whatsapp_opted_in || !targetPhone) {
      console.log('User has not opted in for WhatsApp or no phone number available');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Notification skipped - user not opted in or no phone number' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // In a real implementation, you would integrate with WhatsApp Business API
    // For now, we'll log the message that would be sent
    console.log('WhatsApp message to send:', {
      to: targetPhone,
      message: message
    });

    // Here you would integrate with WhatsApp Business API:
    // const whatsappResponse = await sendWhatsAppMessage(targetPhone, message);

    // For demo purposes, we'll simulate success
    const simulatedResponse = {
      success: true,
      messageId: `msg_${Date.now()}`,
      to: targetPhone,
      message: message
    };

    // Create an impact report if this is a successful claim
    if (type === 'surplus_claimed') {
      const estimatedMeals = Math.floor(surplus.quantity * 2); // Rough estimate: 1kg = 2 meals
      const co2Saved = surplus.quantity * 2.5; // Rough estimate: 1kg food = 2.5kg CO2 saved

      const { error: impactError } = await supabaseClient
        .from('impact_reports')
        .insert({
          surplus_id: surplus_id,
          kitchen_id: kitchen_id,
          kg_rescued: surplus.quantity,
          estimated_meals: estimatedMeals,
          co2_saved_kg: co2Saved
        });

      if (impactError) {
        console.error('Error creating impact report:', impactError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'WhatsApp notification sent successfully',
      details: simulatedResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return new Response(JSON.stringify({ 
      error: 'WhatsApp notification failed', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Note: In a production environment, you would implement actual WhatsApp Business API integration
// async function sendWhatsAppMessage(phoneNumber: string, message: string) {
//   const whatsappApiUrl = 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
//   const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
//   
//   const response = await fetch(whatsappApiUrl, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${accessToken}`,
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       messaging_product: 'whatsapp',
//       to: phoneNumber,
//       type: 'text',
//       text: {
//         body: message
//       }
//     }),
//   });
//   
//   return await response.json();
// }