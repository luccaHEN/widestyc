import { useState, useCallback } from 'react';

export const useImageProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = useCallback(async (file: File, stretchFactor: number): Promise<string> => {
    setIsProcessing(true);
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        let targetW = img.width * stretchFactor;
        let targetH = img.height;

        // Regra 7TV: O aspecto ratio não pode ser maior que 3:1
        // Fixamos em 2.99 para dar uma margem de segurança
        if (targetW / targetH >= 3) {
          targetW = targetH * 2.99;
        }

        // Regra 7TV: A resolução máxima é de 1000x1000
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

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Falha ao obter contexto do canvas');
        
        // Stretch the image horizontally
        ctx.drawImage(img, 0, 0, targetW, targetH);
        
        const resultUrl = canvas.toDataURL(file.type);
        URL.revokeObjectURL(url);
        setIsProcessing(false);
        resolve(resultUrl);
      };
      
      img.onerror = () => reject('Falha ao carregar imagem');
      img.src = url;
    });
  }, []);

  return { processImage, isProcessing };
};
