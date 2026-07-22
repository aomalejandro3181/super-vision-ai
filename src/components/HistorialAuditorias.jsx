import { useState, useEffect } from 'react';

export default function HistorialAuditorias() {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAudit, setSelectedAudit] = useState(null);

    useEffect(() => {
        fetchHistorial();
    }, []);

    const fetchHistorial = async () => {
        try {
            const res = await fetch('/api/historial');
            const data = await res.json();
            if (res.ok) setHistorial(data);
        } catch (err) {
            console.error("Error al cargar historial:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin text-3xl mb-2">⚡</div>
                <p className="font-black text-sm">Cargando auditorías pasadas...</p>
            </div>
        );
    }

    if (historial.length === 0) {
        return (
            <div className="bg-white border-2 border-black p-6 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-2">
                <span className="text-4xl block">📋</span>
                <h3 className="font-black text-base">Sin registros aún</h3>
                <p className="text-xs text-gray-600">Las fotos que analices en el escáner se irán guardando automáticamente aquí.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-24">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-black text-lg">📜 Historial ({historial.length})</h2>
                <button
                    onClick={fetchHistorial}
                    className="text-xs font-bold bg-amber-300 border-2 border-black px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5"
                >
                    🔄 Actualizar
                </button>
            </div>

            {historial.map((item) => {
                const metricas = item.metricas_auditoria?.[0] || {};
                const fecha = new Date(item.created_at).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                return (
                    <div
                        key={item.id}
                        className="bg-white border-2 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3"
                    >
                        {/* Header Tarjeta */}
                        <div className="flex justify-between items-center text-xs font-black border-b border-gray-200 pb-2">
                            <span className="bg-gray-100 flex-1 min-h-[40px] flex items-center border border-black px-2 py-0.5 rounded">
                                🗓️ {fecha}
                            </span>
                            <span className="text-[10px] flex-1 flex items-center min-h-[40px] text-gray-500 font-mono pl-2">
                                ID: #{item.id}
                            </span>
                        </div>

                        {/* Foto y Resumen Métricas */}
                        <div className="flex gap-3 items-center">
                            <img
                                src={item.foto_url}
                                alt="Auditoría"
                                className="w-20 h-20 object-cover border-2 border-black rounded-lg bg-gray-100 flex-shrink-0 cursor-pointer"
                                onClick={() => setSelectedAudit(item)}
                            />

                            <div className="flex-1 grid grid-cols-3 gap-1 text-center">
                                <div className="bg-green-100 p-1.5 rounded border border-black">
                                    <span className="block text-base font-black leading-tight">{metricas.target_facings ?? 0}</span>
                                    <span className="text-[8px] font-bold uppercase block">Marca</span>
                                </div>
                                <div className="bg-blue-100 p-1.5 rounded border border-black">
                                    <span className="block text-base font-black leading-tight">{metricas.competitor_facings ?? 0}</span>
                                    <span className="text-[8px] font-bold uppercase block">Rival</span>
                                </div>
                                <div className="bg-red-100 p-1.5 rounded border border-black">
                                    <span className="block text-base font-black leading-tight">{metricas.stock_breaks ?? 0}</span>
                                    <span className="text-[8px] font-bold uppercase block">Quiebres</span>
                                </div>
                            </div>
                        </div>

                        {/* Observación */}
                        {metricas.observation && (
                            <p className="text-xs text-gray-700 bg-amber-50 p-2 rounded border border-black line-clamp-2 min-h-[90px]">
                                💡 <span className="font-semibold">{metricas.observation}</span>
                            </p>
                        )}
                    </div>
                );
            })}

            {/* Modal de Imagen Completa */}
            {selectedAudit && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-black rounded-xl p-3 max-w-md w-full space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="font-black text-sm">Vista de Detalle</h3>
                            <button
                                onClick={() => setSelectedAudit(null)}
                                className="bg-red-400 font-black px-2 py-0.5 rounded border border-black text-xs"
                            >
                                ✖ Cerrar
                            </button>
                        </div>
                        <img src={selectedAudit.foto_url} alt="Foto completa" className="w-full h-auto border-2 border-black rounded-lg" />
                    </div>
                </div>
            )}
        </div>
    );
}