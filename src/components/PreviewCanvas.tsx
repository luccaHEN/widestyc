import React from 'react';

interface Props {
  resultUrl: string | null;
  isProcessing: boolean;
  progress?: number;
}

export const PreviewCanvas: React.FC<Props> = ({ resultUrl, isProcessing, progress }) => {
  return (
    <div className="bg-dark-panel p-4 rounded-xl shadow-lg mt-6 min-h-[300px] flex items-center justify-center border border-zinc-700 overflow-x-auto relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-dark-panel/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm rounded-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twitch mb-4"></div>
          <p className="font-bold text-twitch animate-pulse">WIDEing...</p>
          {progress !== undefined && progress > 0 && (
            <p className="text-sm text-gray-300 mt-2">{progress}%</p>
          )}
        </div>
      )}

      {resultUrl ? (
        <img 
          src={resultUrl} 
          alt="Wide Emote Preview" 
          className="max-h-[250px] max-w-none rounded object-contain"
        />
      ) : (
        <p className="text-gray-500 font-medium">Faça o upload de uma imagem para ver a prévia</p>
      )}
    </div>
  );
};
