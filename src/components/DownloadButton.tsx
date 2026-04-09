import React from 'react';

interface Props {
  resultUrl: string | null;
  originalName: string;
}

export const DownloadButton: React.FC<Props> = ({ resultUrl, originalName }) => {
  if (!resultUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `LARGO_${originalName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <button 
      onClick={handleDownload}
      className="w-full mt-6 bg-twitch hover:bg-twitch-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-twitch/20 transition-all active:scale-[0.98] uppercase tracking-widest text-lg"
    >
      Baixar Emote
    </button>
  );
};
