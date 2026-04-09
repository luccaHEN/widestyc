import { useState, useCallback } from 'react';
import { parseGIF, decompressFrames } from 'gifuct-js';
import GIF from 'gif.js';

export const useGifProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const processGif = useCallback(async (file: File, stretchFactor: number, speedFactor: number = 1): Promise<string> => {
    setIsProcessing(true);
    setProgress(0);

    return new Promise(async (resolve, reject) => {
      try {
        // 1. Decodifica o GIF
        const buffer = await file.arrayBuffer();
        const parsedGif = parseGIF(buffer);
        const frames = decompressFrames(parsedGif, true);
        
        if (!frames.length) throw new Error("Nenhum quadro (frame) encontrado");
        if (frames.length > 1000) throw new Error("O GIF tem mais de 1000 quadros (limite do 7TV)");

        const width = parsedGif.lsd?.width || frames[0].dims.width;
        const height = parsedGif.lsd?.height || frames[0].dims.height;
        
        let targetW = width * stretchFactor;
        let targetH = height;

        // Regra 7TV: Aspect ratio não pode ser maior que 3:1
        if (targetW / targetH >= 3) {
          targetW = targetH * 2.99;
        }

        // Regra 7TV: Resolução máxima de 1000x1000
        if (targetW > 1000) {
          const scale = 1000 / targetW;
          targetW = 1000;
          targetH = targetH * scale;
        }
        if (targetH > 1000) {
          const scale = 1000 / targetH;
          targetH = 1000;
          targetW = targetW * scale;
        }

        targetW = Math.floor(targetW);
        targetH = Math.floor(targetH);

        const CHROMA_KEY_NUM = 0x000000; // Preto como chroma key para que o otimizador crie bordas perfeitamente limpas

        // 2. Inicializa o Encoder de GIF (Requer gif.worker.js na pasta public)
        const gif = new GIF({
          workers: 2,
          quality: 1, // Qualidade MÁXIMA (Lê todos os pixels para não perder cores)
          width: targetW,
          height: targetH,
          workerScript: '/gif.worker.js',
          transparent: CHROMA_KEY_NUM as any // Bypass TS: a tipagem do gif.js está errada (ele pede string, mas exige número)
        });

        // 3. Processa e estica cada quadro (frame)
        const tempCanvas = document.createElement('canvas');
        // Adiciona a dica willReadFrequently para performance, já que usaremos getImageData
        const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!;
        tempCanvas.width = width;
        tempCanvas.height = height;

        const patchCanvas = document.createElement('canvas');
        const patchCtx = patchCanvas.getContext('2d')!;

        const stretchCanvas = document.createElement('canvas');
        const stretchCtx = stretchCanvas.getContext('2d', { willReadFrequently: true })!;
        stretchCanvas.width = targetW;
        stretchCanvas.height = targetH;

        // Isso guardará o estado do canvas antes do último quadro ser desenhado, para o disposalType 3
        let lastFrameImageData: ImageData | null = null;

        for (const frame of frames) {
          const { dims, disposalType, patch } = frame;

          // Salva o estado atual do canvas se o disposalType do quadro atual for 3 (restaurar ao anterior).
          // Nós usaremos isso na *próxima* iteração.
          if (disposalType === 3) {
            lastFrameImageData = tempCtx.getImageData(0, 0, width, height);
          }

          patchCanvas.width = dims.width;
          patchCanvas.height = dims.height;
          // Cria um objeto ImageData para o fragmento (patch) do quadro atual
          const patchImageData = new ImageData(
            new Uint8ClampedArray(patch),
            dims.width,
            dims.height
          );
          patchCtx.putImageData(patchImageData, 0, 0);

          // COMPÕE o fragmento no canvas temporário.
          // drawImage usa alpha blending, respeitando a transparência do GIF original.
          tempCtx.drawImage(patchCanvas, dims.left, dims.top);

          // Agora que tempCanvas tem o visual completo para este quadro, nós o desenhamos e esticamos.
          stretchCtx.clearRect(0, 0, targetW, targetH);
          stretchCtx.imageSmoothingEnabled = false; // Desativa a suavização para evitar alpha bleeding (contornos pretos)
          stretchCtx.drawImage(tempCanvas, 0, 0, targetW, targetH);

          // Remove os artefatos de alpha blending e aplica o chroma key
          const imageData = stretchCtx.getImageData(0, 0, targetW, targetH);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 128) { // Se o pixel for mais transparente do que visível
              data[i] = 0;       // R (Preto Chroma Key)
              data[i + 1] = 0;   // G
              data[i + 2] = 0;   // B
              data[i + 3] = 255; // Força opacidade para o encoder reconhecer
            } else {
              // Proteção: se a imagem original tiver um pixel exatamente na cor do chroma key (Preto)
              if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
                data[i + 2] = 1; // Alteramos levemente (adiciona 1 no azul) para não gerar buracos transparentes no emote
              }
              data[i + 3] = 255; // Remove qualquer semi-transparência para bordas super nítidas
            }
          }
          stretchCtx.putImageData(imageData, 0, 0);

          // Adiciona o quadro esticado ao encoder de GIF
          // Trava de segurança em 20ms para evitar que o navegador puna o GIF e o deixe em 100ms
          const newDelay = Math.max(20, Math.round(frame.delay / speedFactor));
          gif.addFrame(stretchCtx, { copy: true, delay: newDelay });

          // Se o disposalType do quadro atual for 2 (restaurar ao fundo), limpa a sua área.
          if (disposalType === 2) {
            tempCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
          } else if (disposalType === 3 && lastFrameImageData) {
            // Restaura o estado para como estava antes deste quadro ser desenhado
            tempCtx.putImageData(lastFrameImageData, 0, 0);
            lastFrameImageData = null;
          }
        }

        // 4. Renderiza o GIF final
        gif.on('progress', (p: number) => setProgress(Math.round(p * 100)));
        gif.on('finished', (blob: Blob) => {
          setIsProcessing(false);
          resolve(URL.createObjectURL(blob));
        });

        gif.render();
      } catch (err) {
        setIsProcessing(false);
        reject(err);
      }
    });
  }, []);

  return { processGif, isProcessing, progress };
};
