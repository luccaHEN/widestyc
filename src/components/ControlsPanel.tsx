import React from 'react';

interface Props {
  stretchFactor: number;
  setStretchFactor: (factor: number) => void;
  speedFactor: number;
  setSpeedFactor: (factor: number) => void;
  isGif?: boolean;
}

export const ControlsPanel: React.FC<Props> = ({ stretchFactor, setStretchFactor, speedFactor, setSpeedFactor, isGif }) => {
  const presets = [2, 2.5, 2.99];
  const speedPresets = [1, 1.5, 2];

  return (
    <div className="bg-dark-panel p-6 rounded-xl mt-6 shadow-lg">
      <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-200">Presets:</h3>
      
      <div className="flex gap-4 mb-6">
        {presets.map(preset => (
          <button
            key={preset}
            onClick={() => setStretchFactor(preset)}
            className={`flex-1 py-2 rounded font-bold transition-all ${
              stretchFactor === preset 
                ? 'bg-twitch text-white ring-2 ring-white' 
                : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
            }`}
          >
            {preset === 2.99 ? 'MÁX. (2.99x)' : `x${preset} WIDE`}
          </button>
        ))}
      </div>

      <div>
        <label className="text-sm text-gray-400 mb-2 block">Custom WIDE: {stretchFactor}x</label>
        <input 
          type="range" 
          min="1" 
          max="2.99" 
          step="0.01" 
          value={stretchFactor}
          onChange={(e) => setStretchFactor(parseFloat(e.target.value))}
          className="w-full accent-twitch"
        />
      </div>

      {isGif && (
        <div className="mt-6 border-t border-zinc-700 pt-6">
          <h3 className="text-lg font-bold mb-4 uppercase tracking-wider text-gray-200">Velocidade do GIF</h3>
          
          <div className="flex gap-4 mb-6">
            {speedPresets.map(preset => (
              <button
                key={preset}
                onClick={() => setSpeedFactor(preset)}
                className={`flex-1 py-2 rounded font-bold transition-all ${
                  speedFactor === preset 
                    ? 'bg-twitch text-white ring-2 ring-white' 
                    : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
                }`}
              >
                {preset}x
              </button>
            ))}
          </div>

          <label className="text-sm text-gray-400 mb-2 block">Custom Speed: {speedFactor}x</label>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={speedFactor}
            onChange={(e) => setSpeedFactor(parseFloat(e.target.value))}
            className="w-full accent-twitch"
          />
        </div>
      )}
    </div>
  );
};
