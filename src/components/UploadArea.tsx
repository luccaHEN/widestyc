import React, { useCallback, useState } from 'react';

interface Props {
  onFileSelect: (file: File) => void;
}

export const UploadArea: React.FC<Props> = ({ onFileSelect }) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    validateAndPass(file);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndPass(file);
  };

  const validateAndPass = (file: File) => {
    if (file.size > 7 * 1024 * 1024) {
      alert("Arquivo muito grande! Máx: 7MB (limites do 7TV).");
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/avif', 'image/webp'].includes(file.type)) {
      alert("Formato inválido! Use PNG, JPG, GIF, AVIF ou WEBP.");
      return;
    }
    onFileSelect(file);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;
    
    // Extrai o ID do emote (24 a 26 caracteres alfanuméricos) de qualquer URL ou ID do 7TV
    const match = urlInput.match(/([a-zA-Z0-9]{24,26})/);
    if (!match) {
      alert("URL ou ID do 7TV inválido.");
      return;
    }
    
    const emoteId = match[1];
    setIsLoading(true);
    
    try {
      // Busca os metadados do emote na API v3 do 7TV
      const apiRes = await fetch(`https://7tv.io/v3/emotes/${emoteId}`);
      if (!apiRes.ok) throw new Error("Emote não encontrado no 7TV");
      const data = await apiRes.json();
      
      const isAnimated = data.animated;
      // Sempre puxamos a versão .gif para os animados para que o useGifProcessor funcione corretamente
      const ext = isAnimated ? 'gif' : 'png'; 
      const imgUrl = `https://cdn.7tv.app/emote/${emoteId}/4x.${ext}`;
      
      const imgRes = await fetch(imgUrl);
      if (!imgRes.ok) throw new Error("Falha ao baixar a imagem do CDN do 7TV");
      const blob = await imgRes.blob();
      
      const file = new File([blob], `${data.name}.${ext}`, { type: blob.type });
      validateAndPass(file);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={`border-2 border-dashed border-twitch-dark rounded-xl p-10 text-center transition-colors relative ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-dark-panel cursor-pointer'}`}
      >
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/gif, image/avif, image/webp" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          onChange={handleChange}
          disabled={isLoading}
        />
        <div className="flex flex-col items-center pointer-events-none">
          <svg className="w-12 h-12 text-twitch mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
          <p className="text-lg font-bold">Arraste e solte uma imagem ou GIF</p>
          <p className="text-sm text-gray-400 mt-2">Tamanho máximo: 7MB</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="text-gray-500 mb-3 text-sm font-bold uppercase tracking-wider">ou</div>
        <form onSubmit={handleUrlSubmit} className="flex w-full gap-2">
          <input 
            type="text" 
            placeholder="Cole o link do 7TV (ex: https://7tv.app/emotes/...)" 
            className="flex-1 bg-dark-panel border border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-twitch transition-colors disabled:opacity-50"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="bg-twitch hover:bg-twitch-dark text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg"
            disabled={isLoading || !urlInput}
          >
            {isLoading ? 'Baixando...' : 'Importar'}
          </button>
        </form>
      </div>
    </div>
  );
};
