// src/components/AppContainer.jsx
import { useState } from 'react';
import AuditorScanner from './AuditorScanner';
import HistorialAuditorias from './HistorialAuditorias';

export default function AppContainer() {
    const [activeTab, setActiveTab] = useState('scanner');

    return (
        <div className="min-h-screen bg-[#f3effe] text-black">
            {/* Contenido según la pestaña activa */}
            <main className="max-w-md mx-auto p-4">
                {activeTab === 'scanner' ? <AuditorScanner /> : <HistorialAuditorias />}
            </main>

            {/* Navegación Inferior Estilo App Nativa */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-2 z-40">
                <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setActiveTab('scanner')}
                        className={`p-2.5 rounded-xl font-black text-xs border-2 border-black transition-all flex items-center justify-center gap-2 ${activeTab === 'scanner'
                            ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-gray-100 opacity-70'
                            }`}
                    >
                        📸 Escanear
                    </button>

                    <button
                        onClick={() => setActiveTab('historial')}
                        className={`p-2.5 rounded-xl font-black text-xs border-2 border-black transition-all flex items-center justify-center gap-2 ${activeTab === 'historial'
                            ? 'bg-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-gray-100 opacity-70'
                            }`}
                    >
                        📜 Historial
                    </button>
                </div>
            </nav>
        </div>
    );
}