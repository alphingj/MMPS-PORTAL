// supabase/functions/manage-user/index.ts
/// <reference lib="deno.ns" />

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, userData } = await req.json()
    if (!action || !userData) throw new Error("Action and userData are required.");

    let responseData;
    switch (action) {
      case 'CREATE': {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        })
        if (error) throw error
        responseData = data.user;
        break;
      }
      case 'UPDATE': {
        if (!userData.id) throw new Error("User ID is required for update.");
        const updatePayload: { email?: string; password?: string } = {};
        if (userData.email) updatePayload.email = userData.email;
        if (userData.password) updatePayload.password = userData.password;
        
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userData.id, updatePayload);
        if (error) throw error
        responseData = data.user;
        break;
      }
      case 'DELETE': {
         if (!userData.id) throw new Error("User ID is required for delete.");
         const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userData.id);
         if (error) throw error
         responseData = { message: "User deleted successfully." };
         break;
      }
      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
