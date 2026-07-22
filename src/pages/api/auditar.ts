import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { imageBase64, categoria, marcaObjetivo, competidores, descripcionEmpaque } = await request.json();

    const OPENROUTER_API_KEY = import.meta.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Falta configurar la API Key de OpenRouter en .env" }), 
        { status: 500 }
      );
    }
    // subir a supabase
    const base64Data = imageBase64.split(';base64,').pop();
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const fileName = `auditoria_${Date.now()}.jpg`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('fotos-gondolas')
      .upload(fileName, imageBuffer, { contentType: 'image/jpeg' });

      if (uploadError) {
      console.error("Error al subir a Supabase Storage:", uploadError);
      throw new Error(`Error al guardar la imagen: ${uploadError.message}`);
    }

    // Obtener la URL pública de la imagen
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('fotos-gondolas')
      .getPublicUrl(fileName);

    const fotoUrl = publicUrlData.publicUrl;

    const prompt = `
Eres un auditor experto de Trade Marketing. Tu objetivo es analizar con precisión la foto de la góndola/nevera provista.

CATEGORÍA A EVALUAR: "${categoria}"
MARCA OBJETIVO: "${marcaObjetivo}" (${descripcionEmpaque})
COMPETIDORES DIRECTOS: ${competidores.join(", ")}

REGLAS DE ORO Y RECORRIDO DE EVALUACIÓN:
1. CONTROL DE CALIDAD: Verifica si la imagen es lo suficientemente clara para auditar. Si está excesivamente borrosa o no se distinguen los productos, marca "imagen_valida": false.
2. DELIMITACIÓN DE CATEGORÍA: Revisa las repisas de arriba a abajo. Analiza ÚNICAMENTE las filas donde se exponga la categoría "${categoria}". Ignora productos de otros rubros (harinas, pastas, papel, etc.).
3. MATERIAL POP: Ignora carteles de precios en papel, chispapas o publicidad colgada. Concéntrate en los envases.
4. DEFINICIÓN DE FACING: Cuenta únicamente los frentes visibles de la cara FRONTAL (primera fila expuesta). No cuentes productos apilados detrás en profundidad.
5. BORDES: Solo cuenta un producto si se observa al menos el 50% de su empaque en la foto.
6. HUECOS/QUIEBRES: Un quiebre de stock es un espacio vacío REAL en la repisa dentro de la categoría. Si detectas quiebres, calcula sus coordenadas [ymin, xmin, ymax, xmax] en % (0 a 100).

Devuelve ÚNICAMENTE un JSON plano con este esquema exacto:
{
  "imagen_valida": true,
  "confianza_conteo": "alta", // "alta", "media" o "baja"
  "analisis_paso_a_paso": "Resumen por repisa especificando filas analizadas e ignoradas.",
  "target_facings": number, 
  "competitor_facings": number,
  "stock_breaks": number,
  "areas_mejora": [
    {
      "tipo": "quiebre_de_stock",
      "descripcion": "Descripción corta del problema",
      "box_2d": [ymin, xmin, ymax, xmax] // Coordenadas en % (0 a 100)
    }
  ],
  "observation": "Resumen ejecutivo del Share of Shelf y recomendaciones."
}
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-4o-mini",
        "messages": [
          {
            "role": "user",
            "content": [
              { "type": "text", "text": prompt },
              { "type": "image_url", "image_url": { "url": fotoUrl } }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    // CORREGIR EL JSON
    let responseText = data.choices[0].message.content.trim();
    if (responseText.startsWith("```")) {
      responseText = responseText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
    }
    const auditResult = JSON.parse(responseText);

    // Guardar en la Base de Datos PostgreSQL
    // 3a. Insertar en la tabla 'auditorias'
    const { data: auditRecord, error: dbError1 } = await supabaseAdmin
      .from('auditorias')
      .insert([
        {
          foto_url: fotoUrl
        }
      ])
      .select()
      .single();

      if (dbError1) {
        console.error("Error al insertar la auditoría: ", dbError1)
      } else if(auditRecord){
        // Insertar métricas en la tabla 'metricas_auditoria'
        const { error: dbError2 } = await supabaseAdmin
        .from('metricas_auditoria')
        .insert([
          {
            auditoria_id: auditRecord.id,
            analisis_paso_a_paso: auditResult.analisis_paso_a_paso,
            target_facings: auditResult.target_facings,
            competitor_facings: auditResult.competitor_facings,
            stock_breaks: auditResult.stock_breaks,
            observation: auditResult.observation
          }
        ]);
        if (dbError2) console.error("Error insertando métricas:", dbError2);
      }
      // Devolver el resultado de la IA junto a la URL de Supabase
      return new Response(
      JSON.stringify({ ...auditResult, fotoUrl }), 
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
};