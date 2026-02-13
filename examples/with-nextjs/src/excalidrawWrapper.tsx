"use client";
import React, { useState } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import { createClient } from '@supabase/supabase-js';

import "@excalidraw/excalidraw/index.css";

// Inizializzazione del client Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ExcalidrawWrapper: React.FC = () => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  const handleSalvaOpera = async () => {
    if (!excalidrawAPI) return;

    try {
      // 1. Esporta il disegno come immagine PNG
      const blob = await exportToBlob({
        elements: excalidrawAPI.getSceneElements(),
        mimeType: "image/png",
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
      });

      const nomeFile = `segno_${Date.now()}.png`;

      // 2. Carica il file nello storage di Supabase
      const { data: storageData, error: storageError } = await supabase.storage
        .from('galleria-immagini')
        .upload(nomeFile, blob);

      if (storageError) throw storageError;

      // 3. Salva i dati nella tabella (is_approved/approvato sarà false di default)
      const { error: dbError } = await supabase
        .from('opere')
        .insert([
          { 
            url_disegno: storageData.path, 
            approvato: false,
            nome_cliente: "Ospite della Galleria" 
          }
        ]);

      if (dbError) throw dbError;

      alert("Grazie! Il tuo segno è stato inviato alla galleria. Apparirà dopo la moderazione.");
      excalidrawAPI.resetScene(); // Pulisce la lavagna dopo l'invio

    } catch (error: any) {
      console.error(error);
      alert("Si è verificato un errore: " + error.message);
    }
  };

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <Excalidraw 
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        renderTopRightUI={() => (
          <button
            onClick={handleSalvaOpera}
            style={{
              marginRight: "10px",
              padding: "10px 20px",
              backgroundColor: "#6965db",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontWeight: "bold",
              cursor: "pointer",
              zIndex: 10
            }}
          >
            🎨 Invia alla Galleria
          </button>
        )}
      />
    </div>
  );
};

export default ExcalidrawWrapper;
