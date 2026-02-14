import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { createClient } from '@supabase/supabase-js';

import "../excalidraw-app/sentry";
import ExcalidrawApp from "./App";

// --- CONFIGURAZIONE SUPABASE PER LA GALLERIA ---
const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL || "",
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || ""
);

function GalleriaEsposizione() {
  const [opere, setOpere] = useState<any[]>([]);

  useEffect(() => {
    const caricaOpere = async () => {
      const { data } = await supabase
        .from('opere')
        .select('*')
        .eq('approvato', true)
        .order('created_at', { ascending: false });
      if (data) setOpere(data);
    };
    caricaOpere();
  }, []);

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', padding: '40px', color: 'white', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>GALLERIA DIGITALE</h1>
        <p style={{ opacity: 0.7 }}>I segni lasciati dai nostri ospiti</p>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {opere.map((opera) => (
          <div key={opera.id} style={{ backgroundColor: '#1e1e1e', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <img 
              src={`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/storage/v1/object/public/galleria-immagini/${opera.url_disegno}`} 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        ))}
      </div>
      {opere.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5 }}>In attesa di opere approvate...</p>}
    </div>
  );
}

// --- LOGICA DI ROUTING ---
window.__EXCALIDRAW_SHA__ = import.meta.env.VITE_APP_GIT_SHA;
const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
registerSW();

// Se l'URL finisce con /esposizione, mostra la Galleria. Altrimenti la lavagna.
if (window.location.pathname.includes("/esposizione")) {
  root.render(
    <StrictMode>
      <GalleriaEsposizione />
    </StrictMode>
  );
} else {
  root.render(
    <StrictMode>
      <ExcalidrawApp />
    </StrictMode>
  );
}
