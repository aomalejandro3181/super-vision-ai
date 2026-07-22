import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from('auditorias')
      .select(`
        id,
        foto_url,
        created_at,
        metricas_auditoria (
          target_facings,
          competitor_facings,
          stock_breaks,
          observation,
          analisis_paso_a_paso
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};