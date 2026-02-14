import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { createRoot } from "react-dom/client"; // Serve per Vite

// In Vite si usa import.meta.env invece di process.env
const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL || "",
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function GalleriaEsposizione() {
  const [opere, setOpere] = useState<any[]>([]);

  useEffect(() => {
    // Funzione per caricare le opere approvate
    const caricaOpere = async () => {
      const { data } = await supabase
        .from('opere')
        .select('*')
        .eq('approvato', true) // Prende solo quelle approvate da te
        .order('created_at', { ascending: false });
      
      if (data) setOpere(data);
    };

    caricaOpere();

    // Opzionale: ricarica automaticamente ogni minuto per vedere i nuovi arrivi
    const interval = setInterval(caricaOpere, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', padding: '40px', color: 'white', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', letterSpacing: '2px' }}>GALLERIA DIGITALE</h1>
        <p style={{ opacity: 0.7 }}>I segni lasciati dai nostri ospiti durante il loro soggiorno</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {opere.map((opera) => (
          <div key={opera.id} style={{ backgroundColor: '#1e1e1e', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', transition: 'transform 0.3s' }}>
            <img 
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/galleria-immagini/${opera.url_disegno}`} 
              alt="Opera ospite"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{ padding: '15px', textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
              {new Date(opera.created_at).toLocaleDateString('it-IT')}
            </div>
          </div>
        ))}
      </div>

      {opere.length === 0 && (
        <p style={{ textAlign: 'center', marginTop: '100px', opacity: 0.5 }}>In attesa dei primi segni approvati...</p>
      )}
    </div>
  );
}
import { createRoot } from "react-dom/client";

// Questo pezzetto serve per far partire React nel tuo progetto Vite
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<GalleriaEsposizione />);
}
