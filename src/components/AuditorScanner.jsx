import { useState } from 'react';

// 1. DICCIONARIO DE CONFIGURACIONES (PRESETS)
const PRESETS = {
    Harinas: {
        marcaObjetivo: "KALY",
        competidores: ["Mary", "P.A.N."],
        descripcionEmpaque: "empaques verde/blanco y naranja/amarillo"
    },
    Mayonesas: {
        marcaObjetivo: "Mavesa",
        competidores: ["Kraft"],
        descripcionEmpaque: "tapa roja, frasco con etiqueta azul/amarilla/blanca"
    },
    Margarinas: {
        marcaObjetivo: "Mavesa",
        competidores: ["Nelly", "Miramar"],
        descripcionEmpaque: "tina plástica amarilla con tapa y logo azul"
    }
};

export default function AuditorScanner() {
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [showOverlays, setShowOverlays] = useState(true);

    // Estados sincronizados con el Preset por defecto (Harinas)
    const [categoria, setCategoria] = useState("Harinas");
    const [marcaObjetivo, setMarcaObjetivo] = useState(PRESETS.Harinas.marcaObjetivo);
    const [competidores, setCompetidores] = useState(PRESETS.Harinas.competidores);
    const [descripcionEmpaque, setDescripcionEmpaque] = useState(PRESETS.Harinas.descripcionEmpaque);

    // Manejador del cambio de categoría (Actualiza todo el preset)
    const handleCategoryChange = (e) => {
        const selectedCat = e.target.value;
        setCategoria(selectedCat);

        if (PRESETS[selectedCat]) {
            setMarcaObjetivo(PRESETS[selectedCat].marcaObjetivo);
            setCompetidores(PRESETS[selectedCat].competidores);
            setDescripcionEmpaque(PRESETS[selectedCat].descripcionEmpaque);
        }
    };

    const handleImageCapture = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const processAudit = async () => {
        if (!imagePreview) return;
        setLoading(true);

        try {
            const response = await fetch('/api/auditar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: imagePreview,
                    categoria,
                    marcaObjetivo,
                    competidores,
                    descripcionEmpaque
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            setResult(data);
        } catch (err) {
            alert("Error en la auditoría: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 space-y-6 pb-20">
            {/* Selector de Categoría */}
            <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <label className="block text-xs font-black uppercase text-gray-700 mb-1">Categoría a Auditar</label>
                <select
                    value={categoria}
                    onChange={handleCategoryChange}
                    className="w-full font-bold p-2 border-2 border-black rounded-lg bg-yellow-200 focus:outline-none cursor-pointer"
                >
                    <option value="Harinas">Harinas (KALY vs Mary/PAN)</option>
                    <option value="Mayonesas">Mayonesas (Mavesa vs Kraft)</option>
                    <option value="Margarinas">Margarinas (Mavesa vs Nelly)</option>
                </select>
            </div>

            {/* Visor de Foto con Overlays */}
            <div className="relative bg-gray-100 border-2 border-black rounded-xl overflow-hidden min-h-[250px] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {imagePreview ? (
                    <div className="relative w-full inline-block">
                        <img src={imagePreview} alt="Vista previa" className="w-full h-auto block" />

                        {/* Cajas de Error/Mejora Estilizadas */}
                        {result && showOverlays && result.areas_mejora?.map((area, idx) => {
                            const [ymin, xmin, ymax, xmax] = area.box_2d;
                            return (
                                <div
                                    key={idx}
                                    className="absolute border-2 border-red-600 bg-red-500/30 animate-pulse group cursor-pointer"
                                    style={{
                                        top: `${ymin}%`,
                                        left: `${xmin}%`,
                                        width: `${xmax - xmin}%`,
                                        height: `${ymax - ymin}%`
                                    }}
                                >
                                    <span className="absolute -top-6 left-0 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow whitespace-nowrap z-10 max-w-[220px] truncate">
                                        ⚠️ {area.descripcion}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center p-6">
                        <span className="text-5xl block mb-2">📸</span>
                        <p className="font-bold text-gray-500 text-sm">No has seleccionado ninguna foto</p>
                    </div>
                )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
                <label className="flex-1 bg-cyan-300 text-black font-black text-center p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer text-sm">
                    📷 {imagePreview ? "Cambiar Foto" : "Tomar Foto"}
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" />
                </label>

                {imagePreview && (
                    <button
                        onClick={processAudit}
                        disabled={loading}
                        className="flex-1 bg-green-400 text-black font-black p-3 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 text-sm"
                    >
                        {loading ? "⚡ Analizando..." : "🚀 Analizar"}
                    </button>
                )}
            </div>

            {/* Tarjeta de Resultados */}
            {result && (
                <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                    <div className="flex justify-between items-center border-b-2 border-black pb-2">
                        <h3 className="font-black text-base">📊 Resultado Auditoría</h3>
                        <button
                            onClick={() => setShowOverlays(!showOverlays)}
                            className="text-[10px] bg-gray-200 border border-black font-bold px-2 py-1 rounded hover:bg-gray-300"
                        >
                            {showOverlays ? "👁️ Ocultar Marcas" : "👁️ Mostrar Marcas"}
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-100 p-2 rounded-lg border border-black">
                            <span className="block text-2xl font-black">{result.target_facings}</span>
                            <span className="text-[10px] font-bold uppercase truncate block">{marcaObjetivo}</span>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-lg border border-black">
                            <span className="block text-2xl font-black">{result.competitor_facings}</span>
                            <span className="text-[10px] font-bold uppercase block">Competencia</span>
                        </div>
                        <div className="bg-red-100 p-2 rounded-lg border border-black">
                            <span className="block text-2xl font-black">{result.stock_breaks}</span>
                            <span className="text-[10px] font-bold uppercase block">Quiebres</span>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-black text-xs space-y-1">
                        <p className="font-bold text-amber-900">🔍 Análisis por Repisas:</p>
                        <p className="text-gray-700">{result.analisis_paso_a_paso}</p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-black text-xs space-y-1">
                        <p className="font-bold text-blue-900">💡 Observación Ejecutiva:</p>
                        <p className="text-gray-700">{result.observation}</p>
                    </div>
                </div>
            )}
        </div>
    );
}