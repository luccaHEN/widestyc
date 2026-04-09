import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';
import { UploadArea } from './components/UploadArea';
import { ControlsPanel } from './components/ControlsPanel';
import { PreviewCanvas } from './components/PreviewCanvas';
import { DownloadButton } from './components/DownloadButton';
import { useImageProcessor } from './hooks/useImageProcessor';
import { useGifProcessor } from './hooks/useGifProcessor';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [stretchFactor, setStretchFactor] = useState<number>(2);
  const [speedFactor, setSpeedFactor] = useState<number>(1);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const { processImage, isProcessing: processingImage } = useImageProcessor();
  const { processGif, isProcessing: processingGif, progress: gifProgress } = useGifProcessor();

  const isProcessing = processingImage || processingGif;

  // Debounced processing function
  const triggerProcessing = useCallback(
    debounce(async (targetFile: File, factor: number, speed: number) => {
      try {
        let url = '';
        if (targetFile.type === 'image/gif') {
          url = await processGif(targetFile, factor, speed);
        } else {
          url = await processImage(targetFile, factor);
        }
        setResultUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev); // Cleanup memory
          return url;
        });
      } catch (error) {
        console.error("Falha no processamento", error);
        const msg = error instanceof Error ? error.message : typeof error === 'string' ? error : "Erro desconhecido.";
        alert(`Falha: ${msg}`);
      }
    }, 500), // 500ms debounce ensures sliders don't freeze the UI
    [processImage, processGif]
  );

  // Trigger whenever file or stretchFactor changes
  useEffect(() => {
    if (file) {
      triggerProcessing(file, stretchFactor, speedFactor);
    }
  }, [file, stretchFactor, speedFactor, triggerProcessing]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-x-hidden">
      <div className="w-full max-w-3xl py-12 z-10 relative">
        <header className="text-center mb-10">
        <h1 
          onClick={() => { setFile(null); setResultUrl(null); setSpeedFactor(1); setStretchFactor(2); }}
          className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-twitch to-blue-500 mb-2 cursor-pointer hover:opacity-80 transition-opacity inline-block"
          title="Voltar ao início"
        >
          WIDESTYC
        </h1>
        <p className="text-gray-400">Regras do 7TV (7MB, 1000px, Proporção &lt; 3:1)</p>
      </header>

      <main>
        {!file && <UploadArea onFileSelect={setFile} />}

        {file && (
          <div className="fade-in">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-400">Selecionado: {file.name}</span>
              <button 
                onClick={() => { setFile(null); setResultUrl(null); setSpeedFactor(1); setStretchFactor(2); }}
                className="text-xs text-twitch hover:text-white underline"
              >
                Enviar outro arquivo
              </button>
            </div>

            <ControlsPanel 
              stretchFactor={stretchFactor} 
              setStretchFactor={setStretchFactor} 
              speedFactor={speedFactor}
              setSpeedFactor={setSpeedFactor}
              isGif={file.type === 'image/gif'}
            />
            
            <PreviewCanvas 
              resultUrl={resultUrl} 
              isProcessing={isProcessing} 
              progress={file.type === 'image/gif' ? gifProgress : undefined} 
            />

            <DownloadButton resultUrl={resultUrl} originalName={file.name} />
          </div>
        )}
      </main>
      </div>

      <img 
        src="/sumiugemeos.png" 
        alt="Sumiu Gêmeos" 
        className="w-40 md:w-60 lg:w-72 xl:w-80 md:absolute md:top-1/2 md:-translate-y-1/2 md:left-2 lg:left-8 xl:left-16 object-contain opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300 drop-shadow-2xl mt-8 md:mt-0 z-0" 
      />
    </div>
  );
}

export default App;
